import type { Highlight } from "../../types";
import { useAnnotationStore } from "../../store/useAnnotationStore";

interface Props {
  highlights: Highlight[];
  page: number;
  scale: number;
}

const COLOR_OPACITY: Record<string, string> = {
  "#FFD700": "rgba(255,215,0,0.35)",
  "#90EE90": "rgba(144,238,144,0.35)",
  "#ADD8E6": "rgba(173,216,230,0.35)",
  "#FFB6C1": "rgba(255,182,193,0.35)",
};

export function HighlightLayer({ highlights, page, scale }: Props) {
  const { showAIHighlights } = useAnnotationStore();

  const visible = highlights.filter(
    (h) => h.page === page && (h.source === "user" || showAIHighlights)
  );

  return (
    <div className="absolute inset-0 pointer-events-none">
      {visible.map((h) =>
        h.rects.map((rect, i) => (
          <div
            key={`${h.id}-${i}`}
            className="absolute rounded-sm transition-opacity"
            style={{
              left: rect.x * scale,
              top: rect.y * scale,
              width: rect.width * scale,
              height: rect.height * scale,
              background: COLOR_OPACITY[h.color] ?? "rgba(255,215,0,0.35)",
              border: h.source === "ai" ? "none" : `1px solid ${h.color}`,
            }}
            title={h.comment || h.text.slice(0, 80)}
          />
        ))
      )}
    </div>
  );
}
