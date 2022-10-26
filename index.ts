import express from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import cors from 'cors';
import {knex} from 'knex';
import {handleGetRestaurants} from './controllers/browsing';
import {
    testDataAddresses,
    testdatacategory,
    testdatacategoryitem,
    testDataMenu,
    testdatamenu,
    testDataRestaurants
} from './testdata/testdata';
import {AddressApiObject} from "./apiObjects/api";

dotenv.config();
const app = express();
const port = process.env.PORT;

const db = knex({
    client: 'mysql2',
    connection: {
        host: 'localhost',
        port:3307,
        user: 'root',
        database: 'db'
    }
});

app.use(bodyParser.json());
app.use(cors());

app.get('/', (req, res) => {
    res.status(200).json('Server is up and running');
})

app.get('/create-test-data', (req, res) => {
    const addressesFinal: AddressApiObject[] = [];
    const menusFinal: testdatamenu[] = [];
    const categoriesFinal: testdatacategory[] = [];
    const categoryItemsFinal: testdatacategoryitem[] = [];
    let selected: string[] = [];
    db.transaction(trx => {
        trx.insert(testDataRestaurants)
            .into('restaurants')
            .then(affectedRows => {
                return trx.select('id', 'restaurantName')
                    .from('restaurants')
                    .then(restaurantData => {
                        for (let i = 0; i < testDataAddresses.length; i++) {
                            for (let j = 0; j < restaurantData.length; j++) {
                                if (testDataAddresses[i].name === restaurantData[j].restaurantName && !selected.includes(testDataAddresses[i].name)) {
                                    addressesFinal.push({
                                        restaurantId: restaurantData[j].id,
                                        streetName: testDataAddresses[i].address.streetName,
                                        houseNumber: testDataAddresses[i].address.houseNumber,
                                        zipCode: testDataAddresses[i].address.zipCode,
                                        city: testDataAddresses[i].address.city
                                    })
                                    selected.push(testDataAddresses[i].name);
                                }
                            }
                        }
                        return trx.insert(addressesFinal)
                            .into('restaurantAddresses')
                            .then(affectedRows => {
                                for (let i = 0; i < restaurantData.length; i++) {
                                    menusFinal.push({restaurantId: restaurantData[i].id})
                                }
                                return trx.insert(menusFinal)
                                    .into('menus')
                                    .then(affectedRows => {
                                        return trx.select('id', 'restaurantId')
                                            .from('menus')
                                            .then(menuData => {
                                                for (let i = 0; i < menuData.length; i++) {
                                                    for (let j = 0; j < testDataMenu.length; j++) {
                                                        categoriesFinal.push({menuId: menuData[i].id, title: testDataMenu[j].title});
                                                        // test.push({menuId: menuData[i].id});
                                                    }
                                                }
                                                return trx.insert(categoriesFinal)
                                                    .into('categories')
                                                    .then(affectedRows => {
                                                        return trx.select('id', 'title')
                                                            .from('categories')
                                                            .then(categoriesData => {
                                                                for (let i = 0; i < categoriesData.length; i++) { // 20 category ids, 4 restaurants * 5 categories
                                                                    for (let j = 0; j < testDataMenu.length; j++) { // 5
                                                                        for (let k = 0; k < testDataMenu[j].items.length; k++) { // 3 items pr category
                                                                            if (categoriesData[i].title === testDataMenu[j].title) {
                                                                                categoryItemsFinal.push({categoryId: categoriesData[i].id, name: testDataMenu[j].items[k].name, description: testDataMenu[j].items[k].description, price: testDataMenu[j].items[k].price});
                                                                            }
                                                                        }
                                                                    }
                                                                }
                                                                return trx.insert(categoryItemsFinal)
                                                                    .into('categoryItems')
                                                                    .then(() => {
                                                                        res.status(200).json('Added restaurants');
                                                                    })
                                                            })
                                                            .catch(error => {
                                                                console.log('categories select: ', error);
                                                                res.status(400).json("F.")
                                                            })
                                                    })
                                                    .catch(error => {
                                                        console.log('categoru insertion: ', error);
                                                        res.status(400).json("E.")
                                                    })
                                            })
                                            .catch(error => {
                                                console.log('menu selection: ', error);
                                                res.status(400).json("D.")
                                            })
                                    })
                                    .catch(error => {
                                        console.log('menu insertion: ', error);
                                        res.status(400).json("C.")
                                    })
                            })
                            .catch(error => {
                                console.log('address insertion: ', error);
                                res.status(400).json("B.");
                            })
                })
                    .catch(error => {
                        console.log('Unable to get restaurants: ', error);
                        res.status(400).json("A.");
                    })
            })
            .then(trx.commit)
            .catch(trx.rollback)
    })
        .catch(error => {
            console.log(error);
            res.status(400).json("Unable to add restaurant.")
        });
})

app.get("/browsingList",  handleGetRestaurants(db));

app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at https://localhost:${port}`);
});