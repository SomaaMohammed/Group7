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
import { OwnProfilePanel } from "./OwnProfilePanel";

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
        viewerIsAuthor: viewer ? post.author.id === viewer.id : false,
    }));

    return (
        <main className="app-main" id="user-page-main">
            <div className="content-column page-enter">
                {isOwnProfile
                    ? <OwnProfilePanel profile={profile} />
                    : <section
                          className="card"
                          aria-labelledby="profile-heading"
                      >
                          <header className="user-profile-header">
                              <div className="user-profile-identity">
                                  <Avatar
                                      user={profile}
                                      size="2xl"
                                      alt={`${profile.username}'s avatar`}
                                  />
                                  <div>
                                      <h1
                                          id="profile-heading"
                                          className="user-profile-name"
                                      >
                                          {profile.username}
                                      </h1>
                                      <p
                                          id="profile-handle"
                                          className="text-secondary"
                                      >
                                          @{profile.username}
                                      </p>
                                  </div>
                              </div>
                              {viewer
                                  ? <FollowButton
                                        followingId={profile.id}
                                        initialFollowing={isFollowing}
                                    />
                                  : <Link
                                        className="btn btn-outline"
                                        href="/login"
                                    >
                                        Sign in
                                    </Link>}
                          </header>

                          <p id="profile-bio" className="text-secondary">
                              {profile.bio ||
                                  "This user has not added a bio yet."}
                          </p>

                          <div
                              className="profile-stats"
                              aria-label="Profile statistics"
                          >
                              <span className="profile-stat">
                                  <span className="profile-stat-value">
                                      {profile._count.posts}
                                  </span>{" "}
                                  Posts
                              </span>
                              <span className="profile-stat">
                                  <span className="profile-stat-value">
                                      {profile._count.followers}
                                  </span>{" "}
                                  Followers
                              </span>
                              <span className="profile-stat">
                                  <span className="profile-stat-value">
                                      {profile._count.following}
                                  </span>{" "}
                                  Following
                              </span>
                          </div>
                      </section>}

                <div id="feed-list" style={{ marginTop: 16 }}>
                    {postsWithViewerLikes.length === 0
                        ? <p className="text-secondary">No posts yet.</p>
                        : postsWithViewerLikes.map((post) => (
                              <PostCard
                                  key={post.id}
                                  post={post}
                                  viewerIsAuthor={post.viewerIsAuthor}
                              />
                          ))}
                </div>
            </div>
        </main>
    );
}

UserProfilePage.propTypes = {
    params: PropTypes.object.isRequired,
};
