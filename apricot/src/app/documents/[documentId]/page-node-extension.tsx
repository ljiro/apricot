"use client";

import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { PageCard } from "./page-card";

/**
 * Page node: each page (A4, Letter, Legal) is a card in sequence.
 * Doc content is "page+", each page has "block+".
 */
export const PageNode = Node.create({
  name: "page",

  group: "block",
  content: "block+",
  defining: true,

  parseHTML() {
    return [{ tag: 'div[data-type="page"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        "data-type": "page",
        class: "editor-page-card",
      }),
      0,
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(PageCard);
  },

  addCommands() {
    return {
      insertPageAfter:
        () =>
        ({ commands, state }) => {
          return commands.insertContentAt(
            state.doc.content.size,
            { type: "page", content: [{ type: "paragraph" }] }
          );
        },
    };
  },
});

/** Default doc: one page with one empty paragraph (for new docs / blank template) */
export function getDefaultDoc(): { type: "doc"; content: unknown[] } {
  return {
    type: "doc",
    content: [
      {
        type: "page",
        content: [{ type: "paragraph" }],
      },
    ],
  };
}

