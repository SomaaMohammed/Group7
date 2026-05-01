import { signUp } from "@/lib/auth";

function normalize(payload) {
    return {
        email: String(payload?.email ?? "")
            .trim()
            .toLowerCase(),
        username: String(payload?.username ?? "")
            .trim()
            .toLowerCase(),
        password: String(payload?.password ?? ""),
    };
}

export async function POST(request) {
    const body = await request.json().catch(() => null);
    const { email, username, password } = normalize(body);

    if (!email || !username || !password) {
        return Response.json(
            { error: "email, username, and password are required." },
            { status: 400 },
        );
    }

    if (password.length < 8) {
        return Response.json(
            { error: "Password must be at least 8 characters." },
            { status: 400 },
        );
    }

    try {
        const user = await signUp({ email, username, password });
        return Response.json({ user }, { status: 201 });
    } catch (error) {
        if (error?.code === "P2002") {
            return Response.json(
                { error: "Email or username already exists." },
                { status: 409 },
            );
        }
        return Response.json(
            { error: "Failed to create account." },
            { status: 500 },
        );
    }
}
