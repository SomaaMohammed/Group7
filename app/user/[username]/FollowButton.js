"use client";

import { useState } from "react";
import PropTypes from "@/lib/prop-types";

export function FollowButton({ followingId, initialFollowing }) {
    const [isFollowing, setIsFollowing] = useState(Boolean(initialFollowing));
    const [pending, setPending] = useState(false);
    let label = "Follow";

    if (pending) {
        label = "...";
    } else if (isFollowing) {
        label = "Following";
    }

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
            {label}
        </button>
    );
}

FollowButton.propTypes = {
    followingId: PropTypes.string.isRequired,
    initialFollowing: PropTypes.bool.isRequired,
};
