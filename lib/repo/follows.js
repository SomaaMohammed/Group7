import { prisma } from "@/lib/prisma";

export const followsRepo = {
    /**
     * Create follow edge. Composite PK prevents duplicates — rely on `create` throwing on conflict,
     * or use `createMany({ skipDuplicates: true })` when batching.
     * @param {{ followerId: string, followingId: string }} args
     */
    async follow(_args) {
        /* TODO (track B) */
    },

    /** @param {{ followerId: string, followingId: string }} args */
    async unfollow(_args) {
        /* TODO (track B) */
    },

    /** @param {{ followerId: string, followingId: string }} args */
    async exists(_args) {
        /* TODO (track B) */
    },

    /**
     * Users following `userId`. Newest first by follow createdAt.
     * @param {string} userId
     * @param {{ limit?: number }} args
     */
    async listFollowers(_userId, { limit: _limit = 50 } = {}) {
        /* TODO (track B) */
    },

    /**
     * Users `userId` is following.
     * @param {string} userId
     * @param {{ limit?: number }} args
     */
    async listFollowing(_userId, { limit: _limit = 50 } = {}) {
        /* TODO (track B) */
    },
};
