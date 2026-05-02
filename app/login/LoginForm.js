"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState } from "react";
import PropTypes from "@/lib/prop-types";

function getFormString(form, key) {
    const value = form.get(key);
    return typeof value === "string" ? value : "";
}

function buildRegisterHref(nextPath) {
    return nextPath === "/home"
        ? "/register"
        : `/register?next=${encodeURIComponent(nextPath)}`;
}

export function LoginForm({ didRegister = false, nextPath = "/home" }) {
    const router = useRouter();
    const [error, setError] = useState("");
    const [pending, setPending] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();
        setPending(true);
        setError("");

        const form = new FormData(event.currentTarget);
        const email = getFormString(form, "email").trim().toLowerCase();
        const password = getFormString(form, "password");

        const result = await signIn("credentials", {
            email,
            password,
            redirect: false,
        });

        if (result?.error) {
            setPending(false);
            setError("Invalid email or password.");
            return;
        }

        router.replace(nextPath, {
            transitionTypes: ["nav-forward"],
        });
        router.refresh();
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
                        <p>Welcome back to your campus feed.</p>
                    </div>
                </div>

                <section className="card auth-card">
                    <div className="auth-card-header">
                        <h2>Sign in</h2>
                        <p>Continue with your email and password.</p>
                    </div>

                    {didRegister && (
                        <p className="auth-message auth-message-success">
                            Account created. Sign in now.
                        </p>
                    )}
                    {error && (
                        <p className="auth-message auth-message-error">
                            {error}
                        </p>
                    )}
                    {pending && (
                        <p className="auth-status" aria-live="polite">
                            <span className="spinner spinner-sm" />
                            Taking you there...
                        </p>
                    )}

                    <form
                        onSubmit={handleSubmit}
                        className="flex flex-col gap-3"
                    >
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
                                autoComplete="current-password"
                                disabled={pending}
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="btn btn-primary btn-block btn-lg"
                            disabled={pending}
                        >
                            {pending ? "Signing in..." : "Sign in"}
                        </button>
                    </form>
                    <p className="auth-footer-link">
                        New here?{" "}
                        <Link
                            href={buildRegisterHref(nextPath)}
                            transitionTypes={["nav-forward"]}
                        >
                            Create account
                        </Link>
                    </p>
                </section>
            </div>
        </main>
    );
}

LoginForm.propTypes = {
    didRegister: PropTypes.bool,
    nextPath: PropTypes.string,
};
