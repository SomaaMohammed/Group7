import { getSession } from "@/lib/auth";
import { postsRepo } from "@/lib/repo/posts";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;
const MAX_MEDIA = 4;
const MEDIA_PATH_RE = /^\/api\/media\/[a-z0-9]+$/i;

function parseLimit(value) {
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed <= 0) return DEFAULT_LIMIT;
    return Math.min(MAX_LIMIT, Math.floor(parsed));
}

function normalizeMedia(value) {
    if (!Array.isArray(value)) return null;
    if (value.length > MAX_MEDIA) return null;

    return value.map((item) => String(item ?? "").trim()).filter(Boolean);
}

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const limit = parseLimit(searchParams.get("limit"));
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
    const content = String(body?.content ?? "").trim();
    const media = normalizeMedia(body?.media ?? []);

    if (content.length === 0 || content.length > 2000) {
        return Response.json(
            { error: "Content must be 1-2000 characters." },
            { status: 400 },
        );
    }

    if (!media || media.some((item) => !MEDIA_PATH_RE.test(item))) {
        return Response.json(
            { error: "Media must include up to 4 uploaded image URLs." },
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
