import {Knex} from "knex";
import {Request, Response} from "express";
import {AddressApiObject, RestaurantApiObject} from "../apiObjects/api";

export const handleSetRestaurants = (req: Request, res: Response, db: Knex) => {
    console.log(req.body);
    const restaurantRegistration: RestaurantApiObject = req.body;

    db.transaction(trx => {
        trx.select('email').from('restaurants').where('email', restaurantRegistration.email)
            .then(email => {
                if (email.length){
                    return res.status(400).json('Email already in use');
                }

                return trx.insert({
                    email: restaurantRegistration.email,
                    restaurantName: restaurantRegistration.name,
                    description: restaurantRegistration.description})
                    .into('restaurants')
                    .then(affectedRows => {
                        return trx.select('id').from('restaurants')
                            .where('email', restaurantRegistration.email)
                            .then(returnedId => {
                                const id: number = returnedId[0].id;
                                console.log(id);
                                const address: AddressApiObject = restaurantRegistration.address;
                                return trx.insert({
                                    restaurantId: id,
                                    streetName: address.streetName,
                                    houseNumber: address.houseNumber,
                                    zipCode: address.zipCode,
                                    city: address.city,
                                    floor: address.floor ? address.floor : null
                                }).into('restaurantAddresses')
                                    .then( affectedRows => {
                                        return trx.insert({restaurantId: id}).into('menus')
                                            .then(affectedRows => {
                                                trx.commit();
                                                console.log('Yes1');
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
