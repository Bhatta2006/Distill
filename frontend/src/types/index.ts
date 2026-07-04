export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Highlight {
  id: string;
  document_id: string;
  page: number;
  rects: Rect[];
  text: string;
  color: string;
  source: "ai" | "user";
  comment?: string | null;
  created_at?: string;
}

export interface Section {
  id: string;
  type: string;
  title: string;
  page_start: number;
  page_end: number;
  order_idx: number;
  summary?: string | null;
  highlights: Highlight[];
}

export interface Document {
  id: string;
  filename: string;
  status: DocumentStatus;
  error?: string | null;
  page_count?: number | null;
  title?: string | null;
  sections: Section[];
  created_at: string;
}

export type DocumentStatus =
  | "queued"
  | "parsing"
  | "segmenting"
  | "summarizing"
  | "diagramming"
  | "embedding"
  | "ready"
  | "failed";

export interface Drawing {
  id: string;
  document_id: string;
  page: number;
  canvas_data: string;
  created_at: string;
  updated_at: string;
}

export interface Citation {
  page: number;
  text: string;
  rect?: Rect | null;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations: Citation[];
}

export interface Diagram {
  id: string;
  document_id: string;
  type: "pipeline" | "architecture" | "experiment";
  mermaid_code: string;
  confidence: "high" | "medium" | "low";
  raw_graph?: Record<string, unknown> | null;
}

export interface ExportJob {
  id: string;
  document_id: string;
  format: "pdf" | "markdown" | "docx";
  status: "pending" | "processing" | "done" | "failed";
  download_url?: string | null;
}

export interface ProcessingStatus {
  stage: string;
  progress: number;
  message: string;
}
