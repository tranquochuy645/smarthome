const authMiddleware = require('../src/authMiddleware');
const router = require('express').Router();
require('dotenv').config();
const jwt = require('jsonwebtoken');

const secretKey = process.env.JWT_KEY;


// Create user endpoint
router.post('/create_user', (req, res) => {
  if (req.headers['content-type'] !== 'application/json') {
    return res.status(400).json({ error: 'Invalid content-type' });
  }

  try {
    if (req.body.username == "" || req.body.password == "") {
      res.status(409).send('Empty username or password');
      console.log('empty');
      return;
    }

    const username = req.body.username;
    const password = req.body.password;

    const db = global.mongo_connection.db('database-app');
    db.collection('users').findOne({ 'username': username })
      .then((user) => {
        if (user) {
          console.log(`Username "${username}" already exists`);
          res.status(409).send('Username already exists');
        } else {
          var databaseId;
          db.collection('user_database').insertOne({})
            .then((result) => {
              if (!result) {
                console.log('Failed to create user database');
                res.status(500);
                return;
              } else {
                databaseId = result.insertedId;
                db.collection('users').insertOne({
                  username: username,
                  password: password,
                  databaseId: databaseId,
                  devices: [],
                })
                  .then((result) => {
                    if (!result) {
                      console.error('Error creating user');
                      res.status(500).send('Error creating user');
                    } else {
                      console.log(`User "${username}" created`);
                      res.status(201).send('User created successfully');
                    }
                  });
              }
            });
        }
      });
  } catch (error) {
    return res.status(400).json({ error: 'Malformed JSON' });
  }
});

// Login endpoint
router.post('/login', async (req, res) => {
  if (req.headers['content-type'] !== 'application/json') {
    return res.status(400).json({ error: 'Invalid content-type' });
  }

  try {
    const username = req.body.username;
    const password = req.body.password;

    const db = global.mongo_connection.db('database-app');
    db.collection('users').findOne({
      'username': username,
      'password': password
    })
      .then(user => {
        if (user) {
          const token = jwt.sign({ databaseId: user.databaseId.toString() }, secretKey, { expiresIn: '1h' });
          console.log(`User "${username}" logged in`);
          res.status(200).json({ token: token });
        } else {
          console.log(`Invalid username/password for user "${username}"`);
          res.status(401).send('Invalid username/password');
        }
      })
      .catch(error => {
        console.error(error);
        res.status(500).send('Error logging in');
      });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ error: 'Malformed JSON' });
  }
});


module.exports = router;
