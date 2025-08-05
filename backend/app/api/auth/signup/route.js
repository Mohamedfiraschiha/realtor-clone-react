import { findUserByEmail, createUser } from '../../../../lib/user';
import { hashPassword, generateToken } from '../../../../lib/auth';
import clientPromise from '../../../../lib/mongodb';
import { NextResponse } from 'next/server';
import { withCORS } from '../../../../lib/cors';

async function handleSignup(request) {
  try {
    const { fullName, email, password } = await request.json();
    
    if (!fullName || !email || !password) {
      console.log('❌ Signup: Missing fields');
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    if (client) console.log('✅ MongoDB client is available (signup)');
    
    const existing = await findUserByEmail(email);
    if (existing) {
      console.log('❌ Signup: User already exists:', email);
      return NextResponse.json(
        { message: 'User already exists' },
        { status: 409 }
      );
    }
    
    const hashed = await hashPassword(password);
    const result = await createUser({ fullName, email, password: hashed });
    const user = { _id: result.insertedId, email };
    const token = generateToken(user);
    
    console.log('✅ Signup: User created successfully:', email);
    
    return NextResponse.json(
      { token },
      { 
        status: 201
      }
    );
    
  } catch (err) {
    console.error('❌ Signup error:', err);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const POST = withCORS(handleSignup);

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}