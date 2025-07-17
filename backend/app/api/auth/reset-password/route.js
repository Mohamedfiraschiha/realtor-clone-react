import { withCORS } from '../../../../lib/cors';
import clientPromise from '../../../../lib/mongodb';
import { hashPassword } from '../../../../lib/auth';

async function handler(request) {
  try {
    const { token, password } = await request.json();
    if (!token || !password) {
      return new Response('Missing token or password', { status: 400 });
    }
    const client = await clientPromise;
    const db = client.db();
    // Find the reset token
    const reset = await db.collection('passwordResets').findOne({ token });
    if (!reset || new Date(reset.expires) < new Date()) {
      return new Response('Invalid or expired token', { status: 400 });
    }
    // Update the user's password
    const hashed = await hashPassword(password);
    await db.collection('users').updateOne(
      { email: reset.email },
      { $set: { password: hashed } }
    );
    // Remove the used token
    await db.collection('passwordResets').deleteOne({ token });
    return new Response('Password has been reset successfully.', { status: 200 });
  } catch (err) {
    console.error('Reset password error:', err);
    return new Response('Server error', { status: 500 });
  }
}

export const POST = withCORS(handler);
export const OPTIONS = withCORS(() => new Response(null, { status: 204 })); 