"use client";

import type { Node } from "@tiptap/pm/model";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { TextSelection } from "@tiptap/pm/state";
import Document from "@tiptap/extension-document";

const NORMALIZE_KEY = new PluginKey("docWithPagesNormalize");
const REMOVE_EMPTY_PAGE_KEY = new PluginKey("removeEmptyPageWhenMovingBack");
const LOAD_NEXT_PAGE_AT_EDGE_KEY = new PluginKey("loadNextPageAtEdge");

/** Px from bottom of page to consider "at edge" and load next page */
const EDGE_THRESHOLD_PX = 80;

function getPageIndexAt(doc: Node, pos: number): number {
  let offset = 1;
  for (let i = 0; i < doc.childCount; i++) {
    const node = doc.child(i);
    if (pos >= offset && pos < offset + node.nodeSize) return i;
    offset += node.nodeSize;
  }
  return Math.max(0, doc.childCount - 1);
}

function getPageStartPos(doc: Node, pageIndex: number): number {
  let pos = 1;
  for (let j = 0; j < pageIndex; j++) pos += doc.child(j).nodeSize;
  return pos;
}

function isPageEmpty(pageNode: Node): boolean {
  for (let i = 0; i < pageNode.childCount; i++) {
    const child = pageNode.child(i);
    if (child.type.name === "paragraph" && (!child.content || child.content.size === 0))
      continue;
    return false;
  }
  return true;
}

function readPageHeightPx(dom: HTMLElement): number {
  const raw = getComputedStyle(dom).getPropertyValue("--editor-page-height").trim();
  const n = Number.parseInt(raw.replace("px", ""), 10);
  return Number.isFinite(n) && n > 0 ? n : 1123;
}

/**
 * Document whose top-level content is a sequence of page nodes (cards).
 * Use with PageNode so doc has content "page+".
 */
export const DocumentWithPages = Document.extend({
  content: "page+",

  addProseMirrorPlugins() {
    const pageType = this.type;
    return [
      new Plugin({
        key: NORMALIZE_KEY,
        appendTransaction(tr, _oldState, state) {
          if (!tr.docChanged) return null;
          const doc = state.doc;
          const schema = state.schema;
          const page = schema.nodes.page;
          const paragraph = schema.nodes.paragraph;
          if (!page || !paragraph) return null;
          if (doc.childCount === 0) {
            const emptyPage = page.create(null, [paragraph.create()]);
            return state.tr.replaceWith(0, 0, emptyPage);
          }
          const first = doc.firstChild;
          if (first && first.type === pageType) return null;
          const builder = state.tr;
          const pageNode = page.create(null, doc.content);
          builder.replaceWith(0, doc.content.size, pageNode);
          return builder;
        },
      }),
      new Plugin({
        key: REMOVE_EMPTY_PAGE_KEY,
        appendTransaction(tr, oldState, state) {
          if (!tr.selectionSet) return null;
          const doc = state.doc;
          if (doc.childCount <= 1) return null;
          const oldFrom = oldState.selection.from;
          const newFrom = state.selection.from;
          const oldPageIndex = getPageIndexAt(oldState.doc, oldFrom);
          const newPageIndex = getPageIndexAt(doc, newFrom);
          if (newPageIndex >= oldPageIndex) return null;
          const leftPageIndex = oldPageIndex;
          const pageWeLeft = doc.child(leftPageIndex);
          if (!pageWeLeft || pageWeLeft.type !== pageType) return null;
          if (!isPageEmpty(pageWeLeft)) return null;
          let start = 1;
          for (let i = 0; i < leftPageIndex; i++) start += doc.child(i).nodeSize;
          const end = start + pageWeLeft.nodeSize;
          return state.tr.delete(start, end);
        },
      }),
      new Plugin({
        key: LOAD_NEXT_PAGE_AT_EDGE_KEY,
        view(view) {
          let raf: number | null = null;
          const run = () => {
            const state = view.state;
            const doc = state.doc;
            const schema = state.schema;
            const pageType = schema.nodes.page;
            const paragraph = schema.nodes.paragraph;
            if (!pageType || !paragraph || doc.childCount === 0) return;
            const from = state.selection.from;
            const pageIndex = getPageIndexAt(doc, from);
            if (pageIndex !== doc.childCount - 1) return;
            const pageStartPos = getPageStartPos(doc, pageIndex);
            let pageTop: number;
            let cursorBottom: number;
            let pageHeight: number;
            try {
              const pageCoords = view.coordsAtPos(pageStartPos);
              const cursorCoords = view.coordsAtPos(from);
              pageTop = pageCoords.top;
              cursorBottom = cursorCoords.bottom;
              pageHeight = readPageHeightPx(view.dom as HTMLElement);
            } catch {
              return;
            }
            const pageBottom = pageTop + pageHeight;
            if (cursorBottom < pageBottom - EDGE_THRESHOLD_PX) return;
            const newPage = pageType.create(null, [paragraph.create()]);
            const insertPos = doc.content.size;
            const tr = state.tr.insert(insertPos, newPage);
            const sel = TextSelection.create(tr.doc, insertPos + 2);
            tr.setSelection(sel);
            view.dispatch(tr);
          };
          const schedule = () => {
            if (raf != null) cancelAnimationFrame(raf);
            raf = requestAnimationFrame(() => {
              raf = requestAnimationFrame(() => {
                raf = null;
                run();
              });
            });
          };
          schedule();
          return {
            update() {
              schedule();
            },
            destroy() {
              if (raf != null) cancelAnimationFrame(raf);
            },
          };
        },
      }),
    ];
  },
});
