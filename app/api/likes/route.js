import { requireUser } from "@/lib/auth";
import { likesRepo } from "@/lib/repo/likes";

export async function POST(request) {
  const user = await requireUser();
  const body = await request.json().catch(() => null);
  const postId = String(body?.postId ?? "");

  if (!postId) {
    return Response.json({ error: "postId is required." }, { status: 400 });
  }

  const result = await likesRepo.toggle({ postId, userId: user.id });
  return Response.json(result);
}
