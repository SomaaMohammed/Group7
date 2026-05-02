"use client";

import { useEffect, useRef, useState } from "react";
import { useToast } from "@/components/Toast";
import PropTypes from "@/lib/prop-types";

const LIKE_PARTICLE_COUNT = 8;

export function LikeButton({ postId, initialLiked = false, initialCount = 0 }) {
    const showToast = useToast();
    const [liked, setLiked] = useState(initialLiked);
    const [count, setCount] = useState(initialCount);
    const [animatingLike, setAnimatingLike] = useState(false);
    const [particles, setParticles] = useState([]);
    const likeAnimationTimeoutRef = useRef(null);
    const latestActionRef = useRef(0);

    useEffect(() => {
        return () => {
            if (likeAnimationTimeoutRef.current) {
                clearTimeout(likeAnimationTimeoutRef.current);
            }
        };
    }, []);

    function randomFloat() {
        return Math.random();
    }

    function triggerLikeAnimation() {
        if (globalThis.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            return;
        }

        const nextParticles = [];
        for (let i = 0; i < LIKE_PARTICLE_COUNT; i += 1) {
            const angle = (Math.PI * 2 * i) / LIKE_PARTICLE_COUNT;
            const distance = 18 + randomFloat() * 14;
            nextParticles.push({
                id: `${Date.now()}-${i}-${randomFloat()}`,
                tx: `${Math.cos(angle) * distance}px`,
                ty: `${Math.sin(angle) * distance}px`,
            });
        }

        setParticles(nextParticles);
        setAnimatingLike(false);
        requestAnimationFrame(() => {
            setAnimatingLike(true);

            if (likeAnimationTimeoutRef.current) {
                clearTimeout(likeAnimationTimeoutRef.current);
            }

            likeAnimationTimeoutRef.current = setTimeout(() => {
                setAnimatingLike(false);
                setParticles([]);
                likeAnimationTimeoutRef.current = null;
            }, 560);
        });
    }

    async function handleClick() {
        const previousLiked = liked;
        const previousCount = count;
        const nextLiked = !previousLiked;
        const nextCount = Math.max(0, previousCount + (nextLiked ? 1 : -1));
        const actionId = latestActionRef.current + 1;
        latestActionRef.current = actionId;

        setLiked(nextLiked);
        setCount(nextCount);
        if (nextLiked) {
            triggerLikeAnimation();
        } else {
            setAnimatingLike(false);
            setParticles([]);
        }

        try {
            const res = await fetch("/api/likes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ postId, liked: nextLiked }),
            });

            if (res.status === 401) {
                throw new Error("Sign in to like posts.");
            }

            if (!res.ok) {
                throw new Error("Failed to update like.");
            }

            const result = await res.json();
            if (actionId !== latestActionRef.current) return;

            if (
                typeof result?.liked === "boolean" &&
                result.liked !== nextLiked
            ) {
                setLiked(result.liked);
                setCount(Math.max(0, nextCount + (result.liked ? 1 : -1)));
            }
        } catch (error) {
            if (actionId !== latestActionRef.current) return;
            setLiked(previousLiked);
            setCount(previousCount);
            setAnimatingLike(false);
            setParticles([]);
            showToast(error?.message || "Failed to update like.", "danger");
        }
    }

    return (
        <button
            className={`count-btn post-like-btn${liked ? " liked is-liked" : ""}${animatingLike ? " like-pop" : ""}`}
            type="button"
            aria-pressed={liked}
            onClick={handleClick}
            style={{ position: "relative", zIndex: 2 }}
        >
            <span className="post-like-icon-wrap" aria-hidden="true">
                <span className="like-pop-circle" />
                <span className="icon icon-heart count-btn-icon" />
                <span className="icon icon-heart-fill count-btn-icon" />
                {particles.map((particle) => (
                    <span
                        key={particle.id}
                        className="like-particle"
                        style={{ "--tx": particle.tx, "--ty": particle.ty }}
                    />
                ))}
            </span>
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
