import express, {Request, Response} from 'express';
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
import {
    getRestaurant,
    handleAddNewCategory,
    handleAddNewItem, handleGetMenu,
    handleSetRestaurants
} from "./controllers/restaurantAdministration";

dotenv.config();
const app = express();
const port = process.env.PORT || 5000;

const db = knex({
    client: 'mysql2',
    connection: {
        host: process.env.RESTAURANT_DB_HOST ? `${process.env.RESTAURANT_DB_HOST}` : `127.0.0.1`,
        port: process.env.RESTAURANT_DB_PORT ? parseInt(`${process.env.RESTAURANT_DB_PORT}`) : 3306,
        user: process.env.RESTAURANT_DB_USER ? `${process.env.RESTAURANT_DB_USER}` : `root`,
        database: process.env.RESTAURANT_DB ? `${process.env.RESTAURANT_DB}` : `db`
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
                                                                res.status(400).json("F.")
                                                            })
                                                    })
                                                    .catch(error => {
                                                        res.status(400).json("E.")
                                                    })
                                            })
                                            .catch(error => {
                                                res.status(400).json("D.")
                                            })
                                    })
                                    .catch(error => {
                                        res.status(400).json("C.")
                                    })
                            })
                            .catch(error => {
                                res.status(400).json("B.");
                            })
                })
                    .catch(error => {
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

app.post("/createRestaurant", (req: Request, res: Response) => handleSetRestaurants(req, res, db));

app.get("/browsingList",  handleGetRestaurants(db));

app.post("/getRestaurant", (req: Request, res: Response) => {
    getRestaurant(req, res, db);
});

app.post("/addCategory", (req: Request, res: Response) => handleAddNewCategory(req, res, db));

app.post("/addItem", (req: Request, res: Response) => handleAddNewItem(req, res, db));

app.post("/getMenu", (req: Request, res: Response) => handleGetMenu(req, res, db));

app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
