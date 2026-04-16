const DEFAULT = "/assets/default-avatar.svg";

export function Avatar({ user, src, size = "sm", alt = "" }) {
    const url = src ?? user?.profilePicture ?? DEFAULT;
    return <img className={`avatar avatar-${size}`} src={url} alt={alt} />;
}
