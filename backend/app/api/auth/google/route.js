import { OAuth2Client } from "google-auth-library";
import clientPromise from "../../../../lib/mongodb";
import { generateToken } from "../../../../lib/auth";
import { findUserByEmail, createUser } from "../../../../lib/user";
import { withCORS } from "../../../../lib/cors";

const CLIENT_ID = "362633341927-n8t9ajanjbk6q5pqld85nss8d08nrikg.apps.googleusercontent.com";
const client = new OAuth2Client(CLIENT_ID);

async function handler(request) {
  try {
    const { token } = await request.json();
    if (!token) {
      return new Response("Missing token", { status: 400 });
    }

    // Verify Google token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const email = payload.email;
    const name = payload.name;

    // Find or create user in your DB
    let user = await findUserByEmail(email);
    if (!user) {
      // You may want to store more info (e.g., name, picture)
      user = await createUser({ email, name, password: null, provider: "google" });
    }

    // Issue your own JWT
    const appToken = generateToken(user);

    return new Response(JSON.stringify({ token: appToken }), { status: 200 });
  } catch (err) {
    console.error("Google Auth error:", err);
    return new Response("Authentication failed", { status: 401 });
  }
}

export const POST = withCORS(handler);
export const OPTIONS = withCORS(() => new Response(null, { status: 204 }));