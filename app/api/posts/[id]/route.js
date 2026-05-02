import { notFound } from "next/navigation";
import { getSession } from "@/lib/auth";
import { postsRepo } from "@/lib/repo/posts";

export async function GET(_request, { params }) {
    const { id } = await params;
    const post = await postsRepo.findById(id);

    if (!post) return notFound();

    return Response.json(post);
}

export async function DELETE(_request, { params }) {
    const user = await getSession();

    if (!user) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const post = await postsRepo.findById(id);

    if (!post) {
        return Response.json({ error: "Not found" }, { status: 404 });
    }

    if (post.author.id !== user.id) {
        return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    await postsRepo.delete(id);
    return Response.json({ success: true });
}
