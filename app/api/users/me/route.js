import { requireUser } from "@/lib/auth";
import { usersRepo } from "@/lib/repo/users";

export async function GET() {
    const user = await requireUser();
    const profile = await usersRepo.findById(user.id);
    
    const response = Response.json({ user: profile });
    response.headers.set("Cache-Control", "private, max-age=60");
    return response;
}

export async function PATCH(request) {
    const user = await requireUser();
    const body = await request.json().catch(() => null);
    const username = body?.username;
    const bio = body?.bio;
    const profilePicture = body?.profilePicture;

    const patch = {
        ...(username !== undefined && {
            username: String(username).trim().toLowerCase(),
        }),
        ...(bio !== undefined && { bio: bio === null ? null : String(bio) }),
        ...(profilePicture !== undefined && {
            profilePicture:
                profilePicture === null ? null : String(profilePicture).trim(),
        }),
    };

    try {
        const updated = await usersRepo.update(user.id, patch);
        const response = Response.json({ user: updated });
        response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
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
