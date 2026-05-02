import { statsRepo } from "@/lib/repo/stats";

export const dynamic = "force-dynamic";

export const metadata = {
    title: "Statistics | UNI HUB",
};


function DisplayBarChartFunc({ DataToHandle }) {

    if (!DataToHandle || DataToHandle.length === 0){
        return <p className="text-secondary text-sm">No available data.</p>;
    } 

    const MaximumCount = Math.max(...DataToHandle.map((DataEntry) => DataEntry.count), 1);
    return (

        <div className="stats-bar-chart" aria-label="Posts per day chart">

            {DataToHandle.map((Entry, indexation) => {

                const PercentageRounded = Math.round((Entry.count / MaximumCount) * 100);
                const DateLabel =Entry.day instanceof Date

                        ? Entry.day.toLocaleDateString("en-GB", {
                             day: "numeric", month: "short" 
                            })
                        : new Date(Entry.day).toLocaleDateString("en-GB", {
                             day: "numeric", month: "short" 
                            });
                return (
                    <div key={indexation} className="stats-bar-item" title={`${DateLabel}: ${Entry.count} posts`}>
                        <div

                            className="stats-bar-fill"
                            style={{ height: `${Math.max(PercentageRounded, 2)}%` }}

                            aria-label={`${Entry.count} posts`}
                        />
                        {indexation % 7 === 0 && <span className="stats-bar-label">{DateLabel}</span>}
                    </div>
                );
            })}
        </div>
    );
}


function WordCloudSizeRank({ words }) {

    if (!words || words.length === 0) {

        return <p className="text-secondary text-sm">No data is available.</p>;
    }
    const MaximumCounter = Math.max(...words.map((wordentry) => wordentry.count), 1);
    return (
        <div className="stats-word-cloud">
            {words.map((wordentry) => {
                const DecidedRatio = wordentry.count / MaximumCounter;
                let size;

                if (DecidedRatio > 0.75){
                    size = "xl";
                } else if (DecidedRatio > 0.5) {
                    size = "lg";
                } else if (DecidedRatio > 0.25){ 
                    size = "md";
                } else {
                    size = "sm";
                }

                return (
                    <span key={wordentry.word} className={`stats-word stats-word-${size}`}>
                        {wordentry.word}
                    </span>
                );
            })}
        </div>
    );
}


function StatCardNumber({ PassedLabel, GivenValue, sub }) {
    return (

        <div className="card stats-stat-card">

            <p className="stats-stat-value">{GivenValue}</p>
            <p className="stats-stat-label">{PassedLabel}</p>
            {sub && <p className="text-secondary text-xs" style={{ marginTop: "var(--space-1)" }}>{sub}</p>}
        </div>
    );
}
