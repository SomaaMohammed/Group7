import Link from "next/link";
import { redirect } from "next/navigation";
import { PostCard } from "@/components/PostCard";
import { PostComposer } from "@/components/PostComposer";
import { getSession } from "@/lib/auth";
import PropTypes from "@/lib/prop-types";
import { likesRepo } from "@/lib/repo/likes";
import { postsRepo } from "@/lib/repo/posts";

export const dynamic = "force-dynamic";

function firstParam(value) {
    return Array.isArray(value) ? value[0] : value;
}

export default async function HomePage({ searchParams }) {
    const session = await getSession();

    if (!session) redirect("/login");

    const query = await searchParams;
    const posts = await postsRepo.listHomeFeed(session.id, { limit: 30 });
    const likedPostIds = new Set(
        await likesRepo.listPostIdsByUser({
            userId: session.id,
            postIds: posts.map((post) => post.id),
        }),
    );
    const postsWithViewerLikes = posts.map((post) => ({
        ...post,
        viewerLiked: likedPostIds.has(post.id),
    }));
    const showComposer = firstParam(query?.compose) === "1";

    return (
        <main className="app-main">
            <div className="content-column page-enter">
                <h1 className="page-title">Your Feed</h1>
                {showComposer && <PostComposer defaultOpen />}

                {postsWithViewerLikes.length === 0
                    ? <section className="empty-state card">
                          <h2 className="empty-state-title">
                              Your feed is quiet.
                          </h2>
                          <p className="empty-state-description">
                              Follow classmates or start a post to bring it to
                              life.
                          </p>
                          <div className="flex gap-2 flex-wrap justify-center">
                              <Link className="btn btn-primary" href="/global">
                                  Explore posts
                              </Link>
                              <Link
                                  className="btn btn-ghost"
                                  href="/home?compose=1"
                              >
                                  Start a post
                              </Link>
                          </div>
                      </section>
                    : <div id="feed-list">
                          {postsWithViewerLikes.map((post) => (
                              <PostCard key={post.id} post={post} />
                          ))}
                      </div>}
            </div>
        </main>
    );
}

HomePage.propTypes = {
    searchParams: PropTypes.object.isRequired,
};
