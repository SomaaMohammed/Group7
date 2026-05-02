"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "@/components/Toast";
import PropTypes from "@/lib/prop-types";

export function PostComposer({ defaultOpen = false }) {
    const router = useRouter();
    const showToast = useToast();
    const [open, setOpen] = useState(defaultOpen);
    const [content, setContent] = useState("");
    const [files, setFiles] = useState([]);
    const [posting, setPosting] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();

        if (!content.trim()) {
            showToast("Post cannot be empty.", "danger");
            return;
        }

        setPosting(true);

        try {
            const mediaUrls = [];

            for (const file of files.slice(0, 4)) {
                const formData = new FormData();
                formData.append("file", file);

                const uploadRes = await fetch("/api/media", {
                    method: "POST",
                    body: formData,
                });

                if (!uploadRes.ok) {
                    const error = await uploadRes.json().catch(() => null);
                    throw new Error(error?.error || "Upload failed.");
                }

                const { url } = await uploadRes.json();
                mediaUrls.push(url);
            }

            const postRes = await fetch("/api/posts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content, media: mediaUrls }),
            });

            if (!postRes.ok) {
                const error = await postRes.json().catch(() => null);
                throw new Error(error?.error || "Failed to create post.");
            }

            setContent("");
            setFiles([]);
            setOpen(false);
            showToast("Post created.", "success");
            router.replace("/home");
            router.refresh();
        } catch (error) {
            showToast(error?.message || "Something went wrong.", "danger");
        } finally {
            setPosting(false);
        }
    }

    if (!open) {
        return (
            <button
                className="card btn-block text-left"
                type="button"
                onClick={() => setOpen(true)}
                style={{ marginBottom: 16 }}
            >
                <span className="text-secondary">
                    What&apos;s on your mind?
                </span>
            </button>
        );
    }

    return (
        <form
            className="card flex-col gap-3"
            onSubmit={handleSubmit}
            style={{ marginBottom: 16 }}
        >
            <textarea
                className="textarea"
                value={content}
                maxLength={2000}
                onChange={(event) => setContent(event.target.value)}
                placeholder="What's on your mind?"
                disabled={posting}
            />

            <div className="flex-between gap-3 flex-wrap">
                <label className="btn btn-ghost" htmlFor="post-media">
                    <span className="icon icon-plus" aria-hidden="true" />
                    {" Media"}
                </label>
                <input
                    id="post-media"
                    className="sr-only"
                    type="file"
                    multiple
                    accept="image/*"
                    disabled={posting}
                    onChange={(event) =>
                        setFiles(Array.from(event.target.files || []))
                    }
                />
                <span className="char-counter">
                    {`${content.length}/2000${
                        files.length > 0
                            ? `, ${Math.min(files.length, 4)} image(s)`
                            : ""
                    }`}
                </span>
            </div>

            <div className="flex gap-2">
                <button
                    className="btn btn-primary"
                    type="submit"
                    disabled={posting || !content.trim()}
                >
                    {posting ? "Posting..." : "Post"}
                </button>
                <button
                    className="btn btn-ghost"
                    type="button"
                    disabled={posting}
                    onClick={() => {
                        setOpen(false);
                        setContent("");
                        setFiles([]);
                    }}
                >
                    Cancel
                </button>
            </div>
        </form>
    );
}

PostComposer.propTypes = {
    defaultOpen: PropTypes.bool,
};
