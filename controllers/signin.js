const handleGetRestaurants= (db) => (req, res) => {
    console.log("hello");
    const { zipcode } = req.params;
    if(!zipcode){
        return res.status(400).json('empty fields');
    }
    db.select('*').from('restaurants')
        .where('zipcode', '=', zipcode)
        .then(data => {
            return res.json(data);
        })
        .catch(error => res.status(400).json('No restaurants in your area'));
}

module.exports = {
    handleGetRestaurants: handleGetRestaurants
}