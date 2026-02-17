"use client";

import { Node, mergeAttributes } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { PAGE_GAP_PX } from "./paper-format";

const PAGINATION_KEY = new PluginKey("apricotPagination");

function readPageHeightPx(viewDom: HTMLElement): number {
  const raw = getComputedStyle(viewDom).getPropertyValue("--editor-page-height").trim();
  const n = Number.parseInt(raw.replace("px", ""), 10);
  return Number.isFinite(n) && n > 0 ? n : 1123;
}

export const PageBreak = Node.create({
  name: "pageBreak",

  group: "block",
  atom: true,
  selectable: false,
  draggable: false,

  parseHTML() {
    return [{ tag: 'div[data-page-break="true"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        "data-page-break": "true",
        class: "page-break",
      }),
    ];
  },

  addCommands() {
    return {
      insertPageBreak:
        () =>
        ({ commands }) => {
          return commands.insertContent({ type: this.name });
        },
    };
  },

  addProseMirrorPlugins() {
    let raf: number | null = null;
    let applying = false;
    // Run after layout so coordsAtPos is stable (avoids infinite re-insertion)
    const schedule = (fn: () => void) => {
      if (raf != null) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        raf = requestAnimationFrame(() => {
          raf = null;
          fn();
        });
      });
    };

    return [
      new Plugin({
        key: PAGINATION_KEY,
        view(view) {
          let lastContentDigest = "";

          const run = () => {
            // Avoid feedback loops from our own transactions
            if (applying) return;

            const doc = view.state.doc;
            const schema = view.state.schema;
            const breakType = schema.nodes.pageBreak;
            if (!breakType) return;

            // Digest of content without page breaks so we don't re-run on every update (stops infinite churn)
            const parts: string[] = [];
            let idx = 0;
            doc.forEach((node) => {
              if (node.type === breakType) return;
              parts.push(node.type.name + ":" + idx + ":" + node.nodeSize);
              idx++;
            });
            const pageHeight = readPageHeightPx(view.dom as HTMLElement);
            const contentDigest = parts.join(",") + "|" + pageHeight;
            if (contentDigest === lastContentDigest) return;
            lastContentDigest = contentDigest;
            const gap = PAGE_GAP_PX;
            const slot = pageHeight + gap;
            const breakNode = breakType.create();
            const breakSize = breakNode.nodeSize;

            // Collect existing pageBreak node positions
            const existingBreakPos: number[] = [];
            doc.descendants((node, pos) => {
              if (node.type === breakType) existingBreakPos.push(pos);
              return true;
            });
            existingBreakPos.sort((a, b) => a - b);

            const baseTop = view.coordsAtPos(1).top;

            const desiredInsertPos: number[] = [];
            let plannedBreaks = 0;

            // Iterate top-level blocks; insert breaks before blocks that would start past the page bottom.
            doc.forEach((node, offset) => {
              const pos = offset + 1; // position before this node
              if (node.type === breakType) return;

              // Count how many existing breaks appear before this position
              let breaksBefore = 0;
              for (const bp of existingBreakPos) {
                if (bp < pos) breaksBefore++;
                else break;
              }

              // Current page in our simulation = number of breaks before this block
              const currentPage = breaksBefore + plannedBreaks;

              // coordsAtPos expects a position inside the node
              const coords = view.coordsAtPos(Math.min(pos + 1, doc.content.size));
              const yWithBreaks = coords.top - baseTop;
              const yWithoutBreaks = yWithBreaks - breaksBefore * gap;
              const predictedY = yWithoutBreaks + plannedBreaks * gap;

              if (predictedY - currentPage * slot >= pageHeight) {
                // Don't insert consecutive breaks: if previous node is already a break, we're on a new page
                const nodeBefore = doc.resolve(pos - 1).nodeBefore;
                if (nodeBefore?.type !== breakType) {
                  plannedBreaks++;
                  desiredInsertPos.push(pos);
                }
              }
            });

            // Quick equality check: same number of breaks and (roughly) same placement
            if (desiredInsertPos.length === existingBreakPos.length) {
              // We can still be off, but avoid unnecessary churn.
              // If count matches, skip unless we detect obvious mismatch.
              let mismatch = false;
              for (let i = 0; i < desiredInsertPos.length; i++) {
                // existing break positions include their own nodes; desired are before blocks.
                // If positions drift a lot, we rebuild.
                if (Math.abs((existingBreakPos[i] ?? 0) - desiredInsertPos[i]) > 4) {
                  mismatch = true;
                  break;
                }
              }
              if (!mismatch) return;
            }

            const tr = view.state.tr;
            tr.setMeta(PAGINATION_KEY, true);

            // Remove existing breaks (reverse order)
            for (let i = existingBreakPos.length - 1; i >= 0; i--) {
              const p = existingBreakPos[i]!;
              tr.delete(p, p + breakSize);
            }

            // Insert desired breaks. Positions need to be adjusted for removed breaks and prior inserts.
            // Count how many breaks were removed before each desired position.
            const removedBefore = (pos: number) =>
              existingBreakPos.reduce((acc, bp) => (bp < pos ? acc + 1 : acc), 0);

            const sortedDesired = Array.from(new Set(desiredInsertPos))
              .filter((p) => p > 1)
              .sort((a, b) => a - b);

            let inserted = 0;
            for (const pos of sortedDesired) {
              const removed = removedBefore(pos);
              const basePos = pos - removed * breakSize;
              const adjusted = basePos + inserted * breakSize;
              tr.insert(adjusted, breakNode);
              inserted++;
            }

            if (tr.docChanged) {
              applying = true;
              try {
                view.dispatch(tr);
              } finally {
                applying = false;
              }
            }
          };

          schedule(run);

          return {
            update: () => {
              schedule(run);
            },
            destroy: () => {
              if (raf != null) cancelAnimationFrame(raf);
              raf = null;
            },
          };
        },
      }),
    ];
  },
});

