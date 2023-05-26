const router = require('express').Router();
const ObjectId = require('mongodb').ObjectId;
const authMiddleware = require('../src/authMiddleware.js');

const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;

const TOKEN = "https://accounts.spotify.com/api/token";

router.get('/fetch_access_token',
    (req, res) => {
        let code = req.headers.code;
        let redirect_uri = req.headers.redirect_uri;
        let body = "grant_type=authorization_code";
        body += "&code=" + code;
        body += "&redirect_uri=" + encodeURI(redirect_uri);
        body += "&client_id=" + client_id;
        body += "&client_secret=" + client_secret;
        fetch(/////////call spotify API
            TOKEN,
            {
                method: "POST",
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': 'Basic ' + btoa(client_id + ":" + client_secret)
                },
                body: body
            }
        ).then(
            (response) => {
                if (response.status == 200) {
                    console.log("200");
                    response.json().then(
                        (data) => {
                            access_token = data.access_token;
                            refresh_token = data.refresh_token;
                            console.log("got token");
                            res.send(
                                {
                                    access_token: access_token,
                                    refresh_token: refresh_token
                                }
                            )
                        }
                    )
                } else {
                    res.status(404).send("error on fetchtoken")
                    console.log("error on fetchtoken")
                }
            }
        )
    }
);

router.get('/get_data',
    authMiddleware,
    (req, res) => {

        if (req.headers['content-type'] !== 'application/json') {
            return res.status(400).json({ error: 'Invalid content-type' });
        }

        try {
            if (req.headers.databaseId != null) {
                const databaseId = req.headers.databaseId;

                var o_id = new ObjectId(databaseId);
                global.mongo_connection
                    .db('database-app')
                    .collection('user_database')
                    .findOne(
                        { _id: o_id }
                    )
                    .then(
                        result => {
                            res.send(result);
                        }
                    );
            } else {
                res.status(409).send(); // Added send() to respond with empty body
            }
        } catch (errror) {
            return res.status(400).json({ error: 'Malformed JSON' });
        }
    }
);

router.get('/get_devices',
    authMiddleware,
    (req, res) => {

        if (req.headers['content-type'] !== 'application/json') {
            return res.status(400).json({ error: 'Invalid content-type' });
        }

        try {
            if (req.headers.databaseId != null) {
                const databaseId = req.headers.databaseId;

                var o_id = new ObjectId(databaseId);
                global.mongo_connection
                    .db('database-app')
                    .collection('users')
                    .findOne(
                        { databaseId: o_id }
                    )
                    .then(
                        result => {
                            res.send(result.devices);
                        }
                    );
            } else {
                res.status(409).send(); // Added send() to respond with empty body
            }
        } catch (error) {
            return res.status(400).json({ error: 'Malformed JSON' });
        }
    }
);

module.exports = router;
