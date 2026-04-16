import { prisma } from "@/lib/prisma";

export const commentsRepo = {
    /**
     * Comments on a post, oldest first (thread order).
     * @param {string} postId
     * @param {{ limit?: number, cursor?: string }} args
     */
    async listByPost(_postId, { limit: _limit = 50, cursor: _cursor } = {}) {
        /* TODO (track C) */
    },

    /** @param {{ postId: string, authorId: string, content: string }} data */
    async create(_data) {
        /* TODO (track C) */
    },

    /** @param {string} id */
    async delete(_id) {
        /* TODO (track C) */
    },
};
