import { getSession } from "@/lib/auth";
import { usersRepo } from "@/lib/repo/users";

const USERNAME_RE = /^[a-z0-9_]{3,24}$/;
const MEDIA_PATH_RE = /^\/api\/media\/[a-z0-9]+$/i;
const MAX_BIO_LENGTH = 300;

export async function GET() {
    const user = await getSession();
    if (!user) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await usersRepo.findById(user.id);

    const response = Response.json({ user: profile });
    response.headers.set("Cache-Control", "private, max-age=60");
    return response;
}

export async function PATCH(request) {
    const user = await getSession();
    if (!user) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    const username = body?.username;
    const bio = body?.bio;
    const profilePicture = body?.profilePicture;
    const nextUsername =
        username === undefined
            ? undefined
            : String(username).trim().toLowerCase();
    const nextBio =
        bio === undefined || bio === null ? bio : String(bio).trim();
    const nextProfilePicture =
        profilePicture === undefined || profilePicture === null
            ? profilePicture
            : String(profilePicture).trim();

    if (nextUsername !== undefined && !USERNAME_RE.test(nextUsername)) {
        return Response.json(
            {
                error: "Username must be 3-24 lowercase letters, numbers, or underscores.",
            },
            { status: 400 },
        );
    }

    if (typeof nextBio === "string" && nextBio.length > MAX_BIO_LENGTH) {
        return Response.json(
            { error: "Bio must be 300 characters or less." },
            { status: 400 },
        );
    }

    if (
        typeof nextProfilePicture === "string" &&
        nextProfilePicture.length > 0 &&
        !MEDIA_PATH_RE.test(nextProfilePicture)
    ) {
        return Response.json(
            { error: "Profile image must be an uploaded avatar URL." },
            { status: 400 },
        );
    }

    const patch = {
        ...(nextUsername !== undefined && { username: nextUsername }),
        ...(bio !== undefined && { bio: nextBio || null }),
        ...(profilePicture !== undefined && {
            profilePicture: nextProfilePicture || null,
        }),
    };

    try {
        const updated = await usersRepo.update(user.id, patch);
        const response = Response.json({ user: updated });
        response.headers.set(
            "Cache-Control",
            "no-store, no-cache, must-revalidate",
        );
        return response;
    } catch (error) {
        if (error?.code === "P2002") {
            return Response.json(
                { error: "Username already exists." },
                { status: 409 },
            );
        }
        throw error;
    }
}
