import Image from "next/image";
import PropTypes from "@/lib/prop-types";
import { Avatar } from "./Avatar";
import { LikeButton } from "./LikeButton";
import { TimeAgo } from "./TimeAgo";

export function PostCard({ post }) {
    const { id, author, content, media, createdAt, _count } = post;

    return (
        <article
            className="card card-interactive post-card"
            aria-label={`Post by ${author.username}`}
        >
            <a
                className="post-card-stretched-link"
                href={`/post/${id}`}
                aria-label="View post details"
            >
                <span className="sr-only">View post details</span>
            </a>
            <div className="flex items-center gap-3 post-card-header">
                <a
                    className="post-card-user-link"
                    href={`/user/${author.username}`}
                    aria-label={`View ${author.username}'s profile`}
                >
                    <Avatar user={author} size="sm" alt="" />
                </a>
                <div>
                    <a
                        className="font-semibold post-card-username post-card-user-link"
                        href={`/user/${author.username}`}
                    >
                        {author.username}
                    </a>
                    {" - "}
                    <TimeAgo date={createdAt} />
                </div>
            </div>
            <p className="post-card-content">{content}</p>
            {media?.length > 0 && (
                <div
                    className={`media-grid media-grid-${Math.min(media.length, 4)}`}
                >
                    {media.slice(0, 4).map((url, i) => (
                        <div
                            key={url}
                            className="media-grid-item"
                            data-index={i}
                        >
                            <Image
                                src={url}
                                alt={`Attachment ${i + 1}`}
                                fill
                                sizes="(max-width: 768px) 100vw, 680px"
                                style={{ objectFit: "cover" }}
                                unoptimized
                            />
                        </div>
                    ))}
                </div>
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
};
