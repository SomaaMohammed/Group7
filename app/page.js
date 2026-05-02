import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function RootPage() {
    const session = await getSession();
    if (session?.id) {
        redirect("/home");
    } else {
        redirect("/login");
    }
}
