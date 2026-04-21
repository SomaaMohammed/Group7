import { prisma } from "@/lib/prisma";

export const likesRepo = {
  /**
   * Toggle a like. Use composite PK (postId, userId) — upsert/delete, no read-then-write.
   * @param {{ postId: string, userId: string }} args
   * @returns {Promise<{ liked: boolean }>}
   */
  async toggle({ postId, userId }) {
    try {
      await prisma.like.delete({
        where: { postId_userId: { postId, userId } },
      });
      return { liked: false };
    } catch (error) {
      if (error?.code !== "P2025") throw error;
      await prisma.like.create({ data: { postId, userId } });
      return { liked: true };
    }
  },

  /**
   * Check if a user liked a post. Single PK lookup.
   * @param {{ postId: string, userId: string }} args
   */
  async exists({ postId, userId }) {
    const like = await prisma.like.findUnique({
      where: { postId_userId: { postId, userId } },
    });
    return Boolean(like);
  },
};
