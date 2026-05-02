import { redirect } from "next/navigation";
import { MarkReadOnLeave } from "@/components/MarkReadOnLeave";
import { NotificationCard } from "@/components/NotificationCard";
import { getSession } from "@/lib/auth";
import { getLoginRedirectHref } from "@/lib/navigation";
import { notificationsRepo } from "@/lib/repo/notifications";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
    const user = await getSession();
    if (!user) redirect(getLoginRedirectHref("/notifications"));

    const notifications = await notificationsRepo.listUnread(user.id);

    return (
        <main className="app-main">
            <div className="content-column page-enter">
                <h1 className="page-title">Notifications</h1>
                {notifications.length === 0
                    ? <section className="empty-state card">
                          <h2 className="empty-state-title">
                              You&apos;re all caught up.
                          </h2>
                          <p className="empty-state-description">
                              New likes, comments, and follows will show up
                              here.
                          </p>
                      </section>
                    : <div className="notification-list">
                          {notifications.map((notification) => (
                              <NotificationCard
                                  key={notification.id}
                                  notification={notification}
                              />
                          ))}
                      </div>}
                <MarkReadOnLeave />
            </div>
        </main>
    );
}
