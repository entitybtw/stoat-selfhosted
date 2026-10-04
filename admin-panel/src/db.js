import { MongoClient } from "mongodb";
import { config } from "./config.js";

let client;
let db;

/** Connect to MongoDB, retrying until the database is reachable. */
export async function connectDb() {
  for (let attempt = 1; ; attempt++) {
    try {
      client = new MongoClient(config.mongoUri, { serverSelectionTimeoutMS: 5000 });
      await client.connect();
      db = client.db(config.mongoDb);

      // TTL index so expired panel sessions are removed automatically
      await db
        .collection("admin_sessions")
        .createIndex({ expires: 1 }, { expireAfterSeconds: 0 });

      console.log(`[db] connected to ${config.mongoUri}/${config.mongoDb}`);
      return;
    } catch (err) {
      console.error(`[db] connect attempt ${attempt} failed: ${err.message}`);
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  }
}

/** Access a collection in the Stoat database. */
export function col(name) {
  if (!db) throw new Error("database not connected");
  return db.collection(name);
}
