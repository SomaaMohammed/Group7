"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
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

export function EditProfileForm({ user, onCancel, onSaved }) {
    const showToast = useToast();
    const router = useRouter();
    const fileRef = useRef(null);

    const [username, setUsername] = useState(user.username ?? "");
    const [bio, setBio] = useState(user.bio ?? "");
    const [avatarUrl, setAvatarUrl] = useState(user.profilePicture ?? null);
    const [pendingFile, setPendingFile] = useState(null);
    const [pendingRemove, setPendingRemove] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        setUsername(user.username ?? "");
        setBio(user.bio ?? "");
        setAvatarUrl(user.profilePicture ?? null);
        setPendingFile(null);
        setPendingRemove(false);
    }, [user.username, user.bio, user.profilePicture]);

    function handleAvatarChange(event) {
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

        setPendingFile(file);
        setPendingRemove(false);
        setAvatarUrl(URL.createObjectURL(file));
        event.target.value = "";
    }

    function handleAvatarRemove() {
        setPendingFile(null);
        setPendingRemove(true);
        setAvatarUrl(null);
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setSaving(true);

        try {
            let newAvatarUrl;

            if (pendingFile) {
                const form = new FormData();
                form.append("file", pendingFile);
                const avatarRes = await fetch("/api/users/me/avatar", {
                    method: "POST",
                    body: form,
                });
                if (!avatarRes.ok) {
                    const data = await avatarRes.json().catch(() => ({}));
                    showToast(data.error ?? "Avatar upload failed.", "danger");
                    return;
                }
                const avatarData = await avatarRes.json();
                newAvatarUrl = avatarData.user.profilePicture ?? null;
            }

            const patch = {
                username: username.trim(),
                bio: bio.trim() || null,
            };
            if (pendingRemove) {
                patch.profilePicture = null;
            } else if (newAvatarUrl !== undefined) {
                patch.profilePicture = newAvatarUrl;
            }

            const res = await fetch("/api/users/me", {
                method: "PATCH",
                headers: { "content-type": "application/json" },
                body: JSON.stringify(patch),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                showToast(data.error ?? "Save failed.", "danger");
                return;
            }

            const data = await res.json();
            const nextUsername = data?.user?.username ?? username.trim();
            showToast("Profile saved.", "success");
            setPendingFile(null);
            setPendingRemove(false);
            onSaved?.();
            router.replace(`/user/${nextUsername}`);
            router.refresh();
        } catch {
            showToast("Save failed.", "danger");
        } finally {
            setSaving(false);
        }
    }

    function handleCancel() {
        setUsername(user.username ?? "");
        setBio(user.bio ?? "");
        setAvatarUrl(user.profilePicture ?? null);
        setPendingFile(null);
        setPendingRemove(false);
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
                    <label className="input-label" htmlFor="edit-bio">
                        Bio
                    </label>
                    <textarea
                        id="edit-bio"
                        className="textarea"
                        rows={4}
                        value={bio}
                        onChange={(event) => setBio(event.target.value)}
                        maxLength={300}
                        placeholder="What do you want to share about yourself?"
                    />
                    <span className="input-hint">{bio.length}/300</span>
                </div>

                <div className="input-group">
                    <label className="input-label" htmlFor="edit-avatar">
                        Profile Picture
                    </label>
                    <div className="avatar-upload">
                        <Avatar
                            user={{ profilePicture: avatarUrl, username }}
                            size="lg"
                        />
                        <div className="avatar-upload-actions">
                            <button
                                type="button"
                                className="btn btn-outline btn-sm"
                                disabled={saving}
                                onClick={() => fileRef.current?.click()}
                            >
                                Choose Image
                            </button>
                            <input
                                id="edit-avatar"
                                ref={fileRef}
                                type="file"
                                accept="image/jpeg,image/png,image/webp,image/gif"
                                style={{ display: "none" }}
                                onChange={handleAvatarChange}
                            />
                            <button
                                type="button"
                                className="btn btn-ghost btn-sm"
                                disabled={saving || !avatarUrl}
                                onClick={handleAvatarRemove}
                            >
                                Remove
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
                        {saving ? "Saving..." : "Save changes"}
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
