import { prisma } from "@/lib/prisma";

export const postsRepo = {
    /** @param {{ limit?: number, cursor?: string }} args */
    async listGlobal({ limit = 20, cursor } = {}) {
        return prisma.post.findMany({
            take: limit,
            ...(cursor && { cursor: { id: cursor }, skip: 1 }),
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                content: true,
                media: true,
                createdAt: true,
                author: { select: { id: true, username: true, profilePicture: true } },
                _count: { select: { comments: true, likes: true } },
            },
        });
    },

    /**
     * @param {string} authorId
     * @param {{ limit?: number, cursor?: string }} args
     */
    async listByAuthor(_authorId, { limit: _limit = 20, cursor: _cursor } = {}) {
        /* TODO (track C) */
    },

    /**
     * Feed for a user: posts from people they follow, newest first.
     * @param {string} userId
     * @param {{ limit?: number, cursor?: string }} args
     */
    async listHomeFeed(_userId, { limit: _limit = 20, cursor: _cursor } = {}) {
        /* TODO (track C) */
    },

    /** @param {string} id */
    async findById(_id) {
        /* TODO (track C) */
    },

    /** @param {{ authorId: string, content: string, media?: string[] }} data */
    async create(_data) {
        /* TODO (track C) */
    },

    /** @param {string} id */
    async delete(_id) {
        /* TODO (track C) */
    },

    /**
     * Full-text-ish search on content. Prefer Postgres `ILIKE` via Prisma `contains` (mode: "insensitive").
     * @param {string} q
     * @param {{ limit?: number }} args
     */
    async search(_q, { limit: _limit = 20 } = {}) {
        /* TODO (track C) */
    },
};
