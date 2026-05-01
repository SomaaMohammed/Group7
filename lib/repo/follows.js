import { prisma } from "@/lib/prisma";

export const followsRepo = {
    /**
     * Create follow edge. Composite PK prevents duplicates — rely on `create` throwing on conflict,
     * or use `createMany({ skipDuplicates: true })` when batching.
     * @param {{ followerId: string, followingId: string }} args
     */
    async follow({ followerId, followingId }) {
        try {
            return await prisma.follow.create({
                data: { followerId, followingId },
            });
        } catch (error) {
            if (error?.code === "P2002") return null;
            throw error;
        }
    },

    /** @param {{ followerId: string, followingId: string }} args */
    async unfollow({ followerId, followingId }) {
        try {
            await prisma.follow.delete({
                where: {
                    followerId_followingId: { followerId, followingId },
                },
            });
        } catch (error) {
            if (error?.code !== "P2025") throw error;
        }
    },

    /** @param {{ followerId: string, followingId: string }} args */
    async exists({ followerId, followingId }) {
        const row = await prisma.follow.findUnique({
            where: {
                followerId_followingId: { followerId, followingId },
            },
            select: { followerId: true },
        });
        return Boolean(row);
    },

    /**
     * Users following `userId`. Newest first by follow createdAt.
     * @param {string} userId
     * @param {{ limit?: number }} args
     */
    async listFollowers(userId, { limit = 50 } = {}) {
        const edges = await prisma.follow.findMany({
            where: { followingId: userId },
            take: limit,
            orderBy: { createdAt: "desc" },
            select: {
                follower: {
                    select: { id: true, username: true, profilePicture: true },
                },
            },
        });
        return edges.map((edge) => edge.follower);
    },

    /**
     * Users `userId` is following.
     * @param {string} userId
     * @param {{ limit?: number }} args
     */
    async listFollowing(userId, { limit = 50 } = {}) {
        const edges = await prisma.follow.findMany({
            where: { followerId: userId },
            take: limit,
            orderBy: { createdAt: "desc" },
            select: {
                following: {
                    select: { id: true, username: true, profilePicture: true },
                },
            },
        });
        return edges.map((edge) => edge.following);
    },
};
