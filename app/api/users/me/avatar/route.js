import { requireUser } from "@/lib/auth";
import { usersRepo } from "@/lib/repo/users";
import { deleteImage, uploadImage } from "@/lib/storage";

const MAX_AVATAR_SIZE = 5 * 1024 * 1024;
const ALLOWED_MIME = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
]);

export async function POST(request) {
    const user = await requireUser();
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
        return Response.json({ error: "file is required." }, { status: 400 });
    }

    if (!ALLOWED_MIME.has(file.type)) {
        return Response.json(
            { error: "Unsupported file type." },
            { status: 400 },
        );
    }

    if (file.size > MAX_AVATAR_SIZE) {
        return Response.json(
            { error: "Avatar must be 5MB or less." },
            { status: 400 },
        );
    }

    const current = await usersRepo.findById(user.id);
    const uploaded = await uploadImage(file, user.id);
    const updated = await usersRepo.update(user.id, {
        profilePicture: uploaded.url,
    });

    if (current?.profilePicture) {
        await deleteImage(current.profilePicture);
    }

    return Response.json({ user: updated, media: uploaded });
}
