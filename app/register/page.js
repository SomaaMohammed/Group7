"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterPage() {
    const router = useRouter();
    const [error, setError] = useState("");
    const [pending, setPending] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();
        setPending(true);
        setError("");

        const form = new FormData(event.currentTarget);
        const email = String(form.get("email") ?? "")
            .trim()
            .toLowerCase();
        const username = String(form.get("username") ?? "")
            .trim()
            .toLowerCase();
        const password = String(form.get("password") ?? "");

        const response = await fetch("/api/auth/register", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ email, username, password }),
        });
        const result = await response.json().catch(() => ({}));
        setPending(false);

        if (!response.ok) {
            setError(result?.error ?? "Failed to create account.");
            return;
        }

        router.replace("/login?registered=1");
    }

    return (
        <main className="app-main">
            <div
                className="content-column page-enter"
                style={{ maxWidth: 520 }}
            >
                <h1 className="company-header">UNI HUB</h1>
                <section className="card auth-card" style={{ marginTop: 16 }}>
                    <h2 className="page-title" style={{ marginBottom: 12 }}>
                        Create account
                    </h2>
                    <p className="text-secondary" style={{ marginBottom: 20 }}>
                        Use email, username, and password to join.
                    </p>
                    {error && (
                        <p
                            className="input-hint error"
                            style={{ marginBottom: 12 }}
                        >
                            {error}
                        </p>
                    )}
                    <form
                        onSubmit={handleSubmit}
                        className="flex flex-col gap-3"
                    >
                        <div className="input-group">
                            <label className="input-label" htmlFor="username">
                                Username
                            </label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                className="input"
                                autoComplete="username"
                                minLength={3}
                                maxLength={24}
                                required
                            />
                        </div>
                        <div className="input-group">
                            <label className="input-label" htmlFor="email">
                                Email
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                className="input"
                                autoComplete="email"
                                required
                            />
                        </div>
                        <div className="input-group">
                            <label className="input-label" htmlFor="password">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                className="input"
                                autoComplete="new-password"
                                minLength={8}
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="btn btn-primary btn-block btn-lg"
                            disabled={pending}
                        >
                            {pending ? "Creating..." : "Create account"}
                        </button>
                    </form>
                    <p className="auth-footer-link" style={{ marginTop: 16 }}>
                        Already have account? <Link href="/login">Sign in</Link>
                    </p>
                </section>
            </div>
        </main>
    );
}
