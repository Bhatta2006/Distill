import { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";
import { AlertTriangle, RefreshCw, Copy, Check } from "lucide-react";
import type { Diagram } from "../../types";
import clsx from "clsx";

mermaid.initialize({
  startOnLoad: false,
  theme: "neutral",
  flowchart: { htmlLabels: true, curve: "basis" },
});

const CONFIDENCE_STYLES = {
  high: "text-green-600 bg-green-50",
  medium: "text-yellow-600 bg-yellow-50",
  low: "text-red-600 bg-red-50",
};

interface Props {
  diagram: Diagram | null;
  loading?: boolean;
}

export function DiagramPanel({ diagram, loading }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [renderError, setRenderError] = useState(false);

  useEffect(() => {
    if (!diagram || !containerRef.current) return;
    setRenderError(false);
    const id = `mermaid-${diagram.id}`;
    mermaid
      .render(id, diagram.mermaid_code)
      .then(({ svg }) => {
        if (containerRef.current) containerRef.current.innerHTML = svg;
      })
      .catch(() => setRenderError(true));
  }, [diagram]);

  const copyMermaid = () => {
    if (!diagram) return;
    navigator.clipboard.writeText(diagram.mermaid_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading || !diagram) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400 text-sm">
        {loading ? "Generating diagram…" : "Diagram will appear once processing is complete"}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
        <span className="text-sm font-medium text-gray-700 capitalize">{diagram.type} diagram</span>
        <span
          className={clsx(
            "text-xs px-2 py-0.5 rounded-full font-medium",
            CONFIDENCE_STYLES[diagram.confidence]
          )}
        >
          {diagram.confidence} confidence
        </span>
        {diagram.confidence === "low" && (
          <AlertTriangle className="w-4 h-4 text-yellow-500" title="Low-confidence — treat as draft" />
        )}
        <button
          onClick={copyMermaid}
          className="ml-auto flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? "Copied!" : "Copy Mermaid"}
        </button>
      </div>

      {/* Diagram */}
      {renderError ? (
        <div className="flex flex-col items-center justify-center flex-1 gap-3 text-gray-400">
          <AlertTriangle className="w-8 h-8 text-yellow-400" />
          <p className="text-sm">Diagram render failed.</p>
          <pre className="text-xs bg-gray-50 p-3 rounded-lg max-w-md overflow-auto text-gray-500">
            {diagram.mermaid_code}
          </pre>
        </div>
      ) : (
        <div
          ref={containerRef}
          className="flex-1 overflow-auto p-6 flex items-center justify-center"
        />
      )}

      {diagram.confidence === "low" && (
        <div className="px-4 py-2.5 bg-yellow-50 border-t border-yellow-100 text-xs text-yellow-700">
          This diagram is a draft — the paper's structure may not map cleanly to a flowchart. Edit or discard as needed.
        </div>
      )}
    </div>
  );
}
