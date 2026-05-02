"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useToast } from "@/components/Toast";
import PropTypes from "@/lib/prop-types";

const MAX_ATTACHMENTS = 4;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

function makeAttachment(file) {
    return {
        id: `${file.name}-${file.size}-${file.lastModified}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        file,
        url: URL.createObjectURL(file),
    };
}

function revokeAttachments(attachments) {
    for (const attachment of attachments) {
        URL.revokeObjectURL(attachment.url);
    }
}

export function PostComposer({ defaultOpen = false }) {
    const router = useRouter();
    const showToast = useToast();
    const mediaInputRef = useRef(null);
    const attachmentsRef = useRef([]);
    const [open, setOpen] = useState(defaultOpen);
    const [content, setContent] = useState("");
    const [attachments, setAttachments] = useState([]);
    const [posting, setPosting] = useState(false);

    useEffect(() => {
        attachmentsRef.current = attachments;
    }, [attachments]);

    useEffect(() => {
        return () => revokeAttachments(attachmentsRef.current);
    }, []);

    function resetMediaInput() {
        if (mediaInputRef.current) {
            mediaInputRef.current.value = "";
        }
    }

    function clearAttachments() {
        revokeAttachments(attachmentsRef.current);
        attachmentsRef.current = [];
        setAttachments([]);
        resetMediaInput();
    }

    function handleMediaChange(event) {
        const selectedFiles = Array.from(event.target.files || []);
        resetMediaInput();

        if (selectedFiles.length === 0) return;

        const availableSlots = MAX_ATTACHMENTS - attachments.length;
        if (availableSlots <= 0) {
            showToast(
                `You can attach up to ${MAX_ATTACHMENTS} images.`,
                "danger",
            );
            return;
        }

        const nextAttachments = [];
        const errors = new Set();

        for (const file of selectedFiles) {
            if (nextAttachments.length >= availableSlots) {
                errors.add(`You can attach up to ${MAX_ATTACHMENTS} images.`);
                break;
            }

            if (!file.type.startsWith("image/")) {
                errors.add("Only image files can be attached.");
                continue;
            }

            if (file.size > MAX_IMAGE_BYTES) {
                errors.add("Each image must be under 5 MB.");
                continue;
            }

            nextAttachments.push(makeAttachment(file));
        }

        if (nextAttachments.length > 0) {
            setAttachments((current) => [...current, ...nextAttachments]);
        }

        const firstError = errors.values().next().value;
        if (firstError) {
            showToast(firstError, "danger");
        }
    }

    function removeAttachment(id) {
        setAttachments((current) => {
            const removed = current.find((attachment) => attachment.id === id);
            if (removed) {
                URL.revokeObjectURL(removed.url);
            }
            return current.filter((attachment) => attachment.id !== id);
        });
    }

    async function handleSubmit(event) {
        event.preventDefault();

        if (!content.trim()) {
            showToast("Post cannot be empty.", "danger");
            return;
        }

        setPosting(true);

        try {
            const mediaUrls = [];

            for (const { file } of attachments.slice(0, MAX_ATTACHMENTS)) {
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
            clearAttachments();
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
                    ref={mediaInputRef}
                    id="post-media"
                    className="sr-only"
                    type="file"
                    multiple
                    accept="image/*"
                    disabled={posting}
                    onChange={handleMediaChange}
                />
                <span className="char-counter">
                    {`${content.length}/2000${
                        attachments.length > 0
                            ? `, ${attachments.length} image(s)`
                            : ""
                    }`}
                </span>
            </div>

            {attachments.length > 0 && (
                <ul
                    className="attachment-previews"
                    aria-label="Selected image previews"
                >
                    {attachments.map((attachment, index) => (
                        <li className="attachment-preview" key={attachment.id}>
                            {/* biome-ignore lint/performance/noImgElement: Object URLs are local upload previews and cannot be optimized by next/image. */}
                            <img
                                src={attachment.url}
                                alt={`Preview ${index + 1}: ${attachment.file.name}`}
                            />
                            <button
                                className="attachment-preview-remove"
                                type="button"
                                disabled={posting}
                                onClick={() => removeAttachment(attachment.id)}
                                aria-label={`Remove ${attachment.file.name}`}
                            >
                                <span
                                    className="icon icon-trash"
                                    aria-hidden="true"
                                />
                            </button>
                        </li>
                    ))}
                </ul>
            )}

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
                        clearAttachments();
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
