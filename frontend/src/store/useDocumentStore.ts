import { create } from "zustand";
import type { Document, ProcessingStatus, Diagram } from "../types";

interface DocumentState {
  document: Document | null;
  diagram: Diagram | null;
  processingStatus: ProcessingStatus | null;
  activeTab: "summary" | "diagram" | "chat";

  setDocument: (doc: Document) => void;
  updateDocument: (partial: Partial<Document>) => void;
  setDiagram: (d: Diagram | null) => void;
  setProcessingStatus: (s: ProcessingStatus | null) => void;
  setActiveTab: (tab: "summary" | "diagram" | "chat") => void;
  reset: () => void;
}

const initial = {
  document: null,
  diagram: null,
  processingStatus: null,
  activeTab: "summary" as const,
};

export const useDocumentStore = create<DocumentState>((set) => ({
  ...initial,
  setDocument: (doc) => set({ document: doc }),
  updateDocument: (partial) =>
    set((s) => ({ document: s.document ? { ...s.document, ...partial } : null })),
  setDiagram: (d) => set({ diagram: d }),
  setProcessingStatus: (s) => set({ processingStatus: s }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  reset: () => set(initial),
}));
