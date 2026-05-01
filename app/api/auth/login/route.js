import { signIn } from "@/lib/auth";

export async function POST(request) {
    const body = await request.json().catch(() => null);
    const email = String(body?.email ?? "")
        .trim()
        .toLowerCase();
    const password = String(body?.password ?? "");

    if (!email || !password) {
        return Response.json(
            { error: "email and password are required." },
            { status: 400 },
        );
    }

    try {
        const user = await signIn({ email, password });
        if (!user) {
            return Response.json(
                { error: "Invalid email or password." },
                { status: 401 },
            );
        }
        return Response.json({ user });
    } catch {
        return Response.json(
            { error: "Invalid email or password." },
            { status: 401 },
        );
    }
}
