import Link from "next/link";
import { notFound } from "next/navigation";
import { Avatar } from "@/components/Avatar";
import { CommentComposer } from "@/components/CommentComposer";
import { DeleteCommentButton } from "@/components/DeleteCommentButton";
import { PostCard } from "@/components/PostCard";
import { getSession } from "@/lib/auth";
import PropTypes from "@/lib/prop-types";
import { commentsRepo } from "@/lib/repo/comments";
import { likesRepo } from "@/lib/repo/likes";
import { postsRepo } from "@/lib/repo/posts";

export const dynamic = "force-dynamic";

export default async function PostPage({ params }) {
    const { id } = await params;
    const postPath = "/post/" + id;
    const loginHref = "/login?next=" + encodeURIComponent(postPath);
    const post = await postsRepo.findById(id);

    if (!post) notFound();

    const [comments, session] = await Promise.all([
        commentsRepo.listByPost(id, { limit: 500 }),
        getSession(),
    ]);
    const viewerLiked = session
        ? await likesRepo.exists({ postId: id, userId: session.id })
        : false;

    return (
        <main className="app-main">
            <div className="content-column page-enter">
                <h1 className="page-title">Post</h1>
                <PostCard
                    post={{ ...post, viewerLiked }}
                    mediaDisplay="full"
                    viewerIsAuthor={session?.id === post.author.id}
                />

                <section className="card" style={{ marginTop: 16 }}>
                    <div className="flex-between" style={{ marginBottom: 16 }}>
                        <h2 className="text-lg">Comments</h2>
                        <span className="text-secondary text-sm">
                            {comments.length}{" "}
                            {comments.length === 1 ? "comment" : "comments"}
                        </span>
                    </div>

                    {session
                        ? <CommentComposer postId={id} />
                        : <p
                              className="text-secondary text-sm"
                              style={{ marginBottom: 16 }}
                          >
                              <Link
                                  className="text-accent font-semibold"
                                  href={loginHref}
                                  transitionTypes={["nav-forward"]}
                              >
                                  Sign in
                              </Link>{" "}
                              to join the conversation.
                          </p>}

                    <div className="flex-col gap-3">
                        {comments.length === 0
                            ? <p className="text-secondary text-sm">
                                  No comments yet.
                              </p>
                            : comments.map((comment) => {
                                  const authorHref = `/user/${comment.author.username}`;

                                  return (
                                      <article
                                          key={comment.id}
                                          className="flex gap-3"
                                      >
                                          <Link
                                              className="post-card-user-link"
                                              href={authorHref}
                                              aria-label={`View ${comment.author.username}'s profile`}
                                              transitionTypes={["nav-forward"]}
                                          >
                                              <Avatar
                                                  user={comment.author}
                                                  size="sm"
                                                  alt=""
                                              />
                                          </Link>
                                          <div className="flex-1">
                                              <div className="flex-between gap-3">
                                                  <Link
                                                      className="font-semibold post-card-username post-card-user-link"
                                                      href={authorHref}
                                                      transitionTypes={[
                                                          "nav-forward",
                                                      ]}
                                                  >
                                                      {comment.author.username}
                                                  </Link>
                                                  <time
                                                      className="text-secondary text-xs"
                                                      dateTime={comment.createdAt.toISOString()}
                                                  >
                                                      {new Date(
                                                          comment.createdAt,
                                                      ).toLocaleDateString()}
                                                  </time>
                                              </div>
                                              <p
                                                  className="text-sm"
                                                  style={{
                                                      whiteSpace: "pre-wrap",
                                                  }}
                                              >
                                                  {comment.content}
                                              </p>
                                          </div>
                                          {session?.id ===
                                              comment.author.id && (
                                              <DeleteCommentButton
                                                  commentId={comment.id}
                                              />
                                          )}
                                      </article>
                                  );
                              })}
                    </div>
                </section>
            </div>
        </main>
    );
}

PostPage.propTypes = {
    params: PropTypes.object.isRequired,
};
