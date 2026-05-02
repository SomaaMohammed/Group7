import { getSession } from "@/lib/auth";
import { uploadImage } from "@/lib/storage";

export async function POST(request) {
    const user = await getSession();

    if (!user) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || typeof file === "string") {
        return Response.json({ error: "No file provided." }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
        return Response.json(
            { error: "Only image files allowed." },
            { status: 400 },
        );
    }

    if (file.size > 5 * 1024 * 1024) {
        return Response.json(
            { error: "File must be < 5 MB." },
            { status: 400 },
        );
    }

    try {
        const { url, path } = await uploadImage(file, user.id);
        return Response.json({ url, path }, { status: 201 });
    } catch {
        return Response.json({ error: "Upload failed." }, { status: 500 });
    }
}
