import { prisma } from "@/lib/prisma";

// Part B: ≥6 stats, each a single Prisma query or $queryRaw. No JS-side aggregation.
// Every function copy verbatim into final report with one-line explanation.

export const statsRepo = {
    /**
     * Total counts across entities. Single Promise.all of count queries.
     * @returns {Promise<{ users: number, posts: number, comments: number, likes: number, follows: number }>}
     */
    async totals() {
        /* TODO (track A) — Promise.all([prisma.user.count(), ...]) */
    },

    /**
     * Average followers per user. `prisma.user.aggregate` with `_count` doesn't average across users —
     * use `$queryRaw` for `AVG(follower_count)` over a subquery, or `groupBy` + JS avg IF the count
     * is small. Prefer $queryRaw to keep aggregation DB-side per rubric.
     */
    async avgFollowersPerUser() {
        /* TODO (track A) */
    },

    /** Average posts per user. Same pattern as avgFollowersPerUser. */
    async avgPostsPerUser() {
        /* TODO (track A) */
    },

    /**
     * Most active user in last 3 months (by post count). `groupBy` on Post filtered by createdAt,
     * order by _count desc, take 1 (or top N).
     * @param {{ limit?: number }} args
     */
    async mostActiveUsersLast3Months({ limit: _limit = 5 } = {}) {
        /* TODO (track A) */
    },

    /**
     * Top posts by likes. `prisma.post.findMany` with `orderBy: { likes: { _count: "desc" } }`.
     * @param {{ limit?: number }} args
     */
    async topPostsByLikes({ limit: _limit = 10 } = {}) {
        /* TODO (track A) */
    },

    /**
     * Most frequently used words in post content. Requires $queryRaw:
     *   SELECT word, COUNT(*) AS n
     *   FROM (SELECT lower(regexp_split_to_table(content, '\\s+')) AS word FROM "Post") w
     *   WHERE length(word) > 3
     *   GROUP BY word ORDER BY n DESC LIMIT $1;
     * @param {{ limit?: number }} args
     */
    async topWords({ limit: _limit = 20 } = {}) {
        /* TODO (track A) */
    },

    /**
     * Post volume per day for the last N days. `groupBy` on date_trunc('day', createdAt) via $queryRaw,
     * since Prisma groupBy doesn't expose date truncation.
     * @param {{ days?: number }} args
     */
    async postsPerDay({ days: _days = 30 } = {}) {
        /* TODO (track A) */
    },

    /**
     * Users with most followers. `prisma.user.findMany` with `orderBy: { followers: { _count: "desc" } }`.
     * @param {{ limit?: number }} args
     */
    async topUsersByFollowers({ limit: _limit = 10 } = {}) {
        /* TODO (track A) */
    },
};
