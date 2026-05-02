export default function Loading() {
    return (
        <main className="app-main">
            <div className="content-column route-loading" aria-live="polite">
                <div className="spinner spinner-md" aria-hidden="true" />
                <span className="sr-only">Loading page</span>
                <div className="route-loading-stack" aria-hidden="true">
                    <div className="route-loading-line route-loading-title" />
                    <div className="route-loading-card" />
                    <div className="route-loading-card route-loading-card-sm" />
                </div>
            </div>
        </main>
    );
}
