/**
 * Converts markdown-style text to HTML suitable for TipTap (p, strong, em, h1–h3, ul, ol, li).
 * Used when inserting Gemini/LLM responses into the document so formatting is preserved.
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function markdownToHtml(markdown: string): string {
  if (!markdown?.trim()) return "<p></p>";
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const out: string[] = [];
  let inList = false;
  let listTag = "";
  let i = 0;

  const flushList = () => {
    if (inList) {
      out.push(`</${listTag}>`);
      inList = false;
    }
  };

  const runInline = (line: string): string => {
    return escapeHtml(line)
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/__(.+?)__/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      .replace(/_(.+?)_/g, "<em>$1</em>")
      .replace(/`([^`]+)`/g, "<code>$1</code>");
  };

  while (i < lines.length) {
    const raw = lines[i];
    const trimmed = raw.trim();
    i++;

    if (!trimmed) {
      flushList();
      continue;
    }

    const h1 = /^#\s+(.+)$/.exec(trimmed);
    const h2 = /^##\s+(.+)$/.exec(trimmed);
    const h3 = /^###\s+(.+)$/.exec(trimmed);
    const ul = /^[-*]\s+(.+)$/.exec(trimmed);
    const ol = /^\d+\.\s+(.+)$/.exec(trimmed);

    if (h1) {
      flushList();
      out.push(`<h1>${runInline(h1[1])}</h1>`);
      continue;
    }
    if (h2) {
      flushList();
      out.push(`<h2>${runInline(h2[1])}</h2>`);
      continue;
    }
    if (h3) {
      flushList();
      out.push(`<h3>${runInline(h3[1])}</h3>`);
      continue;
    }
    if (ul) {
      if (!inList || listTag !== "ul") {
        flushList();
        listTag = "ul";
        inList = true;
        out.push("<ul>");
      }
      out.push(`<li>${runInline(ul[1])}</li>`);
      continue;
    }
    if (ol) {
      if (!inList || listTag !== "ol") {
        flushList();
        listTag = "ol";
        inList = true;
        out.push("<ol>");
      }
      out.push(`<li>${runInline(ol[1])}</li>`);
      continue;
    }

    flushList();
    out.push(`<p>${runInline(trimmed)}</p>`);
  }

  flushList();
  return out.length ? out.join("") : "<p></p>";
}
