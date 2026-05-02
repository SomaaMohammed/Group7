import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { commentsRepo } from "@/lib/repo/comments";

export async function DELETE(_request, { params }) {
    const user = await getSession();

    if (!user) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const comment = await prisma.comment.findUnique({
        where: { id },
        select: { author: { select: { id: true } } },
    });

    if (!comment) {
        return Response.json({ error: "Not found" }, { status: 404 });
    }

    if (comment.author.id !== user.id) {
        return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    await commentsRepo.delete(id);
    return Response.json({ success: true });
}
