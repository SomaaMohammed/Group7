import bcrypt from "bcryptjs";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";

function credentialString(value) {
    return typeof value === "string" ? value : "";
}

export const { handlers, auth, signIn, signOut } = NextAuth({
    session: { strategy: "jwt" },
    providers: [
        Credentials({
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                const email = credentialString(credentials?.email)
                    .trim()
                    .toLowerCase();
                const password = credentialString(credentials?.password);
                if (!email || !password) return null;

                const user = await prisma.user.findUnique({
                    where: { email },
                    select: {
                        id: true,
                        email: true,
                        username: true,
                        passwordHash: true,
                    },
                });
                if (!user?.passwordHash) return null;

                const ok = await bcrypt.compare(password, user.passwordHash);
                if (!ok) return null;

                return {
                    id: user.id,
                    email: user.email,
                    username: user.username,
                };
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.sub = user.id;
                token.email = user.email;
                token.username = user.username;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user && token.sub) {
                session.user.id = token.sub;
                session.user.email = token.email;
                session.user.username = token.username;
            }
            return session;
        },
    },
});
