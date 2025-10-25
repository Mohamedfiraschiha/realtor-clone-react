/**
 * API routes for managing offers on sale properties
 */

import { 
  createOffer, 
  getOffersByBuyer, 
  getOffersByOwner,
  getOffersByListing,
  acceptOffer,
  rejectOffer,
  counterOffer,
  updateOfferPrice
} from '../../../models/Offer.js';
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

// Get offers
export async function GET(req) {
  try {
    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return Response.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
    }

    const payload = verifyToken(token);
    const userId = payload.userId;

    const { searchParams } = new URL(req.url);
    const role = searchParams.get('role'); // 'buyer' or 'owner'
    const listingId = searchParams.get('listingId');

    let offers;
    if (listingId) {
      offers = await getOffersByListing(listingId);
    } else if (role === 'owner') {
      offers = await getOffersByOwner(userId);
    } else {
      offers = await getOffersByBuyer(userId);
    }
    
    return Response.json({ offers }, { headers: corsHeaders });
  } catch (error) {
    console.error('Get offers error:', error);
    return Response.json(
      { error: error.message || 'Failed to get offers' },
      { status: 500, headers: corsHeaders }
    );
  }
}

// Create offer
export async function POST(req) {
  try {
    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return Response.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
    }

    const payload = verifyToken(token);
    const buyerId = payload.userId;

    const data = await req.json();
    
    if (!data.listingId || !data.offerPrice) {
      return Response.json(
        { error: 'Missing required fields' },
        { status: 400, headers: corsHeaders }
      );
    }

    const offer = await createOffer({
      ...data,
      buyerId,
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
        
        // Fetch buyer details
        const user = await db.collection('users').findOne({ _id: new ObjectId(buyerId) });
        
        if (owner && user) {
          const template = NotificationTemplates.offerReceived(
            user.fullName || user.email,
            listing.name,
            data.offerPrice
          );
          
          await createNotification({
            recipientId: owner._id.toString(),
            senderId: buyerId,
            ...template,
            listingId: data.listingId,
            listingName: listing.name,
            actionUrl: `/manage-offers`,
          });
        }
      }
    } catch (notifError) {
      console.error('Failed to send notification:', notifError);
      // Don't fail the request if notification fails
    }
    
    return Response.json({ 
      message: 'Offer created successfully',
      offer 
    }, { status: 201, headers: corsHeaders });
  } catch (error) {
    console.error('Create offer error:', error);
    return Response.json(
      { error: error.message || 'Failed to create offer' },
      { status: 500, headers: corsHeaders }
    );
  }
}

// Update offer (accept, reject, counter, update price)
export async function PATCH(req) {
  try {
    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return Response.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
    }

    const payload = verifyToken(token);
    const userId = payload.userId;

    const { searchParams } = new URL(req.url);
    const offerId = searchParams.get('id');
    const action = searchParams.get('action'); // 'accept', 'reject', 'counter', 'update'
    
    if (!offerId || !action) {
      return Response.json({ error: 'Missing parameters' }, { status: 400, headers: corsHeaders });
    }

    const data = await req.json();
    let updated;
    
    switch (action) {
      case 'accept':
        updated = await acceptOffer(offerId, userId);
        break;
      case 'reject':
        updated = await rejectOffer(offerId, userId, data.reason);
        break;
      case 'counter':
        if (!data.counterPrice) {
          return Response.json({ error: 'Counter price required' }, { status: 400, headers: corsHeaders });
        }
        updated = await counterOffer(offerId, userId, data.ownerName, data.counterPrice, data.message);
        break;
      case 'update':
        if (!data.newPrice) {
          return Response.json({ error: 'New price required' }, { status: 400, headers: corsHeaders });
        }
        updated = await updateOfferPrice(offerId, userId, data.newPrice, data.message);
        break;
      default:
        return Response.json({ error: 'Invalid action' }, { status: 400, headers: corsHeaders });
    }
    
    if (!updated) {
      return Response.json(
        { error: 'Offer not found or unauthorized' },
        { status: 404, headers: corsHeaders }
      );
    }
    
    // Send notification to buyer
    if (action === 'accept' || action === 'reject' || action === 'counter') {
      try {
        const client = await clientPromise;
        const db = client.db();
        const { ObjectId } = require('mongodb');
        
        // Fetch the offer
        const offer = await db.collection('offers').findOne({ _id: new ObjectId(offerId) });
        
        if (offer && offer.buyerId) {
          // Fetch listing details
          const listing = await db.collection('listings').findOne({ _id: new ObjectId(offer.listingId) });
          
          // Fetch owner details
          const owner = await db.collection('users').findOne({ _id: new ObjectId(userId) });
          
          if (listing && owner) {
            let template;
            if (action === 'accept') {
              template = NotificationTemplates.offerAccepted(
                owner.fullName || owner.email,
                listing.name
              );
            } else if (action === 'reject') {
              template = NotificationTemplates.offerRejected(
                owner.fullName || owner.email,
                listing.name
              );
            } else if (action === 'counter') {
              template = NotificationTemplates.offerCountered(
                owner.fullName || owner.email,
                listing.name,
                data.counterPrice
              );
            }
            
            if (template) {
              await createNotification({
                recipientId: offer.buyerId,
                senderId: userId,
                ...template,
                listingId: offer.listingId,
                listingName: listing.name,
                actionUrl: `/manage-offers`,
              });
            }
          }
        }
      } catch (notifError) {
        console.error('Failed to send notification:', notifError);
        // Don't fail the request if notification fails
      }
    }
    
    return Response.json({ message: `Offer ${action}ed successfully` }, { headers: corsHeaders });
  } catch (error) {
    console.error('Update offer error:', error);
    return Response.json(
      { error: error.message || 'Failed to update offer' },
      { status: 500, headers: corsHeaders }
    );
  }
}
