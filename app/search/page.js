import { PostCard } from "@/components/PostCard";
import { getSession } from "@/lib/auth";
import PropTypes from "@/lib/prop-types";
import { likesRepo } from "@/lib/repo/likes";
import { postsRepo } from "@/lib/repo/posts";

export const dynamic = "force-dynamic";

function firstParam(value) {
    return Array.isArray(value) ? value[0] : value;
}

export default async function SearchPage({ searchParams }) {
    const query = await searchParams;
    const q = String(firstParam(query?.q) ?? "").trim();
    const [posts, session] = await Promise.all([
        q ? postsRepo.search(q, { limit: 50 }) : [],
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
                <h1 className="page-title">Search</h1>
                <form
                    action="/search"
                    className="card"
                    style={{ marginBottom: 16 }}
                >
                    <div className="input-group">
                        <label className="input-label" htmlFor="post-search">
                            Search posts
                        </label>
                        <div className="flex gap-2">
                            <input
                                id="post-search"
                                className="input"
                                type="search"
                                name="q"
                                placeholder="Search posts..."
                                defaultValue={q}
                            />
                            <button className="btn btn-primary" type="submit">
                                Search
                            </button>
                        </div>
                    </div>
                </form>

                {q && postsWithViewerLikes.length === 0
                    ? <p
                          className="text-secondary text-center"
                          style={{ marginTop: 40 }}
                      >
                          No posts found for &quot;{q}&quot;
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

SearchPage.propTypes = {
    searchParams: PropTypes.object.isRequired,
};
