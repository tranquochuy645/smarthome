require('dotenv').config();
const { MongoClient } = require('mongodb');
// const authMiddleware=require('./authMiddleware');

const mongo_uri = process.env.MONGO_URI;

async function new_database_connection() {
  const mongo_client = new MongoClient(mongo_uri, { useNewUrlParser: true, useUnifiedTopology: true });

  try {
    await mongo_client.connect();
    console.log('Connected to database');
    return mongo_client;
  } catch (error) {
    console.error(error);
  }
};
function close_database_connection(cli) {
    cli.close();
    console.log('Closed database connection');
};

module.exports = {
  new_database_connection,
  close_database_connection
};
