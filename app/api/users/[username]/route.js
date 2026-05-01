import { usersRepo } from "@/lib/repo/users";

export async function GET(_request, context) {
    const { username } = await context.params;
    const profile = await usersRepo.getProfile(String(username));
    if (!profile) {
        return Response.json({ error: "User not found." }, { status: 404 });
    }
    return Response.json({ user: profile });
}
