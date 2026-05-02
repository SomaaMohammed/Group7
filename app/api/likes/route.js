import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { likesRepo } from "@/lib/repo/likes";
import { notificationsRepo } from "@/lib/repo/notifications";

export async function POST(request) {
    const user = await getSession();

    if (!user) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    const postId = String(body?.postId ?? "");

    if (!postId) {
        return Response.json({ error: "postId is required." }, { status: 400 });
    }

    const result = await likesRepo.toggle({ postId, userId: user.id });

    if (result.liked) {
        const post = await prisma.post.findUnique({
            where: { id: postId },
            select: { authorId: true },
        });
        if (post) {
            await notificationsRepo.create({
                recipientId: post.authorId,
                actorId: user.id,
                type: "LIKE",
                postId,
            });
        }
    }

    return Response.json(result);
}
