import { getSession } from "@/lib/auth";
import { commentsRepo } from "@/lib/repo/comments";

export async function POST(request) {
    const user = await getSession();

    if (!user) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    const { postId = "", content = "" } = body || {};

    if (!postId || typeof content !== "string" || content.length === 0) {
        return Response.json(
            { error: "postId and content are required." },
            { status: 400 },
        );
    }

    const comment = await commentsRepo.create({
        postId,
        authorId: user.id,
        content,
    });

    return Response.json(comment, { status: 201 });
}
