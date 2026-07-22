import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { verifyRequest } from "@/lib/firebase-admin";

export async function GET(req: Request) {
  const decoded = await verifyRequest(req);
  if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = await getDb();
  const docs = await db
    .collection("activity")
    .find({ uid: decoded.uid })
    .sort({ createdAt: -1 })
    .limit(10)
    .toArray();

  return NextResponse.json(
    docs.map((d) => ({
      _id: d._id.toString(),
      text: d.text,
      createdAt: d.createdAt,
    }))
  );
}
