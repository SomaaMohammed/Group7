import { prisma } from "@/lib/prisma";

const USER_SUMMARY_SELECT = {
    id: true,
    username: true,
    profilePicture: true,
};

const POST_STATS_SELECT = {
    id: true,
    content: true,
    media: true,
    createdAt: true,
    author: { select: USER_SUMMARY_SELECT },
    _count: { select: { comments: true, likes: true } },
};

function clampPositiveInteger(value, fallback, max = 100) {
    const parsed = Number.parseInt(String(value ?? fallback), 10);
    if (!Number.isFinite(parsed) || parsed < 1) return fallback;
    return Math.min(parsed, max);
}

function numberFromRow(row, key) {
    return Number(row?.[key] ?? 0);
}

export const statsRepo = {
    async totals() {
        const [users, posts, comments, likes, follows] = await Promise.all([
            prisma.user.count(),
            prisma.post.count(),
            prisma.comment.count(),
            prisma.like.count(),
            prisma.follow.count(),
        ]);

        return { users, posts, comments, likes, follows };
    },

    async avgFollowersPerUser() {
        const [row] = await prisma.$queryRaw`
            SELECT COALESCE(AVG(follower_count), 0)::float AS average
            FROM (
                SELECT COUNT(f."followerId") AS follower_count
                FROM "User" u
                LEFT JOIN "Follow" f ON f."followingId" = u.id
                GROUP BY u.id
            ) counts
        `;

        return numberFromRow(row, "average");
    },

    async avgPostsPerUser() {
        const [row] = await prisma.$queryRaw`
            SELECT COALESCE(AVG(post_count), 0)::float AS average
            FROM (
                SELECT COUNT(p.id) AS post_count
                FROM "User" u
                LEFT JOIN "Post" p ON p."authorId" = u.id
                GROUP BY u.id
            ) counts
        `;

        return numberFromRow(row, "average");
    },

    async mostActiveUsersLast3Months({ limit = 5 } = {}) {
        const take = clampPositiveInteger(limit, 5);
        const since = new Date();
        since.setMonth(since.getMonth() - 3);

        return prisma.$queryRaw`
            SELECT
                u.id,
                u.username,
                u."profilePicture",
                COUNT(p.id)::int AS "postCount"
            FROM "User" u
            JOIN "Post" p ON p."authorId" = u.id
            WHERE p."createdAt" >= ${since}
            GROUP BY u.id
            ORDER BY "postCount" DESC, u.username ASC
            LIMIT ${take}
        `;
    },

    async topPostsByLikes({ limit = 10 } = {}) {
        return prisma.post.findMany({
            take: clampPositiveInteger(limit, 10),
            orderBy: { likes: { _count: "desc" } },
            select: POST_STATS_SELECT,
        });
    },

    async topWords({ limit = 20 } = {}) {
        const take = clampPositiveInteger(limit, 20);

        return prisma.$queryRaw`
            SELECT word, COUNT(*)::int AS count
            FROM (
                SELECT lower(regexp_replace(token, '[^[:alnum:]]', '', 'g')) AS word
                FROM "Post", regexp_split_to_table(content, '\\s+') AS token
            ) words
            WHERE length(word) > 3
            GROUP BY word
            ORDER BY count DESC, word ASC
            LIMIT ${take}
        `;
    },

    async postsPerDay({ days = 30 } = {}) {
        const span = clampPositiveInteger(days, 30, 365);
        const since = new Date(Date.now() - span * 24 * 60 * 60 * 1000);

        return prisma.$queryRaw`
            SELECT date_trunc('day', "createdAt")::date AS day, COUNT(*)::int AS count
            FROM "Post"
            WHERE "createdAt" >= ${since}
            GROUP BY day
            ORDER BY day ASC
        `;
    },

    async topUsersByFollowers({ limit = 10 } = {}) {
        return prisma.user.findMany({
            take: clampPositiveInteger(limit, 10),
            orderBy: { followers: { _count: "desc" } },
            select: {
                ...USER_SUMMARY_SELECT,
                _count: { select: { followers: true, following: true } },
            },
        });
    },
};
