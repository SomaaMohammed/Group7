// Minimal time formatter. Step 12 ports legacy formatTime from legacy/js/global/time.js.

export function formatTime(date) {
    const d = date instanceof Date ? date : new Date(date);
    const diffSec = (Date.now() - d.getTime()) / 1000;
    if (diffSec < 60) return "just now";
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d ago`;
    return d.toLocaleDateString();
}
