"use client";

import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";

const SUGGESTION_RANGES_PLUGIN_KEY = new PluginKey("suggestionRanges");

type RangeEntry = { id: string; from: number; to: number };

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    suggestionRanges: {
      setSuggestionRanges: (ranges: { id: string; from: number; to: number }[]) => ReturnType;
      removeSuggestionRange: (id: string) => ReturnType;
    };
  }
}

export const SuggestionRangesExtension = Extension.create({
  name: "suggestionRanges",

  addCommands() {
    return {
      setSuggestionRanges:
        (ranges: { id: string; from: number; to: number }[]) =>
        ({ tr }) => {
          tr.setMeta(SUGGESTION_RANGES_PLUGIN_KEY, { set: ranges });
          return true;
        },
      removeSuggestionRange:
        (id: string) =>
        ({ tr }) => {
          tr.setMeta(SUGGESTION_RANGES_PLUGIN_KEY, { remove: id });
          return true;
        },
    };
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: SUGGESTION_RANGES_PLUGIN_KEY,
        state: {
          init() {
            return [] as RangeEntry[];
          },
          apply(tr, value: RangeEntry[]) {
            const meta = tr.getMeta(SUGGESTION_RANGES_PLUGIN_KEY) as
              | { set?: RangeEntry[]; remove?: string }
              | undefined;
            if (meta?.set !== undefined) return meta.set;
            if (meta?.remove !== undefined) return value.filter((r) => r.id !== meta.remove);
            if (value.length === 0 || !tr.docChanged) return value;
            return value
              .map(({ id, from, to }) => ({
                id,
                from: tr.mapping.map(from),
                to: tr.mapping.map(to),
              }))
              .filter(({ from, to }) => from < to);
          },
        },
        props: {
          decorations(state) {
            const ranges = SUGGESTION_RANGES_PLUGIN_KEY.getState(state) as RangeEntry[] | undefined;
            if (!ranges?.length) return DecorationSet.empty;
            const decos = ranges.flatMap(({ from, to }) => {
              if (from >= to) return [];
              return [
                Decoration.inline(from, to, {
                  class: "suggestion-range-highlight",
                }),
              ];
            });
            return DecorationSet.create(state.doc, decos);
          },
        },
      }),
    ];
  },
});
