import { prisma } from "@/lib/prisma";

export async function GET(_request, context) {
    const { id } = await context.params;
    const media = await prisma.mediaAsset.findUnique({
        where: { id },
        select: {
            bytes: true,
            mimeType: true,
            filename: true,
            sizeBytes: true,
        },
    });

    if (!media) {
        return new Response("Not found", { status: 404 });
    }

    return new Response(media.bytes, {
        headers: {
            "content-type": media.mimeType,
            "content-length": String(media.sizeBytes),
            "content-disposition": `inline; filename="${media.filename}"`,
            "cache-control": "public, max-age=31536000, immutable",
        },
    });
}
