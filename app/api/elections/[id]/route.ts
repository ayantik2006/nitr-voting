import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { verifyRequest } from "@/lib/firebase-admin";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const decoded = await verifyRequest(req);
  if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const db = await getDb();
  const election = await db
    .collection("elections")
    .findOne({ _id: new ObjectId(id) });

  if (!election) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (election.createdBy !== decoded.uid) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await db.collection("elections").deleteOne({ _id: new ObjectId(id) });
  await db.collection("votes").deleteMany({ electionId: id });

  return NextResponse.json({ ok: true });
}
