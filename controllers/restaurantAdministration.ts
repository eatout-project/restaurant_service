import {Knex} from "knex";
import {Request, Response} from "express";
import {
    AddressApiObject,
    AddressResponseApiObject, LoginApiObject,
    RestaurantApiObject,
    RestaurantMenuApiObject, RestaurantResponseApiObject
} from "../apiObjects/api";

export const handleSetRestaurants = (req: Request, res: Response, db: Knex) => {
    const restaurantRegistration: RestaurantApiObject = req.body;

    db.transaction(trx => {
        trx.select('email').from('restaurants').where('email', restaurantRegistration.email)
            .then(email => {
                if (email.length){
                    return res.status(400).json('Email already in use');
                }

                trx.insert({
                    email: restaurantRegistration.email,
                    restaurantName: restaurantRegistration.restaurantName,
                    description: restaurantRegistration.description})
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
                                    .then( affectedRows => {
                                        trx.insert({restaurantId: id}).into('menus')
                                            .then(affectedRows => {
                                                trx.commit();
                                                return res.status(200).json('Success');
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

            db.select('*').from('restaurantAddresses').where('restaurantId', id)
                .then(addressData => {
                    const restaurantAddress: AddressResponseApiObject = addressData[0];

                    db.select('*').from('menus').where('restaurantId', id)
                        .then(menuData => {
                            const restaurantMenu: RestaurantMenuApiObject = menuData[0]
                            const restaurantObject: RestaurantResponseApiObject = {
                                id,
                                email,
                                restaurantName,
                                description,
                                restaurantAddress,
                                restaurantMenu
                            }
                            return res.status(200).json(restaurantObject);
                        })
                        .catch(error => {
                            return res.json(400).json('Unable to get restaurant data');
                        })
                })
        })
        .catch(error => {
            return res.status(400).json('Unable to get restaurant');
        })
}
