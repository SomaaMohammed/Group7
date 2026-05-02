"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import PropTypes from "@/lib/prop-types";
import { Avatar } from "./Avatar";
import { ThemeToggle } from "./ThemeToggle";

const NAV = [
    { href: "/global", label: "Global Feed", icon: "icon-world" },
    { href: "/home", label: "Your Feed", icon: "icon-home" },
    { href: "/search", label: "Search", icon: "icon-search" },
];

// When user is present: inject profile + settings nav. Otherwise render anon-safe shell.
export function Shell({ user }) {
    const pathname = usePathname() ?? "";
    const router = useRouter();
    const isAuthPage = pathname === "/login" || pathname === "/register";

    async function handleSignOut() {
        await fetch("/api/auth/signout", { method: "POST" });
        router.push("/login");
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
                    {user && (
                        <Link
                            className="icon-btn app-header-settings"
                            href="/settings"
                            aria-label="Settings"
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
                            <Link
                                className={`sidebar-nav-item${isActive(profileHref) ? " active" : ""}`}
                                href={profileHref}
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
                            >
                                New Post
                            </Link>
                        </div>
                        <div className="sidebar-user-row">
                            <Link className="sidebar-user" href={profileHref}>
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
                        <Link className="btn btn-primary" href="/login">
                            Sign in
                        </Link>
                    </div>
                )}
            </aside>

            <nav className="bottom-nav">
                {NAV.map(({ href, label, icon }) => (
                    <Link
                        key={href}
                        className={`bottom-nav-item${isActive(href) ? " active" : ""}`}
                        href={href}
                        aria-label={label}
                    >
                        <span className={`icon ${icon}`} aria-hidden="true" />
                        <span className="sr-only">{label}</span>
                    </Link>
                ))}
                {user && (
                    <>
                        <Link
                            className="bottom-nav-fab"
                            href="/home?compose=1"
                            aria-label="New post"
                        >
                            <span
                                className="icon icon-plus"
                                aria-hidden="true"
                            />
                            <span className="sr-only">New post</span>
                        </Link>
                        <Link
                            className={`bottom-nav-item${isActive(profileHref) ? " active" : ""}`}
                            href={profileHref}
                            aria-label="Profile"
                        >
                            <span
                                className="icon icon-person"
                                aria-hidden="true"
                            />
                            <span className="sr-only">Profile</span>
                        </Link>
                    </>
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
