import clientPromise from '../../../lib/mongodb';

export async function GET(request) {
  try {
    const client = await clientPromise;
    console.log('✅ MongoDB connection successful!');
    return new Response('MongoDB connection successful!', { status: 200 });
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    return new Response('MongoDB connection failed', { status: 500 });
  }
} 