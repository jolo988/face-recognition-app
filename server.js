const express = require('express');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const knex = require('knex')

const app = express();

//connect to localhost database
const db = knex({
    client: 'pg',
    connection: {
      host : '127.0.0.1',
      port : 5432,
      user : 'postgres',
      password : '',
      database : 'smart-brain'
    }
  });

//parse json data from frontend
app.use(express.json());
app.use(cors()); //apply middleware cors (security mechanism)

//res in json format
app.get('/', (req, res) => {
    res.send(db.users);
});

//need to receive from frontend body via HTTPS
app.post('/signin', (req, res) => {
    const { name, password } = req.body
    if (!email || !password) {
        return res.status(400).json('Incorrect form submission')
    }
    db.select('email', 'hash')
    .from('login')
    .where('email', '=', req.body.email)
    .then(data => {
        const isValid = bcrypt.compareSync(password, data[0].hash);
        if (isValid) {
            return db.select('*').from('users')
            .where('email', '=', email)
            .then(user => {
                res.json(user[0])
            })
            .catch(err => res.status(400).json('Unable to get user'))
        } else {
            res.status(400).json('Wrong credentials')
        }
    })
    .catch(err => res.status(400).json('Wrong credentials'))
    // bcrypt.compareSync("not_bacon", hash); // false})
     
});

//grab req.body -> enter new info to database
app.post('/register', (req, res) => {
    //pulling specific values from request body
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json('Incorrect form submission');//need return to end function if it gets returned
    }
    

    // bcrypt Usage - Sync method: 
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);

    //transaction wraps sql 'users' + 'login' tables(both to update or fail so tables don't update without one another)
        db.transaction(trx => {
            trx.insert({
                hash: hash,
                email: email
            })
            .into('login')
            .returning('email')
            .then(loginEmail => {
                return trx('users')
        //returning all columns response of registered user
                .returning('*')
                .insert({
                    name: name,
                    email: loginEmail[0].email,
                    joined: new Date() 
                })
            //if successful -> send response of/return object of registered user
                .then(user => {
                    res.json(user[0]);
                })
            })
            .then(trx.commit)//commit changes (add) to DB tables if all matches
            .catch(trx.rollback)//if anything fails -> rollback changes
        })    
        
        .catch(err => res.status(400).json('Unable to register'))
});

//Get param ID. loop through users database -> find matching ID
//if user id = id in server params -> return user id
//**can't set headers after they're sent -> loops and callbacks that run 2+ times will try to re-set headers */
//Can do map or filter or find() to find user w/ ID 
//if length >1 -> return user
app.get('/profile/:id', (req, res) => {
    const { id } = req.params;
    db.select('*').from('users').where({id})
        .then(user => {
            if (user.length) {
                res.json(user[0])
            } else {
                res.status(400).json('Username not found')
            }
        })
});

//for every image submitted in frontend -> hit this route -> increase counter when submitting image
//find user ID to update entries (receiving from body instead of params)
//if found -> res w/ user.entries + increase
//if ID in DB = id found in body ->
app.put('/image', (req, res) => {
    const { id } = req.body;
    db('users').where('id', '=', id)
    .increment('entries', 1)
    .returning('entries')
    .then(entries => {res.json(entries[0].entries)})
    .catch(err => res.status(400).json('Unable to update entries'))

});

// var bcrypt = require('bcryptjs');
// bcrypt.genSalt(10, function(err, salt) {
//     bcrypt.hash("B4c0/\/", salt, function(err, hash) {
//         // Store hash in your password DB.
//     });
// });

// // Load hash from your password DB.
// bcrypt.compare("B4c0/\/", hash, function(err, res) {
//     // res === true
// });
// bcrypt.compare("not_bacon", hash, function(err, res) {
//     // res === false
// });

// // As of bcryptjs 2.4.0, compare returns a promise if callback is omitted:
// bcrypt.compare("B4c0/\/", hash).then((res) => {
//     // res === true
// });

app.listen(8081, () => {
    console.log('app is running on port 8081')
});
