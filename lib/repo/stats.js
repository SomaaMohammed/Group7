import { prisma } from "@/lib/prisma";



export const statsRepo = {
    /**
     * Total counts across entities. Single Promise.all of count queries.
     * @returns {Promise<{ users: number, posts: number, comments: number, likes: number, follows: number }>}
     */
    async totals() {
        const [users, posts, comments, likes, follows] = await Promise.all([ prisma.user.count(), prisma.post.count(), prisma.comment.count(), prisma.like.count(),
            prisma.follow.count(),
        ]);


        return { users, posts, comments, likes, follows };
    },

    async avgFollowersPerUser() {
        const result = await prisma.$queryRaw`


            SELECT AVG(follower_count)::float AS avg
            FROM ( SELECT COUNT(*) AS follower_count FROM "Follow"
                GROUP BY "followingId"
            ) sub
        `;

        return result[0]?.avg ?? 0;
    },

   
    async avgPostsPerUser() {

        const result = await prisma.$queryRaw`

            SELECT AVG(post_count)::float AS avg
            FROM (SELECT COUNT(*) AS post_count
                
                FROM "Post"
                GROUP BY "authorId"
            
            ) sub
        `;


        return result[0]?.avg ?? 0;
    },

    /**
     * @param {{ limit?: number }} args
     */
    async mostActiveUsersLast3Months({ limit = 5 } = {}) {
        const LastThreeMonthsDate = new Date();

        MonthToSet= (LastThreeMonthsDate.getMonth() - 3);

        LastThreeMonthsDate.setMonth(MonthToSet);

 
        const GroupingPosts = await prisma.post.groupBy({ by: ["authorId"],
            where: { createdAt:
                        { 
                            gte: LastThreeMonthsDate 
                        } 
                    },

            _count: { 
                authorId: true
            },

            orderBy:
             { _count: 
                { 
                    authorId: "desc" 
                } 
            },

            take: limit,
        });
 
        const IdsOfPosts = GroupingPosts.map((EachEntry) => EachEntry.authorId);
 
        const MatchingUsers = await prisma.user.findMany({

            where: { 
                id: {
                     in: IdsOfPosts 
                    } 
                },

            select: { 
                id: true, username: true, profilePicture: true 
            },
        });
 
        const MappingOfUsers = Object.fromEntries(MatchingUsers.map((SelectedUser) => [SelectedUser.id, SelectedUser]));
 
        return GroupingPosts.map((EachEntry) => ({
            ...MappingOfUsers[EachEntry.authorId],

            postCount: EachEntry._count.authorId,

        }));
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
