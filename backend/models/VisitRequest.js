/**
 * Visit Request model for managing property viewing appointments
 * Uses native MongoDB driver (no Mongoose)
 */

import clientPromise from '../lib/mongodb.js';

export async function getVisitRequestsCollection() {
  const client = await clientPromise;
  const db = client.db();
  const collection = db.collection('visit_requests');
  
  // Create indexes
  await collection.createIndex({ listingId: 1 });
  await collection.createIndex({ userId: 1 });
  await collection.createIndex({ ownerId: 1 });
  await collection.createIndex({ status: 1 });
  await collection.createIndex({ createdAt: -1 });
  
  return collection;
}

export async function createVisitRequest(data) {
  const collection = await getVisitRequestsCollection();
  
  const visitRequest = {
    listingId: data.listingId,
    userId: data.userId,
    userName: data.userName,
    userEmail: data.userEmail,
    userPhone: data.userPhone,
    ownerId: data.ownerId,
    ownerEmail: data.ownerEmail,
    preferredDate: new Date(data.preferredDate),
    preferredTime: data.preferredTime,
    message: data.message || '',
    status: 'pending', // pending, approved, rejected, completed, cancelled
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  const result = await collection.insertOne(visitRequest);
  return { ...visitRequest, _id: result.insertedId };
}

export async function getVisitRequestsByUser(userId) {
  const collection = await getVisitRequestsCollection();
  return await collection
    .find({ userId })
    .sort({ createdAt: -1 })
    .toArray();
}

export async function getVisitRequestsByOwner(ownerId) {
  const collection = await getVisitRequestsCollection();
  return await collection
    .find({ ownerId })
    .sort({ createdAt: -1 })
    .toArray();
}

export async function updateVisitRequestStatus(requestId, status, userId) {
  const collection = await getVisitRequestsCollection();
  const { ObjectId } = await import('mongodb');
  
  const result = await collection.updateOne(
    { _id: new ObjectId(requestId), ownerId: userId },
    { 
      $set: { 
        status,
        updatedAt: new Date()
      }
    }
  );
  
  return result.modifiedCount > 0;
}

export async function cancelVisitRequest(requestId, userId) {
  const collection = await getVisitRequestsCollection();
  const { ObjectId } = await import('mongodb');
  
  const result = await collection.updateOne(
    { _id: new ObjectId(requestId), userId },
    { 
      $set: { 
        status: 'cancelled',
        updatedAt: new Date()
      }
    }
  );
  
  return result.modifiedCount > 0;
}
