import bcrypt from "bcryptjs";
import {
    auth,
    signIn as nextAuthSignIn,
    signOut as nextAuthSignOut,
} from "@/auth";
import { prisma } from "@/lib/prisma";

function normalize(user) {
    if (!user) return null;
    return { id: user.id, username: user.username, email: user.email };
}

export async function getSession() {
    const session = await auth();
    if (!session?.user?.id) return null;
    return normalize({
        id: session.user.id,
        username: session.user.username,
        email: session.user.email,
    });
}

export async function requireUser() {
    const user = await getSession();
    if (!user) throw new Response("Unauthorized", { status: 401 });
    return user;
}

export async function signUp({ email, username, password }) {
    const normalizedEmail = String(email ?? "")
        .trim()
        .toLowerCase();
    const normalizedUsername = String(username ?? "")
        .trim()
        .toLowerCase();
    const hash = await bcrypt.hash(String(password ?? ""), 12);

    const profile = await prisma.user.create({
        data: {
            email: normalizedEmail,
            username: normalizedUsername,
            passwordHash: hash,
        },
        select: { id: true, username: true, email: true },
    });
    return normalize(profile);
}

export async function signIn({ email, password }) {
    const res = await nextAuthSignIn("credentials", {
        email: String(email ?? "")
            .trim()
            .toLowerCase(),
        password: String(password ?? ""),
        redirect: false,
    });
    if (res?.error) throw new Error(res.error);
    return getSession();
}

export async function signOut() {
    await nextAuthSignOut({ redirect: false });
}
