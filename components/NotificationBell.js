"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import PropTypes from "@/lib/prop-types";

const POLL_INTERVAL = 12000;

export function NotificationBell({ variant, isActive }) {
    const [count, setCount] = useState(0);

    const poll = useCallback(async () => {
        try {
            const res = await fetch("/api/notifications/unread-count");
            if (res.ok) {
                const data = await res.json();
                setCount(data.count);
            }
        } catch {}
    }, []);

    useEffect(() => {
        let id;
        function start() {
            poll();
            id = setInterval(poll, POLL_INTERVAL);
        }
        function handleVisibility() {
            if (document.visibilityState === "hidden") {
                clearInterval(id);
            } else {
                start();
            }
        }
        start();
        document.addEventListener("visibilitychange", handleVisibility);
        return () => {
            clearInterval(id);
            document.removeEventListener("visibilitychange", handleVisibility);
        };
    }, [poll]);

    if (variant === "sidebar") {
        return (
            <Link
                className={`sidebar-nav-item${isActive ? " active" : ""}`}
                href="/notifications"
                transitionTypes={["nav-forward"]}
            >
                <span className="notification-bell">
                    <span className="icon icon-bell" aria-hidden="true" />
                    {count > 0 && (
                        <span className="notification-badge">
                            {count > 99 ? "99+" : count}
                        </span>
                    )}
                </span>
                <span>Notifications</span>
            </Link>
        );
    }

    return (
        <Link
            className="icon-btn notification-bell"
            href="/notifications"
            aria-label={`Notifications${count > 0 ? ` (${count} unread)` : ""}`}
            transitionTypes={["nav-forward"]}
        >
            <span className="icon icon-bell" aria-hidden="true" />
            {count > 0 && (
                <span className="notification-badge">
                    {count > 99 ? "99+" : count}
                </span>
            )}
        </Link>
    );
}

NotificationBell.propTypes = {
    variant: PropTypes.string,
    isActive: PropTypes.bool,
};
