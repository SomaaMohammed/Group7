import { formatTime } from "@/lib/format";

export function TimeAgo({ date }) {
    const d = date instanceof Date ? date : new Date(date);
    return (
        <time className="text-secondary text-xs" dateTime={d.toISOString()}>
            {formatTime(d)}
        </time>
    );
}
