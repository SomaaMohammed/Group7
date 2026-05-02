import { getSession } from "@/lib/auth";
import { postsRepo } from "@/lib/repo/posts";

export async function GET(request) {
    const user = await getSession();

    if (!user) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = Number(searchParams.get("limit")) || 20;
    const cursor = searchParams.get("cursor") ?? undefined;

    const posts = await postsRepo.listHomeFeed(user.id, { limit, cursor });
    return Response.json({ posts });
}
