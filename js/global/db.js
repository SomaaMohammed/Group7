// js/global/db.js
// The ONLY file in the project that touches localStorage.
// API mirrors Prisma's client intentionally — migrating to Prisma in Phase 2
// means rewriting only this file.
//
// Schema field reference:
//   users:    id, username, email, password, bio, profilePicture, createdAt
//   posts:    id, authorId, content, createdAt
//   comments: id, postId, authorId, content, createdAt
//   likes:    id, postId, userId, createdAt
//   follows:  id, followerId, followingId, createdAt

// --- Internal helpers ---

function readTable(table) {
  const raw = localStorage.getItem(table);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeTable(table, data) {
  localStorage.setItem(table, JSON.stringify(data));
}

function generateId(prefix) {
  const randomPart =
    globalThis.crypto?.randomUUID?.() ??
    Math.random().toString(36).slice(2, 11);
  return `${prefix}_${randomPart}`;
}

function matchesWhere(record, where = {}) {
  return Object.entries(where).every(([key, val]) => record[key] === val);
}

// --- Generic table operations factory ---

function createTableOps(tableName, idPrefix) {
  return {
    async findMany({ where } = {}) {
      const records = readTable(tableName);
      return where ? records.filter((r) => matchesWhere(r, where)) : records;
    },

    async findUnique({ where }) {
      const records = readTable(tableName);
      return records.find((r) => matchesWhere(r, where)) || null;
    },

    async create({ data }) {
      const records = readTable(tableName);
      const newRecord = {
        ...data,
        id: generateId(idPrefix),
        createdAt: new Date().toISOString(),
      };
      records.push(newRecord);
      writeTable(tableName, records);
      return newRecord;
    },

    async update({ where, data }) {
      const records = readTable(tableName);
      const index = records.findIndex((r) => matchesWhere(r, where));
      if (index === -1) return null;
      const originalId = records[index].id;
      records[index] = { ...records[index], ...data, id: originalId };
      writeTable(tableName, records);
      return records[index];
    },

    async delete({ where }) {
      const records = readTable(tableName);
      const index = records.findIndex((r) => matchesWhere(r, where));
      if (index === -1) return null;
      const [deleted] = records.splice(index, 1);
      writeTable(tableName, records);
      return deleted;
    },

    async deleteMany({ where } = {}) {
      const records = readTable(tableName);
      const remaining = where
        ? records.filter((r) => !matchesWhere(r, where))
        : [];
      writeTable(tableName, remaining);
    },
  };
}

// --- The db object ---

const db = {
  users: createTableOps("users", "usr"),
  posts: createTableOps("posts", "pst"),
  comments: createTableOps("comments", "cmt"),
  likes: createTableOps("likes", "lke"),
  follows: createTableOps("follows", "flw"),
};

export default db;
