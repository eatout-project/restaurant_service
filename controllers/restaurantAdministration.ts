import {Knex} from "knex";
import {Request, Response} from "express";
import {AddressApiObject, RestaurantApiObject} from "../apiObjects/api";

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
                    restaurantName: restaurantRegistration.name,
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
                                                console.log(error);
                                                return res.status(400).json('Unable to create account');
                                            })
                                    })
                            })
                    })
            })
    })
}
