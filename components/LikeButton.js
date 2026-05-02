"use client";

import { useState } from "react";
import { useToast } from "@/components/Toast";
import PropTypes from "@/lib/prop-types";

export function LikeButton({ postId, initialLiked = false, initialCount = 0 }) {
    const showToast = useToast();
    const [liked, setLiked] = useState(initialLiked);
    const [count, setCount] = useState(initialCount);
    const [loading, setLoading] = useState(false);

    async function handleClick() {
        if (loading) return;

        const previousLiked = liked;
        const previousCount = count;
        const nextLiked = !previousLiked;
        const nextCount = Math.max(0, previousCount + (nextLiked ? 1 : -1));

        setLiked(nextLiked);
        setCount(nextCount);
        setLoading(true);

        try {
            const res = await fetch("/api/likes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ postId }),
            });

            if (res.status === 401) {
                throw new Error("Sign in to like posts.");
            }

            if (!res.ok) {
                throw new Error("Failed to update like.");
            }

            const result = await res.json();

            if (
                typeof result?.liked === "boolean" &&
                result.liked !== nextLiked
            ) {
                setLiked(result.liked);
                setCount(Math.max(0, nextCount + (result.liked ? 1 : -1)));
            }
        } catch (error) {
            setLiked(previousLiked);
            setCount(previousCount);
            showToast(error?.message || "Failed to update like.", "danger");
        } finally {
            setLoading(false);
        }
    }

    return (
        <button
            className={`count-btn${liked ? " liked" : ""}`}
            type="button"
            aria-pressed={liked}
            disabled={loading}
            onClick={handleClick}
            style={{ position: "relative", zIndex: 2 }}
        >
            <span
                className={`icon ${liked ? "icon-heart-fill" : "icon-heart"} count-btn-icon`}
                aria-hidden="true"
            />
            <span>
                {count} {count === 1 ? "like" : "likes"}
            </span>
        </button>
    );
}

LikeButton.propTypes = {
    postId: PropTypes.string.isRequired,
    initialLiked: PropTypes.bool,
    initialCount: PropTypes.number,
};
