"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Avatar } from "@/components/Avatar";
import { useToast } from "@/components/Toast";
import PropTypes from "@/lib/prop-types";

export function EditProfileForm({ user, onCancel, onSaved }) {
    const showToast = useToast();
    const router = useRouter();
    const fileRef = useRef(null);

    const [username, setUsername] = useState(user.username ?? "");
    const [bio, setBio] = useState(user.bio ?? "");
    const [avatarUrl, setAvatarUrl] = useState(user.profilePicture ?? null);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [removingAvatar, setRemovingAvatar] = useState(false);

    useEffect(() => {
        setUsername(user.username ?? "");
        setBio(user.bio ?? "");
        setAvatarUrl(user.profilePicture ?? null);
    }, [user.username, user.bio, user.profilePicture]);

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
            showToast(data.error ?? "Avatar upload failed.", "danger");
            return;
        }
        const data = await res.json();
        setAvatarUrl(data.user.profilePicture ?? null);
        showToast("Avatar updated.", "success");
    }

    async function handleAvatarRemove() {
        setRemovingAvatar(true);
        const res = await fetch("/api/users/me", {
            method: "PATCH",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ profilePicture: null }),
        });
        setRemovingAvatar(false);
        if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            showToast(data.error ?? "Failed to remove avatar.", "danger");
            return;
        }
        setAvatarUrl(null);
        showToast("Avatar removed.", "success");
        router.refresh();
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setSaving(true);
        const res = await fetch("/api/users/me", {
            method: "PATCH",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
                username: username.trim(),
                bio: bio.trim() || null,
            }),
        });
        setSaving(false);
        if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            showToast(data.error ?? "Save failed.", "danger");
            return;
        }
        const data = await res.json();
        const nextUsername = data?.user?.username ?? username.trim();
        showToast("Profile saved.", "success");
        onSaved?.();
        router.replace(`/user/${nextUsername}`);
        router.refresh();
    }

    function handleCancel() {
        setUsername(user.username ?? "");
        setBio(user.bio ?? "");
        setAvatarUrl(user.profilePicture ?? null);
        onCancel?.();
    }

    return (
        <section
            id="edit-profile-form"
            className="card"
            aria-label="Profile Editing"
        >
            <h2 className="profile-main-change">Edit Profile</h2>
            <form className="flex-col gap-4" onSubmit={handleSubmit}>
                <div className="input-group">
                    <label className="input-label" htmlFor="edit-username">
                        Username
                    </label>
                    <input
                        id="edit-username"
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
                    <label className="input-label" htmlFor="edit-bio">
                        Bio
                    </label>
                    <textarea
                        id="edit-bio"
                        className="textarea"
                        rows={4}
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        maxLength={300}
                        placeholder="What do you want to share about yourself"
                    />
                </div>

                <div className="input-group">
                    <label className="input-label">Profile Picture</label>
                    <div className="avatar-upload">
                        <Avatar
                            user={{ profilePicture: avatarUrl, username }}
                            size="lg"
                        />
                        <div className="avatar-upload-actions">
                            <button
                                type="button"
                                className="btn btn-outline btn-sm"
                                disabled={uploading}
                                onClick={() => fileRef.current?.click()}
                            >
                                {uploading ? "Uploading…" : "Choose Image"}
                            </button>
                            <input
                                ref={fileRef}
                                type="file"
                                accept="image/jpeg,image/png,image/webp,image/gif"
                                style={{ display: "none" }}
                                onChange={handleAvatarChange}
                            />
                            <button
                                type="button"
                                className="btn btn-ghost btn-sm"
                                disabled={removingAvatar || !avatarUrl}
                                onClick={handleAvatarRemove}
                            >
                                {removingAvatar ? "Removing…" : "Remove"}
                            </button>
                        </div>
                    </div>
                    <span className="input-hint">
                        JPEG, PNG, GIF, or WebP. Max 5 MB.
                    </span>
                </div>

                <div className="change-actions">
                    <button
                        type="button"
                        className="btn btn-ghost"
                        onClick={handleCancel}
                        disabled={saving}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={saving}
                    >
                        {saving ? "Saving…" : "Save changes"}
                    </button>
                </div>
            </form>
        </section>
    );
}

EditProfileForm.propTypes = {
    user: PropTypes.shape({
        username: PropTypes.string,
        bio: PropTypes.string,
        profilePicture: PropTypes.string,
    }).isRequired,
    onCancel: PropTypes.func,
    onSaved: PropTypes.func,
};
