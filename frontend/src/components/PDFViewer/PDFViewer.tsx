import { useEffect, useRef, useState } from "react";
import * as pdfjs from "pdfjs-dist";
import type { PDFDocumentProxy, PDFPageProxy } from "pdfjs-dist";
import { PDFPage } from "./PDFPage";
import { useAnnotationStore } from "../../store/useAnnotationStore";
import { ChevronUp, ChevronDown, ZoomIn, ZoomOut } from "lucide-react";

// Use CDN worker to avoid bundling complexity
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface Props {
  url: string;
}

export function PDFViewer({ url }: Props) {
  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
  const [pages, setPages] = useState<PDFPageProxy[]>([]);
  const [scale, setScale] = useState(1.2);
  const [currentPage, setCurrentPage] = useState(1);
  const { highlights } = useAnnotationStore();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    pdfjs.getDocument(url).promise.then(async (doc) => {
      if (cancelled) return;
      setPdfDoc(doc);
      const loaded: PDFPageProxy[] = [];
      for (let i = 1; i <= doc.numPages; i++) {
        loaded.push(await doc.getPage(i));
      }
      if (!cancelled) setPages(loaded);
    });
    return () => { cancelled = true; };
  }, [url]);

  const zoom = (delta: number) =>
    setScale((s) => Math.max(0.5, Math.min(3, +(s + delta).toFixed(1))));

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-100 bg-white sticky top-0 z-10">
        <button onClick={() => zoom(-0.1)} className="p-1.5 rounded hover:bg-gray-100">
          <ZoomOut className="w-4 h-4 text-gray-500" />
        </button>
        <span className="text-xs text-gray-500 w-10 text-center">{Math.round(scale * 100)}%</span>
        <button onClick={() => zoom(0.1)} className="p-1.5 rounded hover:bg-gray-100">
          <ZoomIn className="w-4 h-4 text-gray-500" />
        </button>
        <span className="ml-auto text-xs text-gray-400">
          {pdfDoc ? `${currentPage} / ${pdfDoc.numPages}` : "Loading…"}
        </span>
      </div>

      {/* Pages */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto bg-gray-100 px-6 py-6 scrollbar-thin flex flex-col items-center"
        onScroll={() => {
          // Update current page indicator based on scroll position
          const els = containerRef.current?.querySelectorAll("[data-page]");
          if (!els) return;
          for (const el of Array.from(els)) {
            const rect = el.getBoundingClientRect();
            if (rect.top >= 0 && rect.top < window.innerHeight / 2) {
              setCurrentPage(Number((el as HTMLElement).dataset.page));
              break;
            }
          }
        }}
      >
        {pages.map((page, i) => (
          <div key={i} data-page={i + 1}>
            <PDFPage page={page} scale={scale} highlights={highlights} pageNum={i + 1} />
          </div>
        ))}
        {!pages.length && (
          <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
            Loading PDF…
          </div>
        )}
      </div>
    </div>
  );
}
