"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "@/components/Toast";
import PropTypes from "@/lib/prop-types";

export function CommentComposer({ postId }) {
    const router = useRouter();
    const showToast = useToast();
    const [content, setContent] = useState("");
    const [submitting, setSubmitting] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();

        if (!content.trim()) return;

        setSubmitting(true);

        try {
            const res = await fetch("/api/comments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ postId, content }),
            });

            if (!res.ok) {
                const error = await res.json().catch(() => null);
                throw new Error(error?.error || "Failed to post comment.");
            }

            setContent("");
            showToast("Comment posted.", "success");
            router.refresh();
        } catch (error) {
            showToast(error?.message || "Something went wrong.", "danger");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <form
            className="flex-col gap-2"
            onSubmit={handleSubmit}
            style={{ marginBottom: 16 }}
        >
            <textarea
                className="textarea"
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder="Write a comment..."
                disabled={submitting}
                style={{ minHeight: 72 }}
            />
            <div className="flex-end">
                <button
                    className="btn btn-primary"
                    type="submit"
                    disabled={submitting || !content.trim()}
                >
                    {submitting ? "Posting..." : "Comment"}
                </button>
            </div>
        </form>
    );
}

CommentComposer.propTypes = {
    postId: PropTypes.string.isRequired,
};
