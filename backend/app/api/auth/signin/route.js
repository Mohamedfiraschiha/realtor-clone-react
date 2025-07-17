import clientPromise from '../../../../lib/mongodb';
import { comparePassword, generateToken } from '../../../../lib/auth';
import { findUserByEmail } from '../../../../lib/user';
import { withCORS } from '../../../../lib/cors';

async function handler(request) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) {
      console.log('❌ Signin: Missing fields');
      return new Response('Missing fields', { status: 400 });
    }
    const client = await clientPromise;
    if (client) console.log('✅ MongoDB client is available (signin)');
    const user = await findUserByEmail(email);
    if (!user) {
      console.log('❌ Signin: Invalid credentials (user not found):', email);
      return new Response('Invalid credentials', { status: 401 });
    }
    const valid = await comparePassword(password, user.password);
    if (!valid) {
      console.log('❌ Signin: Invalid credentials (wrong password):', email);
      return new Response('Invalid credentials', { status: 401 });
    }
    const token = generateToken(user);
    console.log('✅ Signin: User authenticated successfully:', email);
    return new Response(JSON.stringify({ token }), { status: 200 });
  } catch (err) {
    console.error('❌ Signin error:', err);
    return new Response('Server error', { status: 500 });
  }
}

export const POST = withCORS(handler);
export const OPTIONS = withCORS(() => new Response(null, { status: 204 })); 