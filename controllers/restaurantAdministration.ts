import {Knex} from "knex";
import {Request, Response} from "express";
import {
    AddressApiObject,
    CategoryApiObject,
    CategoryDAO,
    CategoryRequestApiObject,
    ItemDAO,
    ItemRequestApiObject,
    LoginApiObject,
    LoginResponseApiObject,
    MenuApiObject,
    MenuDAO,
    RestaurantApiObject
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
                    restaurantName: restaurantRegistration.name,
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
                                                        const menu: MenuApiObject = {
                                                            id: returnedMenuId[0].id,
                                                            categories: undefined
                                                        };

                                                        trx.commit();
                                                        const responseObject: LoginResponseApiObject = {
                                                            id,
                                                            email: restaurantRegistration.email,
                                                            name: restaurantRegistration.name,
                                                            description: restaurantRegistration.description,
                                                            menu
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
            const {id, email, description, name} = loginDataObject;

            db.select('*').from('menus').where('restaurantId', id)
                .then((menuData: MenuDAO[]) => {
                    const menu: MenuApiObject = {
                        id: menuData[0].id,
                        categories: []
                    }

                    db.select('*').from('categories').where('menuId', menu.id)
                        .then((categoryData: CategoryDAO[]) => {
                            const menuCategories: CategoryApiObject[] = [];

                            Promise.all(categoryData.map((category: CategoryDAO) => {
                                const finalCategory: CategoryApiObject = {
                                    id: category.id,
                                    title: category.title,
                                    items: []
                                };

                                return db.select('*').from('categoryItems').where('categoryId', category.id)
                                    .then((itemData: ItemDAO[]) => {
                                        itemData.forEach((item: ItemDAO) => finalCategory.items.push(item));
                                        menuCategories.push(finalCategory);
                                    });
                            }))
                                .then(() => {
                                    menu.categories = menuCategories;

                                    const restaurantObject: LoginResponseApiObject = {
                                        id,
                                        email,
                                        name: name,
                                        description,
                                        menu: menu
                                    }
                                    return res.status(200).json(restaurantObject);
                                });
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
                    if (category.title == newCategory.title) {
                        return res.status(400).json('Category already exist!');
                    }
                });
                trx.insert({menuId: newCategory.menuId, title: newCategory.title}).into('categories')
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
                    price: newItem.price
                }).into('categoryItems')
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


export const handleGetMenu = (req: Request, res: Response, db: Knex) => {
    const {id} = req.body;

    db.select('id').from('menus').where('restaurantId', id)
        .then(menuId => {
            const menuCategories: CategoryApiObject[] = [];
            db.select('*').from('categories').where('menuId', menuId[0].id)
                .then(returnedCategories => {
                    Promise.all(returnedCategories.map((category, index) => {
                        return db.select('*').from('categoryItems').where('categoryId', category.id)
                            .then(returnedItems => {
                                category.items = returnedItems;
                                menuCategories.push(category)
                            })
                    }))
                        .then(() => {
                            return res.status(200).json(menuCategories);
                        })
                })
        })
        .catch(error => {
            return res.json(400).json('Unable to get menu data');
        })
}
