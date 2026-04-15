export function formatTime(isoDate) {
    const date = new Date(isoDate);
    if (Number.isNaN(date.getTime())) return "Unknown date";
    return date.toLocaleString();
}
