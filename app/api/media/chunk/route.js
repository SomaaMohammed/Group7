import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const MAX_CHUNK_BYTES = 3.5 * 1024 * 1024;

export async function POST(request) {
    const user = await getSession();
    if (!user) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const chunk = formData.get("chunk");
    const uploadId = formData.get("uploadId");
    const chunkIndex = Number(formData.get("chunkIndex"));

    if (!chunk || typeof chunk === "string") {
        return Response.json({ error: "No chunk provided." }, { status: 400 });
    }

    if (!uploadId || !Number.isInteger(chunkIndex) || chunkIndex < 0) {
        return Response.json(
            { error: "Invalid chunk metadata." },
            { status: 400 },
        );
    }

    if (chunk.size > MAX_CHUNK_BYTES + 1024) {
        return Response.json({ error: "Chunk too large." }, { status: 400 });
    }

    const arrayBuffer = await chunk.arrayBuffer();
    const bytes = Buffer.from(arrayBuffer);

    await prisma.mediaChunk.upsert({
        where: {
            uploadId_chunkIndex: { uploadId, chunkIndex },
        },
        create: {
            uploadId,
            ownerId: user.id,
            chunkIndex,
            bytes,
        },
        update: {
            bytes,
        },
    });

    return Response.json({ received: chunkIndex }, { status: 200 });
}
