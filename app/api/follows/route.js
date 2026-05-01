import { requireUser } from "@/lib/auth";
import { followsRepo } from "@/lib/repo/follows";

function getFollowingId(body) {
    return String(body?.followingId ?? "").trim();
}

export async function POST(request) {
    const user = await requireUser();
    const body = await request.json().catch(() => null);
    const followingId = getFollowingId(body);

    if (!followingId) {
        return Response.json(
            { error: "followingId is required." },
            { status: 400 },
        );
    }

    if (followingId === user.id) {
        return Response.json(
            { error: "You cannot follow yourself." },
            { status: 400 },
        );
    }

    await followsRepo.follow({ followerId: user.id, followingId });
    const following = await followsRepo.listFollowing(user.id, { limit: 1000 });
    return Response.json({
        ok: true,
        followingCount: following.length,
    });
}

export async function DELETE(request) {
    const user = await requireUser();
    const body = await request.json().catch(() => null);
    const followingId = getFollowingId(body);

    if (!followingId) {
        return Response.json(
            { error: "followingId is required." },
            { status: 400 },
        );
    }

    await followsRepo.unfollow({ followerId: user.id, followingId });
    const following = await followsRepo.listFollowing(user.id, { limit: 1000 });
    return Response.json({
        ok: true,
        followingCount: following.length,
    });
}
