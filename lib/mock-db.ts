import fs from "fs";
import path from "path";

const DB_FILE = path.join(process.cwd(), "db.json");

interface MockSchema {
  elections: any[];
  votes: any[];
  profiles: any[];
  activity: any[];
}

function readDb(): MockSchema {
  if (!fs.existsSync(DB_FILE)) {
    const defaultDb: MockSchema = {
      elections: [],
      votes: [],
      profiles: [],
      activity: [],
    };
    writeDb(defaultDb);
    return defaultDb;
  }
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
  } catch {
    return { elections: [], votes: [], profiles: [], activity: [] };
  }
}

function writeDb(data: MockSchema) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
}

function generateId() {
  return Array.from({ length: 24 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join("");
}

function matchQuery(item: any, query: any): boolean {
  for (const key in query) {
    if (query[key] && typeof query[key] === "object" && query[key]._id) {
      const queryVal = query[key]._id.toString();
      const itemVal = item[key]?.toString();
      if (itemVal !== queryVal) return false;
    } else if (query[key] && typeof query[key] === "object") {
      continue;
    } else {
      if (item[key] !== query[key]) return false;
    }
  }
  return true;
}

class MockCollection {
  name: keyof MockSchema;

  constructor(name: keyof MockSchema) {
    this.name = name;
  }

  find(query: any = {}) {
    const data = readDb();
    const items = data[this.name] || [];
    const filtered = items.filter((item) => matchQuery(item, query));
    return {
      sort(sortQuery: any) {
        filtered.sort((a, b) => {
          const key = Object.keys(sortQuery)[0];
          const order = sortQuery[key];
          if (a[key] < b[key]) return order === -1 ? 1 : -1;
          if (a[key] > b[key]) return order === -1 ? -1 : 1;
          return 0;
        });
        return this;
      },
      limit(n: number) {
        filtered.splice(n);
        return this;
      },
      async toArray() {
        return filtered;
      },
    };
  }

  async findOne(query: any) {
    const data = readDb();
    const items = data[this.name] || [];
    return items.find((item) => matchQuery(item, query)) || null;
  }

  async insertOne(doc: any) {
    const data = readDb();
    const id = doc._id ? doc._id.toString() : generateId();
    const newDoc = { ...doc, _id: id };
    if (!data[this.name]) data[this.name] = [];
    data[this.name].push(newDoc);
    writeDb(data);
    return { insertedId: id };
  }

  async updateOne(query: any, update: any) {
    const data = readDb();
    const items = data[this.name] || [];
    const idx = items.findIndex((item) => matchQuery(item, query));
    if (idx !== -1) {
      const setFields = update.$set || {};
      items[idx] = { ...items[idx], ...setFields };
      writeDb(data);
      return { modifiedCount: 1 };
    }
    return { modifiedCount: 0 };
  }

  async deleteOne(query: any) {
    const data = readDb();
    const items = data[this.name] || [];
    const idx = items.findIndex((item) => matchQuery(item, query));
    if (idx !== -1) {
      items.splice(idx, 1);
      writeDb(data);
      return { deletedCount: 1 };
    }
    return { deletedCount: 0 };
  }

  async deleteMany(query: any) {
    const data = readDb();
    const items = data[this.name] || [];
    const remaining = items.filter((item) => !matchQuery(item, query));
    const deletedCount = items.length - remaining.length;
    data[this.name] = remaining;
    writeDb(data);
    return { deletedCount };
  }

  async countDocuments(query: any) {
    const data = readDb();
    const items = data[this.name] || [];
    return items.filter((item) => matchQuery(item, query)).length;
  }

  aggregate(pipeline: any[]) {
    const data = readDb();
    let items = data[this.name] || [];
    
    const matchStage = pipeline.find((p) => p.$match);
    if (matchStage) {
      items = items.filter((item) => matchQuery(item, matchStage.$match));
    }

    const groupStage = pipeline.find((p) => p.$group);
    if (groupStage) {
      const counts: Record<string, number> = {};
      const groupField = groupStage.$group._id.replace("$", "");
      items.forEach((item) => {
        const val = item[groupField];
        counts[val] = (counts[val] || 0) + 1;
      });
      const result = Object.entries(counts).map(([id, count]) => ({
        _id: id,
        count,
      }));
      return {
        async toArray() {
          return result;
        },
      };
    }

    return {
      async toArray() {
        return items;
      },
    };
  }

  async createIndex() {
    return true;
  }
}

export class MockDb {
  collection(name: keyof MockSchema) {
    return new MockCollection(name);
  }
}

export function getMockDb() {
  return new MockDb() as any;
}

export function seedMockDb() {
  let db: MockSchema;
  if (fs.existsSync(DB_FILE)) {
    db = readDb();
  } else {
    db = { elections: [], votes: [], profiles: [], activity: [] };
  }

  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 3, 0, 0);
  const end = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 18, 0, 0);

  const candidates = [
    { id: "c-0", name: "Anibesh", avatar: "/nominees/anibesh.jpg" },
    { id: "c-1", name: "Shreyash", avatar: "/nominees/shreyash.jpg" },
    { id: "c-2", name: "Tapas", avatar: "/nominees/tapas.jpg" },
    { id: "c-3", name: "Ashwani", avatar: "/nominees/ashwani.jpg" },
  ];

  db.elections = [
    {
      _id: "election-1st-cr",
      title: "Class Representative — 1st Position",
      position: "1st CR (Primary Representative)",
      description: "Vote for your choice for the 1st Class Representative of our class.",
      candidates,
      eligibleVoters: 75,
      rollNumberFrom: "125CE0001",
      rollNumberTo: "125CE0075",
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      createdBy: "mock-admin-uid",
      createdByName: "Election Administrator",
      createdAt: new Date().toISOString(),
    },
    {
      _id: "election-2nd-cr",
      title: "Class Representative — 2nd Position",
      position: "2nd CR (Secondary Representative)",
      description: "Vote for your choice for the 2nd Class Representative of our class.",
      candidates,
      eligibleVoters: 75,
      rollNumberFrom: "125CE0001",
      rollNumberTo: "125CE0075",
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      createdBy: "mock-admin-uid",
      createdByName: "Election Administrator",
      createdAt: new Date().toISOString(),
    },
  ];

  if (!db.profiles || db.profiles.length === 0) {
    db.profiles = [
      {
        uid: "mock-admin-uid",
        email: "admin@nitrkl.ac.in",
        displayName: "Election Admin",
        rollNumber: "ADMIN01",
        department: "Computer Science",
        year: "3rd Year",
        role: "Admin",
      }
    ];
  }

  writeDb(db);
}
