import { findUserByEmail } from '../../../../lib/user';
import { withCORS } from '../../../../lib/cors';
import crypto from 'crypto';
import clientPromise from '../../../../lib/mongodb';
import nodemailer from 'nodemailer';

async function handler(request) {
  try {
    const { email } = await request.json();
    if (!email) {
      return new Response('Missing email', { status: 400 });
    }
    const user = await findUserByEmail(email);
    // Always return the same message for security
    if (user) {
      // Generate a secure token
      const token = crypto.randomBytes(32).toString('hex');
      const expires = new Date(Date.now() + 1000 * 60 * 60); // 1 hour from now
      // Store token in a passwordResets collection
      const client = await clientPromise;
      const db = client.db();
      await db.collection('passwordResets').insertOne({ email, token, expires });
      // Send the reset link via Ethereal (Nodemailer)
      const resetLink = `http://localhost:3001/reset-password?token=${token}`;
      try {
        const testAccount = await nodemailer.createTestAccount();
        const transporter = nodemailer.createTransport({
          host: "smtp.ethereal.email",
          port: 587,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        });
        const info = await transporter.sendMail({
          from: 'Realtor Clone <no-reply@realtor-clone.com>',
          to: email,
          subject: 'Password Reset Request',
          text: `You requested a password reset. Click the link to reset your password: ${resetLink}\nIf you did not request this, please ignore this email.`,
        });
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
      } catch (mailErr) {
        console.error('Nodemailer error:', mailErr);
      }
    }
    return new Response('If this email is registered, a reset link will be sent.', { status: 200 });
  } catch (err) {
    console.error('Forgot password error:', err);
    return new Response('Server error', { status: 500 });
  }
}

export const POST = withCORS(handler);
export const OPTIONS = withCORS(() => new Response(null, { status: 204 }));