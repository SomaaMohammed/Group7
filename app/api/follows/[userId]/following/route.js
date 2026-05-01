import { followsRepo } from "@/lib/repo/follows";

export async function GET(_request, context) {
    const { userId } = await context.params;
    const users = await followsRepo.listFollowing(String(userId));
    return Response.json({ users });
}
