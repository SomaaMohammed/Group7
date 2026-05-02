import { getSession } from "@/lib/auth";
import { notificationsRepo } from "@/lib/repo/notifications";

async function handleMarkRead() {
	const user = await getSession();
	if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

	await notificationsRepo.markAllRead(user.id);
	return Response.json({ ok: true });
}

export const POST = handleMarkRead;
export const PATCH = handleMarkRead;
