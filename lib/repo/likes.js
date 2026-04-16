import { prisma } from "@/lib/prisma";

export const likesRepo = {
    /**
     * Toggle a like. Use composite PK (postId, userId) — upsert/delete, no read-then-write.
     * @param {{ postId: string, userId: string }} args
     * @returns {Promise<{ liked: boolean }>}
     */
    async toggle(_args) {
        /* TODO (track C) */
    },

    /**
     * Check if a user liked a post. Single PK lookup.
     * @param {{ postId: string, userId: string }} args
     */
    async exists(_args) {
        /* TODO (track C) */
    },
};
