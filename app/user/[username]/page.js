import Link from "next/link";
import { notFound } from "next/navigation";
import { Avatar } from "@/components/Avatar";
import { PostCard } from "@/components/PostCard";
import { getSession } from "@/lib/auth";
import PropTypes from "@/lib/prop-types";
import { followsRepo } from "@/lib/repo/follows";
import { likesRepo } from "@/lib/repo/likes";
import { postsRepo } from "@/lib/repo/posts";
import { usersRepo } from "@/lib/repo/users";
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

    const posts = await postsRepo.listByAuthor(profile.id, { limit: 30 });
    const likedPostIds = viewer
        ? new Set(
              await likesRepo.listPostIdsByUser({
                  userId: viewer.id,
                  postIds: posts.map((post) => post.id),
              }),
          )
        : new Set();
    const postsWithViewerLikes = posts.map((post) => ({
        ...post,
        viewerLiked: likedPostIds.has(post.id),
    }));

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
                                <h1 className="page-title">
                                    @{profile.username}
                                </h1>
                                {profile.bio && (
                                    <p className="text-secondary">
                                        {profile.bio}
                                    </p>
                                )}
                            </div>
                        </div>
                        {viewer && !isOwnProfile && (
                            <FollowButton
                                followingId={profile.id}
                                initialFollowing={isFollowing}
                            />
                        )}
                        {!viewer && (
                            <Link className="btn btn-primary" href="/login">
                                Sign in
                            </Link>
                        )}
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
                    {postsWithViewerLikes.length === 0
                        ? <p className="text-secondary">No posts yet.</p>
                        : postsWithViewerLikes.map((post) => (
                              <PostCard key={post.id} post={post} />
                          ))}
                </div>
            </div>
        </main>
    );
}

UserProfilePage.propTypes = {
    params: PropTypes.object.isRequired,
};
