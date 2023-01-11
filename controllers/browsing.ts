import {Knex} from "knex";
import {Request, Response} from "express";
import {RestaurantApiObject} from "../apiObjects/api";

export const handleGetRestaurants = (db: Knex) => (req: Request, res: Response) => {
    console.log('hi')
    let restaurantApiObjects: RestaurantApiObject[] = [];

    db.transaction(trx => {
        trx.select('*').from('restaurants')
            .then((restaurants) => {
                Promise.all(restaurants.map((restaurant) => {
                    const restaurantTemp: RestaurantApiObject = {id: restaurant.id, email: restaurant.email, name: restaurant.restaurantName, description: restaurant.description,
                        address: {
                            streetName: "", houseNumber: 0, zipCode: 0, city: "", restaurantId: 0
                        }};
                    return trx.select('*').from('restaurantAddresses')
                        .where('restaurantId', restaurant.id)
                        .then(address => {
                            restaurantTemp.address = address[0];
                            return trx.select('id').from('menus').where('restaurantId', restaurant.id)
                                .then((id) => {
                                    restaurantTemp.menu = {
                                        id: id[0].id,
                                        categories: undefined
                                    };

                                    return trx.select('*').from('categories').where('menuId', restaurantTemp.menu.id)
                                        .then(categories => {
                                            restaurantTemp.menu = {id: id[0].id, categories: categories};

                                            // @ts-ignore
                                            return Promise.all(restaurantTemp.menu.categories.map((category, index) => {
                                                return trx.select('*').from('categoryItems').where('categoryId', category.id)
                                                    .then(items => {
                                                        // @ts-ignore
                                                        restaurantTemp.menu.categories[index].items = items;
                                                    })
                                            })).then(() => {
                                                restaurantApiObjects.push(restaurantTemp);
                                            })
                                        })
                                })
                        })
                }))
                    .then(() => {
                        console.log(restaurantApiObjects)
                        trx.commit();
                        res.status(200).json(restaurantApiObjects);
                    })
                    .catch(error => {
                        trx.rollback();
                        return res.status(400).json('Unable to get restaurants');
                    })
            })
    })
}
