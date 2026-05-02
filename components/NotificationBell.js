"use client";

import { useState, useEffect, useCallback } from "react";

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
			<a
				className={`sidebar-nav-item${isActive ? " active" : ""}`}
				href="/notifications"
			>
				<span className="icon icon-bell" aria-hidden="true" />
				<span>Notifications{count > 0 ? ` (${count})` : ""}</span>
			</a>
		);
	}

	return (
		<a
			className="icon-btn notification-bell"
			href="/notifications"
			aria-label={`Notifications${count > 0 ? ` (${count} unread)` : ""}`}
		>
			<span className="icon icon-bell" aria-hidden="true" />
			{count > 0 && (
				<span className="notification-badge">
					{count > 99 ? "99+" : count}
				</span>
			)}
		</a>
	);
}
