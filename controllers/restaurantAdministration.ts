import {Knex} from "knex";
import {Request, Response} from "express";
import {
    AddressApiObject,
    CategoryDAO,
    CategoryRequestApiObject, ItemDAO, ItemRequestApiObject,
    LoginApiObject,
    RestaurantApiObject,
    RestaurantLoginResponseApiObject,
    RestaurantMenuApiObject,
    RestaurantMenuCategoryApiObject,
    RestaurantMenuCategoryItemApiObject,
    RestaurantRegistrationResponseApiObject
} from "../apiObjects/api";

export const handleSetRestaurants = (req: Request, res: Response, db: Knex) => {
    const restaurantRegistration: RestaurantApiObject = req.body;

    db.transaction(trx => {
        trx.select('email').from('restaurants').where('email', restaurantRegistration.email)
            .then(email => {
                if (email.length) {
                    return res.status(400).json('Email already in use');
                }

                trx.insert({
                    email: restaurantRegistration.email,
                    restaurantName: restaurantRegistration.restaurantName,
                    description: restaurantRegistration.description
                })
                    .into('restaurants')
                    .then(affectedRows => {
                        trx.select('id').from('restaurants')
                            .where('email', restaurantRegistration.email)
                            .then(returnedId => {
                                const id: number = returnedId[0].id;
                                const address: AddressApiObject = restaurantRegistration.address;
                                trx.insert({
                                    restaurantId: id,
                                    streetName: address.streetName,
                                    houseNumber: address.houseNumber,
                                    zipCode: address.zipCode,
                                    city: address.city,
                                    floor: address.floor ? address.floor : null
                                }).into('restaurantAddresses')
                                    .then(affectedRows => {
                                        trx.insert({restaurantId: id}).into('menus')
                                            .then(affectedRows => {
                                                trx.select('id').from('menus').where('restaurantId', id)
                                                    .then(returnedMenuId => {
                                                        const menuId: number = returnedMenuId[0].id;
                                                        trx.commit();
                                                        const responseObject: RestaurantRegistrationResponseApiObject = {
                                                            id,
                                                            email: restaurantRegistration.email,
                                                            restaurantName: restaurantRegistration.restaurantName,
                                                            description: restaurantRegistration.description,
                                                            menuId
                                                        }
                                                        return res.status(200).json(responseObject);
                                                    })
                                            })
                                            .catch(error => {
                                                trx.rollback();
                                                return res.status(400).json('Unable to create account');
                                            })
                                    })
                            })
                    })
            })
    })
}

export const getRestaurant = (req: Request, res: Response, db: Knex) => {
    const {email} = req.body;

    db.select('*').from('restaurants').where('email', email)
        .then(loginData => {
            const loginDataObject: LoginApiObject = loginData[0];
            const {id, email, description, restaurantName} = loginDataObject;

            db.select('*').from('menus').where('restaurantId', id)
                .then(menuData => {
                    const restaurantMenu: RestaurantMenuApiObject = menuData[0]
                    const menuCategories: RestaurantMenuCategoryApiObject[] = [];
                    const categoryItems: RestaurantMenuCategoryItemApiObject[] = [];

                    db.select('*').from('categories').where('menuId', restaurantMenu.id)
                        .then(categoryData => {
                            categoryData.forEach(category => {
                                menuCategories.push(category)
                            });

                            menuCategories.forEach(function (category) {
                                db.select('*').from('categoryItems').where('categoryId', category.id)
                                    .then(itemData => {
                                        itemData.forEach(item => categoryItems.push(item));
                                    })
                            })
                        })
                        .then(() => {
                            const restaurantObject: RestaurantLoginResponseApiObject = {
                                id,
                                email,
                                restaurantName,
                                description,
                                restaurantMenu,
                                menuCategories,
                                categoryItems
                            }
                            return res.status(200).json(restaurantObject);
                        })

                })
                .catch(error => {
                    return res.json(400).json('Unable to get restaurant data');
                })
        })

        .catch(error => {
            return res.status(400).json('Unable to get restaurant');
        })
}

export const handleAddNewCategory = (req: Request, res: Response, db: Knex) => {
    const newCategory: CategoryRequestApiObject = req.body;

    db.transaction(trx => {
        trx.select('*').from('categories').where('menuId', newCategory.menuId)
            .then(categories => {
                const categoryList: CategoryDAO[] = categories;
                categoryList.forEach(function (category) {
                    if (category.title == newCategory.categoryTitle) {
                        return res.status(400).json('Category already exist!');
                    }
                });
                trx.insert({menuId: newCategory.menuId, title: newCategory.categoryTitle}).into('categories')
                    .then(() => {
                        return trx.select('*').from('categories').where('menuId', newCategory.menuId)
                            .then(updatedCategories => {
                                const updatedCategoryList: CategoryDAO[] = updatedCategories;
                                trx.commit();
                                return res.status(200).json(updatedCategoryList);
                            })
                    })
                    .catch(error => {
                        trx.rollback();
                        return res.status(400).json('Unable to add category');
                    })
            })
            .catch(error => {
            })
    })
}

export const handleAddNewItem = (req: Request, res: Response, db: Knex) => {
    const newItem: ItemRequestApiObject = req.body;

    db.transaction(trx => {
        trx.select('*').from('categoryItems').where('categoryId', newItem.categoryId)
            .then(items => {
                const itemList: ItemDAO[] = items;
                itemList.forEach(item => {
                    if (item.name === newItem.name) {
                        return res.status(400).json('Item already exist in this category!');
                    }
                });

                trx.insert({
                    categoryId: newItem.categoryId,
                    name: newItem.name, description:
                    newItem.description,
                    price: newItem.price}).into('categoryItems')
                    .then(() => {
                        trx.select('*').from('categoryItems').where('categoryId', newItem.categoryId)
                            .then(updatedItems => {
                                const updatedItemList: ItemDAO[] = updatedItems;
                                trx.commit();
                                return res.status(200).json(updatedItemList);
                            })
                    })
                    .catch(error => {
                        trx.rollback();
                        return res.status(400).json('Unable to add item');
                    })
            })
    })
}

