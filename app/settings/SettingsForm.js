"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useToast } from "@/components/Toast";

export function SettingsForm() {
    const showToast = useToast();
    const router = useRouter();

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

    async function handleChangePassword(event) {
        event.preventDefault();
        setChangingPassword(true);

        try {
            const res = await fetch("/api/users/me/password", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({
                    currentPassword,
                    newPassword,
                    confirmNewPassword,
                }),
            });

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
        } catch {
            showToast("Failed to change password.", "danger");
        } finally {
            setChangingPassword(false);
        }
    }

    async function handleDeleteAccount(event) {
        event.preventDefault();
        setDeletingAccount(true);

        try {
            const res = await fetch("/api/users/me", {
                method: "DELETE",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ password: deletePassword }),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                showToast(data.error ?? "Failed to delete account.", "danger");
                return;
            }

            showToast("Account deleted.", "success");
            router.push("/login");
            router.refresh();
        } catch {
            showToast("Failed to delete account.", "danger");
        } finally {
            setDeletingAccount(false);
        }
    }

    return (
        <section
            className="card"
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
                                  onChange={(event) =>
                                      setCurrentPassword(event.target.value)
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
                                  onChange={(event) =>
                                      setNewPassword(event.target.value)
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
                                  onChange={(event) =>
                                      setConfirmNewPassword(event.target.value)
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
                                      ? "Saving..."
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
                                  onChange={(event) =>
                                      setDeletePassword(event.target.value)
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
                                      ? "Deleting..."
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
        </section>
    );
}
