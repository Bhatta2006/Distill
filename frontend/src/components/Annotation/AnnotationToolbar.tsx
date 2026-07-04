import { MousePointer2, Highlighter, Pen, Eraser, MessageSquare, Eye, EyeOff } from "lucide-react";
import { useAnnotationStore } from "../../store/useAnnotationStore";
import clsx from "clsx";

const COLORS = ["#FFD700", "#90EE90", "#ADD8E6", "#FFB6C1"];

type Tool = "select" | "highlight" | "pen" | "eraser" | "comment";

const TOOLS: { id: Tool; icon: React.FC<{ className?: string }>; label: string }[] = [
  { id: "select", icon: MousePointer2, label: "Select" },
  { id: "highlight", icon: Highlighter, label: "Highlight" },
  { id: "pen", icon: Pen, label: "Freehand" },
  { id: "eraser", icon: Eraser, label: "Eraser" },
  { id: "comment", icon: MessageSquare, label: "Comment" },
];

export function AnnotationToolbar() {
  const { activeTool, setActiveTool, activeColor, setActiveColor, showAIHighlights, toggleAIHighlights } =
    useAnnotationStore();

  return (
    <div className="flex flex-col gap-3 p-3 bg-white border-r border-gray-100 h-full">
      {/* Tools */}
      <div className="flex flex-col gap-1">
        {TOOLS.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => setActiveTool(id)}
            title={label}
            className={clsx(
              "w-9 h-9 flex items-center justify-center rounded-lg transition-colors",
              activeTool === id
                ? "bg-accent text-white"
                : "text-gray-500 hover:bg-gray-100"
            )}
          >
            <Icon className="w-4 h-4" />
          </button>
        ))}
      </div>

      <div className="h-px bg-gray-100 mx-1" />

      {/* Colors */}
      <div className="flex flex-col gap-1.5">
        {COLORS.map((c) => (
          <button
            key={c}
            onClick={() => setActiveColor(c)}
            className={clsx(
              "w-6 h-6 rounded-full mx-1.5 transition-transform",
              activeColor === c && "ring-2 ring-offset-1 ring-accent scale-110"
            )}
            style={{ background: c }}
          />
        ))}
      </div>

      <div className="h-px bg-gray-100 mx-1" />

      {/* AI highlights toggle */}
      <button
        onClick={toggleAIHighlights}
        title={showAIHighlights ? "Hide AI highlights" : "Show AI highlights"}
        className={clsx(
          "w-9 h-9 flex items-center justify-center rounded-lg transition-colors",
          showAIHighlights ? "bg-yellow-50 text-yellow-600" : "text-gray-400 hover:bg-gray-100"
        )}
      >
        {showAIHighlights ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
      </button>
    </div>
  );
}
