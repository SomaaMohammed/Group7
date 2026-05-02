"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import PropTypes from "@/lib/prop-types";

export function ConfirmDialog({ title, message, confirmLabel = "Delete", onConfirm, onCancel, loading = false }) {
    const cancelRef = useRef(null);

    useEffect(() => {
        cancelRef.current?.focus();
        function handleKey(e) {
            if (e.key === "Escape") onCancel();
        }
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [onCancel]);

    return createPortal(
        <div className="modal-backdrop" onClick={onCancel}>
            <div className="modal" style={{ maxWidth: 400 }} onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">{title}</h2>
                </div>
                <p className="text-secondary" style={{ marginBottom: "var(--space-5)" }}>
                    {message}
                </p>
                <div className="modal-footer">
                    <button
                        ref={cancelRef}
                        className="btn btn-secondary"
                        type="button"
                        onClick={onCancel}
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        className="btn btn-danger"
                        type="button"
                        onClick={onConfirm}
                        disabled={loading}
                    >
                        {loading ? "Deleting…" : confirmLabel}
                    </button>
                </div>
            </div>
        </div>,
        document.body,
    );
}

ConfirmDialog.propTypes = {
    title: PropTypes.string.isRequired,
    message: PropTypes.string.isRequired,
    confirmLabel: PropTypes.string,
    onConfirm: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    loading: PropTypes.bool,
};
