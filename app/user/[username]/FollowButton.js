"use client";

import { useState } from "react";

export function FollowButton({ followingId, initialFollowing }) {
    const [isFollowing, setIsFollowing] = useState(Boolean(initialFollowing));
    const [pending, setPending] = useState(false);

    async function toggle() {
        setPending(true);
        const method = isFollowing ? "DELETE" : "POST";
        const response = await fetch("/api/follows", {
            method,
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ followingId }),
        });
        setPending(false);
        if (!response.ok) return;
        setIsFollowing(!isFollowing);
    }

    return (
        <button
            type="button"
            className={`btn btn-follow${isFollowing ? " following" : ""}`}
            onClick={toggle}
            disabled={pending}
        >
            {pending ? "..." : isFollowing ? "Following" : "Follow"}
        </button>
    );
}
