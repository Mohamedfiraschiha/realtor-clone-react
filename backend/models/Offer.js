/**
 * Offer model for managing purchase offers on sale properties
 * Includes negotiation history
 * Uses native MongoDB driver (no Mongoose)
 */

import clientPromise from '../lib/mongodb.js';

export async function getOffersCollection() {
  const client = await clientPromise;
  const db = client.db();
  const collection = db.collection('offers');
  
  // Create indexes
  await collection.createIndex({ listingId: 1 });
  await collection.createIndex({ buyerId: 1 });
  await collection.createIndex({ ownerId: 1 });
  await collection.createIndex({ status: 1 });
  await collection.createIndex({ createdAt: -1 });
  
  return collection;
}

export async function createOffer(data) {
  const collection = await getOffersCollection();
  
  const offer = {
    listingId: data.listingId,
    listingPrice: data.listingPrice,
    buyerId: data.buyerId,
    buyerName: data.buyerName,
    buyerEmail: data.buyerEmail,
    buyerPhone: data.buyerPhone,
    ownerId: data.ownerId,
    ownerEmail: data.ownerEmail,
    currentOfferPrice: data.offerPrice,
    originalOfferPrice: data.offerPrice,
    message: data.message || '',
    status: 'pending', // pending, accepted, rejected, countered, expired
    negotiationHistory: [
      {
        by: 'buyer',
        userId: data.buyerId,
        userName: data.buyerName,
        price: data.offerPrice,
        message: data.message || '',
        timestamp: new Date(),
      }
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  const result = await collection.insertOne(offer);
  return { ...offer, _id: result.insertedId };
}

export async function getOffersByBuyer(buyerId) {
  const collection = await getOffersCollection();
  return await collection
    .find({ buyerId })
    .sort({ createdAt: -1 })
    .toArray();
}

export async function getOffersByOwner(ownerId) {
  const collection = await getOffersCollection();
  return await collection
    .find({ ownerId })
    .sort({ createdAt: -1 })
    .toArray();
}

export async function getOffersByListing(listingId) {
  const collection = await getOffersCollection();
  return await collection
    .find({ listingId })
    .sort({ createdAt: -1 })
    .toArray();
}

export async function acceptOffer(offerId, ownerId) {
  const collection = await getOffersCollection();
  const { ObjectId } = await import('mongodb');
  
  const result = await collection.updateOne(
    { _id: new ObjectId(offerId), ownerId },
    { 
      $set: { 
        status: 'accepted',
        updatedAt: new Date()
      }
    }
  );
  
  return result.modifiedCount > 0;
}

export async function rejectOffer(offerId, ownerId, reason = '') {
  const collection = await getOffersCollection();
  const { ObjectId } = await import('mongodb');
  
  const result = await collection.updateOne(
    { _id: new ObjectId(offerId), ownerId },
    { 
      $set: { 
        status: 'rejected',
        rejectionReason: reason,
        updatedAt: new Date()
      }
    }
  );
  
  return result.modifiedCount > 0;
}

export async function counterOffer(offerId, ownerId, ownerName, counterPrice, message = '') {
  const collection = await getOffersCollection();
  const { ObjectId } = await import('mongodb');
  
  const negotiationEntry = {
    by: 'owner',
    userId: ownerId,
    userName: ownerName,
    price: counterPrice,
    message,
    timestamp: new Date(),
  };
  
  const result = await collection.updateOne(
    { _id: new ObjectId(offerId), ownerId },
    { 
      $set: { 
        status: 'countered',
        currentOfferPrice: counterPrice,
        updatedAt: new Date()
      },
      $push: {
        negotiationHistory: negotiationEntry
      }
    }
  );
  
  return result.modifiedCount > 0;
}

export async function updateOfferPrice(offerId, buyerId, newPrice, message = '') {
  const collection = await getOffersCollection();
  const { ObjectId } = await import('mongodb');
  
  // Get buyer name
  const offer = await collection.findOne({ _id: new ObjectId(offerId), buyerId });
  if (!offer) return false;
  
  const negotiationEntry = {
    by: 'buyer',
    userId: buyerId,
    userName: offer.buyerName,
    price: newPrice,
    message,
    timestamp: new Date(),
  };
  
  const result = await collection.updateOne(
    { _id: new ObjectId(offerId), buyerId },
    { 
      $set: { 
        status: 'pending',
        currentOfferPrice: newPrice,
        updatedAt: new Date()
      },
      $push: {
        negotiationHistory: negotiationEntry
      }
    }
  );
  
  return result.modifiedCount > 0;
}
