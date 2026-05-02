import { prisma } from "@/lib/prisma";

export const notificationsRepo = {
	async create({ recipientId, actorId, type, postId = null }) {
		if (recipientId === actorId) return null;
		return prisma.notification.create({
			data: { recipientId, actorId, type, postId },
		});
	},

	async listUnread(recipientId, { limit = 50 } = {}) {
		return prisma.notification.findMany({
			where: { recipientId, read: false },
			take: limit,
			orderBy: { createdAt: "desc" },
			select: {
				id: true,
				type: true,
				postId: true,
				createdAt: true,
				actor: {
					select: { id: true, username: true, profilePicture: true },
				},
				post: { select: { id: true, content: true } },
			},
		});
	},

	async unreadCount(recipientId) {
		return prisma.notification.count({
			where: { recipientId, read: false },
		});
	},

	async markAllRead(recipientId) {
		return prisma.notification.updateMany({
			where: { recipientId, read: false },
			data: { read: true },
		});
	},
};
