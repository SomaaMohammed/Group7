import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { commentsRepo } from "@/lib/repo/comments";
import { notificationsRepo } from "@/lib/repo/notifications";

const MAX_COMMENT_LENGTH = 1000;

export async function POST(request) {
    const user = await getSession();

    if (!user) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    const postId = String(body?.postId ?? "").trim();
    const content = String(body?.content ?? "").trim();

    if (!postId || content.length === 0) {
        return Response.json(
            { error: "postId and content are required." },
            { status: 400 },
        );
    }

    if (content.length > MAX_COMMENT_LENGTH) {
        return Response.json(
            { error: "Comments must be 1000 characters or less." },
            { status: 400 },
        );
    }

    const comment = await commentsRepo.create({
        postId,
        authorId: user.id,
        content,
    });

    const post = await prisma.post.findUnique({
        where: { id: postId },
        select: { authorId: true },
    });
    if (post) {
        await notificationsRepo.create({
            recipientId: post.authorId,
            actorId: user.id,
            type: "COMMENT",
            postId,
        });
    }

    return Response.json(comment, { status: 201 });
}
