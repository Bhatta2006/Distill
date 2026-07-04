import { create } from "zustand";
import type { Highlight, Drawing } from "../types";

type Tool = "select" | "highlight" | "pen" | "eraser" | "comment";

interface AnnotationState {
  highlights: Highlight[];
  drawings: Drawing[];
  activeTool: Tool;
  activeColor: string;
  showAIHighlights: boolean;

  setHighlights: (hs: Highlight[]) => void;
  addHighlight: (h: Highlight) => void;
  updateHighlight: (id: string, partial: Partial<Highlight>) => void;
  removeHighlight: (id: string) => void;

  setDrawings: (ds: Drawing[]) => void;
  upsertDrawing: (d: Drawing) => void;

  setActiveTool: (t: Tool) => void;
  setActiveColor: (c: string) => void;
  toggleAIHighlights: () => void;
}

export const useAnnotationStore = create<AnnotationState>((set) => ({
  highlights: [],
  drawings: [],
  activeTool: "select",
  activeColor: "#FFD700",
  showAIHighlights: true,

  setHighlights: (hs) => set({ highlights: hs }),
  addHighlight: (h) => set((s) => ({ highlights: [...s.highlights, h] })),
  updateHighlight: (id, partial) =>
    set((s) => ({
      highlights: s.highlights.map((h) => (h.id === id ? { ...h, ...partial } : h)),
    })),
  removeHighlight: (id) =>
    set((s) => ({ highlights: s.highlights.filter((h) => h.id !== id) })),

  setDrawings: (ds) => set({ drawings: ds }),
  upsertDrawing: (d) =>
    set((s) => ({
      drawings: s.drawings.some((x) => x.id === d.id)
        ? s.drawings.map((x) => (x.id === d.id ? d : x))
        : [...s.drawings, d],
    })),

  setActiveTool: (t) => set({ activeTool: t }),
  setActiveColor: (c) => set({ activeColor: c }),
  toggleAIHighlights: () => set((s) => ({ showAIHighlights: !s.showAIHighlights })),
}));
