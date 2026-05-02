import Script from "next/script";
import { Shell } from "@/components/Shell";
import { ToastProvider } from "@/components/Toast";
import { getSession } from "@/lib/auth";
import PropTypes from "@/lib/prop-types";
import { usersRepo } from "@/lib/repo/users";
import { THEME_INIT_SCRIPT } from "@/lib/theme-init";
import "./globals.css";

export const dynamic = "force-dynamic";

export const metadata = {
    title: "UNI HUB",
    description: "Group 7 — CMPS 350 Phase 2",
};

export default async function RootLayout({ children }) {
    const session = await getSession().catch(() => null);
    const user = session
        ? await usersRepo.findById(session.id).catch(() => null)
        : null;

    return (
        <html lang="en" suppressHydrationWarning>
            <body className="app-shell">
                <Script id="theme-init" strategy="beforeInteractive">
                    {THEME_INIT_SCRIPT}
                </Script>
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
