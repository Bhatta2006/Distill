import { useState } from "react";
import { ChevronDown, ChevronUp, FileText } from "lucide-react";
import type { Section } from "../../types";
import clsx from "clsx";

const SECTION_COLORS: Record<string, string> = {
  abstract: "bg-purple-50 text-purple-700 border-purple-200",
  introduction: "bg-blue-50 text-blue-700 border-blue-200",
  method: "bg-green-50 text-green-700 border-green-200",
  experiments: "bg-orange-50 text-orange-700 border-orange-200",
  results: "bg-yellow-50 text-yellow-700 border-yellow-200",
  discussion: "bg-pink-50 text-pink-700 border-pink-200",
  conclusion: "bg-indigo-50 text-indigo-700 border-indigo-200",
  other: "bg-gray-50 text-gray-600 border-gray-200",
};

interface SectionCardProps {
  section: Section;
}

function SectionCard({ section }: SectionCardProps) {
  const [open, setOpen] = useState(section.type === "abstract");
  const colorClass = SECTION_COLORS[section.type] ?? SECTION_COLORS.other;

  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-gray-50 transition-colors"
      >
        <span className={clsx("text-xs font-medium px-2 py-0.5 rounded-full border", colorClass)}>
          {section.type.replace("_", " ")}
        </span>
        <span className="flex-1 text-sm font-medium text-gray-800 truncate">{section.title}</span>
        <span className="text-xs text-gray-400">p.{section.page_start}</span>
        {open ? (
          <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
        )}
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3">
          {section.summary ? (
            <p className="text-sm text-gray-600 leading-relaxed reading-surface">{section.summary}</p>
          ) : (
            <p className="text-sm text-gray-400 italic">Summary pending…</p>
          )}
          {section.highlights.length > 0 && (
            <div className="text-xs text-gray-400 flex items-center gap-1">
              <FileText className="w-3 h-3" />
              {section.highlights.length} key sentence{section.highlights.length !== 1 ? "s" : ""} highlighted
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface Props {
  sections: Section[];
}

export function SummaryPanel({ sections }: Props) {
  if (!sections.length) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400 text-sm">
        Summaries will appear as the paper processes…
      </div>
    );
  }

  return (
    <div className="space-y-2 p-4 overflow-y-auto h-full scrollbar-thin">
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
        Section Summaries
      </h3>
      {sections.map((s) => (
        <SectionCard key={s.id} section={s} />
      ))}
    </div>
  );
}
