"use client";

import { usePathname } from "next/navigation";
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
    const isActive = (href) => pathname === href || pathname.startsWith(`${href}/`);
    const profileHref = user ? `/user/${user.username}` : "/login";

    return (
        <>
            <header className="app-header">
                <div className="app-header-identity">
                    <a className="app-header-brand" href="/home" aria-label="UNI HUB home">
                        <img src="/assets/logo.svg" alt="UNI HUB logo" />
                        <span>UNI HUB</span>
                    </a>
                </div>
                <div className="app-header-actions">
                    <ThemeToggle />
                    {user && (
                        <a
                            className="icon-btn app-header-settings"
                            href="/settings"
                            aria-label="Settings"
                        >
                            <span className="icon icon-settings" aria-hidden="true" />
                        </a>
                    )}
                </div>
            </header>

            <aside className="app-sidebar">
                <div className="sidebar-brand-row">
                    <a className="sidebar-brand-link" href="/home" aria-label="UNI HUB home">
                        <img src="/assets/logo.svg" alt="UNI HUB logo" />
                        <div className="sidebar-brand">
                            <p>UNI HUB</p>
                        </div>
                    </a>
                    <ThemeToggle />
                </div>

                <nav className="sidebar-nav">
                    {NAV.map(({ href, label, icon }) => (
                        <a
                            key={href}
                            className={`sidebar-nav-item${isActive(href) ? " active" : ""}`}
                            href={href}
                        >
                            <span className={`icon ${icon}`} aria-hidden="true" />
                            <span>{label}</span>
                        </a>
                    ))}
                    {user && (
                        <>
                            <a
                                className={`sidebar-nav-item${isActive(profileHref) ? " active" : ""}`}
                                href={profileHref}
                            >
                                <span className="icon icon-person" aria-hidden="true" />
                                <span>Profile</span>
                            </a>
                            <a
                                className={`sidebar-nav-item${isActive("/settings") ? " active" : ""}`}
                                href="/settings"
                            >
                                <span className="icon icon-settings" aria-hidden="true" />
                                <span>Settings</span>
                            </a>
                        </>
                    )}
                </nav>

                {user && (
                    <>
                        <div className="sidebar-new-post">
                            <a className="btn btn-primary" href="/home?compose=1">New Post</a>
                        </div>
                        <a className="sidebar-user" href={profileHref}>
                            <Avatar user={user} size="sm" alt={`${user.username}'s avatar`} />
                            <div className="sidebar-user-info">
                                <span className="sidebar-user-name">{user.username}</span>
                                <span className="sidebar-user-handle">@{user.username}</span>
                            </div>
                        </a>
                    </>
                )}
                {!user && (
                    <div className="sidebar-new-post">
                        <a className="btn btn-primary" href="/login">Sign in</a>
                    </div>
                )}
            </aside>

            <nav className="bottom-nav">
                {NAV.map(({ href, label, icon }) => (
                    <a
                        key={href}
                        className={`bottom-nav-item${isActive(href) ? " active" : ""}`}
                        href={href}
                        aria-label={label}
                    >
                        <span className={`icon ${icon}`} aria-hidden="true" />
                    </a>
                ))}
                {user && (
                    <>
                        <a
                            className="bottom-nav-fab"
                            href="/home?compose=1"
                            aria-label="New post"
                        >
                            <span className="icon icon-plus" aria-hidden="true" />
                        </a>
                        <a
                            className={`bottom-nav-item${isActive(profileHref) ? " active" : ""}`}
                            href={profileHref}
                            aria-label="Profile"
                        >
                            <span className="icon icon-person" aria-hidden="true" />
                        </a>
                    </>
                )}
            </nav>
        </>
    );
}
