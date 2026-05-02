import { prisma } from "@/lib/prisma";

const COMMENT_SELECT = {
    id: true,
    content: true,
    createdAt: true,
    author: { select: { id: true, username: true, profilePicture: true } },
};

export const commentsRepo = {
    /**
     * Comments on a post, oldest first (thread order).
     * @param {string} postId
     * @param {{ limit?: number, cursor?: string }} args
     */
    async listByPost(postId, { limit = 50, cursor } = {}) {
        return prisma.comment.findMany({
            where: { postId },
            take: limit,
            ...(cursor && { cursor: { id: cursor }, skip: 1 }),
            orderBy: { createdAt: "asc" },
            select: COMMENT_SELECT,
        });
    },

    /** @param {{ postId: string, authorId: string, content: string }} data */
    async create({ postId, authorId, content }) {
        return prisma.comment.create({
            data: {
                post: { connect: { id: postId } },
                author: { connect: { id: authorId } },
                content,
            },
            select: COMMENT_SELECT,
        });
    },

    /** @param {string} id */
    async delete(id) {
        return prisma.comment.delete({
            where: { id },
            select: COMMENT_SELECT,
        });
    },
};
