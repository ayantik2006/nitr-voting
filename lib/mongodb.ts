import { MongoClient, type Db } from "mongodb";

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

let clientPromise: Promise<MongoClient> | null = null;

function getClientPromise(): Promise<MongoClient> {
  if (clientPromise) return clientPromise;
  
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error("Missing MONGO_URI env var");
  
  const client = new MongoClient(uri);
  clientPromise =
    global._mongoClientPromise ?? (global._mongoClientPromise = client.connect());
  return clientPromise;
}

let indexesEnsured: Promise<unknown> | undefined;

export async function getDb(): Promise<Db> {
  const c = await getClientPromise();
  const db = c.db();
  indexesEnsured ??= db
    .collection("votes")
    .createIndex({ electionId: 1, voterUid: 1 }, { unique: true });
  await indexesEnsured;
  return db;
}
