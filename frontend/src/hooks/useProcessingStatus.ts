import { useEffect, useRef } from "react";
import { useDocumentStore } from "../store/useDocumentStore";
import { getDocument, getDiagram } from "../api/documents";
import type { ProcessingStatus } from "../types";

const TERMINAL = new Set(["ready", "failed"]);

const STATUS_PROGRESS: Record<string, number> = {
  queued: 0.05, parsing: 0.15, segmenting: 0.30,
  summarizing: 0.55, diagramming: 0.75, embedding: 0.90,
  ready: 1.0, failed: 1.0,
};
const STATUS_MESSAGES: Record<string, string> = {
  queued: "Queued for processing…", parsing: "Parsing PDF layout…",
  segmenting: "Detecting sections…", summarizing: "Summarizing & highlighting…",
  diagramming: "Generating method diagram…", embedding: "Indexing for chat…",
  ready: "Ready!", failed: "Processing failed.",
};

export function useProcessingStatus(docId: string | null) {
  const { setProcessingStatus, setDocument, setDiagram } = useDocumentStore();
  const cleanupRef = useRef<() => void>(() => {});

  useEffect(() => {
    if (!docId) return;

    let cancelled = false;

    const onReady = async () => {
      if (cancelled) return;
      const [doc, diagram] = await Promise.allSettled([getDocument(docId), getDiagram(docId)]);
      if (doc.status === "fulfilled") setDocument(doc.value);
      if (diagram.status === "fulfilled") setDiagram(diagram.value);
      setProcessingStatus(null);
    };

    const onStatus = (status: string) => {
      if (cancelled) return;
      setProcessingStatus({
        stage: status,
        progress: STATUS_PROGRESS[status] ?? 0,
        message: STATUS_MESSAGES[status] ?? status,
      });
      if (status === "ready") onReady();
    };

    // ── Try WebSocket first (Docker), fall back to polling (Vercel) ──────────
    let ws: WebSocket | null = null;
    let pollTimer: ReturnType<typeof setInterval> | null = null;

    const startPolling = () => {
      pollTimer = setInterval(async () => {
        if (cancelled) { clearInterval(pollTimer!); return; }
        try {
          const doc = await getDocument(docId);
          onStatus(doc.status);
          if (TERMINAL.has(doc.status)) clearInterval(pollTimer!);
        } catch { /* network hiccup — keep polling */ }
      }, 3000);
    };

    try {
      const proto = window.location.protocol === "https:" ? "wss" : "ws";
      ws = new WebSocket(`${proto}://${window.location.host}/ws/documents/${docId}`);

      ws.onmessage = (e) => {
        const data: { stage?: string; error?: string } = JSON.parse(e.data);
        if (data.stage) onStatus(data.stage);
        if (data.stage && TERMINAL.has(data.stage)) ws?.close();
      };

      // WebSocket not available (Vercel serverless) → fall back to polling
      ws.onerror = () => { ws?.close(); startPolling(); };
    } catch {
      startPolling();
    }

    cleanupRef.current = () => {
      cancelled = true;
      ws?.close();
      if (pollTimer) clearInterval(pollTimer);
    };
    return cleanupRef.current;
  }, [docId]);
}
