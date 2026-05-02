import { getSession } from "@/lib/auth";
import { postsRepo } from "@/lib/repo/posts";

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const limit = Number(searchParams.get("limit")) || 20;
    const cursor = searchParams.get("cursor") ?? undefined;

    const posts = await postsRepo.listGlobal({ limit, cursor });
    return Response.json({ posts });
}

export async function POST(request) {
    const user = await getSession();

    if (!user) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    const { content = "", media = [] } = body || {};

    if (
        typeof content !== "string" ||
        content.length === 0 ||
        content.length > 2000
    ) {
        return Response.json(
            { error: "Content must be 1-2000 characters." },
            { status: 400 },
        );
    }

    if (!Array.isArray(media)) {
        return Response.json(
            { error: "media must be an array." },
            { status: 400 },
        );
    }

    const post = await postsRepo.create({
        authorId: user.id,
        content,
        media,
    });

    return Response.json(post, { status: 201 });
}
