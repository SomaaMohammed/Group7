import { getSession } from "@/lib/auth";
import { usersRepo } from "@/lib/repo/users";
import { redirect } from "next/navigation";
import { SettingsForm } from "./SettingsForm";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
    const session = await getSession();
    if (!session) redirect("/login");

    const user = await usersRepo.findById(session.id);
    if (!user) redirect("/login");

    return (
        <main className="app-main">
            <div className="content-column page-enter">
                <SettingsForm user={user} />
            </div>
        </main>
    );
}
