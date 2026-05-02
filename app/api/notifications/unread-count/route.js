import { getSession } from "@/lib/auth";
import { notificationsRepo } from "@/lib/repo/notifications";

export async function GET() {
	const user = await getSession();
	if (!user) return Response.json({ count: 0 });

	const count = await notificationsRepo.unreadCount(user.id);
	return Response.json({ count });
}
