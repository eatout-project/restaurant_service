const handleRegister = (req, res, db, bcrypt) => {
    const { email, name, password } = req.body;
    if(!email || !name || !password){
        return res.status(400).json('empty fields');
    }
    if (password.length > 50) {
        res.status(400).json('password is too long. Maximum is 49 characters');
    }
    const hash = bcrypt.hashSync(password, 10);
    db.transaction(trx => {
        trx.insert({hash: hash, email: email})
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

}

module.exports = {
    handleRegister: handleRegister
}