import { MongoClient, type Db } from "mongodb";

const uri = process.env.MONGO_URI;
if (!uri) throw new Error("Missing MONGO_URI env var");

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

const client = new MongoClient(uri);
const clientPromise =
  global._mongoClientPromise ?? (global._mongoClientPromise = client.connect());

let indexesEnsured: Promise<unknown> | undefined;

export async function getDb(): Promise<Db> {
  const c = await clientPromise;
  const db = c.db();
  indexesEnsured ??= db
    .collection("votes")
    .createIndex({ electionId: 1, voterUid: 1 }, { unique: true });
  await indexesEnsured;
  return db;
}
