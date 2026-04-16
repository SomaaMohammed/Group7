// Placeholder — Step 12 replaces with fuller version (avatar helper, time-ago, media grid).
// Class names mirror legacy/js/global/post-card.js so global.css rules apply unchanged.

import { formatTime } from "@/lib/format";

export function PostCard({ post }) {
    const { id, author, content, media, createdAt, _count } = post;
    const avatar = author.profilePicture || "/assets/default-avatar.svg";

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
                    <img className="avatar avatar-sm" src={avatar} alt="" />
                </a>
                <div>
                    <a
                        className="font-semibold post-card-username post-card-user-link"
                        href={`/user/${author.username}`}
                    >
                        {author.username}
                    </a>
                    <span className="text-secondary text-xs"> · {formatTime(createdAt)}</span>
                </div>
            </div>
            <p className="post-card-content">{content}</p>
            {media?.length > 0 && (
                <div className="post-card-media">
                    {media.map((url) => (
                        <img key={url} src={url} alt="" />
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
