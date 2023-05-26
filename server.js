require('dotenv').config();
const bodyParser = require('body-parser');
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server, {
    cors: {
        origin: '*',
    }
});

const { new_database_connection } = require('./src/database_connection.js');
const { update_user_database, update_user } = require('./src/update_data.js');
const api = require('./routes/api.js');
const auth = require('./routes/auth.js');

const port = process.env.PORT;

async function run() {
    global.mongo_connection = await new_database_connection();
    app.use(bodyParser.json());
    app.use(express.static('dist'));
    app.use('/grape',express.static('grape'));
    app.use('/JoeAdventureWebGL', express.static('JoeAdventureWebGL'));
    app.use('/vr', express.static('vr'));
    app.use("/api", api);
    app.use("/auth", auth);

    io.on('connection', (socket) => {
        console.log('New socket connection!!');

        socket.on('disconnect', () => {
            console.log('disconnect');
        });

        socket.on('toSocketId', e => {
            try {
                io.to(e.socketId).emit('remote', e.message);
            } catch (err) {
                console.log(err);
                socket.emit('status', err);
            }
        });

        socket.on('handShake', (EndPointId) => {
            console.log('handShake');
            socket.to(EndPointId).emit('handShake', socket.id);
            socket.on('disconnect', () => {
                socket.to(EndPointId).emit('offline', socket.id);
            });
        });

        let RaspDisconnectListenerAdded = false;

        socket.on('toMyDatabase', message => {
            try {
                if (message.timestamp == true) {
                    Object.keys(message.data).forEach(
                        key => {
                            message.data[key].timestamp = Date.now();
                        }
                    );
                };
                var dataToAdd = { devices: socket.id };
            } catch (err) {
                console.log(err);
                socket.emit('status', 'Failed to parse Json object');
            };
            update_user(message.databaseId, dataToAdd, 'addToSet');
            update_user_database(message.databaseId, message.data, message.method, socket);

            if (RaspDisconnectListenerAdded == false) {
                socket.on('disconnect', () => {
                    update_user(message.databaseId, dataToAdd, 'pull');
                });
                RaspDisconnectListenerAdded = true;
            };
        });
    });

    server.listen(port, () => {
        console.log('http port: ' + port);
    });
}

run();
