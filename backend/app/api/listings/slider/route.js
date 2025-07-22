import { withCORS } from "../../../lib/cors";
import clientPromise from "../../../lib/mongodb";

// GET handler for fetching slider listings
async function handler(request) {
  if (request.method !== "GET") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const client = await clientPromise;
    const db = client.db();
    
    // Get recent listings with images for the slider (limit to 6)
    const listings = await db
      .collection("listings")
      .find({
        images: { $exists: true, $ne: [], $not: { $size: 0 } }
      })
      .sort({ _id: -1 })
      .limit(6)
      .toArray();

    return new Response(JSON.stringify(listings), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching slider listings:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch listings" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// Export handlers for Next.js app router
export const GET = withCORS(handler);
export const OPTIONS = withCORS(() => new Response(null, { status: 204 }));