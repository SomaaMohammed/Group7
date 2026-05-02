import { statsRepo } from '@/lib/repo/stats';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Statistics | UNI HUB',
};

function DisplayBarChartFunc({ DataToHandle }) {
  if (!DataToHandle || DataToHandle.length === 0) {
    return <p className="text-secondary text-sm">No available data.</p>;
  }

  const MaximumCount = Math.max(...DataToHandle.map((DataEntry) => DataEntry.count), 1);
  return (
    <div className="stats-bar-chart" aria-label="Posts per day chart">
      {DataToHandle.map((Entry, indexation) => {
        const PercentageRounded = Math.round((Entry.count / MaximumCount) * 100);
        const DateLabel =
          Entry.day instanceof Date
            ? Entry.day.toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
              })
            : new Date(Entry.day).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
              });
        return (
          <div
            key={indexation}
            className="stats-bar-item"
            title={`${DateLabel}: ${Entry.count} posts`}
          >
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

        if (DecidedRatio > 0.75) {
          size = 'xl';
        } else if (DecidedRatio > 0.5) {
          size = 'lg';
        } else if (DecidedRatio > 0.25) {
          size = 'md';
        } else {
          size = 'sm';
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
      {sub && (
        <p className="text-secondary text-xs" style={{ marginTop: 'var(--space-1)' }}>
          {sub}
        </p>
      )}
    </div>
  );
}

export default async function StatsPage() {
  const [
    TotalsData,
    RankedTopPosts,
    RankedTopUsers,
    PostsPerDay,
    TopWords,
    HighestActivity,
    AverageFollowers,
    AveragePosts,
  ] = await Promise.all([
    statsRepo.totals(),
    statsRepo.topPostsByLikes({ limit: 5 }),
    statsRepo.topUsersByFollowers({ limit: 5 }),
    statsRepo.postsPerDay({ days: 35 }),
    statsRepo.topWords({ limit: 15 }),
    statsRepo.mostActiveUsersLast3Months({ limit: 5 }),

    statsRepo.avgFollowersPerUser(),
    statsRepo.avgPostsPerUser(),
  ]);

  return (
    <>
      <style>{`
                .stats-page {
                    padding-top: var(--space-6);
                    padding-bottom: var(--space-12);
                    padding-right: var(--space-6);
                    padding-left: var(--space-6);
                }
 
                .stats-totals-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));

                    gap: var(--space-3);

                    margin-bottom: var(--space-6);
                }
 
                .stats-stat-card {
                    padding-top: var(--space-5);
                    padding-bottom: var(--space-3);
                    text-align: center;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                }
 
                .stats-stat-value {
                    margin-bottom: var(--space-1);

                    font-size: var(--font-size-2xl);

                    
                    color: var(--color-primary);
                    line-height: 1.1;
                    font-weight: var(--font-weight-bold);

                }
 
                .stats-stat-label {
                    font-size: var(--font-size-xs);

                    
                    color: var(--color-text-secondary);

                    text-transform: uppercase;

                    letter-spacing: 0.06em;
                    font-weight: var(--font-weight-medium);
                }
 
                
                .stats-section {

                    margin-bottom: var(--space-6);
                }
 
                .stats-section-title {

                    margin-bottom: var(--space-3);

                    
                    color: var(--color-text-secondary);

                    text-transform: uppercase;
                    font-weight: var(--font-weight-semibold);
                    letter-spacing: 0.08em;
                   
                    font-size: var(--font-size-sm);
                }
 
               
                .stats-ranked-list {
                    display: flex;

                    flex-direction: column;
                    gap: var(--space-2);
                }
 
                .stats-ranked-item {
                    display: flex;
                    align-items: center;
                    padding-top: var(--space-3);
                    padding-bottom: var(--space-4);
                    padding-left: var(--space-3);
                    padding-right: var(--space-4);
                    background-color: var(--elevation-1);
                    border-radius: var(--radius-md);
                    box-shadow: var(--shadow-card);
                    gap: var(--space-3);
                }
 
                .stats-rank-num {

                    text-align: center;

                    font-weight: var(--font-weight-bold);
                    color: var(--color-text-disabled);

                    font-size: var(--font-size-xs);
                    width: 20px;
                    
                    flex-shrink: 0;
                }
 
                .stats-rank-num.top3 {
                    color: var(--color-primary);
                }
 
                .stats-ranked-info {
                    flex: 1;

                    min-width: 0;
                }
 
                .stats-ranked-name {
                    
                    font-weight: var(--font-weight-semibold);
                    color: var(--color-text-primary);
                    font-size: var(--font-size-sm);
                    white-space: nowrap;
                    
                    text-overflow: ellipsis;
                    overflow: hidden;
                }
 
                .stats-ranked-meta {
                    font-size: var(--font-size-xs);

                    color: var(--color-text-secondary);
                    margin-top: 2px;
                    
                    overflow: hidden;

                    text-overflow: ellipsis;
                    white-space: nowrap;
                }
 
                .stats-ranked-count {
                    
                    
                    color: var(--color-primary);
                    font-size: var(--font-size-sm);

                    flex-shrink: 0;
                    font-weight: var(--font-weight-bold);
                }
 
               
                .stats-two-col {
                    display: grid;

                    grid-template-columns: 1fr;
                    gap: var(--space-4);
                }
 
                @media (min-width: 680px) {
                    .stats-two-col {
                        grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
                    }
                }
 
                
                .stats-bar-chart {
                    display: flex;

                    align-items: flex-end;
                    gap: 3px;
                    height: 100px;

                    padding-top: var(--space-2);
                    padding-left: 0;
                    padding-bottom: var(--space-1);

                    padding-right: 0;
                }
 
                .stats-bar-item {
                    flex: 1;

                    display: flex;
                    flex-direction: column;
                    
                    justify-content: flex-end;
                    align-items: center;
                    height: 100%;


                    position: relative;
                }
 
                .stats-bar-fill {
                    width: 100%;
                    background-color: var(--color-primary);

                    border-top-left-radius: var(--radius-xs);

                    border-top-right-radius: var(--radius-xs);
                    border-bottom-right-radius: 0;

                    border-bottom-left-radius: 0;

                    opacity: 0.8;
                    transition: opacity var(--transition-fast);
                    min-height: 2px;
                    
                }
 

                .stats-bar-item:hover .stats-bar-fill {
                    opacity: 1;
                }
 
                .stats-bar-label {
                    position: absolute;

                    bottom: -18px;

                    font-size: 9px;
                    
                    white-space: nowrap;
                    color: var(--color-text-disabled);
                }
 
                .stats-bar-chart-wrap {
                    padding-bottom: var(--space-5);
                }


                .stats-word-cloud {
                    display: flex;

                    align-items: center;
                    gap: var(--space-2);

                    line-height: 1.4;
                    flex-wrap: wrap;
                }

                .stats-word-cloud-card {
                    min-height: 128px;
                    padding-top: var(--space-3);
                    padding-right: var(--space-4);
                    padding-bottom: var(--space-4);
                    padding-left: var(--space-4);
                    background-color: var(--elevation-1);
                    border-radius: var(--radius-md);
                    box-shadow: var(--shadow-card);
                    display: flex;
                    align-items: center;
                }
 
                .stats-word {
                    display: inline-block;
                    font-weight: var(--font-weight-medium);
                    border-radius: var(--radius-full);

                    background-color: var(--color-primary-subtle);
                    color: var(--color-primary);

                    padding: 2px var(--space-2);
                    
                }
 
                .stats-word-xl { 
                    font-size: var(--font-size-xl);
                }
                .stats-word-lg {
                    font-size: var(--font-size-lg);
                }
                .stats-word-md {
                    font-size: var(--font-size-base);
                }
                .stats-word-sm { 
                    font-size: var(--font-size-sm); 
                }
 
                .stats-avatar {
                    width: 32px;
                    background-color: var(--elevation-2);
                    border-radius: var(--radius-full);

                    
                    flex-shrink: 0;
                    object-fit: cover;
                    
                    height: 32px;
                }
 
                .stats-avatar-placeholder {
                    width: 32px;
                   
                    border-radius: var(--radius-full);
                    
                    color: var(--color-primary);
                    height: 32px;
                    background-color: var(--color-primary-subtle);
                    
                    display: flex;
                    align-items: center;

                    justify-content: center;
                    font-size: var(--font-size-xs);
                    font-weight: var(--font-weight-bold);

                    flex-shrink: 0;
                }
            `}</style>

      <div className="content-column stats-page page-enter">
        <h1 className="page-title">Statistics Overview</h1>

        <section className="stats-section">
          <p className="stats-section-title">A Look at The Platform</p>
          <div className="stats-totals-grid">
            <StatCardNumber PassedLabel="Users" GivenValue={TotalsData.users.toLocaleString()} />
            <StatCardNumber PassedLabel="Posts" GivenValue={TotalsData.posts.toLocaleString()} />

            <StatCardNumber
              PassedLabel="Comments"
              GivenValue={TotalsData.comments.toLocaleString()}
            />
            <StatCardNumber PassedLabel="Likes" GivenValue={TotalsData.likes.toLocaleString()} />

            <StatCardNumber
              PassedLabel="Follows"
              GivenValue={TotalsData.follows.toLocaleString()}
            />
            <StatCardNumber
              PassedLabel="Average followers"
              GivenValue={Number(AverageFollowers).toFixed(1)}
              sub="per user"
            />

            <StatCardNumber
              PassedLabel="Average posts"
              GivenValue={Number(AveragePosts).toFixed(1)}
              sub="per user"
            />
          </div>
        </section>

        <div className="stats-two-col" style={{ marginBottom: 'var(--space-6)' }}>
          <section className="stats-section" style={{ marginBottom: 0 }}>
            <p className="stats-section-title">Posts per day in the last 30 days</p>

            <div className="card stats-bar-chart-wrap">
              <DisplayBarChartFunc DataToHandle={PostsPerDay} />
            </div>
          </section>

          <section className="stats-section" style={{ marginBottom: 0 }}>
            <p className="stats-section-title">Top Words</p>
            <div className="stats-word-cloud-card">
              <WordCloudSizeRank words={TopWords} />
            </div>
          </section>
        </div>

        <div className="stats-two-col" style={{ marginBottom: 'var(--space-6)' }}>
          <section className="stats-section" style={{ marginBottom: 0 }}>
            <p className="stats-section-title">Most Liked Posts</p>

            <div className="stats-ranked-list">
              {RankedTopPosts.map((EachPosting, Index) => (
                <div key={EachPosting.id} className="stats-ranked-item">
                  <span className={`stats-rank-num${Index < 3 ? ' top3' : ''}`}>{Index + 1}</span>
                  <div className="stats-ranked-info">
                    <p className="stats-ranked-name"> @{EachPosting.author.username}</p>
                    <p className="stats-ranked-meta">
                      {' '}
                      {EachPosting.content.slice(0, 60)}{' '}
                      {EachPosting.content.length > 60 ? '…' : ''}
                    </p>
                  </div>
                  <span className="stats-ranked-count">♥ {EachPosting._count.likes}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="stats-section" style={{ marginBottom: 0 }}>
            <p className="stats-section-title">Top Users by Followers</p>
            <div className="stats-ranked-list">
              {RankedTopUsers.map((EachUser, Index) => (
                <div key={EachUser.id} className="stats-ranked-item">
                  <span className={`stats-rank-num${Index < 3 ? ' top3' : ''}`}>{Index + 1}</span>
                  {EachUser.profilePicture ? (
                    <img
                      className="stats-avatar"
                      src={EachUser.profilePicture}
                      alt={EachUser.username}
                    />
                  ) : (
                    <div className="stats-avatar-placeholder" aria-hidden="true">
                      {EachUser.username[0].toUpperCase()}
                    </div>
                  )}
                  <div className="stats-ranked-info">
                    <p className="stats-ranked-name">@{EachUser.username}</p>
                    <p className="stats-ranked-meta">{EachUser._count.following} Following</p>
                  </div>
                  <span className="stats-ranked-count">{EachUser._count.followers} Followers</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        <section className="stats-section">
          <p className="stats-section-title">Most Active in The Last 3 months</p>
          <div className="stats-ranked-list">
            {HighestActivity.map((EachUser, Index) => (
              <div key={EachUser.id} className="stats-ranked-item">
                <span className={`stats-rank-num${Index < 3 ? ' top3' : ''}`}>{Index + 1}</span>
                {EachUser.profilePicture ? (
                  <img
                    className="stats-avatar"
                    src={EachUser.profilePicture}
                    alt={EachUser.username}
                  />
                ) : (
                  <div className="stats-avatar-placeholder" aria-hidden="true">
                    {EachUser.username[0].toUpperCase()}
                  </div>
                )}

                <div className="stats-ranked-info">
                  <p className="stats-ranked-name">@{EachUser.username}</p>
                </div>

                <span className="stats-ranked-count">{EachUser.postCount} posts</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
