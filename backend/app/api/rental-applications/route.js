/**
 * API routes for managing rental applications
 */

import { 
  createRentalApplication, 
  getApplicationsByApplicant, 
  getApplicationsByOwner,
  updateApplicationStatus,
  withdrawApplication
} from '../../../models/RentalApplication.js';
import { verifyToken } from '../../../lib/auth.js';
import { createNotification, NotificationTemplates } from '../../../lib/notificationHelper.js';
import clientPromise from '../../../lib/mongodb.js';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Handle OPTIONS request for CORS preflight
export async function OPTIONS(req) {
  return new Response(null, {
    status: 200,
    headers: corsHeaders,
  });
}

// Get applications
export async function GET(req) {
  try {
    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return Response.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
    }

    const payload = verifyToken(token);
    const userId = payload.userId;

    const { searchParams } = new URL(req.url);
    const role = searchParams.get('role'); // 'applicant' or 'owner'

    let applications;
    if (role === 'owner') {
      applications = await getApplicationsByOwner(userId);
    } else {
      applications = await getApplicationsByApplicant(userId);
    }
    
    return Response.json({ applications }, { headers: corsHeaders });
  } catch (error) {
    console.error('Get applications error:', error);
    return Response.json(
      { error: error.message || 'Failed to get applications' },
      { status: 500, headers: corsHeaders }
    );
  }
}

// Submit application
export async function POST(req) {
  try {
    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return Response.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
    }

    const payload = verifyToken(token);
    const applicantId = payload.userId;

    const data = await req.json();
    
    if (!data.listingId || !data.personalInfo || !data.employmentInfo) {
      return Response.json(
        { error: 'Missing required fields' },
        { status: 400, headers: corsHeaders }
      );
    }

    const application = await createRentalApplication({
      ...data,
      applicantId,
    });
    
    // Send notification to property owner
    try {
      const client = await clientPromise;
      const db = client.db();
      const { ObjectId } = require('mongodb');
      
      // Fetch listing details
      const listing = await db.collection('listings').findOne({ _id: new ObjectId(data.listingId) });
      
      if (listing && listing.userEmail) {
        // Find the owner by email
        const owner = await db.collection('users').findOne({ email: listing.userEmail });
        
        // Fetch applicant details
        const user = await db.collection('users').findOne({ _id: new ObjectId(applicantId) });
        
        if (owner && user) {
          const template = NotificationTemplates.applicationReceived(
            user.fullName || user.email,
            listing.name
          );
          
          await createNotification({
            recipientId: owner._id.toString(),
            senderId: applicantId,
            ...template,
            listingId: data.listingId,
            listingName: listing.name,
            actionUrl: `/manage-applications`,
          });
        }
      }
    } catch (notifError) {
      console.error('Failed to send notification:', notifError);
      // Don't fail the request if notification fails
    }    return Response.json({ 
      message: 'Application submitted successfully',
      application 
    }, { status: 201, headers: corsHeaders });
  } catch (error) {
    console.error('Create application error:', error);
    return Response.json(
      { error: error.message || 'Failed to submit application' },
      { status: 500, headers: corsHeaders }
    );
  }
}

// Update application status
export async function PATCH(req) {
  try {
    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return Response.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
    }

    const payload = verifyToken(token);
    const userId = payload.userId;

    const { searchParams } = new URL(req.url);
    const applicationId = searchParams.get('id');
    const action = searchParams.get('action'); // 'approve', 'reject', 'withdraw'
    
    if (!applicationId || !action) {
      return Response.json({ error: 'Missing parameters' }, { status: 400, headers: corsHeaders });
    }

    let updated;
    const statusMap = {
      'approve': 'approved',
      'reject': 'rejected',
      'withdraw': 'withdrawn'
    };
    
    if (action === 'withdraw') {
      updated = await withdrawApplication(applicationId, userId);
    } else {
      updated = await updateApplicationStatus(applicationId, statusMap[action], userId);
    }
    
    if (!updated) {
      return Response.json(
        { error: 'Application not found or unauthorized' },
        { status: 404, headers: corsHeaders }
      );
    }
    
    // Send notification to applicant (if approved or rejected)
    if (action === 'approve' || action === 'reject') {
      try {
        const client = await clientPromise;
        const db = client.db();
        const { ObjectId } = require('mongodb');
        
        // Fetch the application
        const application = await db.collection('rental_applications').findOne({ _id: new ObjectId(applicationId) });
        
        if (application && application.applicantId) {
          // Fetch listing details
          const listing = await db.collection('listings').findOne({ _id: new ObjectId(application.listingId) });
          
          // Fetch owner details
          const owner = await db.collection('users').findOne({ _id: new ObjectId(userId) });
          
          if (listing && owner) {
            const template = action === 'approve'
              ? NotificationTemplates.applicationApproved(
                  owner.fullName || owner.email,
                  listing.name
                )
              : NotificationTemplates.applicationRejected(
                  owner.fullName || owner.email,
                  listing.name
                );
            
            await createNotification({
              recipientId: application.applicantId,
              senderId: userId,
              ...template,
              listingId: application.listingId,
              listingName: listing.name,
              actionUrl: `/manage-applications`,
            });
          }
        }
      } catch (notifError) {
        console.error('Failed to send notification:', notifError);
        // Don't fail the request if notification fails
      }
    }
    
    return Response.json({ message: `Application ${action}ed successfully` }, { headers: corsHeaders });
  } catch (error) {
    console.error('Update application error:', error);
    return Response.json(
      { error: error.message || 'Failed to update application' },
      { status: 500, headers: corsHeaders }
    );
  }
}
