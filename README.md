# Group7
Best web project insha Allah

## Notes
- Many methods in db.json are marked as async even though the code itself doesn't need async. The idea of this is to anticipate phase two where we would switch from local storage to actual database. That is why db.js was even created, since it exposes an sql interface to mimic that.