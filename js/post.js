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
const postLikeCount = document.getElementById('post-like-count');
const likeBtn = document.getElementById('like-btn');
const deleteBtn = document.getElementById('delete-btn');

let currentUser = null;
let currentPostData = null;

applyTheme(getInitialTheme());

await initPostPage();

async function initPostPage() {
  currentUser = await requireAuth();
  if (!currentUser) return;

  await injectShell();

  const postId = parsePostIdFromUrl();
  const pageData = await loadPostPageData(postId);
  currentPostData = pageData;
  await renderPostPage(pageData);
  bindLikeHandler();
  bindDeleteHandler();
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
  const likes = await db.likes.findMany({ where: { postId } });
  const likedByCurrentUser = likes.some((l) => l.userId === currentUser.id);

  return { postId, post, author, likes, likedByCurrentUser };
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

  if (postLikeCount) {
    postLikeCount.textContent = String(pageData.likes.length);
  }

  if (likeBtn) {
    likeBtn.disabled = post.authorId === currentUser.id;
    likeBtn.textContent = pageData.likedByCurrentUser ? 'Unlike' : 'Like';
  }

  if (deleteBtn) {
    const isOwnPost = post.authorId === currentUser.id;
    deleteBtn.classList.toggle('hidden', !isOwnPost);
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

function bindLikeHandler() {
  if (!likeBtn) return;
  likeBtn.addEventListener('click', toggleLike);
}

function bindDeleteHandler() {
  if (!deleteBtn) return;
  deleteBtn.addEventListener('click', deletePost);
}

async function toggleLike() {
  if (!currentPostData || !currentUser || !likeBtn || likeBtn.disabled) return;

  const { postId } = currentPostData;
  const existingLike = await db.likes.findUnique({
    where: { postId, userId: currentUser.id },
  });

  if (existingLike) {
    await db.likes.delete({ where: { id: existingLike.id } });
    currentPostData.likes = currentPostData.likes.filter(
      (l) => l.id !== existingLike.id,
    );
    currentPostData.likedByCurrentUser = false;
  } else {
    const newLike = await db.likes.create({
      data: { postId, userId: currentUser.id },
    });
    currentPostData.likes = [...currentPostData.likes, newLike];
    currentPostData.likedByCurrentUser = true;
  }

  if (postLikeCount) {
    postLikeCount.textContent = String(currentPostData.likes.length);
  }
  likeBtn.textContent = currentPostData.likedByCurrentUser ? 'Unlike' : 'Like';
}

async function deletePost() {
  if (!currentPostData || !currentUser || !deleteBtn) return;
  if (currentPostData.post.authorId !== currentUser.id) return;

  deleteBtn.disabled = true;

  await db.comments.deleteMany({ where: { postId: currentPostData.postId } });
  await db.likes.deleteMany({ where: { postId: currentPostData.postId } });
  await db.posts.delete({ where: { id: currentPostData.postId } });

  showToast('Post deleted', 'success');
  goToHome();
}

function formatTime(isoDate) {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return 'Unknown date';
  return date.toLocaleString();
}
