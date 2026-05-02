import { getSession } from "@/lib/auth";
import { postsRepo } from "@/lib/repo/posts";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;

function parseLimit(value) {
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed <= 0) return DEFAULT_LIMIT;
    return Math.min(MAX_LIMIT, Math.floor(parsed));
}

export async function GET(request) {
    const user = await getSession();

    if (!user) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseLimit(searchParams.get("limit"));
    const cursor = searchParams.get("cursor") ?? undefined;

    const posts = await postsRepo.listHomeFeed(user.id, { limit, cursor });
    return Response.json({ posts });
}
