"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import PropTypes from "@/lib/prop-types";

function getFormString(form, key) {
    const value = form.get(key);
    return typeof value === "string" ? value : "";
}

function buildLoginHref(nextPath, registered = false) {
    const params = new URLSearchParams();
    if (registered) params.set("registered", "1");
    if (nextPath !== "/home") params.set("next", nextPath);
    const query = params.toString();
    return query ? `/login?${query}` : "/login";
}

export function RegisterForm({ nextPath = "/home" }) {
    const router = useRouter();
    const [error, setError] = useState("");
    const [pending, setPending] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();
        setPending(true);
        setError("");

        const form = new FormData(event.currentTarget);
        const email = getFormString(form, "email").trim().toLowerCase();
        const username = getFormString(form, "username").trim().toLowerCase();
        const password = getFormString(form, "password");

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

        router.replace(buildLoginHref(nextPath, true), {
            transitionTypes: ["nav-back"],
        });
    }

    return (
        <main className="app-main auth-page">
            <div className="content-column auth-shell page-enter">
                <div className="auth-brand">
                    <Image
                        src="/assets/logo.svg"
                        alt=""
                        className="auth-logo"
                        width={56}
                        height={56}
                        unoptimized
                    />
                    <div>
                        <h1>UNI HUB</h1>
                        <p>Create your campus profile.</p>
                    </div>
                </div>

                <section className="card auth-card">
                    <div className="auth-card-header">
                        <h2>Create account</h2>
                        <p>Use email, username, and password to join.</p>
                    </div>

                    {error && (
                        <p className="auth-message auth-message-error">
                            {error}
                        </p>
                    )}
                    {pending && (
                        <p className="auth-status" aria-live="polite">
                            <span className="spinner spinner-sm" />
                            Creating your account...
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
                                disabled={pending}
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
                                disabled={pending}
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
                                disabled={pending}
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
                    <p className="auth-footer-link">
                        Already have account?{" "}
                        <Link
                            href={buildLoginHref(nextPath)}
                            transitionTypes={["nav-back"]}
                        >
                            Sign in
                        </Link>
                    </p>
                </section>
            </div>
        </main>
    );
}

RegisterForm.propTypes = {
    nextPath: PropTypes.string,
};
