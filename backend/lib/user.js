import clientPromise from './mongodb';

export async function findUserByEmail(email) {
  const client = await clientPromise;
  const db = client.db(); // Always use .db()
  return db.collection('users').findOne({ email });
}

export async function createUser({ fullName, email, password }) {
  const client = await clientPromise;
  const db = client.db();
  return db.collection('users').insertOne({ fullName, email, password });
} 