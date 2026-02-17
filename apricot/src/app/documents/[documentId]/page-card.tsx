"use client";

import { NodeViewContent, NodeViewWrapper } from "@tiptap/react";

/**
 * Renders one page as a card (A4, Letter, Legal) in sequence.
 * Uses --editor-page-height so format changes apply.
 */
export function PageCard() {
  return (
    <NodeViewWrapper
      className="editor-page-card"
      data-type="page"
      style={{
        minHeight: "var(--editor-page-height, 1123px)",
        width: "var(--editor-page-width, 794px)",
      }}
    >
      <div className="editor-page-card-inner">
        <NodeViewContent />
      </div>
    </NodeViewWrapper>
  );
}
