const testDataRestaurants = [
        {
            restaurantName: 'Mogensens',
            description: 'Sygt hyggeligt'
        },
        {
            restaurantName: 'Valdemarsens',
            description: 'Lækker lækker'
        },
        {
            restaurantName: 'Bogenses',
            description: 'Den er fiiiiin'
        },
        {
            restaurantName: 'Den aalborgensiske',
            description: 'Ja det bare dæjli'
        },
    ];

const testDataAddresses = [
    {
        name: 'Mogensens',
        address: {
            streetName: 'Tranekærvej',
            houseNumber: 68,
            zipCode: 8240,
            city: 'Risskov'
        }
    },
    {
        name: 'Valdemarsens',
        address: {
            streetName: 'Jørgen brønlundsvej',
            houseNumber: 5,
            zipCode: 7100,
            city: 'Vejle'
        }
    },
    {
        name: 'Bogenses',
        address: {
            streetName: 'Søren frichs vej',
            houseNumber: 39,
            zipCode: 8200,
            city: 'Aarhus'
        }
    },
    {
        name: 'Den aalborgensiske',
        address: {
            streetName: 'Nørrevænget',
            houseNumber: 55,
            zipCode: 5000,
            city: 'Odense'
        }
    },
];


module.exports = {
    testDataRestaurants: testDataRestaurants,
    testDataAddresses: testDataAddresses
}