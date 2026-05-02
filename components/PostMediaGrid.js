"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import PropTypes from "@/lib/prop-types";

const MAX_VISIBLE_MEDIA = 4;

function getMediaKind(url) {
    try {
        const parsed = new URL(url, "http://localhost");
        const mimeType = parsed.searchParams.get("mime") ?? "";
        if (mimeType.startsWith("video/")) return "video";
    } catch {
        // Ignore malformed URLs and treat them as images.
    }

    return "image";
}

export function PostMediaGrid({ media, display = "grid" }) {
    const items = media.slice(0, MAX_VISIBLE_MEDIA).map((url) => ({
        url,
        kind: getMediaKind(url),
    }));
    const isFullDisplay = display === "full";
    const [mounted, setMounted] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(null);
    const closeButtonRef = useRef(null);
    const isOpen = currentIndex !== null;
    const activeItem = isOpen ? items[currentIndex] : null;

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!isOpen) return;

        const previousOverflow = document.body.style.overflow;
        const previouslyFocused =
            document.activeElement instanceof HTMLElement
                ? document.activeElement
                : null;

        function handleKeydown(event) {
            if (event.key === "Escape") {
                setCurrentIndex(null);
                return;
            }

            if (event.key === "ArrowLeft") {
                event.preventDefault();
                setCurrentIndex((index) =>
                    index === null ? null : Math.max(0, index - 1),
                );
                return;
            }

            if (event.key === "ArrowRight") {
                event.preventDefault();
                setCurrentIndex((index) =>
                    index === null
                        ? null
                        : Math.min(items.length - 1, index + 1),
                );
            }
        }

        document.body.style.overflow = "hidden";
        document.addEventListener("keydown", handleKeydown);
        requestAnimationFrame(() => closeButtonRef.current?.focus());

        return () => {
            document.body.style.overflow = previousOverflow;
            document.removeEventListener("keydown", handleKeydown);
            previouslyFocused?.focus?.();
        };
    }, [isOpen, items.length]);

    if (items.length === 0) return null;

    function showPrevious() {
        setCurrentIndex((index) =>
            index === null ? null : Math.max(0, index - 1),
        );
    }

    function showNext() {
        setCurrentIndex((index) =>
            index === null ? null : Math.min(items.length - 1, index + 1),
        );
    }

    const lightbox =
        mounted && activeItem
            ? createPortal(
                  <div
                      className="lightbox-backdrop"
                      role="dialog"
                      aria-modal="true"
                      aria-label="Media viewer"
                      tabIndex={-1}
                      onClick={(event) => {
                          if (event.target === event.currentTarget) {
                              setCurrentIndex(null);
                          }
                      }}
                      onKeyDown={(event) => {
                          if (event.key === "Escape") {
                              setCurrentIndex(null);
                          }
                      }}
                  >
                      <button
                          ref={closeButtonRef}
                          className="lightbox-close"
                          type="button"
                          onClick={() => setCurrentIndex(null)}
                          aria-label="Close media viewer"
                      >
                          X
                      </button>

                      {items.length > 1 && (
                          <button
                              className="lightbox-nav lightbox-nav-prev"
                              type="button"
                              onClick={showPrevious}
                              disabled={currentIndex === 0}
                              aria-label="Previous media"
                          >
                              {"<"}
                          </button>
                      )}

                      <div className="lightbox-content">
                          {activeItem.kind === "video"
                              ? <>
                                    {/* biome-ignore lint/a11y/useMediaCaption: Uploaded media has no sidecar caption tracks in current storage model. */}
                                    <video
                                        className="lightbox-video"
                                        src={activeItem.url}
                                        controls
                                        autoPlay
                                        playsInline
                                        preload="metadata"
                                    />
                                </>
                              : <div className="lightbox-image-frame">
                                    <Image
                                        src={activeItem.url}
                                        alt={`Attachment ${currentIndex + 1}`}
                                        fill
                                        sizes="100vw"
                                        style={{ objectFit: "contain" }}
                                        unoptimized
                                        priority
                                    />
                                </div>}
                      </div>

                      {items.length > 1 && (
                          <button
                              className="lightbox-nav lightbox-nav-next"
                              type="button"
                              onClick={showNext}
                              disabled={currentIndex === items.length - 1}
                              aria-label="Next media"
                          >
                              {">"}
                          </button>
                      )}

                      {items.length > 1 && (
                          <div className="lightbox-counter">
                              {currentIndex + 1} / {items.length}
                          </div>
                      )}
                  </div>,
                  document.body,
              )
            : null;

    return (
        <>
            <div
                className={`media-grid media-grid-${items.length}${isFullDisplay ? " media-grid-full" : ""}`}
            >
                {items.map((item, index) => (
                    <button
                        key={`${item.url}-${index}`}
                        className="media-grid-item"
                        type="button"
                        onClick={() => setCurrentIndex(index)}
                        aria-label={`View attachment ${index + 1} fullscreen`}
                    >
                        {item.kind === "video"
                            ? <video
                                  className={
                                      isFullDisplay
                                          ? "media-grid-full-video"
                                          : undefined
                                  }
                                  src={item.url}
                                  muted
                                  playsInline
                                  preload="metadata"
                              />
                            : isFullDisplay
                              ? <>
                                    {/* biome-ignore lint/performance/noImgElement: Detail media needs natural dimensions for uncropped full-size display. */}
                                    <img
                                        className="media-grid-full-image"
                                        src={item.url}
                                        alt={`Attachment ${index + 1}`}
                                    />
                                </>
                              : <Image
                                    src={item.url}
                                    alt={`Attachment ${index + 1}`}
                                    fill
                                    sizes="(max-width: 768px) 100vw, 680px"
                                    style={{ objectFit: "cover" }}
                                    unoptimized
                                />}
                    </button>
                ))}
            </div>
            {lightbox}
        </>
    );
}

PostMediaGrid.propTypes = {
    media: PropTypes.arrayOf(PropTypes.string).isRequired,
    display: PropTypes.string,
};
