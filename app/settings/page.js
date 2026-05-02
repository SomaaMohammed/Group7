import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { SettingsForm } from "./SettingsForm";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
    const session = await getSession();
    if (!session) redirect("/login");

    return (
        <main className="app-main">
            <div className="content-column page-enter">
                <SettingsForm />
            </div>
        </main>
    );
}
