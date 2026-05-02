import Image from "next/image";
import PropTypes from "@/lib/prop-types";

const DEFAULT = "/assets/default-avatar.svg";

export function Avatar({ user, src, size = "sm", alt = "" }) {
    const url = src ?? user?.profilePicture ?? DEFAULT;
    return (
        <Image
            className={`avatar avatar-${size}`}
            src={url}
            alt={alt}
            width={112}
            height={112}
            unoptimized
        />
    );
}

Avatar.propTypes = {
    user: PropTypes.shape({
        profilePicture: PropTypes.string,
    }),
    src: PropTypes.string,
    size: PropTypes.string,
    alt: PropTypes.string,
};
