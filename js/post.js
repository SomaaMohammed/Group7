import { requireAuth } from './global/auth.js';
import db from './global/db.js';
import { goToHome, goToUser } from './global/router.js';
import { injectShell } from './global/shell.js';
import { toSafeImageSrc } from './global/sanitize.js';
import { applyTheme, getInitialTheme } from './global/theme.js';
import { showToast } from './global/toast.js';

const postAuthorAvatar = document.getElementById('post-author-avatar');
const postAuthorName = document.getElementById('post-author-name');
const postTimestamp = document.getElementById('post-timestamp');
const postContent = document.getElementById('post-content');

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
  const params = new URLSearchParams(location.search);
  return params.get('id')?.trim() || '';
}

async function loadPostPageData(postId) {
  if (!postId) {
    showToast('Post not found.', 'danger');
    goToHome();
    return null;
  }

  const post = await db.posts.findUnique({ where: { id: postId } });
  if (!post) {
    showToast('Post not found.', 'danger');
    goToHome();
    return null;
  }

  const author = await db.users.findUnique({ where: { id: post.authorId } });

  return { postId, post, author };
}

async function renderPostPage(pageData) {
  if (!pageData) return;

  const { post, author } = pageData;

  if (postAuthorAvatar) {
    const username = author?.username || 'Unknown user';
    postAuthorAvatar.src = toSafeImageSrc(
      author?.profilePicture,
      '../assets/default-avatar.svg',
    );
    postAuthorAvatar.alt = `${username}'s avatar`;
  }

  if (postAuthorName) {
    postAuthorName.textContent = author?.username || 'Unknown user';
  }

  if (postContent) {
    postContent.textContent = post.content || '';
  }

  if (postTimestamp) {
    postTimestamp.textContent = formatTime(post.createdAt);
  }

  if (author?.id) {
    if (postAuthorAvatar) {
      postAuthorAvatar.style.cursor = 'pointer';
      postAuthorAvatar.addEventListener('click', () => goToUser(author.id));
    }

    if (postAuthorName) {
      postAuthorName.style.cursor = 'pointer';
      postAuthorName.addEventListener('click', () => goToUser(author.id));
    }
  }
}

function formatTime(isoDate) {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return 'Unknown date';
  return date.toLocaleString();
}
