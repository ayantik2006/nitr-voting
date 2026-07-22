import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { verifyRequest } from "@/lib/firebase-admin";
import { computeStatus } from "@/lib/election-status";
import { isRollNumberInRange } from "@/lib/roll-number";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const decoded = await verifyRequest(req);
  if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const { candidateId } = await req.json();
  if (typeof candidateId !== "string") {
    return NextResponse.json({ error: "candidateId required" }, { status: 400 });
  }

  const db = await getDb();
  const election = await db
    .collection("elections")
    .findOne({ _id: new ObjectId(id) });

  if (!election) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const status = computeStatus(election.startDate, election.endDate);
  if (status !== "open") {
    return NextResponse.json({ error: "Election is not open" }, { status: 400 });
  }

  const candidateExists = election.candidates.some(
    (c: { id: string }) => c.id === candidateId
  );
  if (!candidateExists) {
    return NextResponse.json({ error: "Invalid candidate" }, { status: 400 });
  }

  const rollNumber = (decoded.email ?? "").split("@")[0].toUpperCase();
  if (!isRollNumberInRange(rollNumber, election.rollNumberFrom, election.rollNumberTo)) {
    return NextResponse.json(
      { error: "You are not eligible to vote in this election." },
      { status: 403 }
    );
  }

  const votes = db.collection("votes");
  const existing = await votes.findOne({ electionId: id, voterUid: decoded.uid });
  if (existing) {
    return NextResponse.json({ error: "Already voted" }, { status: 409 });
  }

  try {
    await votes.insertOne({
      electionId: id,
      candidateId,
      voterUid: decoded.uid,
      createdAt: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({ error: "Already voted" }, { status: 409 });
  }

  await db.collection("activity").insertOne({
    uid: decoded.uid,
    text: `Vote submitted for ${election.title}`,
    createdAt: new Date().toISOString(),
  });

  return NextResponse.json({ ok: true });
}
