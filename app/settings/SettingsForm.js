"use client";

import { Avatar } from "@/components/Avatar";
import { useToast } from "@/components/Toast";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

export function SettingsForm({ user }) {
    const showToast = useToast();
    const router = useRouter();
    const fileRef = useRef(null);

    const [username, setUsername] = useState(user.username ?? "");
    const [bio, setBio] = useState(user.bio ?? "");
    const [avatarUrl, setAvatarUrl] = useState(user.profilePicture ?? null);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    async function handleAvatarChange(e) {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        const form = new FormData();
        form.append("file", file);
        const res = await fetch("/api/users/me/avatar", {
            method: "POST",
            body: form,
        });
        setUploading(false);
        if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            showToast(data.error ?? "Avatar upload failed.", "error");
            return;
        }
        const data = await res.json();
        setAvatarUrl(data.user.profilePicture);
        showToast("Avatar updated.", "success");
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setSaving(true);
        const res = await fetch("/api/users/me", {
            method: "PATCH",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ username: username.trim(), bio: bio.trim() || null }),
        });
        setSaving(false);
        if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            showToast(data.error ?? "Save failed.", "error");
            return;
        }
        showToast("Profile saved.", "success");
        router.refresh();
    }

    return (
        <form className="card" onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <h2 className="page-title" style={{ marginBottom: 0 }}>Edit profile</h2>

            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <Avatar user={{ profilePicture: avatarUrl, username }} size="xl" alt="Your avatar" />
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        disabled={uploading}
                        onClick={() => fileRef.current?.click()}
                    >
                        {uploading ? "Uploading…" : "Change avatar"}
                    </button>
                    <input
                        ref={fileRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        style={{ display: "none" }}
                        onChange={handleAvatarChange}
                    />
                    <span className="input-hint">JPG, PNG, WebP or GIF · max 5 MB</span>
                </div>
            </div>

            <div className="input-group">
                <label className="input-label" htmlFor="username">Username</label>
                <input
                    id="username"
                    className="input"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    minLength={1}
                    maxLength={30}
                    autoComplete="username"
                />
            </div>

            <div className="input-group">
                <label className="input-label" htmlFor="bio">Bio</label>
                <textarea
                    id="bio"
                    className="input"
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    maxLength={300}
                    placeholder="Tell people about yourself…"
                    style={{ resize: "vertical" }}
                />
            </div>

            <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? "Saving…" : "Save changes"}
            </button>
        </form>
    );
}
