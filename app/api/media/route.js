import { getSession } from "@/lib/auth";
import { uploadImage } from "@/lib/storage";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_VIDEO_BYTES = 25 * 1024 * 1024;

function getMediaKind(mimeType) {
    if (mimeType.startsWith("image/")) return "image";
    if (mimeType.startsWith("video/")) return "video";
    return null;
}

export async function POST(request) {
    const user = await getSession();

    if (!user) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || typeof file === "string") {
        return Response.json({ error: "No file provided." }, { status: 400 });
    }

    const mediaKind = getMediaKind(file.type);

    if (!mediaKind) {
        return Response.json(
            { error: "Only image and video files are allowed." },
            { status: 400 },
        );
    }

    const maxBytes = mediaKind === "video" ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
    if (file.size > maxBytes) {
        return Response.json(
            {
                error:
                    mediaKind === "video"
                        ? "Each video must be under 25 MB."
                        : "Each image must be under 5 MB.",
            },
            { status: 400 },
        );
    }

    try {
        const { url, path } = await uploadImage(file, user.id);
        return Response.json(
            {
                url: `${url}?mime=${encodeURIComponent(file.type)}`,
                path,
                mimeType: file.type,
            },
            { status: 201 },
        );
    } catch {
        return Response.json({ error: "Upload failed." }, { status: 500 });
    }
}
