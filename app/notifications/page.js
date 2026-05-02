import { requireUser } from "@/lib/auth";
import { notificationsRepo } from "@/lib/repo/notifications";
import { MarkReadOnLeave } from "@/components/MarkReadOnLeave";
import { NotificationCard } from "@/components/NotificationCard";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
	const user = await requireUser();
	const notifications = await notificationsRepo.listUnread(user.id);

	return (
		<main className="app-main">
			<div className="content-column page-enter">
				<h1 className="page-title">Notifications</h1>
				{notifications.length === 0 ? (
					<p className="text-secondary">You&apos;re all caught up!</p>
				) : (
					<div className="notification-list">
						{notifications.map((n) => (
							<NotificationCard key={n.id} notification={n} />
						))}
					</div>
				)}
				<MarkReadOnLeave />
			</div>
		</main>
	);
}
