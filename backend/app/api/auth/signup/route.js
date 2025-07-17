import { findUserByEmail, createUser } from '../../../../lib/user';
import { hashPassword, generateToken } from '../../../../lib/auth';
import clientPromise from '../../../../lib/mongodb';
import { withCORS } from '../../../../lib/cors';

async function handler(request) {
  try {
    const { fullName, email, password } = await request.json();
    if (!fullName || !email || !password) {
      console.log('❌ Signup: Missing fields');
      return new Response('Missing fields', { status: 400 });
    }
    const client = await clientPromise;
    if (client) console.log('✅ MongoDB client is available (signup)');
    const existing = await findUserByEmail(email);
    if (existing) {
      console.log('❌ Signup: User already exists:', email);
      return new Response('User already exists', { status: 409 });
    }
    const hashed = await hashPassword(password);
    const result = await createUser({ fullName, email, password: hashed });
    const user = { _id: result.insertedId, email };
    const token = generateToken(user);
    console.log('✅ Signup: User created successfully:', email);
    return new Response(JSON.stringify({ token }), { status: 201 });
  } catch (err) {
    console.error('❌ Signup error:', err);
    return new Response('Server error', { status: 500 });
  }
}

export const POST = withCORS(handler);
export const OPTIONS = withCORS(() => new Response(null, { status: 204 })); 