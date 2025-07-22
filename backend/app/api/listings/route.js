import { withCORS } from "../../../lib/cors";
import clientPromise from "../../../lib/mongodb";
import jwt from "jsonwebtoken";

// Helper to get user email from JWT in Authorization header
function getUserEmailFromRequest(request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader) return null;
  const token = authHeader.replace("Bearer ", "");
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    return payload.email;
  } catch {
    return null;
  }
}

// Main POST handler for creating a listing
async function handler(request) {
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const email = getUserEmailFromRequest(request);
  if (!email) return new Response("Unauthorized", { status: 401 });

  const client = await clientPromise;
  const db = client.db();
  const data = await request.json();
  const listing = { ...data, userEmail: email };
  const result = await db.collection("listings").insertOne(listing);

  return new Response(JSON.stringify({ _id: result.insertedId }), {
    status: 201,
    headers: { "Content-Type": "application/json" },
  });
}

// GET handler for fetching listings with optional filters
async function getListings(request) {
  if (request.method !== "GET") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const url = new URL(request.url);
    const offer = url.searchParams.get("offer");
    const type = url.searchParams.get("type");
    const limit = parseInt(url.searchParams.get("limit")) || 10;

    const client = await clientPromise;
    const db = client.db();

    // Build query
    const query = {};
    if (offer === "true") query.offer = true;
    if (type) query.type = type;

    const listings = await db
      .collection("listings")
      .find(query)
      .sort({ timestamp: -1 })
      .limit(limit)
      .toArray();

    return new Response(JSON.stringify(listings), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching listings:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch listings" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export const GET = withCORS(getListings);
export const POST = withCORS(handler);
export const OPTIONS = withCORS(() => new Response(null, { status: 204 }));
