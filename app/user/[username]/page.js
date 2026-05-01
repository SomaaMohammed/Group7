import { Avatar } from "@/components/Avatar";
import { PostCard } from "@/components/PostCard";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { followsRepo } from "@/lib/repo/follows";
import { usersRepo } from "@/lib/repo/users";
import { notFound } from "next/navigation";
import { FollowButton } from "./FollowButton";

export const dynamic = "force-dynamic";

export default async function UserProfilePage({ params }) {
    const { username } = await params;
    const profile = await usersRepo.getProfile(String(username));
    if (!profile) notFound();

    const viewer = await getSession();
    const isOwnProfile = viewer?.id === profile.id;

    let isFollowing = false;
    if (viewer?.id && !isOwnProfile) {
        isFollowing = await followsRepo.exists({
            followerId: viewer.id,
            followingId: profile.id,
        });
    }

    const posts = await prisma.post.findMany({
        where: { authorId: profile.id },
        take: 30,
        orderBy: { createdAt: "desc" },
        select: {
            id: true,
            content: true,
            media: true,
            createdAt: true,
            author: {
                select: {
                    id: true,
                    username: true,
                    profilePicture: true,
                },
            },
            _count: { select: { comments: true, likes: true } },
        },
    });

    return (
        <main className="app-main">
            <div className="content-column page-enter">
                <section className="card">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <Avatar
                                user={profile}
                                size="lg"
                                alt={`${profile.username}'s avatar`}
                            />
                            <div>
                                <h1 className="page-title">@{profile.username}</h1>
                                {profile.bio && (
                                    <p className="text-secondary">{profile.bio}</p>
                                )}
                            </div>
                        </div>
                        {!viewer ? (
                            <a className="btn btn-primary" href="/login">
                                Sign in
                            </a>
                        ) : !isOwnProfile ? (
                            <FollowButton
                                followingId={profile.id}
                                initialFollowing={isFollowing}
                            />
                        ) : null}
                    </div>
                    <div
                        className="flex gap-4 text-secondary text-sm"
                        style={{ marginTop: 12 }}
                    >
                        <span>{profile._count.posts} posts</span>
                        <span>{profile._count.followers} followers</span>
                        <span>{profile._count.following} following</span>
                    </div>
                </section>

                <div id="feed-list" style={{ marginTop: 16 }}>
                    {posts.length === 0 ? (
                        <p className="text-secondary">No posts yet.</p>
                    ) : (
                        posts.map((post) => <PostCard key={post.id} post={post} />)
                    )}
                </div>
            </div>
        </main>
    );
}
