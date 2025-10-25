/**
 * API routes for managing user favorites/wishlist
 */

import { addToFavorites, getUserFavorites, removeFromFavorites } from '../../../models/Favorite.js';
import { verifyToken } from '../../../lib/auth.js';
import { createNotification, NotificationTemplates } from '../../../lib/notificationHelper.js';
import clientPromise from '../../../lib/mongodb.js';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Handle OPTIONS request for CORS preflight
export async function OPTIONS(req) {
  return new Response(null, {
    status: 200,
    headers: corsHeaders,
  });
}

// Get user's favorites
export async function GET(req) {
  try {
    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return Response.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
    }

    const payload = verifyToken(token);
    const userId = payload.userId;

    const favorites = await getUserFavorites(userId);
    
    return Response.json({ favorites }, { headers: corsHeaders });
  } catch (error) {
    console.error('Get favorites error:', error);
    return Response.json(
      { error: error.message || 'Failed to get favorites' },
      { status: 500, headers: corsHeaders }
    );
  }
}

// Add to favorites
export async function POST(req) {
  try {
    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return Response.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
    }

    const payload = verifyToken(token);
    const userId = payload.userId;

    const { listingId } = await req.json();
    
    if (!listingId) {
      return Response.json({ error: 'Listing ID required' }, { status: 400, headers: corsHeaders });
    }

    const favorite = await addToFavorites(userId, listingId);
    
    // Send notification to property owner
    try {
      const client = await clientPromise;
      const db = client.db();
      const { ObjectId } = require('mongodb');
      
      // Fetch listing details
      const listing = await db.collection('listings').findOne({ _id: new ObjectId(listingId) });
      
      if (listing && listing.userEmail) {
        // Find the owner by email
        const owner = await db.collection('users').findOne({ email: listing.userEmail });
        
        // Fetch user details (favoriter)
        const user = await db.collection('users').findOne({ _id: new ObjectId(userId) });
        
        if (owner && user) {
          const template = NotificationTemplates.favorite(
            user.fullName || user.email,
            listing.name
          );
          
          await createNotification({
            recipientId: owner._id.toString(),
            senderId: userId,
            ...template,
            listingId,
            listingName: listing.name,
            actionUrl: `/show-listing/${listingId}`,
          });
        }
      }
    } catch (notifError) {
      console.error('Failed to send notification:', notifError);
      // Don't fail the request if notification fails
    }
    
    return Response.json({ 
      message: 'Added to favorites',
      favorite 
    }, { status: 201, headers: corsHeaders });
  } catch (error) {
    console.error('Add to favorites error:', error);
    
    if (error.message === 'Listing already in favorites') {
      return Response.json({ error: error.message }, { status: 409, headers: corsHeaders });
    }
    
    return Response.json(
      { error: error.message || 'Failed to add to favorites' },
      { status: 500, headers: corsHeaders }
    );
  }
}

// Remove from favorites
export async function DELETE(req) {
  try {
    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return Response.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
    }

    const payload = verifyToken(token);
    const userId = payload.userId;

    const { searchParams } = new URL(req.url);
    const listingId = searchParams.get('listingId');
    
    if (!listingId) {
      return Response.json({ error: 'Listing ID required' }, { status: 400, headers: corsHeaders });
    }

    const removed = await removeFromFavorites(userId, listingId);
    
    if (!removed) {
      return Response.json({ error: 'Favorite not found' }, { status: 404, headers: corsHeaders });
    }
    
    return Response.json({ message: 'Removed from favorites' }, { headers: corsHeaders });
  } catch (error) {
    console.error('Remove from favorites error:', error);
    return Response.json(
      { error: error.message || 'Failed to remove from favorites' },
      { status: 500, headers: corsHeaders }
    );
  }
}
