import Link from "next/link";
import { Avatar } from "@/components/Avatar";
import PropTypes from "@/lib/prop-types";
import { usersRepo } from "@/lib/repo/users";

export const dynamic = "force-dynamic";

function firstParam(value) {
    return Array.isArray(value) ? value[0] : value;
}

export default async function SearchPage({ searchParams }) {
    const query = await searchParams;
    const q = String(firstParam(query?.q) ?? "").trim();
    const users = q ? await usersRepo.search(q, { limit: 50 }) : [];

    return (
        <main className="app-main">
            <div className="content-column page-enter">
                <h1 className="page-title">Search</h1>
                <p className="text-secondary" style={{ marginBottom: 16 }}>
                    Find classmates and creators by username.
                </p>
                <form
                    action="/search"
                    className="card"
                    style={{ marginBottom: 16 }}
                >
                    <div className="input-group">
                        <label className="input-label" htmlFor="post-search">
                            Search users
                        </label>
                        <div className="flex gap-2">
                            <input
                                id="post-search"
                                className="input"
                                type="search"
                                name="q"
                                placeholder="Search users..."
                                defaultValue={q}
                            />
                            <button className="btn btn-primary" type="submit">
                                Search
                            </button>
                        </div>
                    </div>
                </form>

                {q && users.length === 0
                    ? <p
                          className="text-secondary text-center search-empty-state"
                          style={{ marginTop: 40 }}
                      >
                          No users found for &quot;{q}&quot;
                      </p>
                    : <div id="feed-list" className="search-results">
                          {users.map((user, index) => (
                              <Link
                                  key={user.id}
                                  href={`/user/${user.username}`}
                                  className="card card-interactive search-result"
                                  style={{ animationDelay: `${index * 45}ms` }}
                              >
                                  <Avatar
                                      src={user.profilePicture}
                                      alt={user.username}
                                  />
                                  <div>
                                      <div className="font-semibold">
                                          {user.username}
                                      </div>
                                      <div className="text-secondary text-sm">
                                          View profile
                                      </div>
                                  </div>
                              </Link>
                          ))}
                      </div>}
            </div>
        </main>
    );
}

SearchPage.propTypes = {
    searchParams: PropTypes.object.isRequired,
};
