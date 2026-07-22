import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { verifyRequest } from "@/lib/firebase-admin";
import type { Profile } from "@/lib/types";

export async function GET(req: Request) {
  const decoded = await verifyRequest(req);
  if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = await getDb();
  const profiles = db.collection<Profile>("profiles");

  const profile = await profiles.findOne({ uid: decoded.uid });
  if (!profile) {
    const rollNumber = (decoded.email ?? "").split("@")[0].toUpperCase();
    const newProfile: Profile = {
      uid: decoded.uid,
      email: decoded.email ?? "",
      displayName: decoded.name ?? "Student",
      rollNumber,
      department: "Not set",
      year: "Not set",
      role: "Student",
    };
    await profiles.insertOne(newProfile);
    return NextResponse.json(newProfile);
  }

  return NextResponse.json(profile);
}

export async function PATCH(req: Request) {
  const decoded = await verifyRequest(req);
  if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const updates: Partial<Profile> = {};
  for (const key of ["department", "year", "role"] as const) {
    if (typeof body[key] === "string") updates[key] = body[key];
  }

  const db = await getDb();
  await db
    .collection<Profile>("profiles")
    .updateOne({ uid: decoded.uid }, { $set: updates });

  return NextResponse.json({ ok: true });
}
