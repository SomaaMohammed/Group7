// js/seed.js
// Run from browser console or import from a page to populate localStorage
// with demo data for development and testing.
//
// Usage: open the app in a browser and run in the console:
//   from seed.html (project root): import("./js/seed.js")
//   from pages/login.html: import("../js/seed.js")
//
// Or visit seed.html for a one-click option.

import db from "./global/db.js";

const DEMO_PASSWORD = "TestPass" + "123";

const USERS = [
    {
        username: "alice",
        email: "alice@example.com",
        password: DEMO_PASSWORD,
        bio: "Coffee lover and frontend developer.",
        profilePicture: "",
    },
    {
        username: "bob_dev",
        email: "bob@example.com",
        password: DEMO_PASSWORD,
        bio: "Full-stack engineer. Open-source contributor.",
        profilePicture: "",
    },
    {
        username: "charlie",
        email: "charlie@example.com",
        password: DEMO_PASSWORD,
        bio: "Design enthusiast. Pixel perfectionist.",
        profilePicture: "",
    },
    {
        username: "diana",
        email: "diana@example.com",
        password: DEMO_PASSWORD,
        bio: "CS student. Learning something new every day.",
        profilePicture: "",
    },
    {
        username: "eve_writes",
        email: "eve@example.com",
        password: DEMO_PASSWORD,
        bio: "Writer, reader, occasional coder.",
        profilePicture: "",
    },
];

const POST_CONTENTS = [
    "Just deployed my first project! Feeling great.",
    "Anyone else love late-night coding sessions?",
    "Hot take: tabs > spaces. Fight me.",
    "Working on a social media app for class. It's actually fun!",
    "CSS Grid changed my life. No more float hacks.",
    "Just finished reading Clean Code. Highly recommend.",
    "Why does centering a div still feel like an achievement?",
    "Dark mode is not a feature, it's a lifestyle.",
    "Pushed 15 commits today. Productivity level: over 9000.",
    "Remember to take breaks. Your code will still be there.",
    "Pair programming tip: one drives, one navigates. Both learn.",
    "JavaScript: the language where [] + [] equals an empty string.",
];

const COMMENT_CONTENTS = [
    "Totally agree!",
    "Nice post!",
    "Haha, so true.",
    "I had the same experience.",
    "Great advice, thanks for sharing.",
    "This made my day.",
    "Couldn't have said it better.",
    "Interesting perspective!",
];

async function seed() {
    // Check if already seeded
    const existingUsers = await db.users.findMany();
    if (existingUsers.length > 0) {
        console.log(
            "Database already has users. Clear localStorage first if you want to re-seed.",
        );
        return false;
    }

    const createdUsers = [];
    for (const userData of USERS) {
        const user = await db.users.create({ data: userData });
        createdUsers.push(user);
    }

    const alice = createdUsers[0];
    for (let i = 1; i < createdUsers.length; i++) {
        await db.follows.create({
            data: { followerId: createdUsers[i].id, followingId: alice.id },
        });
        await db.follows.create({
            data: { followerId: alice.id, followingId: createdUsers[i].id },
        });
    }

    await db.follows.create({
        data: {
            followerId: createdUsers[1].id,
            followingId: createdUsers[2].id,
        },
    });
    await db.follows.create({
        data: {
            followerId: createdUsers[1].id,
            followingId: createdUsers[3].id,
        },
    });

    const createdPosts = [];
    for (let i = 0; i < POST_CONTENTS.length; i++) {
        const author = createdUsers[i % createdUsers.length];
        const post = await db.posts.create({
            data: { authorId: author.id, content: POST_CONTENTS[i] },
        });
        createdPosts.push(post);
    }

    // Create comments on some posts
    for (let i = 0; i < 8; i++) {
        const post = createdPosts[i % createdPosts.length];
        const commenter = createdUsers[(i + 1) % createdUsers.length];
        await db.comments.create({
            data: {
                postId: post.id,
                authorId: commenter.id,
                content: COMMENT_CONTENTS[i],
            },
        });
    }

    for (let i = 0; i < 10; i++) {
        const post = createdPosts[i % createdPosts.length];
        const liker = createdUsers[(i + 2) % createdUsers.length];

        if (liker.id === post.authorId) continue;
        await db.likes.create({
            data: { postId: post.id, userId: liker.id },
        });
    }

    console.log("Seed complete!");
    console.log(
        `  ${createdUsers.length} users (login with any email + "${DEMO_PASSWORD}")`,
    );
    console.log(`  ${createdPosts.length} posts`);
    console.log("  8 comments, ~10 likes, multiple follow relationships");
    console.log(`  Try logging in as alice@example.com / ${DEMO_PASSWORD}`);
    return true;
}

const result = await seed();
export default result;
