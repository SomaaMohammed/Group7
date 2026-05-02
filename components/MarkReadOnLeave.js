"use client";

import { useEffect } from "react";

export function MarkReadOnLeave() {
    useEffect(() => {
        function handleVisibilityChange() {
            if (document.visibilityState === "hidden") {
                fetch("/api/notifications/mark-read", {
                    method: "PATCH",
                    keepalive: true,
                });
            }
        }
        document.addEventListener("visibilitychange", handleVisibilityChange);
        return () => {
            document.removeEventListener(
                "visibilitychange",
                handleVisibilityChange,
            );
            fetch("/api/notifications/mark-read", {
                method: "PATCH",
                keepalive: true,
            });
        };
    }, []);

    return null;
}
