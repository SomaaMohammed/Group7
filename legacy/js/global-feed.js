import { requireAuth } from "./global/auth.js";
import db from "./global/db.js";
import { injectShell } from "./global/shell.js";
import { applyTheme, getInitialTheme } from "./global/theme.js";
import { flushQueuedToast } from "./global/toast.js";
import { renderPostCard } from "./global/post-card.js";
import { resolveMedia } from "./global/media.js";
import { resolveAvatarUrls } from "./global/avatar.js";
import { openLightbox } from "./global/lightbox.js";

const feedList = document.getElementById("feed-list");

applyTheme(getInitialTheme());

await initPage();

async function initPage() {
    const currentUser = await requireAuth();
    if (!currentUser) return;

    await injectShell();
    flushQueuedToast();

    if (feedList) {
        feedList.addEventListener("click", (e) => {
            const gridItem = e.target.closest(".media-grid-item");
            if (!gridItem) return;
            e.preventDefault();
            e.stopPropagation();

            const grid = gridItem.closest(".media-grid");
            const items = [...grid.querySelectorAll(".media-grid-item")];
            const index = items.indexOf(gridItem);
            const mediaItems = items.map((item) => ({
                url: item.querySelector("img,video")?.src,
                mimeType: item.dataset.mimeType,
            }));
            openLightbox(mediaItems, index);
        });
    }

    await renderFeed();
}

async function renderFeed() {
    if (!feedList) return;

    const allPosts = await db.posts.findMany();
    allPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    if (allPosts.length === 0) {
        feedList.innerHTML = `
      <div class="empty-state">
        <p class="empty-state-title">No posts yet.</p>
        <p class="empty-state-description">
          Be the first to post!
        </p>
      </div>`;
        return;
    }

    const [allUsers, allLikes, allComments] = await Promise.all([
        db.users.findMany(),
        db.likes.findMany(),
        db.comments.findMany(),
    ]);

    const userMap = Object.fromEntries(allUsers.map((u) => [u.id, u]));

    await resolveAvatarUrls(allUsers);

    const mediaMap = new Map();
    await Promise.all(
        allPosts.map(async (post) => {
            if (post.mediaIds?.length) {
                mediaMap.set(post.id, await resolveMedia(post.mediaIds));
            }
        }),
    );

    feedList.innerHTML = allPosts
        .map((post) => {
            const author = userMap[post.authorId];
            const likeCount = allLikes.filter(
                (l) => l.postId === post.id,
            ).length;
            const commentCount = allComments.filter(
                (c) => c.postId === post.id,
            ).length;
            const mediaItems = mediaMap.get(post.id) || [];
            return renderPostCard(
                post,
                author,
                likeCount,
                commentCount,
                mediaItems,
            );
        })
        .join("");
}
