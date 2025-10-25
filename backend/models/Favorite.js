/**
 * Favorite model for managing user's wishlist/favorites
 * Uses native MongoDB driver (no Mongoose)
 */

import clientPromise from '../lib/mongodb.js';

export async function getFavoritesCollection() {
  const client = await clientPromise;
  const db = client.db();
  const collection = db.collection('favorites');
  
  // Create indexes
  await collection.createIndex({ userId: 1, listingId: 1 }, { unique: true });
  await collection.createIndex({ userId: 1 });
  await collection.createIndex({ createdAt: -1 });
  
  return collection;
}

export async function addToFavorites(userId, listingId) {
  const collection = await getFavoritesCollection();
  
  const favorite = {
    userId,
    listingId,
    createdAt: new Date(),
  };
  
  try {
    const result = await collection.insertOne(favorite);
    return { ...favorite, _id: result.insertedId };
  } catch (error) {
    // Handle duplicate key error
    if (error.code === 11000) {
      throw new Error('Listing already in favorites');
    }
    throw error;
  }
}

export async function removeFromFavorites(userId, listingId) {
  const collection = await getFavoritesCollection();
  const result = await collection.deleteOne({ userId, listingId });
  return result.deletedCount > 0;
}

export async function getUserFavorites(userId) {
  const collection = await getFavoritesCollection();
  return await collection.find({ userId }).sort({ createdAt: -1 }).toArray();
}

export async function isFavorite(userId, listingId) {
  const collection = await getFavoritesCollection();
  const favorite = await collection.findOne({ userId, listingId });
  return favorite !== null;
}
