import { PostCard } from "@/components/PostCard";
import { postsRepo } from "@/lib/repo/posts";

export const dynamic = "force-dynamic";

export default async function GlobalPage() {
    const posts = await postsRepo.listGlobal({ limit: 30 });

    return (
        <main className="app-main">
            <div className="content-column page-enter">
                <h1 className="page-title">Global Feed</h1>
                {posts.length === 0 ? (
                    <p className="text-secondary">No posts yet. Run the seed script.</p>
                ) : (
                    <div id="feed-list">
                        {posts.map((post) => (
                            <PostCard key={post.id} post={post} />
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
