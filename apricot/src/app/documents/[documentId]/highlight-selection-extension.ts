"use client";

import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";

const HIGHLIGHT_PLUGIN_KEY = new PluginKey("aiHighlightSelection");

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    aiHighlightSelection: {
      setHighlightRange: (from: number, to: number) => ReturnType;
      clearHighlightRange: () => ReturnType;
    };
  }
}

export const HighlightSelectionExtension = Extension.create({
  name: "aiHighlightSelection",

  addCommands() {
    return {
      setHighlightRange:
        (from: number, to: number) =>
        ({ tr }) => {
          tr.setMeta(HIGHLIGHT_PLUGIN_KEY, { from, to });
          return true;
        },
      clearHighlightRange:
        () =>
        ({ tr }) => {
          tr.setMeta(HIGHLIGHT_PLUGIN_KEY, null);
          return true;
        },
    };
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: HIGHLIGHT_PLUGIN_KEY,
        state: {
          init(_, state) {
            return null as { from: number; to: number } | null;
          },
          apply(tr, value, oldState, newState) {
            const meta = tr.getMeta(HIGHLIGHT_PLUGIN_KEY);
            if (meta === null) return null;
            if (meta && typeof meta.from === "number" && typeof meta.to === "number") {
              return { from: meta.from, to: meta.to };
            }
            if (value && tr.docChanged) {
              const { from, to } = value;
              const mappedFrom = tr.mapping.map(from);
              const mappedTo = tr.mapping.map(to);
              if (mappedFrom >= mappedTo) return null;
              return { from: mappedFrom, to: mappedTo };
            }
            return value;
          },
        },
        props: {
          decorations(state) {
            const pluginState = HIGHLIGHT_PLUGIN_KEY.getState(state);
            if (!pluginState || pluginState.from === pluginState.to) {
              return DecorationSet.empty;
            }
            const { from, to } = pluginState;
            const deco = Decoration.inline(from, to, {
              class: "ai-selection-highlight",
            });
            return DecorationSet.create(state.doc, [deco]);
          },
        },
      }),
    ];
  },
});
