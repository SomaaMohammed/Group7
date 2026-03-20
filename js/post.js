import { requireAuth } from './global/auth.js';
import db from './global/db.js';
import { injectShell } from './global/shell.js';
import { applyTheme, getInitialTheme } from './global/theme.js';
import { showToast } from './global/toast.js';

applyTheme(getInitialTheme());

await initPostPage();

async function initPostPage() {
  const currentUser = await requireAuth();
  if (!currentUser) return;

  await injectShell();

  const postId = parsePostIdFromUrl();
  const pageData = await loadPostPageData(postId);
  await renderPostPage(pageData);
}

function parsePostIdFromUrl() {
  const params = new URLSearchParams(globalThis.location.search);
  return params.get('id')?.trim() || '';
}

async function loadPostPageData(postId) {
  if (!postId) {
    showToast('Post not found.', 'danger');
    return null;
  }

  const post = await db.posts.findUnique({ where: { id: postId } });
  if (!post) {
    showToast('Post not found.', 'danger');
    return null;
  }

  return { postId, post };
}

async function renderPostPage(pageData) {
  if (!pageData) return;
}
