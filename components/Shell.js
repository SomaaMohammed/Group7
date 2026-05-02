"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import PropTypes from "@/lib/prop-types";
import { Avatar } from "./Avatar";
import { NotificationBell } from "./NotificationBell";
import { ThemeToggle } from "./ThemeToggle";

const NAV = [
    { href: "/global", label: "Global Feed", icon: "icon-world" },
    { href: "/home", label: "Your Feed", icon: "icon-home" },
    { href: "/search", label: "Search", icon: "icon-search" },
    { href: "/stats", label: "Statistics", icon: "icon-eye" },
];

// When user is present: inject profile + settings nav. Otherwise render anon-safe shell.
export function Shell({ user: initialUser }) {
    const pathname = usePathname() ?? "";
    const router = useRouter();
    const [user, setUser] = useState(initialUser);
    const isAuthPage = pathname === "/login" || pathname === "/register";

    useEffect(() => {
        setUser(initialUser);
    }, [initialUser]);

    useEffect(() => {
        if (isAuthPage || !initialUser) return;

        let cancelled = false;

        async function refreshShellUser() {
            try {
                const response = await fetch("/api/users/me", {
                    cache: "no-store",
                });

                if (cancelled) return;

                if (!response.ok) {
                    setUser(null);
                    return;
                }

                const data = await response.json();
                setUser(data?.user ?? null);
            } catch {
                if (!cancelled) setUser(initialUser ?? null);
            }
        }

        refreshShellUser();

        return () => {
            cancelled = true;
        };
    }, [initialUser, isAuthPage]);

    async function handleSignOut() {
        await fetch("/api/auth/signout", { method: "POST" });
        router.replace("/login", { transitionTypes: ["nav-back"] });
        router.refresh();
    }

    if (isAuthPage) return null;

    const isActive = (href) =>
        pathname === href || pathname.startsWith(`${href}/`);
    const profileHref = user ? `/user/${user.username}` : "/login";

    return (
        <>
            <header className="app-header">
                <div className="app-header-identity">
                    <Link
                        className="app-header-brand"
                        href="/home"
                        aria-label="UNI HUB home"
                        transitionTypes={["nav-back"]}
                    >
                        <Image
                            src="/assets/logo.svg"
                            alt="UNI HUB logo"
                            width={48}
                            height={48}
                            unoptimized
                        />
                        <span>UNI HUB</span>
                    </Link>
                </div>
                <div className="app-header-actions">
                    <ThemeToggle />
                    <Link
                        className={`icon-btn${isActive("/stats") ? " active" : ""}`}
                        href="/stats"
                        aria-label="Statistics"
                        transitionTypes={["nav-forward"]}
                    >
                        <span className="icon icon-eye" aria-hidden="true" />
                        <span className="sr-only">Statistics</span>
                    </Link>
                    {user && <NotificationBell />}
                    {user && (
                        <Link
                            className="icon-btn app-header-settings"
                            href="/settings"
                            aria-label="Settings"
                            transitionTypes={["nav-forward"]}
                        >
                            <span
                                className="icon icon-settings"
                                aria-hidden="true"
                            />
                            <span className="sr-only">Settings</span>
                        </Link>
                    )}
                </div>
            </header>

            <aside className="app-sidebar">
                <div className="sidebar-brand-row">
                    <Link
                        className="sidebar-brand-link"
                        href="/home"
                        aria-label="UNI HUB home"
                        transitionTypes={["nav-back"]}
                    >
                        <Image
                            src="/assets/logo.svg"
                            alt="UNI HUB logo"
                            width={48}
                            height={48}
                            unoptimized
                        />
                        <div className="sidebar-brand">
                            <p>UNI HUB</p>
                        </div>
                    </Link>
                    <ThemeToggle />
                </div>

                <nav className="sidebar-nav">
                    {NAV.map(({ href, label, icon }) => (
                        <Link
                            key={href}
                            className={`sidebar-nav-item${isActive(href) ? " active" : ""}`}
                            href={href}
                            transitionTypes={["nav-forward"]}
                        >
                            <span
                                className={`icon ${icon}`}
                                aria-hidden="true"
                            />
                            <span>{label}</span>
                        </Link>
                    ))}
                    {user && (
                        <>
                            <NotificationBell
                                variant="sidebar"
                                isActive={isActive("/notifications")}
                            />
                            <Link
                                className={`sidebar-nav-item${isActive(profileHref) ? " active" : ""}`}
                                href={profileHref}
                                transitionTypes={["nav-forward"]}
                            >
                                <span
                                    className="icon icon-person"
                                    aria-hidden="true"
                                />
                                <span>Profile</span>
                            </Link>
                            <Link
                                className={`sidebar-nav-item${isActive("/settings") ? " active" : ""}`}
                                href="/settings"
                                transitionTypes={["nav-forward"]}
                            >
                                <span
                                    className="icon icon-settings"
                                    aria-hidden="true"
                                />
                                <span>Settings</span>
                            </Link>
                        </>
                    )}
                </nav>

                {user && (
                    <>
                        <div className="sidebar-new-post">
                            <Link
                                className="btn btn-primary"
                                href="/home?compose=1"
                                transitionTypes={["nav-forward"]}
                            >
                                New Post
                            </Link>
                        </div>
                        <div className="sidebar-user-row">
                            <Link
                                className="sidebar-user"
                                href={profileHref}
                                transitionTypes={["nav-forward"]}
                            >
                                <Avatar
                                    user={user}
                                    size="sm"
                                    alt={`${user.username}'s avatar`}
                                />
                                <div className="sidebar-user-info">
                                    <span className="sidebar-user-name">
                                        {user.username}
                                    </span>
                                    <span className="sidebar-user-handle">
                                        @{user.username}
                                    </span>
                                </div>
                            </Link>
                            <button
                                type="button"
                                className="btn btn-ghost btn-sm mr-7"
                                onClick={handleSignOut}
                                aria-label="Sign out"
                                title="Sign out"
                            >
                                Sign out
                            </button>
                        </div>
                    </>
                )}
                {!user && (
                    <div className="sidebar-new-post">
                        <Link
                            className="btn btn-primary"
                            href="/login"
                            transitionTypes={["nav-forward"]}
                        >
                            Sign in
                        </Link>
                    </div>
                )}
            </aside>

            <nav className="bottom-nav">
                <Link
                    className={`bottom-nav-item${isActive("/home") ? " active" : ""}`}
                    href="/home"
                    aria-label="Your Feed"
                    transitionTypes={["nav-back"]}
                >
                    <span className="icon icon-home" aria-hidden="true" />
                    <span className="sr-only">Your Feed</span>
                </Link>
                <Link
                    className={`bottom-nav-item${isActive("/global") ? " active" : ""}`}
                    href="/global"
                    aria-label="Global Feed"
                    transitionTypes={["nav-forward"]}
                >
                    <span className="icon icon-world" aria-hidden="true" />
                    <span className="sr-only">Global Feed</span>
                </Link>
                {user && (
                    <Link
                        className="bottom-nav-fab"
                        href="/home?compose=1"
                        aria-label="New post"
                        transitionTypes={["nav-forward"]}
                    >
                        <span className="icon icon-plus" aria-hidden="true" />
                        <span className="sr-only">New post</span>
                    </Link>
                )}
                <Link
                    className={`bottom-nav-item${isActive("/search") ? " active" : ""}`}
                    href="/search"
                    aria-label="Search"
                    transitionTypes={["nav-forward"]}
                >
                    <span className="icon icon-search" aria-hidden="true" />
                    <span className="sr-only">Search</span>
                </Link>
                {user && (
                    <Link
                        className={`bottom-nav-item${isActive(profileHref) ? " active" : ""}`}
                        href={profileHref}
                        aria-label="Profile"
                        transitionTypes={["nav-forward"]}
                    >
                        <span className="icon icon-person" aria-hidden="true" />
                        <span className="sr-only">Profile</span>
                    </Link>
                )}
            </nav>
        </>
    );
}

Shell.propTypes = {
    user: PropTypes.shape({
        username: PropTypes.string.isRequired,
        profilePicture: PropTypes.string,
    }),
};
