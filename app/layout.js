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
            <head>
                <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
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
