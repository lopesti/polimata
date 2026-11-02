"use client";

import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";

export type WikiSuggestion = { id: string; title: string };

/**
 * Detects [[ partial query and exposes via callback for UI overlay.
 * Actual mark insertion handled by parent when user picks a suggestion.
 */
export const WikiAutocomplete = Extension.create<{
  onQuery: (q: string | null, from: number, to: number) => void;
}>({
  name: "wikiAutocomplete",

  addOptions() {
    return {
      onQuery: () => {},
    };
  },

  addProseMirrorPlugins() {
    const onQuery = this.options.onQuery;
    return [
      new Plugin({
        key: new PluginKey("wikiAutocomplete"),
        view() {
          return {
            update(view) {
              const { state } = view;
              const { from } = state.selection;
              const textBefore = state.doc.textBetween(
                Math.max(0, from - 60),
                from,
                "\n"
              );
              const m = textBefore.match(/\[\[([^\]]*)$/);
              if (m) {
                onQuery(m[1] ?? "", from - (m[1]?.length ?? 0) - 2, from);
              } else {
                onQuery(null, from, from);
              }
            },
          };
        },
      }),
    ];
  },
});
