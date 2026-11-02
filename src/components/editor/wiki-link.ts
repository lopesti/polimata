import { Mark, mergeAttributes } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";

/**
 * Simple wiki-link mark: [[Note Title]]
 * Renders as a link-like mark. Click navigation handled outside.
 */
export const WikiLink = Mark.create({
  name: "wikiLink",

  addAttributes() {
    return {
      title: {
        default: null,
        parseHTML: (el) => el.getAttribute("data-title"),
        renderHTML: (attrs) => ({ "data-title": attrs.title }),
      },
    };
  },

  parseHTML() {
    return [{ tag: "span[data-wiki-link]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "span",
      mergeAttributes(HTMLAttributes, {
        "data-wiki-link": "",
        class:
          "rounded bg-blue-50 px-1 text-blue-700 cursor-pointer dark:bg-blue-950 dark:text-blue-300",
      }),
      0,
    ];
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey("wikiLinkInput"),
        props: {
          // Detect ]] to close a wiki link started with [[
          handleTextInput(view, from, to, text) {
            if (text !== "]") return false;
            const { state } = view;
            const $from = state.doc.resolve(from);
            const textBefore = $from.parent.textBetween(
              Math.max(0, $from.parentOffset - 80),
              $from.parentOffset,
              undefined,
              "\ufffc"
            );
            const match = textBefore.match(/\[\[([^\]]+)$/);
            if (!match) return false;

            // User typed first ]; wait for second ] handled next key — simpler: on ]] 
            return false;
          },
        },
      }),
    ];
  },
});

/** Convert [[Title]] plain text patterns into wikiLink marks in HTML string (post-process) */
export function linkifyWikiSyntax(html: string): string {
  return html.replace(/\[\[([^\]]+)\]\]/g, (_m, title: string) => {
    const safe = title.replace(/"/g, "&quot;");
    return `<span data-wiki-link data-title="${safe}" class="rounded bg-blue-50 px-1 text-blue-700 dark:bg-blue-950 dark:text-blue-300">[[${title}]]</span>`;
  });
}
