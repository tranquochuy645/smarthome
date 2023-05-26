
const ObjectId = require('mongodb').ObjectId;
async function update_user_database(id, objectData, method = 'set', socket = null) {
    var o_id = new ObjectId(id);
    if (method == 'set') {


        global.mongo_connection
            .db('database-app')
            .collection('user_database')
            .updateOne(
                { _id: o_id },
                {
                    $set: objectData
                }
            ).catch((err) => {
                console.log(err)
                if (socket != null) {
                    try {
                        socket.emit('status', 'Failed to '+method)
                    } catch (socket_err) {
                        console.log(socket_err)
                    }
                }
            });
    };
    if (method == 'unset') {


        global.mongo_connection
            .db('database-app')
            .collection('user_database')
            .updateOne(
                { _id: o_id },
                {
                    $unset: objectData
                }
            ).catch((err) => {
                console.log(err)
                if (socket != null) {
                    try {
                        socket.emit('status', 'Failed to '+method)
                    } catch (socket_err) {
                        console.log(socket_err)
                    }
                }
            });
    };


    if (method == 'push') {


        global.mongo_connection
            .db('database-app')
            .collection('user_database')
            .updateOne(
                { _id: o_id },
                {
                    $push: objectData
                }
            ).catch((err) => {
                console.log(err)
                if (socket != null) {
                    try {
                        socket.emit('status', 'Failed to '+method)
                    } catch (socket_err) {
                        console.log(socket_err)
                    }
                }
            });
    };
    if (method == 'addToSet') {

        global.mongo_connection
            .db('database-app')
            .collection('user_database')
            .updateOne(
                { _id: o_id },
                {
                    $addToSet: objectData
                }
            ).catch((err) => {
                console.log(err)
                if (socket != null) {
                    try {
                        socket.emit('status', 'Failed to '+method)
                    } catch (socket_err) {
                        console.log(socket_err)
                    }
                }
            });
    };
    if (method == 'pull') {


        global.mongo_connection
            .db('database-app')
            .collection('user_database')
            .updateOne(
                { _id: o_id },
                {
                    $pull: objectData
                }
            )
            .catch((err) => {
                console.log(err)
                if (socket != null) {
                    try {
                        socket.emit('status', 'Failed to '+method)
                    } catch (socket_err) {
                        console.log(socket_err)
                    }
                }
                // global.mongo_err=err
            });
    };

    // close_database_connection(mongo_connection);



};
async function update_user(id, objectData, method = 'set', socket = null) {

    var o_id = new ObjectId(id);
    if (method == 'set') {
        global.mongo_connection
            .db('database-app')
            .collection('users')
            .updateOne(
                { databaseId: o_id },
                {
                    $set: objectData
                }
            ).catch((err) => {
                console.log(err)
                if (socket != null) {
                    try {
                        socket.emit('status', 'Failed to '+method)
                    } catch (socket_err) {
                        console.log(socket_err)
                    }
                }
            });
    };
    if (method == 'unset') {
        global.mongo_connection
            .db('database-app')
            .collection('users')
            .updateOne(
                { databaseId: o_id },
                {
                    $unset: objectData
                }
            ).catch((err) => {
                console.log(err)
                if (socket != null) {
                    try {
                        socket.emit('status', 'Failed to '+method)
                    } catch (socket_err) {
                        console.log(socket_err)
                    }
                }
            });
    };
    if (method == 'push') {
        global.mongo_connection
            .db('database-app')
            .collection('users')
            .updateOne(
                { databaseId: o_id },
                {
                    $push: objectData
                }
            ).catch((err) => {
                console.log(err)
                if (socket != null) {
                    try {
                        socket.emit('status', 'Failed to '+method)
                    } catch (socket_err) {
                        console.log(socket_err)
                    }
                }
            });
    };
    if (method == 'addToSet') {
        global.mongo_connection
            .db('database-app')
            .collection('users')
            .updateOne(
                { databaseId: o_id },
                {
                    $addToSet: objectData
                }
            ).catch((err) => {
                console.log(err)
                if (socket != null) {
                    try {
                        socket.emit('status', 'Failed to '+method)
                    } catch (socket_err) {
                        console.log(socket_err)
                    }
                }
            });
    };
    if (method == 'pull') {

        global.mongo_connection
            .db('database-app')
            .collection('users')
            .updateOne(
                { databaseId: o_id },
                {
                    $pull: objectData
                }
            ).catch((err) => {
                console.log(err)
                if (socket != null) {
                    try {
                        socket.emit('status', 'Failed to '+method)
                    } catch (socket_err) {
                        console.log(socket_err)
                    }
                }
            });

    }
};


module.exports = {
    update_user,
    update_user_database
};