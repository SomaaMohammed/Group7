import Link from "next/link";
import PropTypes from "@/lib/prop-types";
import { Avatar } from "./Avatar";
import { DeletePostButton } from "./DeletePostButton";
import { LikeButton } from "./LikeButton";
import { PostMediaGrid } from "./PostMediaGrid";
import { TimeAgo } from "./TimeAgo";

export function PostCard({
    post,
    mediaDisplay = "grid",
    viewerIsAuthor = false,
}) {
    const { id, author, content, media, createdAt, _count } = post;

    return (
        <article
            className="card card-interactive post-card"
            aria-label={`Post by ${author.username}`}
        >
            <Link
                className="post-card-stretched-link"
                href={`/post/${id}`}
                aria-label="View post details"
                transitionTypes={["nav-forward"]}
            >
                <span className="sr-only">View post details</span>
            </Link>
            <div className="flex items-center gap-3 post-card-header">
                <Link
                    className="post-card-user-link"
                    href={`/user/${author.username}`}
                    aria-label={`View ${author.username}'s profile`}
                    transitionTypes={["nav-forward"]}
                >
                    <Avatar user={author} size="sm" alt="" />
                </Link>
                <div>
                    <Link
                        className="font-semibold post-card-username post-card-user-link"
                        href={`/user/${author.username}`}
                        transitionTypes={["nav-forward"]}
                    >
                        {author.username}
                    </Link>
                    {" - "}
                    <TimeAgo date={createdAt} />
                </div>
            </div>
            <p className="post-card-content">{content}</p>
            {media?.length > 0 && (
                <PostMediaGrid media={media} display={mediaDisplay} />
            )}
            <div className="flex gap-4 text-secondary text-sm post-card-stats">
                <LikeButton
                    postId={id}
                    initialLiked={Boolean(post.viewerLiked)}
                    initialCount={_count.likes}
                />
                <span>
                    {_count.comments} comment{_count.comments === 1 ? "" : "s"}
                </span>
                {viewerIsAuthor && (
                    <span style={{ marginLeft: "auto" }}>
                        <DeletePostButton postId={id} />
                    </span>
                )}
            </div>
        </article>
    );
}

PostCard.propTypes = {
    post: PropTypes.shape({
        id: PropTypes.string.isRequired,
        author: PropTypes.shape({
            username: PropTypes.string.isRequired,
            profilePicture: PropTypes.string,
        }).isRequired,
        content: PropTypes.string.isRequired,
        media: PropTypes.arrayOf(PropTypes.string),
        createdAt: PropTypes.oneOfType([
            PropTypes.instanceOf(Date),
            PropTypes.string,
        ]).isRequired,
        viewerLiked: PropTypes.bool,
        _count: PropTypes.shape({
            comments: PropTypes.number.isRequired,
            likes: PropTypes.number.isRequired,
        }).isRequired,
    }).isRequired,
    mediaDisplay: PropTypes.string,
    viewerIsAuthor: PropTypes.bool,
};
