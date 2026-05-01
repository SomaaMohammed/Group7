import { prisma } from "@/lib/prisma";

const USER_SAFE_SELECT = {
    id: true,
    username: true,
    email: true,
    bio: true,
    profilePicture: true,
    createdAt: true,
};

export const usersRepo = {
    /** @param {string} id */
    async findById(id) {
        return prisma.user.findUnique({
            where: { id },
            select: USER_SAFE_SELECT,
        });
    },

    /** @param {string} username */
    async findByUsername(username) {
        return prisma.user.findUnique({
            where: { username },
            select: USER_SAFE_SELECT,
        });
    },

    /** @param {string} email */
    async findByEmail(email) {
        return prisma.user.findUnique({
            where: { email },
            select: USER_SAFE_SELECT,
        });
    },

    /**
     * Profile view: user + follower/following counts + post count.
     * @param {string} username
     */
    async getProfile(username) {
        return prisma.user.findUnique({
            where: { username },
            select: {
                id: true,
                username: true,
                email: true,
                bio: true,
                profilePicture: true,
                createdAt: true,
                _count: {
                    select: {
                        followers: true,
                        following: true,
                        posts: true,
                    },
                },
            },
        });
    },

    /**
     * @param {{ id: string, email: string, username: string, passwordHash?: string | null }} data
     */
    async create(data) {
        return prisma.user.create({
            data,
            select: USER_SAFE_SELECT,
        });
    },

    /**
     * @param {string} id
     * @param {{ username?: string, bio?: string, profilePicture?: string }} patch
     */
    async update(id, patch) {
        const data = Object.fromEntries(
            Object.entries({
                username: patch?.username,
                bio: patch?.bio,
                profilePicture: patch?.profilePicture,
            }).filter(([, value]) => value !== undefined),
        );

        return prisma.user.update({
            where: { id },
            data,
            select: USER_SAFE_SELECT,
        });
    },

    /**
     * Username autocomplete / user search. Use `contains` with `mode: "insensitive"`.
     * @param {string} q
     * @param {{ limit?: number }} args
     */
    async search(q, { limit = 20 } = {}) {
        const needle = String(q ?? "").trim();
        if (!needle) return [];

        return prisma.user.findMany({
            where: {
                username: {
                    contains: needle,
                    mode: "insensitive",
                },
            },
            take: limit,
            orderBy: { username: "asc" },
            select: {
                id: true,
                username: true,
                profilePicture: true,
            },
        });
    },
};
