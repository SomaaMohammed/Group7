# Group7
Best web project insha Allah

## Notes
- Many methods in db.json are marked as async even though the code itself doesn't need async. The idea of this is to anticipate phase two where we would switch from local storage to actual database. That is why db.js was even created, since it exposes an sql interface to mimic that.

- js/global/shell.js injects a nav bar into every protected page as long as every protected page has <div id="shell-root"></div> in its HTML. In addition those HTML pages await requireAuth() then await injectShell() prior to dealing with any DOM queries

- Files must be opened through a live server not through file:// to not have the ES modules get blocked