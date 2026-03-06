import { requireAuth } from "./global/auth.js";
import { injectShell } from "./global/shell.js";
import { applyTheme, getInitialTheme } from "./global/theme.js";

applyTheme(getInitialTheme());

await requireAuth();
await injectShell();
