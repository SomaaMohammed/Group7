import { Avatar } from "./Avatar";
import { TimeAgo } from "./TimeAgo";

export function PostCard({ post }) {
    const { id, author, content, media, createdAt, _count } = post;

    return (
        <article className="card card-interactive post-card" aria-label={`Post by ${author.username}`}>
            <a
                className="post-card-stretched-link"
                href={`/post/${id}`}
                aria-label="View post details"
            />
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
                    {" · "}
                    <TimeAgo date={createdAt} />
                </div>
            </div>
            <p className="post-card-content">{content}</p>
            {media?.length > 0 && (
                <div className={`media-grid media-grid-${Math.min(media.length, 4)}`}>
                    {media.slice(0, 4).map((url, i) => (
                        <div key={url} className="media-grid-item" data-index={i}>
                            <img src={url} alt={`Attachment ${i + 1}`} loading="lazy" />
                        </div>
                    ))}
                </div>
            )}
            <div className="flex gap-4 text-secondary text-sm post-card-stats">
                <span>{_count.likes} like{_count.likes === 1 ? "" : "s"}</span>
                <span>{_count.comments} comment{_count.comments === 1 ? "" : "s"}</span>
            </div>
        </article>
    );
}
