import { withCORS } from "../../../../lib/cors";
import clientPromise from "../../../../lib/mongodb";
import jwt from "jsonwebtoken";

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

async function getMine(request) {
  const email = getUserEmailFromRequest(request);
  if (!email) return new Response("Unauthorized", { status: 401 });
  const client = await clientPromise;
  const db = client.db();
  const listings = await db
    .collection("listings")
    .find({ userEmail: email })
    .toArray();
  return new Response(JSON.stringify(listings), { status: 200 });
}

export const GET = withCORS(getMine);
export const OPTIONS = withCORS(() => new Response(null, { status: 204 }));
