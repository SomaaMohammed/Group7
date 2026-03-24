import { requireAuth } from './global/auth.js';
import db from './global/db.js';
import { goToHome, goToUser } from './global/router.js';
import { injectShell } from './global/shell.js';
import { escapeHtml, toSafeImageSrc } from './global/sanitize.js';
import { applyTheme, getInitialTheme } from './global/theme.js';
import { showToast } from './global/toast.js';

const postAuthorAvatar = document.getElementById('post-author-avatar');
const postAuthorName = document.getElementById('post-author-name');
const postTimestamp = document.getElementById('post-timestamp');
const postContent = document.getElementById('post-content');
const postLikeCount = document.getElementById('post-like-count');
const likeBtn = document.getElementById('like-btn');
const deleteBtn = document.getElementById('delete-btn');
const commentsList = document.getElementById('comments-list');
const commentForm = document.getElementById('comment-form');
const commentInput = document.getElementById('comment-input');
const commentSubmitBtn = document.getElementById('comment-submit-btn');
const LIKE_PARTICLE_COUNT = 10;

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
  bindCommentHandler();
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

  const [likes, comments, users] = await Promise.all([
    db.likes.findMany({ where: { postId } }),
    db.comments.findMany({ where: { postId } }),
    db.users.findMany(),
  ]);
  const userMap = Object.fromEntries(users.map((user) => [user.id, user]));
  const author = userMap[post.authorId] || null;
  const sortedComments = comments.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  const likedByCurrentUser = likes.some((l) => l.userId === currentUser.id);

  return {
    postId,
    post,
    author,
    likes,
    likedByCurrentUser,
    comments: sortedComments,
    userMap,
  };
}

async function renderPostPage(pageData) {
  if (!pageData) return;

  const { post, author } = pageData;

  if (postAuthorAvatar) {
    const username = author?.username || 'Unknown user';
    postAuthorAvatar.src = toSafeImageSrc(author?.profilePicture, '../assets/default-avatar.svg');
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
    likeBtn.classList.toggle('is-liked', pageData.likedByCurrentUser);
    const likeAction = pageData.likedByCurrentUser ? 'Unlike' : 'Like';
    likeBtn.setAttribute('aria-label', `${likeAction} post`);
    likeBtn.setAttribute('title', `${likeAction} post`);
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

  renderComments(pageData.comments, pageData.userMap);
}

function bindLikeHandler() {
  if (!likeBtn) return;
  likeBtn.addEventListener('click', toggleLike);
}

function bindDeleteHandler() {
  if (!deleteBtn) return;
  deleteBtn.addEventListener('click', deletePost);
}

function bindCommentHandler() {
  if (commentForm) {
    commentForm.addEventListener('submit', submitComment);
  }
  if (commentsList) {
    commentsList.addEventListener('click', handleCommentAuthorClick);
  }
}

async function toggleLike() {
  if (!currentPostData || !currentUser || !likeBtn || likeBtn.disabled) return;

  const { postId } = currentPostData;
  const existingLike = await db.likes.findUnique({
    where: { postId, userId: currentUser.id },
  });

  if (existingLike) {
    await db.likes.delete({ where: { id: existingLike.id } });
    currentPostData.likes = currentPostData.likes.filter((l) => l.id !== existingLike.id);
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
  if (likeBtn) {
    likeBtn.classList.toggle('is-liked', currentPostData.likedByCurrentUser);
    const likeAction = currentPostData.likedByCurrentUser ? 'Unlike' : 'Like';
    likeBtn.setAttribute('aria-label', `${likeAction} post`);
    likeBtn.setAttribute('title', `${likeAction} post`);
    if (currentPostData.likedByCurrentUser) {
      triggerLikeAnimation();
    }
  }
}

function triggerLikeAnimation() {
  if (!likeBtn || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  likeBtn.classList.remove('like-pop');
  void likeBtn.offsetWidth;
  likeBtn.classList.add('like-pop');

  const particles = [];
  for (let i = 0; i < LIKE_PARTICLE_COUNT; i += 1) {
    const particle = document.createElement('span');
    particle.className = 'like-particle';
    const angle = (Math.PI * 2 * i) / LIKE_PARTICLE_COUNT;
    const distance = 18 + Math.random() * 14;
    const tx = `${Math.cos(angle) * distance}px`;
    const ty = `${Math.sin(angle) * distance}px`;
    particle.style.setProperty('--tx', tx);
    particle.style.setProperty('--ty', ty);
    likeBtn.appendChild(particle);
    particles.push(particle);
  }

  setTimeout(() => {
    likeBtn.classList.remove('like-pop');
    particles.forEach((particle) => particle.remove());
  }, 560);
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

function renderComments(comments, userMap) {
  if (!commentsList) return;

  if (!comments.length) {
    commentsList.innerHTML = '<p class="text-secondary text-sm">No comments yet.</p>';
    return;
  }

  commentsList.innerHTML = comments
    .map((comment) => {
      const author = userMap[comment.authorId];
      const username = escapeHtml(author?.username || 'Unknown user');
      const avatarSrc = escapeHtml(
        toSafeImageSrc(author?.profilePicture, '../assets/default-avatar.svg'),
      );
      const content = escapeHtml(comment.content || '');
      const timestamp = escapeHtml(formatTime(comment.createdAt));

      return `
        <article class="flex gap-3">
          <img
            class="avatar avatar-sm"
            src="${avatarSrc}"
            alt="${username}'s avatar"
            data-user-id="${escapeHtml(author?.id || '')}"
            style="cursor: pointer"
          />
          <div class="flex-1">
            <div class="flex items-center gap-2 flex-wrap">
              <strong class="text-sm" data-user-id="${escapeHtml(author?.id || '')}" style="cursor: pointer">${username}</strong>
              <span class="text-secondary text-xs">${timestamp}</span>
            </div>
            <p class="text-sm">${content}</p>
          </div>
        </article>
      `;
    })
    .join('');
}

async function submitComment(event) {
  event.preventDefault();
  if (!currentPostData || !commentInput || !commentSubmitBtn) return;

  const content = commentInput.value.trim();
  if (!content) {
    showToast('Comment cannot be empty.', 'info');
    return;
  }

  commentSubmitBtn.disabled = true;
  await db.comments.create({
    data: {
      postId: currentPostData.postId,
      authorId: currentUser.id,
      content,
    },
  });

  const refreshedData = await loadPostPageData(currentPostData.postId);
  if (refreshedData) {
    currentPostData = refreshedData;
    renderComments(currentPostData.comments, currentPostData.userMap);
  }

  commentInput.value = '';
  commentSubmitBtn.disabled = false;
  showToast('Comment added', 'success');
}

function handleCommentAuthorClick(event) {
  const userElement = event.target.closest('[data-user-id]');
  const userId = userElement?.dataset.userId?.trim();
  if (!userId) return;
  goToUser(userId);
}

function formatTime(isoDate) {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return 'Unknown date';
  return date.toLocaleString();
}
