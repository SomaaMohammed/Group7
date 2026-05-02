import { signOut } from "@/lib/auth";

export async function POST() {
    await signOut();
    const response = Response.json({ ok: true });
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
    return response;
}
