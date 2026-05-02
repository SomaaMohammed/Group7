import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { firstParam, getSafeRedirectPath } from "@/lib/navigation";
import { LoginForm } from "./LoginForm";

export const dynamic = "force-dynamic";

export default async function LoginPage({ searchParams }) {
    const query = await searchParams;
    const nextPath = getSafeRedirectPath(firstParam(query?.next), "/home");
    const session = await getSession();

    if (session) {
        redirect(nextPath);
    }

    return (
        <LoginForm
            didRegister={firstParam(query?.registered) === "1"}
            nextPath={nextPath}
        />
    );
}
