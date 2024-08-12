const { MongoClient } = require('mongodb');

const url = 'mongodb+srv://agustindelgado555:T2PvQo3d7rBPe5Lp@cluster0.3bzvm.mongodb.net/places_test?retryWrites=true&w=majority&appName=Cluster0';

let db;

const mongoConnect = async () => {
    try {
        const client = await MongoClient.connect(url);
        console.log('Connected to MongoDB');
        db = client.db();
    } catch (err) {
        console.error('Failed to connect to MongoDB', err);
        throw err;
    }
};

const getDb = () => {
    if (db) {
        return db;
    }
    throw 'No database found!';
};

module.exports = {
    mongoConnect,
    getDb
};

