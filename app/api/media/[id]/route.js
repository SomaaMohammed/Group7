import { prisma } from "@/lib/prisma";

function parseRangeHeader(rangeHeader, totalBytes) {
    const match = /^bytes=(\d*)-(\d*)$/i.exec(rangeHeader);
    if (!match) return null;

    const startRaw = match[1];
    const endRaw = match[2];

    if (!startRaw && !endRaw) return null;

    let start;
    let end;

    if (!startRaw) {
        const suffixLength = Number(endRaw);
        if (!Number.isInteger(suffixLength) || suffixLength <= 0) return null;
        start = Math.max(totalBytes - suffixLength, 0);
        end = totalBytes - 1;
    } else {
        start = Number(startRaw);
        if (!Number.isInteger(start) || start < 0 || start >= totalBytes) {
            return null;
        }

        if (endRaw) {
            end = Number(endRaw);
            if (!Number.isInteger(end) || end < start) return null;
            end = Math.min(end, totalBytes - 1);
        } else {
            end = totalBytes - 1;
        }
    }

    return { start, end };
}

export async function GET(request, context) {
    const { id } = await context.params;
    const media = await prisma.mediaAsset.findUnique({
        where: { id },
        select: {
            bytes: true,
            mimeType: true,
            filename: true,
            sizeBytes: true,
        },
    });

    if (!media) {
        return new Response("Not found", { status: 404 });
    }

    const bytes = Buffer.from(media.bytes);
    const rangeHeader = request.headers.get("range");

    if (rangeHeader) {
        const range = parseRangeHeader(rangeHeader, media.sizeBytes);

        if (!range) {
            return new Response("Requested range not satisfiable", {
                status: 416,
                headers: {
                    "content-range": `bytes */${media.sizeBytes}`,
                },
            });
        }

        const { start, end } = range;
        const chunk = bytes.subarray(start, end + 1);

        return new Response(chunk, {
            status: 206,
            headers: {
                "accept-ranges": "bytes",
                "content-type": media.mimeType,
                "content-length": String(chunk.byteLength),
                "content-range": `bytes ${start}-${end}/${media.sizeBytes}`,
                "content-disposition": `inline; filename="${media.filename}"`,
                "cache-control": "public, max-age=31536000, immutable",
            },
        });
    }

    return new Response(media.bytes, {
        headers: {
            "accept-ranges": "bytes",
            "content-type": media.mimeType,
            "content-length": String(media.sizeBytes),
            "content-disposition": `inline; filename="${media.filename}"`,
            "cache-control": "public, max-age=31536000, immutable",
        },
    });
}
