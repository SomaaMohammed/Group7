import { getSession } from "@/lib/auth";
import { notificationsRepo } from "@/lib/repo/notifications";

export async function GET() {
	const user = await getSession();
	if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

	const notifications = await notificationsRepo.listUnread(user.id);
	return Response.json(notifications);
}
