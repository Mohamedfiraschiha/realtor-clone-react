import { ObjectId } from "mongodb";

// Message schema structure (for reference)
// {
//   from: ObjectId (User ID),
//   to: ObjectId (User ID),
//   listingId: ObjectId (Listing ID),
//   listingName: String,
//   message: String,
//   read: Boolean,
//   readAt: Date,
//   createdAt: Date,
//   updatedAt: Date
// }

export async function getMessagesCollection(client) {
  const db = client.db(); // Use default database from connection string
  const collection = db.collection("messages");

  // Create indexes if they don't exist
  await collection.createIndex({ from: 1, to: 1, createdAt: -1 });
  await collection.createIndex({ to: 1, read: 1 });

  return collection;
}

export async function createMessage(client, messageData) {
  const collection = await getMessagesCollection(client);

  const message = {
    from: new ObjectId(messageData.from),
    to: new ObjectId(messageData.to),
    listingId: messageData.listingId
      ? new ObjectId(messageData.listingId)
      : null,
    listingName: messageData.listingName || null,
    message: messageData.message,
    read: false,
    readAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await collection.insertOne(message);
  return { ...message, _id: result.insertedId };
}

export async function findMessages(client, query, options = {}) {
  const collection = await getMessagesCollection(client);
  return await collection.find(query, options).toArray();
}

export async function updateMessages(client, filter, update) {
  const collection = await getMessagesCollection(client);
  return await collection.updateMany(filter, update);
}

export async function getConversations(client, userId) {
  const collection = await getMessagesCollection(client);
  const userObjectId = new ObjectId(userId);

  // Get all conversations where user is either sender or receiver
  const conversations = await collection
    .aggregate([
      {
        $match: {
          $or: [{ from: userObjectId }, { to: userObjectId }],
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $group: {
          _id: {
            $cond: [{ $eq: ["$from", userObjectId] }, "$to", "$from"],
          },
          lastMessage: { $first: "$$ROOT" },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$to", userObjectId] },
                    { $eq: ["$read", false] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      {
        $sort: { "lastMessage.createdAt": -1 },
      },
    ])
    .toArray();

  return conversations;
}
