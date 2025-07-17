import { withCORS } from "../../../../lib/cors.js";
import clientPromise from "../../../../lib/mongodb.js";
import { ObjectId } from "mongodb";

// GET: Fetch a single listing by ID
async function getListing(request, context) {
  const params = await context.params;
  try {
    const client = await clientPromise;
    const db = client.db();
    const listing = await db
      .collection("listings")
      .findOne({ _id: new ObjectId(params.id) });
    if (!listing) return new Response("Not found", { status: 404 });
    return new Response(JSON.stringify(listing), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Get listing error:", error);
    return new Response(`Internal Server Error: ${error.message}`, {
      status: 500,
    });
  }
}

// PUT: Update a listing by ID
async function updateListing(request, context) {
  const params = await context.params;
  try {
    const client = await clientPromise;
    const db = client.db();
    const body = await request.json();
    delete body._id; // Prevent immutable _id update
    const result = await db
      .collection("listings")
      .updateOne({ _id: new ObjectId(params.id) }, { $set: body });
    if (result.matchedCount === 0)
      return new Response("Not found", { status: 404 });
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Update listing error:", error);
    return new Response(`Internal Server Error: ${error.message}`, {
      status: 500,
    });
  }
}

// DELETE: Remove a listing by ID
async function deleteListing(request, context) {
  const params = await context.params;
  try {
    const client = await clientPromise;
    const db = client.db();
    const result = await db
      .collection("listings")
      .deleteOne({ _id: new ObjectId(params.id) });
    if (result.deletedCount === 0)
      return new Response("Not found", { status: 404 });
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Delete listing error:", error);
    return new Response(`Internal Server Error: ${error.message}`, {
      status: 500,
    });
  }
}

export const GET = withCORS(getListing);
export const PUT = withCORS(updateListing);
export const DELETE = withCORS(deleteListing);
export const OPTIONS = withCORS(() => new Response(null, { status: 204 }));
