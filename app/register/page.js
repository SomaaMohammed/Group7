import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { firstParam, getSafeRedirectPath } from "@/lib/navigation";
import { RegisterForm } from "./RegisterForm";

export const dynamic = "force-dynamic";

export default async function RegisterPage({ searchParams }) {
    const query = await searchParams;
    const nextPath = getSafeRedirectPath(firstParam(query?.next), "/home");
    const session = await getSession();

    if (session) {
        redirect(nextPath);
    }

    return <RegisterForm nextPath={nextPath} />;
}
