import "./globals.css";

export const metadata = {
    title: "UNI HUB",
    description: "Group 7 — CMPS 350 Phase 2",
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body className="app-shell">{children}</body>
        </html>
    );
}
