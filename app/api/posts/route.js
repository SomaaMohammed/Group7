import { postsRepo } from "@/lib/repo/posts";

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const limit = Number(searchParams.get("limit")) || 20;
    const cursor = searchParams.get("cursor") ?? undefined;

    const posts = await postsRepo.listGlobal({ limit, cursor });
    return Response.json({ posts });
}
