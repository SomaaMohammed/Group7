"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useEffect, useState } from "react";

function getFormString(form, key) {
    const value = form.get(key);
    return typeof value === "string" ? value : "";
}

export default function LoginPage() {
    const router = useRouter();
    const [error, setError] = useState("");
    const [pending, setPending] = useState(false);
    const [didRegister, setDidRegister] = useState(false);

    useEffect(() => {
        const params = new URLSearchParams(globalThis.location.search);
        setDidRegister(params.get("registered") === "1");
    }, []);

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
        router.replace("/home");
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
                        Sign in
                    </h2>
                    <p className="text-secondary" style={{ marginBottom: 20 }}>
                        Continue with your email and password.
                    </p>
                    {didRegister && (
                        <p
                            className="input-hint success"
                            style={{ marginBottom: 12 }}
                        >
                            Account created. Sign in now.
                        </p>
                    )}
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
                                autoComplete="current-password"
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
                    <p className="auth-footer-link" style={{ marginTop: 16 }}>
                        New here? <Link href="/register">Create account</Link>
                    </p>
                </section>
            </div>
        </main>
    );
}
