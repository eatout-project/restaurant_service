import {Knex} from "knex";
import {Request, Response} from "express";
import {RestaurantApiObject} from "../apiObjects/api";

export const handleGetRestaurants = (db: Knex) => (req: Request, res: Response) => {
    let restaurantApiObjects: RestaurantApiObject[] = [];

    db.select('*').from('restaurants')
        .then((restaurants) => {
            return Promise.all(restaurants.map((restaurant) => {
                const restaurantTemp: RestaurantApiObject = {email: "", name: restaurant.restaurantName, description: restaurant.description,
                    address: {
                    streetName: "", houseNumber: 0, zipCode: 0, city: "", restaurantId: 0
                    }};

                return db.select('*').from('restaurantAddresses')
                    .where('restaurantId', restaurant.id)
                    .then(address => {
                        restaurantTemp.address = address[0];

                        return db.select('id').from('menus').where('restaurantId', restaurant.id)
                            .then((id) => {
                                restaurantTemp.menu = {id: id[0].id};

                                return db.select('*').from('categories').where('menuId', restaurantTemp.menu.id)
                                    .then(categories => {
                                        restaurantTemp.menu = {id: id[0].id, categories: categories};

                                        // @ts-ignore
                                        return Promise.all(restaurantTemp.menu.categories.map((category, index) => {
                                            return db.select('*').from('categoryItems').where('categoryId', category.id)
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
        })
        .then(() => {
            res.status(200).json(restaurantApiObjects);
        })
        .catch(error => {
            res.status(400).json('No restaurants in your area')
        });
}
