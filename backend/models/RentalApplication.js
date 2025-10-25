/**
 * Rental Application model for managing rental applications
 * Uses native MongoDB driver (no Mongoose)
 */

import clientPromise from '../lib/mongodb.js';

export async function getRentalApplicationsCollection() {
  const client = await clientPromise;
  const db = client.db();
  const collection = db.collection('rental_applications');
  
  // Create indexes
  await collection.createIndex({ listingId: 1 });
  await collection.createIndex({ applicantId: 1 });
  await collection.createIndex({ ownerId: 1 });
  await collection.createIndex({ status: 1 });
  await collection.createIndex({ createdAt: -1 });
  
  return collection;
}

export async function createRentalApplication(data) {
  const collection = await getRentalApplicationsCollection();
  
  const application = {
    listingId: data.listingId,
    applicantId: data.applicantId,
    ownerId: data.ownerId,
    ownerEmail: data.ownerEmail,
    
    // Personal Information
    personalInfo: {
      fullName: data.personalInfo.fullName,
      email: data.personalInfo.email,
      phone: data.personalInfo.phone,
      dateOfBirth: data.personalInfo.dateOfBirth,
      currentAddress: data.personalInfo.currentAddress,
      moveInDate: new Date(data.personalInfo.moveInDate),
    },
    
    // Employment Information
    employmentInfo: {
      employmentStatus: data.employmentInfo.employmentStatus,
      employer: data.employmentInfo.employer || '',
      position: data.employmentInfo.position || '',
      monthlyIncome: data.employmentInfo.monthlyIncome,
      employmentDuration: data.employmentInfo.employmentDuration || '',
    },
    
    // References
    references: data.references || [], // Array of {name, relationship, phone, email}
    
    // Additional Info
    numberOfOccupants: data.numberOfOccupants || 1,
    hasPets: data.hasPets || false,
    petDetails: data.petDetails || '',
    additionalNotes: data.additionalNotes || '',
    
    // Credit check consent
    creditCheckConsent: data.creditCheckConsent || false,
    backgroundCheckConsent: data.backgroundCheckConsent || false,
    
    status: 'pending', // pending, approved, rejected, withdrawn
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  const result = await collection.insertOne(application);
  return { ...application, _id: result.insertedId };
}

export async function getApplicationsByApplicant(applicantId) {
  const collection = await getRentalApplicationsCollection();
  return await collection
    .find({ applicantId })
    .sort({ createdAt: -1 })
    .toArray();
}

export async function getApplicationsByOwner(ownerId) {
  const collection = await getRentalApplicationsCollection();
  return await collection
    .find({ ownerId })
    .sort({ createdAt: -1 })
    .toArray();
}

export async function updateApplicationStatus(applicationId, status, userId) {
  const collection = await getRentalApplicationsCollection();
  const { ObjectId } = await import('mongodb');
  
  const result = await collection.updateOne(
    { _id: new ObjectId(applicationId), ownerId: userId },
    { 
      $set: { 
        status,
        updatedAt: new Date()
      }
    }
  );
  
  return result.modifiedCount > 0;
}

export async function withdrawApplication(applicationId, applicantId) {
  const collection = await getRentalApplicationsCollection();
  const { ObjectId } = await import('mongodb');
  
  const result = await collection.updateOne(
    { _id: new ObjectId(applicationId), applicantId },
    { 
      $set: { 
        status: 'withdrawn',
        updatedAt: new Date()
      }
    }
  );
  
  return result.modifiedCount > 0;
}
