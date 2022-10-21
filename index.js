const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const knex = require('knex');
const restuarants = require('./controllers/signin');
const { testDataRestaurants, testDataAddresses } = require('./testdata/testdata');
// const register = require('./controllers/register');

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
    console.log('testdatarestaurants: ', testDataRestaurants);
    let addressesFinal = [];
    const selected = [];
    db.transaction(trx => {
        trx.insert(testDataRestaurants)
            .into('restaurants')
            .then(affectedRows => {
                trx.select('id', 'restaurantName')
                    .from('restaurants')
                    .then(values => {
                        console.log(values);
                        for (let i = 0; i < testDataAddresses.length; i++) {
                            for (let j = 0; j < values.length; j++) {
                                if (testDataAddresses[i].name === values[j].restaurantName && !selected.includes(testDataAddresses[i].name)) {
                                    testDataAddresses[i].restaurentId = values[j].id;
                                    addressesFinal.push({
                                        restaurantId: values[j].id,
                                        streetName: testDataAddresses[i].address.streetName,
                                        houseNumber: testDataAddresses[i].address.houseNumber,
                                        zipCode: testDataAddresses[i].address.zipCode,
                                        city: testDataAddresses[i].address.city
                                    })
                                    selected.push(testDataAddresses[i].name);
                                }
                            }
                        }
                }).then(() => {
                    console.log('addressesFinal: ', addressesFinal);
                    trx.insert(addressesFinal)
                        .into('restaurantAddresses')
                        .then(affectedRows => {
                            res.status(200).json('Restaurants added');
                        })
                })
                    .then(trx.commit)
                    .catch(error => {
                        trx.rollback
                        console.log(error);
                        res.status(400).json("Unable to add restaurant.")
                    })
            })
    });
})

app.get("/restaurants/:zipcode",  restuarants.handleGetRestaurants(db));

/*
db.transaction(trx => {
        trx.insert({restaurantName: testData, description: email})
            .into('login')
            .returning('email')
            .then(loginEmail => {
                return trx('users')
                    .returning('*')
                    .insert({
                        name: name,
                        email: loginEmail[0],
                        joined: new Date()
                    })
                    .then(user => {
                        res.json(user[0]);
                    })
            })
            .then(trx.commit)
            .catch(trx.rollback)
    })
        .catch(error => res.status(400).json("Unable to register. Email already in use. "));
    res.status(200).json('Server is up and running');
*/


// app.post("/register", (req, res) => {register.handleRegister(req, res, db, bcrypt)});

let port = process.env.PORT;
if (port == null || port == "") {
    port = 5000;
}
app.listen(port);