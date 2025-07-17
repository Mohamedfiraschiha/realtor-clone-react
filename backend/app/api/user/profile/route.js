import { withCORS } from '../../../../lib/cors';
import clientPromise from '../../../../lib/mongodb';
import jwt from 'jsonwebtoken';

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

async function getProfile(request) {
  const email = getUserEmailFromRequest(request);
  console.log('Decoded email:', email);
  if (!email) return new Response('Unauthorized', { status: 401 });
  const client = await clientPromise;
  const db = client.db();
  const user = await db.collection('users').findOne({ email });
  console.log('User found:', user);
  if (!user) return new Response('User not found', { status: 404 });
  return new Response(JSON.stringify({ name: user.fullName || user.name, email: user.email }), { status: 200 });
}

async function patchProfile(request) {
  const email = getUserEmailFromRequest(request);
  if (!email) return new Response('Unauthorized', { status: 401 });
  const client = await clientPromise;
  const db = client.db();
  const { name } = await request.json();
  const result = await db.collection('users').updateOne(
    { email },
    { $set: { fullName: name } }
  );
  if (result.modifiedCount === 0) return new Response('Update failed', { status: 400 });
  return new Response('Profile updated', { status: 200 });
}

export const GET = withCORS(getProfile);
export const PATCH = withCORS(patchProfile);
export const OPTIONS = withCORS(() => new Response(null, { status: 204 })); 