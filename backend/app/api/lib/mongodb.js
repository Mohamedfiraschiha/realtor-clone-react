// lib/mongodb.js
import { MongoClient } from 'mongodb';

console.log('MONGODB_URI:', process.env.MONGODB_URI); // Debug log

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error('Please add your Mongo URI to .env.local');

let client;
let clientPromise;

if (!global._mongoClient) {
  client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  global._mongoClient = client;
  global._mongoClientPromise = client.connect();
} else {
  client = global._mongoClient;
}

clientPromise = global._mongoClientPromise;

export default clientPromise;
