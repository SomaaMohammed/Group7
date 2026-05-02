/* biome-ignore-all lint/security/noDangerouslySetInnerHtml: Static theme bootstrap must run before first paint. */
import { cookies } from "next/headers";
import { Shell } from "@/components/Shell";
import { ToastProvider } from "@/components/Toast";
import { getSession } from "@/lib/auth";
import PropTypes from "@/lib/prop-types";
import { THEME_INIT_SCRIPT } from "@/lib/theme-init";
import "./globals.css";

export const dynamic = "force-dynamic";

export const metadata = {
    title: "UNI HUB",
    description: "Group 7 - CMPS 350 Phase 2",
};

function normalizeTheme(value) {
    return value === "dark" || value === "light" ? value : "light";
}

export default async function RootLayout({ children }) {
    const [session, cookieStore] = await Promise.all([
        getSession().catch(() => null),
        cookies(),
    ]);
    const initialTheme = normalizeTheme(cookieStore.get("theme")?.value);
    const user = session
        ? {
              username: session.username,
              profilePicture: session.profilePicture,
          }
        : null;

    return (
        <html
            lang="en"
            data-scroll-behavior="smooth"
            data-theme={initialTheme}
            style={{ colorScheme: initialTheme }}
            suppressHydrationWarning
        >
            <head>
                <meta name="color-scheme" content="dark light" />
                <script
                    id="theme-init"
                    dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }}
                />
            </head>
            <body className="app-shell">
                <ToastProvider>
                    <Shell user={user} />
                    {children}
                </ToastProvider>
            </body>
        </html>
    );
}

RootLayout.propTypes = {
    children: PropTypes.node.isRequired,
};
