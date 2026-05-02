import Link from "next/link";
import PropTypes from "@/lib/prop-types";
import { Avatar } from "./Avatar";
import { TimeAgo } from "./TimeAgo";

const TYPE_CONFIG = {
    COMMENT: {
        icon: "icon-comment",
        colorClass: "type-comment",
        label: "commented on your post",
    },
    LIKE: {
        icon: "icon-heart-fill",
        colorClass: "type-like",
        label: "liked your post",
    },
    FOLLOW: {
        icon: "icon-person",
        colorClass: "type-follow",
        label: "started following you",
    },
};

export function NotificationCard({ notification }) {
    const { actor, type, post, createdAt } = notification;
    const config = TYPE_CONFIG[type] ?? TYPE_CONFIG.FOLLOW;
    const href =
        type === "FOLLOW"
            ? `/user/${actor.username}`
            : `/post/${notification.postId}`;

    return (
        <Link
            className="notification-card"
            href={href}
            transitionTypes={["nav-forward"]}
        >
            <Avatar user={actor} size="sm" />
            <div className="notification-card-body">
                <p className="notification-card-text">
                    <strong>{actor.username}</strong> {config.label}
                </p>
                {post?.content && (
                    <p className="notification-card-snippet">
                        {post.content.slice(0, 80)}
                    </p>
                )}
                <TimeAgo date={createdAt} />
            </div>
            <span
                className={`icon ${config.icon} notification-card-icon ${config.colorClass}`}
                aria-hidden="true"
            />
        </Link>
    );
}

NotificationCard.propTypes = {
    notification: PropTypes.shape({
        id: PropTypes.string.isRequired,
        type: PropTypes.string.isRequired,
        postId: PropTypes.string,
        createdAt: PropTypes.string.isRequired,
        actor: PropTypes.shape({
            id: PropTypes.string.isRequired,
            username: PropTypes.string.isRequired,
            profilePicture: PropTypes.string,
        }).isRequired,
        post: PropTypes.shape({
            id: PropTypes.string,
            content: PropTypes.string,
        }),
    }).isRequired,
};
