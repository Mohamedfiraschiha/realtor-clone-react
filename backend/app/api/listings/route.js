import { withCORS } from '../../../lib/cors';
import clientPromise from '../../../lib/mongodb';
import jwt from 'jsonwebtoken';

// Helper to get user email from JWT in Authorization header
function getUserEmailFromRequest(request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return null;
  const token = authHeader.replace('Bearer ', '');
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    return payload.email;
  } catch {
    return null;
  }
}

// Main POST handler for creating a listing
async function handler(request) {
  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const email = getUserEmailFromRequest(request);
  if (!email) return new Response('Unauthorized', { status: 401 });

  const client = await clientPromise;
  const db = client.db();
  const data = await request.json();
  const listing = { ...data, userEmail: email };
  const result = await db.collection('listings').insertOne(listing);

  return new Response(JSON.stringify({ _id: result.insertedId }), {
    status: 201,
    headers: { 'Content-Type': 'application/json' }
  });
}

// Export handlers for Next.js app router
export const POST = withCORS(handler);
export const OPTIONS = withCORS(() => new Response(null, { status: 204 }));