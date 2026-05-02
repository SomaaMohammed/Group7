import { PostCard } from "@/components/PostCard";
import { getSession } from "@/lib/auth";
import { likesRepo } from "@/lib/repo/likes";
import { postsRepo } from "@/lib/repo/posts";

export const dynamic = "force-dynamic";

export default async function GlobalPage() {
    const [posts, session] = await Promise.all([
        postsRepo.listGlobal({ limit: 30 }),
        getSession(),
    ]);
    const likedPostIds = session
        ? new Set(
              await likesRepo.listPostIdsByUser({
                  userId: session.id,
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
                <h1 className="page-title">Global Feed</h1>
                {postsWithViewerLikes.length === 0
                    ? <p className="text-secondary">
                          No posts yet. Run the seed script.
                      </p>
                    : <div id="feed-list">
                          {postsWithViewerLikes.map((post) => (
                              <PostCard key={post.id} post={post} />
                          ))}
                      </div>}
            </div>
        </main>
    );
}
