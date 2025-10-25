/**
 * API routes for managing visit requests
 */

import { 
  createVisitRequest, 
  getVisitRequestsByUser, 
  getVisitRequestsByOwner,
  updateVisitRequestStatus,
  cancelVisitRequest
} from '../../../models/VisitRequest.js';
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

// Get visit requests (by user or owner)
export async function GET(req) {
  try {
    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return Response.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
    }

    const payload = verifyToken(token);
    const userId = payload.userId;

    const { searchParams } = new URL(req.url);
    const role = searchParams.get('role'); // 'user' or 'owner'

    let requests;
    if (role === 'owner') {
      requests = await getVisitRequestsByOwner(userId);
    } else {
      requests = await getVisitRequestsByUser(userId);
    }
    
    return Response.json({ requests }, { headers: corsHeaders });
  } catch (error) {
    console.error('Get visit requests error:', error);
    return Response.json(
      { error: error.message || 'Failed to get visit requests' },
      { status: 500, headers: corsHeaders }
    );
  }
}

// Create visit request
export async function POST(req) {
  try {
    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return Response.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
    }

    const payload = verifyToken(token);
    const userId = payload.userId;

    const data = await req.json();
    
    if (!data.listingId || !data.preferredDate || !data.preferredTime) {
      return Response.json(
        { error: 'Missing required fields' },
        { status: 400, headers: corsHeaders }
      );
    }

    const visitRequest = await createVisitRequest({
      ...data,
      userId,
    });
    
    console.log('Visit request created successfully, now creating notification...');
    
    // Send notification to property owner
    try {
      const client = await clientPromise;
      const db = client.db();
      const { ObjectId } = require('mongodb');
      
      console.log('Fetching listing with ID:', data.listingId);
      
      // Fetch listing details
      const listing = await db.collection('listings').findOne({ _id: new ObjectId(data.listingId) });
      
      console.log('Listing found:', !!listing, 'userEmail:', listing?.userEmail);
      
      if (listing && listing.userEmail) {
        // Find the owner by email
        const owner = await db.collection('users').findOne({ email: listing.userEmail });
        console.log('Owner found:', !!owner, 'ownerId:', owner?._id);
        
        // Fetch requester details
        const user = await db.collection('users').findOne({ _id: new ObjectId(userId) });
        console.log('Requester found:', !!user, 'fullName:', user?.fullName);
        
        if (owner && user) {
          console.log('Creating visit request notification:', {
            recipientId: owner._id.toString(),
            senderId: userId,
            listingName: listing.name
          });
          
          const template = NotificationTemplates.visitRequest(
            user.fullName || user.email,
            listing.name,
            new Date(data.preferredDate).toLocaleDateString()
          );
          
          console.log('Notification template:', template);
          
          const notificationResult = await createNotification({
            recipientId: owner._id.toString(),
            senderId: userId,
            ...template,
            listingId: data.listingId,
            listingName: listing.name,
            actionUrl: `/manage-visits`,
          });
          
          console.log('✅ Notification created successfully! ID:', notificationResult._id);
        } else {
          console.log('❌ Notification NOT created - missing owner or user:', {
            hasOwner: !!owner,
            hasUser: !!user
          });
        }
      } else {
        console.log('❌ Notification NOT created - listing has no userEmail');
      }
    } catch (notifError) {
      console.error('❌ Failed to send notification:', notifError);
      // Don't fail the request if notification fails
    }
    
    return Response.json({ 
      message: 'Visit request created',
      request: visitRequest 
    }, { status: 201, headers: corsHeaders });
  } catch (error) {
    console.error('Create visit request error:', error);
    return Response.json(
      { error: error.message || 'Failed to create visit request' },
      { status: 500, headers: corsHeaders }
    );
  }
}

// Update visit request status
export async function PATCH(req) {
  try {
    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return Response.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
    }

    const payload = verifyToken(token);
    const userId = payload.userId;

    const { searchParams } = new URL(req.url);
    const requestId = searchParams.get('id');
    const action = searchParams.get('action'); // 'approve', 'reject', 'cancel'
    
    if (!requestId || !action) {
      return Response.json({ error: 'Missing parameters' }, { status: 400, headers: corsHeaders });
    }

    let updated;
    let statusMap = {
      'approve': 'approved',
      'reject': 'rejected',
      'cancel': 'cancelled',
      'complete': 'completed'
    };
    
    if (action === 'cancel') {
      updated = await cancelVisitRequest(requestId, userId);
    } else {
      updated = await updateVisitRequestStatus(requestId, statusMap[action], userId);
    }
    
    if (!updated) {
      return Response.json(
        { error: 'Request not found or unauthorized' },
        { status: 404, headers: corsHeaders }
      );
    }
    
    // Send notification to requester (if approved or rejected)
    if (action === 'approve' || action === 'reject') {
      try {
        const client = await clientPromise;
        const db = client.db();
        const { ObjectId } = require('mongodb');
        
        // Fetch the visit request
        const visitRequest = await db.collection('visit_requests').findOne({ _id: new ObjectId(requestId) });
        
        if (visitRequest && visitRequest.userId) {
          // Fetch listing details
          const listing = await db.collection('listings').findOne({ _id: new ObjectId(visitRequest.listingId) });
          
          // Fetch owner details
          const owner = await db.collection('users').findOne({ _id: new ObjectId(userId) });
          
          if (listing && owner) {
            const template = action === 'approve' 
              ? NotificationTemplates.visitApproved(
                  owner.fullName || owner.email,
                  listing.name,
                  new Date(visitRequest.preferredDate).toLocaleDateString()
                )
              : NotificationTemplates.visitRejected(
                  owner.fullName || owner.email,
                  listing.name
                );
            
            await createNotification({
              recipientId: visitRequest.userId,
              senderId: userId,
              ...template,
              listingId: visitRequest.listingId,
              listingName: listing.name,
              actionUrl: `/manage-visits`,
            });
          }
        }
      } catch (notifError) {
        console.error('Failed to send notification:', notifError);
        // Don't fail the request if notification fails
      }
    }
    
    return Response.json({ message: `Request ${action}d successfully` }, { headers: corsHeaders });
  } catch (error) {
    console.error('Update visit request error:', error);
    return Response.json(
      { error: error.message || 'Failed to update visit request' },
      { status: 500, headers: corsHeaders }
    );
  }
}
