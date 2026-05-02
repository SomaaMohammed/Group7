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
        <form action="/search" className="card" style={{ marginBottom: 16 }}>
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

        {q && users.length === 0 ? (
          <p className="text-secondary text-center" style={{ marginTop: 40 }}>
            No users found for &quot;{q}&quot;
          </p>
        ) : (
          <div id="feed-list">
            {users.map((user) => (
              <a
                key={user.id}
                href={`/user/${user.username}`}
                className="card"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  textDecoration: "none",
                  color: "inherit",
                }}
              >
                <Avatar src={user.profilePicture} alt={user.username} />
                <div>
                  <div className="font-semibold">{user.username}</div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

SearchPage.propTypes = {
  searchParams: PropTypes.object.isRequired,
};
