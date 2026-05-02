import { prisma } from "@/lib/prisma";

const POST_SELECT = {
    id: true,
    content: true,
    media: true,
    createdAt: true,
    author: { select: { id: true, username: true, profilePicture: true } },
    _count: { select: { comments: true, likes: true } },
};

export const postsRepo = {
    /** @param {{ limit?: number, cursor?: string }} args */
    async listGlobal({ limit = 20, cursor } = {}) {
        return prisma.post.findMany({
            take: limit,
            ...(cursor && { cursor: { id: cursor }, skip: 1 }),
            orderBy: { createdAt: "desc" },
            select: POST_SELECT,
        });
    },

    /**
     * @param {string} authorId
     * @param {{ limit?: number, cursor?: string }} args
     */
    async listByAuthor(authorId, { limit = 20, cursor } = {}) {
        return prisma.post.findMany({
            where: { authorId },
            take: limit,
            ...(cursor && { cursor: { id: cursor }, skip: 1 }),
            orderBy: { createdAt: "desc" },
            select: POST_SELECT,
        });
    },

    /**
     * Feed for a user: their own posts plus posts from people they follow, newest first.
     * @param {string} userId
     * @param {{ limit?: number, cursor?: string }} args
     */
    async listHomeFeed(userId, { limit = 20, cursor } = {}) {
        return prisma.post.findMany({
            where: {
                OR: [
                    { authorId: userId },
                    {
                        author: {
                            followers: {
                                some: { followerId: userId },
                            },
                        },
                    },
                ],
            },
            take: limit,
            ...(cursor && { cursor: { id: cursor }, skip: 1 }),
            orderBy: { createdAt: "desc" },
            select: POST_SELECT,
        });
    },

    /** @param {string} id */
    async findById(id) {
        return prisma.post.findUnique({
            where: { id },
            select: POST_SELECT,
        });
    },

    /** @param {{ authorId: string, content: string, media?: string[] }} data */
    async create({ authorId, content, media }) {
        return prisma.post.create({
            data: {
                author: { connect: { id: authorId } },
                content,
                media: media ?? [],
            },
            select: POST_SELECT,
        });
    },

    /** @param {string} id */
    async delete(id) {
        return prisma.post.delete({
            where: { id },
            select: POST_SELECT,
        });
    },

    /**
     * Full-text-ish search on content. Prefer Postgres `ILIKE` via Prisma `contains` (mode: "insensitive").
     * @param {string} q
     * @param {{ limit?: number }} args
     */
    async search(q, { limit = 20 } = {}) {
        return prisma.post.findMany({
            where: {
                content: {
                    contains: q,
                    mode: "insensitive",
                },
            },
            take: limit,
            orderBy: { createdAt: "desc" },
            select: POST_SELECT,
        });
    },
};
