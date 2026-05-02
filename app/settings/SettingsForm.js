"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Avatar } from "@/components/Avatar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useToast } from "@/components/Toast";
import PropTypes from "@/lib/prop-types";

export function SettingsForm({ user }) {
    const showToast = useToast();
    const router = useRouter();
    const fileRef = useRef(null);

    const [username, setUsername] = useState(user.username ?? "");
    const [bio, setBio] = useState(user.bio ?? "");
    const [avatarUrl, setAvatarUrl] = useState(user.profilePicture ?? null);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [changingPassword, setChangingPassword] = useState(false);
    const [showChangePassword, setShowChangePassword] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");
    const [deletingAccount, setDeletingAccount] = useState(false);
    const [showDeleteAccountConfirm, setShowDeleteAccountConfirm] =
        useState(false);
    const [deletePassword, setDeletePassword] = useState("");

    async function handleLogout() {
        const res = await fetch("/api/auth/signout", { method: "POST" });
        if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            showToast(data.error ?? "Logout failed.", "danger");
            return;
        }
        router.push("/login");
        router.refresh();
    }

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
        setAvatarUrl(data.user.profilePicture);
        showToast("Avatar updated.", "success");
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
        showToast("Profile saved.", "success");
        router.refresh();
    }

    async function handleChangePassword(e) {
        e.preventDefault();
        setChangingPassword(true);
        const res = await fetch("/api/users/me/password", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
                currentPassword,
                newPassword,
                confirmNewPassword,
            }),
        });
        setChangingPassword(false);

        if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            showToast(data.error ?? "Failed to change password.", "danger");
            return;
        }

        setCurrentPassword("");
        setNewPassword("");
        setConfirmNewPassword("");
        setShowChangePassword(false);
        showToast("Password changed successfully.", "success");
    }

    async function handleDeleteAccount(e) {
        e.preventDefault();
        setDeletingAccount(true);
        const res = await fetch("/api/users/me", {
            method: "DELETE",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ password: deletePassword }),
        });
        setDeletingAccount(false);

        if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            showToast(data.error ?? "Failed to delete account.", "danger");
            return;
        }

        showToast("Account deleted.", "success");
        router.push("/login");
        router.refresh();
    }

    return (
        <form
            className="card"
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: 16 }}
        >
            <h1 className="page-title" style={{ marginBottom: 0 }}>
                Settings
            </h1>

            <section
                className="card"
                style={{
                    padding: 16,
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                }}
            >
                <h2
                    className="text-xs text-secondary"
                    style={{ fontWeight: 600 }}
                >
                    Appearance
                </h2>
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    <span className="text-sm">Theme</span>
                    <ThemeToggle />
                </div>
            </section>

            <section
                className="card"
                style={{
                    padding: 16,
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                }}
            >
                <h2
                    className="text-xs text-secondary"
                    style={{ fontWeight: 600 }}
                >
                    Account
                </h2>
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    <span className="text-sm">Session</span>
                    <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        onClick={handleLogout}
                    >
                        Log out
                    </button>
                </div>
                <hr className="divider" style={{ margin: 0 }} />
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    <span className="text-sm">Change Password</span>
                    <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => setShowChangePassword((prev) => !prev)}
                    >
                        Change
                    </button>
                </div>

                {showChangePassword
                    ? <div
                          style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 12,
                          }}
                      >
                          <div className="input-group">
                              <label
                                  className="input-label"
                                  htmlFor="current-password"
                              >
                                  Current Password
                              </label>
                              <input
                                  id="current-password"
                                  className="input"
                                  type="password"
                                  value={currentPassword}
                                  onChange={(e) =>
                                      setCurrentPassword(e.target.value)
                                  }
                                  placeholder="Enter current password"
                              />
                          </div>
                          <div className="input-group">
                              <label
                                  className="input-label"
                                  htmlFor="new-password"
                              >
                                  New Password
                              </label>
                              <input
                                  id="new-password"
                                  className="input"
                                  type="password"
                                  value={newPassword}
                                  onChange={(e) =>
                                      setNewPassword(e.target.value)
                                  }
                                  placeholder="At least 8 chars, letters and numbers"
                              />
                          </div>
                          <div className="input-group">
                              <label
                                  className="input-label"
                                  htmlFor="confirm-new-password"
                              >
                                  Confirm New Password
                              </label>
                              <input
                                  id="confirm-new-password"
                                  className="input"
                                  type="password"
                                  value={confirmNewPassword}
                                  onChange={(e) =>
                                      setConfirmNewPassword(e.target.value)
                                  }
                                  placeholder="Re-enter new password"
                              />
                          </div>
                          <div className="flex gap-2">
                              <button
                                  type="button"
                                  className="btn btn-primary btn-sm"
                                  disabled={changingPassword}
                                  onClick={handleChangePassword}
                              >
                                  {changingPassword
                                      ? "Saving…"
                                      : "Save Password"}
                              </button>
                              <button
                                  type="button"
                                  className="btn btn-ghost btn-sm"
                                  onClick={() => {
                                      setShowChangePassword(false);
                                      setCurrentPassword("");
                                      setNewPassword("");
                                      setConfirmNewPassword("");
                                  }}
                              >
                                  Cancel
                              </button>
                          </div>
                      </div>
                    : null}

                <hr className="divider" style={{ margin: 0 }} />
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    <span
                        className="text-sm"
                        style={{ color: "var(--color-danger)" }}
                    >
                        Delete Account
                    </span>
                    <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        onClick={() =>
                            setShowDeleteAccountConfirm((prev) => !prev)
                        }
                    >
                        Delete
                    </button>
                </div>

                {showDeleteAccountConfirm
                    ? <div
                          style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 12,
                          }}
                      >
                          <p className="text-secondary text-sm">
                              This action is permanent. All your posts,
                              comments, likes, and followers will be deleted.
                              Type your password to confirm.
                          </p>
                          <div className="input-group">
                              <label
                                  className="input-label"
                                  htmlFor="delete-confirm-password"
                              >
                                  Password
                              </label>
                              <input
                                  id="delete-confirm-password"
                                  className="input"
                                  type="password"
                                  value={deletePassword}
                                  onChange={(e) =>
                                      setDeletePassword(e.target.value)
                                  }
                                  placeholder="Enter your password to confirm"
                              />
                          </div>
                          <div className="flex gap-2">
                              <button
                                  type="button"
                                  className="btn btn-danger btn-sm"
                                  disabled={deletingAccount}
                                  onClick={handleDeleteAccount}
                              >
                                  {deletingAccount
                                      ? "Deleting…"
                                      : "Permanently Delete Account"}
                              </button>
                              <button
                                  type="button"
                                  className="btn btn-ghost btn-sm"
                                  onClick={() => {
                                      setShowDeleteAccountConfirm(false);
                                      setDeletePassword("");
                                  }}
                              >
                                  Cancel
                              </button>
                          </div>
                      </div>
                    : null}
            </section>

            <h2
                className="page-title"
                style={{ marginBottom: 0, fontSize: "1.125rem" }}
            >
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
                        {uploading ? "Uploading…" : "Change avatar"}
                    </button>
                    <input
                        ref={fileRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        style={{ display: "none" }}
                        onChange={handleAvatarChange}
                    />
                    <span className="input-hint">
                        JPG, PNG, WebP or GIF · max 5 MB
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
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    minLength={1}
                    maxLength={30}
                    autoComplete="username"
                />
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

SettingsForm.propTypes = {
    user: PropTypes.shape({
        username: PropTypes.string,
        bio: PropTypes.string,
        profilePicture: PropTypes.string,
    }).isRequired,
};
