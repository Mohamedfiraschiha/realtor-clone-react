import { withCORS } from '../../../lib/cors';
import clientPromise from "../../../lib/mongodb";

async function handler(req) {
  try {
    const { to, message } = await req.json();
    if (!to || !message) {
      return new Response(JSON.stringify({ error: "Missing fields" }), { status: 400 });
    }
    const client = await clientPromise;
    const db = client.db();
    await db.collection("messages").insertOne({
      to,
      message,
      date: new Date(),
    });
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
}

export const POST = withCORS(handler);
export const OPTIONS = withCORS(() => new Response(null, { status: 204 })); 