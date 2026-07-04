import { useEffect, useRef } from "react";
import type { PDFPageProxy } from "pdfjs-dist";
import { HighlightLayer } from "./HighlightLayer";
import type { Highlight } from "../../types";

interface Props {
  page: PDFPageProxy;
  scale: number;
  highlights: Highlight[];
  pageNum: number;
}

export function PDFPage({ page, scale, highlights, pageNum }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const viewport = page.getViewport({ scale });
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    const ctx = canvas.getContext("2d")!;
    const task = page.render({ canvasContext: ctx, viewport });
    return () => { task.cancel(); };
  }, [page, scale]);

  const viewport = page.getViewport({ scale });

  return (
    <div
      className="relative shadow-sm mb-4 bg-white"
      style={{ width: viewport.width, height: viewport.height }}
    >
      <canvas ref={canvasRef} className="block" />
      <HighlightLayer highlights={highlights} page={pageNum} scale={scale} />
    </div>
  );
}
