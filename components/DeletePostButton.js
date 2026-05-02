"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { useToast } from "@/components/Toast";
import PropTypes from "@/lib/prop-types";

export function DeletePostButton({ postId }) {
    const router = useRouter();
    const showToast = useToast();
    const [loading, setLoading] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    async function handleDelete() {
        setLoading(true);
        try {
            const res = await fetch(`/api/posts/${postId}`, { method: "DELETE" });
            if (!res.ok) {
                const data = await res.json().catch(() => null);
                throw new Error(data?.error || "Failed to delete post.");
            }
            showToast("Post deleted.", "success");
            router.push("/");
            router.refresh();
        } catch (error) {
            showToast(error?.message || "Something went wrong.", "danger");
            setLoading(false);
            setShowConfirm(false);
        }
    }

    return (
        <>
            <button
                className="delete-btn"
                type="button"
                onClick={() => setShowConfirm(true)}
                aria-label="Delete post"
            >
                <span className="icon icon-trash" aria-hidden="true" />
            </button>
            {showConfirm && (
                <ConfirmDialog
                    title="Delete post"
                    message="This will permanently delete this post and all its comments. This cannot be undone."
                    onConfirm={handleDelete}
                    onCancel={() => setShowConfirm(false)}
                    loading={loading}
                />
            )}
        </>
    );
}

DeletePostButton.propTypes = {
    postId: PropTypes.string.isRequired,
};
