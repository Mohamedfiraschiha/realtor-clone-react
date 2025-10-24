import { withCORS } from "../../../lib/cors";
import clientPromise from "../../../lib/mongodb";

// GET handler for fetching user by email
async function getUser(request) {
  try {
    const url = new URL(request.url);
    const email = url.searchParams.get("email");

    if (!email) {
      return new Response(JSON.stringify({ error: "Email is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const client = await clientPromise;
    const db = client.db(); // Use default database from connection string

    const user = await db.collection("users").findOne(
      { email },
      { projection: { password: 0 } } // Exclude password
    );

    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ user }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Get user error:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export const GET = withCORS(getUser);
export const OPTIONS = withCORS(() => new Response(null, { status: 204 }));
