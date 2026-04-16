import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";

const adapter = new PrismaPg({
    connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } },
);

// Tunables — raise for denser stats signal.
const USER_COUNT = 32;
const POST_COUNT = 420;
const COMMENT_COUNT = 1800;
const LIKE_COUNT = 3500;
const HUB_USERS = 4;
const DAYS_BACK = 180;
const DEFAULT_PASSWORD = "password123";

const USERNAMES = [
    "alex", "jordan", "riley", "sam", "taylor", "casey", "morgan", "avery",
    "blake", "dana", "ellis", "finn", "gray", "harper", "indigo", "jules",
    "kai", "lane", "mason", "nico", "parker", "quinn", "rowan", "skye",
    "toby", "uma", "val", "wren", "yuri", "zion", "arden", "briar",
];

const BIO_FRAGMENTS = [
    "coffee addict", "night owl", "student", "builder", "reader", "runner",
    "dog person", "cat person", "traveller", "gamer", "amateur photographer",
    "wannabe chef", "design nerd", "frontend curious", "backend curious",
    "math enjoyer", "music lover", "writer", "poet", "perpetually tired",
];

const WORD_POOL = [
    "social", "media", "coffee", "morning", "night", "project", "deadline",
    "debug", "feature", "team", "design", "review", "ship", "coding", "weekend",
    "holiday", "game", "movie", "book", "music", "travel", "food", "recipe",
    "running", "gym", "fitness", "study", "exam", "class", "assignment",
    "grade", "friend", "family", "birthday", "sunset", "sunrise", "art",
    "writing", "reading", "poetry", "startup", "tech", "prompt", "build",
    "learn", "teach", "share", "quiet", "loud", "happy", "tired", "focused",
    "procrastinating", "finally", "today", "tomorrow", "yesterday", "always",
];

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const pickN = (arr, n) => {
    const copy = [...arr];
    const out = [];
    for (let i = 0; i < n && copy.length; i++) {
        out.push(copy.splice(Math.floor(Math.random() * copy.length), 1)[0]);
    }
    return out;
};
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Bias timestamps toward recency: sqrt skew. Newer half of seed window gets ~70% of rows.
function biasedPastDate() {
    const skew = Math.random() ** 2;
    const daysAgo = skew * DAYS_BACK;
    const ms = Date.now() - daysAgo * 24 * 60 * 60 * 1000;
    return new Date(ms);
}

function makePostContent() {
    const words = pickN(WORD_POOL, rand(6, 18));
    const sentence = words.join(" ");
    return sentence.charAt(0).toUpperCase() + sentence.slice(1);
}

function makeBio() {
    return pickN(BIO_FRAGMENTS, rand(1, 3)).join(", ");
}

function makeAvatarUrl(username) {
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`;
}

function makePostMedia() {
    const count = rand(1, 3);
    return Array.from({ length: count }, () => {
        const seed = Math.random().toString(36).slice(2, 10);
        return `https://picsum.photos/seed/${seed}/600/400`;
    });
}

async function clearDatabase() {
    console.log("  wipe existing rows...");
    await prisma.follow.deleteMany();
    await prisma.like.deleteMany();
    await prisma.comment.deleteMany();
    await prisma.post.deleteMany();
    await prisma.user.deleteMany();

    // Clear Supabase Auth users (listUsers paginated, 1000 per page default).
    let page = 1;
    while (true) {
        const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 100 });
        if (error) throw error;
        if (!data.users.length) break;
        for (const u of data.users) {
            await supabaseAdmin.auth.admin.deleteUser(u.id);
        }
        if (data.users.length < 100) break;
        page++;
    }
}

async function seedUser(username) {
    const email = `${username}@demo.test`;
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email,
        password: DEFAULT_PASSWORD,
        email_confirm: true,
    });
    if (error) throw new Error(`auth create ${email}: ${error.message}`);
    const authId = data.user.id;

    return prisma.user.create({
        data: {
            id: authId,
            username,
            email,
            bio: makeBio(),
            profilePicture: Math.random() < 0.5 ? makeAvatarUrl(username) : null,
            createdAt: biasedPastDate(),
        },
        select: { id: true, username: true },
    });
}

async function seedUsers() {
    console.log(`  users x${USER_COUNT}...`);
    const names = USERNAMES.slice(0, USER_COUNT);
    const users = [];
    for (const name of names) {
        users.push(await seedUser(name));
    }
    return users;
}

async function seedPosts(users) {
    console.log(`  posts x${POST_COUNT}...`);

    // Weighted authorship: first HUB_USERS get 3x weight so "most active" has signal.
    const weights = users.map((_, i) => (i < HUB_USERS ? 3 : 1));
    const cumulative = [];
    let sum = 0;
    for (const w of weights) {
        sum += w;
        cumulative.push(sum);
    }
    const pickAuthor = () => {
        const r = Math.random() * sum;
        const idx = cumulative.findIndex((c) => c >= r);
        return users[idx];
    };

    const data = Array.from({ length: POST_COUNT }, () => ({
        authorId: pickAuthor().id,
        content: makePostContent(),
        media: Math.random() < 0.15 ? makePostMedia() : [],
        createdAt: biasedPastDate(),
    }));

    // createMany is one round-trip; no returned rows. Follow with findMany for ids.
    await prisma.post.createMany({ data });
    return prisma.post.findMany({ select: { id: true, authorId: true, createdAt: true } });
}

async function seedComments(users, posts) {
    console.log(`  comments x${COMMENT_COUNT}...`);
    // Weight comments toward newer posts (last third gets ~60% of comments).
    const sortedPosts = [...posts].sort((a, b) => b.createdAt - a.createdAt);
    const data = Array.from({ length: COMMENT_COUNT }, () => {
        const bucket = Math.random() < 0.6
            ? sortedPosts.slice(0, Math.ceil(posts.length / 3))
            : sortedPosts;
        const post = pick(bucket);
        return {
            postId: post.id,
            authorId: pick(users).id,
            content: makePostContent(),
            createdAt: new Date(
                post.createdAt.getTime() + rand(60_000, 14 * 24 * 60 * 60 * 1000),
            ),
        };
    });
    await prisma.comment.createMany({ data });
}

async function seedLikes(users, posts) {
    console.log(`  likes x${LIKE_COUNT}...`);
    const sortedPosts = [...posts].sort((a, b) => b.createdAt - a.createdAt);
    const data = Array.from({ length: LIKE_COUNT }, () => {
        const bucket = Math.random() < 0.7
            ? sortedPosts.slice(0, Math.ceil(posts.length / 2))
            : sortedPosts;
        const post = pick(bucket);
        return {
            postId: post.id,
            userId: pick(users).id,
            createdAt: new Date(
                post.createdAt.getTime() + rand(60_000, 7 * 24 * 60 * 60 * 1000),
            ),
        };
    });
    // Composite PK (postId,userId) — skipDuplicates silently drops retries.
    await prisma.like.createMany({ data, skipDuplicates: true });
}

async function seedFollows(users) {
    console.log("  follows (hubs + tail)...");
    const hubs = users.slice(0, HUB_USERS);
    const data = [];

    // Every non-hub follows most hubs.
    for (const follower of users) {
        for (const hub of hubs) {
            if (follower.id === hub.id) continue;
            if (Math.random() < 0.8) {
                data.push({
                    followerId: follower.id,
                    followingId: hub.id,
                    createdAt: biasedPastDate(),
                });
            }
        }
    }

    // Long tail: each user follows ~3-8 random others.
    for (const follower of users) {
        const targets = pickN(
            users.filter((u) => u.id !== follower.id),
            rand(3, 8),
        );
        for (const t of targets) {
            data.push({
                followerId: follower.id,
                followingId: t.id,
                createdAt: biasedPastDate(),
            });
        }
    }

    await prisma.follow.createMany({ data, skipDuplicates: true });
}

async function main() {
    console.log("seed start");
    await clearDatabase();
    const users = await seedUsers();
    const posts = await seedPosts(users);
    await seedComments(users, posts);
    await seedLikes(users, posts);
    await seedFollows(users);

    const [u, p, c, l, f] = await Promise.all([
        prisma.user.count(),
        prisma.post.count(),
        prisma.comment.count(),
        prisma.like.count(),
        prisma.follow.count(),
    ]);
    console.log(`done: users=${u} posts=${p} comments=${c} likes=${l} follows=${f}`);
    console.log(`login: <username>@demo.test / ${DEFAULT_PASSWORD}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exitCode = 1;
    })
    .finally(() => prisma.$disconnect());
