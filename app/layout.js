import Script from "next/script";
import { Shell } from "@/components/Shell";
import { ToastProvider } from "@/components/Toast";
import { getSession } from "@/lib/auth";
import { THEME_INIT_SCRIPT } from "@/lib/theme-init";
import "./globals.css";

export const metadata = {
    title: "UNI HUB",
    description: "Group 7 — CMPS 350 Phase 2",
};

export default async function RootLayout({ children }) {
    const user = await getSession().catch(() => null);

    return (
        <html lang="en" suppressHydrationWarning>
            <body className="app-shell">
                <Script
                    id="theme-init"
                    strategy="beforeInteractive"
                    dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }}
                />
                <ToastProvider>
                    <Shell user={user} />
                    {children}
                </ToastProvider>
            </body>
        </html>
    );
}
