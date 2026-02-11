/**
 * Paper size dimensions at 96 DPI (1 inch = 96px).
 * Used for editor layout and print.
 */
export type PaperFormatId = "a4" | "letter" | "legal";

export const PAPER_FORMATS: Record<
  PaperFormatId,
  { id: PaperFormatId; label: string; widthPx: number; heightPx: number; widthMm: number; heightMm: number }
> = {
  a4: {
    id: "a4",
    label: "A4",
    widthPx: 794,
    heightPx: 1123,
    widthMm: 210,
    heightMm: 297,
  },
  letter: {
    id: "letter",
    label: "Letter (short)",
    widthPx: 816,
    heightPx: 1056,
    widthMm: 215.9,
    heightMm: 279.4,
  },
  legal: {
    id: "legal",
    label: "Legal",
    widthPx: 816,
    heightPx: 1344,
    widthMm: 215.9,
    heightMm: 355.6,
  },
};

export const DEFAULT_PAPER_FORMAT: PaperFormatId = "a4";
