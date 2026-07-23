import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { verifyRequest } from "@/lib/firebase-admin";
import { computeStatus } from "@/lib/election-status";
import type { ElectionDoc, ElectionWithStats } from "@/lib/types";

async function withStats(
  elections: ElectionDoc[],
  uid: string
): Promise<ElectionWithStats[]> {
  const db = await getDb();
  const votes = db.collection("votes");

  return Promise.all(
    elections.map(async (election) => {
      const status = computeStatus(election.startDate, election.endDate);
      const [votesCast, myVote] = await Promise.all([
        votes.countDocuments({ electionId: election._id }),
        votes.findOne({ electionId: election._id, voterUid: uid }),
      ]);

      let candidateVotes: Record<string, number> = {};
      const now = Date.now();
      const end = new Date(election.endDate).getTime();
      const resultsDeclared = now >= end + 10 * 60 * 1000;

      if (status === "closed" && resultsDeclared) {
        const tally = await votes
          .aggregate<{ _id: string; count: number }>([
            { $match: { electionId: election._id } },
            { $group: { _id: "$candidateId", count: { $sum: 1 } } },
          ])
          .toArray();
        candidateVotes = Object.fromEntries(tally.map((t) => [t._id, t.count]));
      }

      return {
        ...election,
        status,
        votesCast,
        hasVoted: !!myVote,
        candidateVotes,
      };
    })
  );
}

export async function GET(req: Request) {
  const decoded = await verifyRequest(req);
  if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const scope = searchParams.get("scope") ?? "all";

  const db = await getDb();
  const filter = scope === "mine" ? { createdBy: decoded.uid } : {};
  const docs = await db
    .collection<Omit<ElectionDoc, "_id"> & { _id: ObjectId }>("elections")
    .find(filter)
    .sort({ createdAt: -1 })
    .toArray();

  const elections: ElectionDoc[] = docs.map((d) => ({
    ...d,
    _id: d._id.toString(),
  }));

  return NextResponse.json(await withStats(elections, decoded.uid));
}

export async function POST(req: Request) {
  const decoded = await verifyRequest(req);
  if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const {
    title,
    position,
    description,
    candidateNames,
    eligibleVoters,
    rollNumberFrom,
    rollNumberTo,
    startDate,
    endDate,
  } = body;

  if (
    typeof title !== "string" ||
    !title.trim() ||
    typeof position !== "string" ||
    !position.trim() ||
    !Array.isArray(candidateNames) ||
    candidateNames.length < 2 ||
    !startDate ||
    !endDate
  ) {
    return NextResponse.json({ error: "Invalid election data" }, { status: 400 });
  }

  const db = await getDb();
  const doc = {
    title: title.trim(),
    position: position.trim(),
    ...(typeof description === "string" && description.trim()
      ? { description: description.trim() }
      : {}),
    candidates: candidateNames.map((name: string, i: number) => ({
      id: `c-${i}`,
      name: String(name).trim(),
    })),
    eligibleVoters: Number(eligibleVoters) || 0,
    ...(typeof rollNumberFrom === "string" && rollNumberFrom.trim()
      ? { rollNumberFrom: rollNumberFrom.trim().toUpperCase() }
      : {}),
    ...(typeof rollNumberTo === "string" && rollNumberTo.trim()
      ? { rollNumberTo: rollNumberTo.trim().toUpperCase() }
      : {}),
    startDate,
    endDate,
    createdBy: decoded.uid,
    createdByName: decoded.name ?? decoded.email ?? "Student",
    createdAt: new Date().toISOString(),
  };

  const result = await db.collection("elections").insertOne(doc);
  await db.collection("activity").insertOne({
    uid: decoded.uid,
    text: `Election "${doc.title}" created`,
    createdAt: new Date().toISOString(),
  });

  return NextResponse.json({ _id: result.insertedId.toString(), ...doc });
}
