## Restaurant service 

## Developer guide

To run the application:

    * Setup database
    1) Clone git@github.com:eatout-project/restaurant_db.git
    2) Clone git@github.com:eatout-project/docker-cofigurations.git
    3) cd docker-cofigurations
    4) run 'docker-compose up'

    * run restaurant_service
    1) run 'npm install' in command line from root of restaurant_service
    2) run 'npm start' in command line

    * create test data
    1) make a GET request to 'http://localhost:5000/create-test-data'