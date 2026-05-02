import { formatTime } from "@/lib/format";
import PropTypes from "@/lib/prop-types";

export function TimeAgo({ date }) {
    const d = date instanceof Date ? date : new Date(date);
    return (
        <time className="text-secondary text-xs" dateTime={d.toISOString()}>
            {formatTime(d)}
        </time>
    );
}

TimeAgo.propTypes = {
    date: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.string])
        .isRequired,
};
