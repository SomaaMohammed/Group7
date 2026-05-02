"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Avatar } from "@/components/Avatar";
import { useToast } from "@/components/Toast";
import PropTypes from "@/lib/prop-types";

const MAX_AVATAR_BYTES = 5 * 1024 * 1024;
const ALLOWED_AVATAR_TYPES = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
]);

export function SettingsForm({ user }) {
    const showToast = useToast();
    const router = useRouter();
    const fileRef = useRef(null);

    const [username, setUsername] = useState(user.username ?? "");
    const [bio, setBio] = useState(user.bio ?? "");
    const [avatarUrl, setAvatarUrl] = useState(user.profilePicture ?? null);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    async function handleAvatarChange(event) {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!ALLOWED_AVATAR_TYPES.has(file.type)) {
            showToast("Use a JPG, PNG, WebP, or GIF image.", "danger");
            event.target.value = "";
            return;
        }

        if (file.size > MAX_AVATAR_BYTES) {
            showToast("Avatar must be 5 MB or less.", "danger");
            event.target.value = "";
            return;
        }

        setUploading(true);
        try {
            const form = new FormData();
            form.append("file", file);
            const res = await fetch("/api/users/me/avatar", {
                method: "POST",
                body: form,
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                showToast(data.error ?? "Avatar upload failed.", "danger");
                return;
            }

            const data = await res.json();
            setAvatarUrl(data.user.profilePicture);
            showToast("Avatar updated.", "success");
            router.refresh();
        } catch {
            showToast("Avatar upload failed.", "danger");
        } finally {
            setUploading(false);
            event.target.value = "";
        }
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setSaving(true);

        try {
            const res = await fetch("/api/users/me", {
                method: "PATCH",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({
                    username: username.trim(),
                    bio: bio.trim() || null,
                }),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                showToast(data.error ?? "Save failed.", "danger");
                return;
            }

            showToast("Profile saved.", "success");
            router.refresh();
        } catch {
            showToast("Save failed.", "danger");
        } finally {
            setSaving(false);
        }
    }

    return (
        <form
            className="card"
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: 16 }}
        >
            <h2 className="page-title" style={{ marginBottom: 0 }}>
                Edit profile
            </h2>

            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <Avatar
                    user={{ profilePicture: avatarUrl, username }}
                    size="xl"
                    alt="Your avatar"
                />
                <div
                    style={{ display: "flex", flexDirection: "column", gap: 8 }}
                >
                    <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        disabled={uploading}
                        onClick={() => fileRef.current?.click()}
                    >
                        {uploading ? "Uploading..." : "Change avatar"}
                    </button>
                    <input
                        ref={fileRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        style={{ display: "none" }}
                        onChange={handleAvatarChange}
                    />
                    <span className="input-hint">
                        JPG, PNG, WebP or GIF - max 5 MB
                    </span>
                </div>
            </div>

            <div className="input-group">
                <label className="input-label" htmlFor="username">
                    Username
                </label>
                <input
                    id="username"
                    className="input"
                    type="text"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    required
                    minLength={3}
                    maxLength={24}
                    pattern="[a-z0-9_]{3,24}"
                    autoComplete="username"
                />
                <span className="input-hint">
                    3-24 lowercase letters, numbers, or underscores.
                </span>
            </div>

            <div className="input-group">
                <label className="input-label" htmlFor="bio">
                    Bio
                </label>
                <textarea
                    id="bio"
                    className="input"
                    rows={3}
                    value={bio}
                    onChange={(event) => setBio(event.target.value)}
                    maxLength={300}
                    placeholder="Tell people about yourself..."
                    style={{ resize: "vertical" }}
                />
                <span className="input-hint">{bio.length}/300</span>
            </div>

            <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? "Saving..." : "Save changes"}
            </button>
        </form>
    );
}

SettingsForm.propTypes = {
    user: PropTypes.shape({
        username: PropTypes.string,
        bio: PropTypes.string,
        profilePicture: PropTypes.string,
    }).isRequired,
};
