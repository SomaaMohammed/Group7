import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

    const { uploadId, filename, mimeType, totalChunks } = await request.json();

    if (!uploadId || !filename || !mimeType || !totalChunks) {
        return Response.json(
            { error: "Missing required fields." },
            { status: 400 },
        );
    }

    const mediaKind = getMediaKind(mimeType);
    if (!mediaKind) {
        return Response.json(
            { error: "Only image and video files are allowed." },
            { status: 400 },
        );
    }

    const chunks = await prisma.mediaChunk.findMany({
        where: { uploadId, ownerId: user.id },
        orderBy: { chunkIndex: "asc" },
        select: { chunkIndex: true, bytes: true },
    });

    if (chunks.length !== totalChunks) {
        return Response.json(
            { error: `Expected ${totalChunks} chunks, got ${chunks.length}.` },
            { status: 400 },
        );
    }

    for (let i = 0; i < chunks.length; i++) {
        if (chunks[i].chunkIndex !== i) {
            return Response.json(
                { error: "Missing or duplicate chunks." },
                { status: 400 },
            );
        }
    }

    const buffers = chunks.map((c) => Buffer.from(c.bytes));
    const assembled = Buffer.concat(buffers);

    const maxBytes = mediaKind === "video" ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
    if (assembled.byteLength > maxBytes) {
        await prisma.mediaChunk.deleteMany({ where: { uploadId } });
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

    const media = await prisma.mediaAsset.create({
        data: {
            ownerId: user.id,
            filename,
            mimeType,
            sizeBytes: assembled.byteLength,
            bytes: assembled,
        },
        select: { id: true },
    });

    await prisma.mediaChunk.deleteMany({ where: { uploadId } });

    const url = `/api/media/${media.id}?mime=${encodeURIComponent(mimeType)}`;
    return Response.json({ url, path: media.id, mimeType }, { status: 201 });
}
