import { prisma } from "@/lib/prisma";

function normalizeMediaId(path) {
    if (!path) return "";
    const input = String(path);
    if (!input.includes("/")) return input;
    const withoutQuery = input.split("?")[0];
    return withoutQuery.split("/").filter(Boolean).pop() ?? "";
}

export async function uploadImage(file, userId) {
    const filename = String(file?.name ?? "upload.bin");
    const mimeType = String(file?.type ?? "application/octet-stream");
    const arrayBuffer = await file.arrayBuffer();
    const bytes = Buffer.from(arrayBuffer);

    const media = await prisma.mediaAsset.create({
        data: {
            ownerId: userId,
            filename,
            mimeType,
            sizeBytes: bytes.byteLength,
            bytes,
        },
        select: { id: true },
    });

    return { url: `/api/media/${media.id}`, path: media.id };
}

export async function deleteImage(path) {
    const id = normalizeMediaId(path);
    if (!id) return;

    await prisma.mediaAsset.deleteMany({
        where: { id },
    });
}
