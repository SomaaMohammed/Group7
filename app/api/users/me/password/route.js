import bcrypt from "bcryptjs";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function isStrongPassword(password) {
    const hasMinLength = password.length >= 8;
    const hasLetter = /[A-Za-z]/.test(password);
    const hasNumber = /\d/.test(password);
    return hasMinLength && hasLetter && hasNumber;
}

export async function POST(request) {
    const user = await requireUser();
    const body = await request.json().catch(() => null);
    const currentPassword = String(body?.currentPassword ?? "");
    const newPassword = String(body?.newPassword ?? "");
    const confirmNewPassword = String(body?.confirmNewPassword ?? "");

    if (!currentPassword || !newPassword || !confirmNewPassword) {
        return Response.json(
            {
                error: "Current password, new password, and confirmation are required.",
            },
            { status: 400 },
        );
    }

    if (!isStrongPassword(newPassword)) {
        return Response.json(
            {
                error: "Password must be 8+ chars and include letters and numbers.",
            },
            { status: 400 },
        );
    }

    if (currentPassword === newPassword) {
        return Response.json(
            { error: "New password must be different from current password." },
            { status: 400 },
        );
    }

    if (newPassword !== confirmNewPassword) {
        return Response.json(
            { error: "Passwords do not match." },
            { status: 400 },
        );
    }

    const account = await prisma.user.findUnique({
        where: { id: user.id },
        select: { passwordHash: true },
    });
    if (!account?.passwordHash) {
        return Response.json(
            { error: "Password sign-in is not enabled for this account." },
            { status: 400 },
        );
    }

    const ok = await bcrypt.compare(currentPassword, account.passwordHash);
    if (!ok) {
        return Response.json(
            { error: "Current password is incorrect." },
            { status: 401 },
        );
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
        where: { id: user.id },
        data: { passwordHash },
    });

    return Response.json({ ok: true });
}
