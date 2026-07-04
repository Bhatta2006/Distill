import { useState } from "react";
import { Download, FileText, FileCode, File, Loader2, CheckCircle, X } from "lucide-react";
import { triggerExport, getExportJob, getDownloadUrl } from "../../api/export";
import type { ExportJob } from "../../types";
import clsx from "clsx";

const FORMATS = [
  { id: "pdf" as const, label: "PDF", desc: "Highlights + diagram + notes baked in", icon: File },
  { id: "markdown" as const, label: "Markdown", desc: "Summaries + Mermaid diagram code", icon: FileCode },
  { id: "docx" as const, label: "Word (.docx)", desc: "Editable summary document", icon: FileText },
];

interface Props {
  docId: string;
  open: boolean;
  onClose: () => void;
}

export function ExportModal({ docId, open, onClose }: Props) {
  const [selected, setSelected] = useState<"pdf" | "markdown" | "docx">("pdf");
  const [job, setJob] = useState<ExportJob | null>(null);
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleExport = async () => {
    setLoading(true);
    try {
      const j = await triggerExport(docId, selected);
      setJob(j);
      // Poll for completion
      const poll = setInterval(async () => {
        const updated = await getExportJob(j.id);
        setJob(updated);
        if (updated.status === "done" || updated.status === "failed") {
          clearInterval(poll);
          setLoading(false);
        }
      }, 2000);
    } catch {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setJob(null);
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-accent-light flex items-center justify-center">
              <Download className="w-4 h-4 text-accent" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Export Paper</h2>
          </div>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {!job ? (
          <>
            <div className="space-y-2 mb-6">
              {FORMATS.map(({ id, label, desc, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setSelected(id)}
                  className={clsx(
                    "w-full flex items-center gap-3 p-4 rounded-xl border text-left transition-colors",
                    selected === id
                      ? "border-accent bg-accent-light"
                      : "border-gray-100 hover:border-gray-200 hover:bg-gray-50"
                  )}
                >
                  <Icon className={clsx("w-5 h-5 shrink-0", selected === id ? "text-accent" : "text-gray-400")} />
                  <div>
                    <p className={clsx("text-sm font-medium", selected === id ? "text-accent" : "text-gray-800")}>{label}</p>
                    <p className="text-xs text-gray-500">{desc}</p>
                  </div>
                </button>
              ))}
            </div>

            <button
              onClick={handleExport}
              disabled={loading}
              className="w-full py-3 bg-accent text-white rounded-xl font-medium text-sm hover:bg-indigo-600 disabled:opacity-40 transition-colors"
            >
              Export as {selected.toUpperCase()}
            </button>
          </>
        ) : (
          <div className="text-center space-y-4">
            {job.status === "done" ? (
              <>
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
                <p className="text-gray-700 font-medium">Your export is ready!</p>
                <a
                  href={getDownloadUrl(job.id)}
                  download
                  className="inline-block px-6 py-2.5 bg-accent text-white rounded-xl text-sm font-medium hover:bg-indigo-600 transition-colors"
                >
                  Download {job.format.toUpperCase()}
                </a>
              </>
            ) : job.status === "failed" ? (
              <>
                <p className="text-red-500">Export failed. Please try again.</p>
                <button onClick={() => setJob(null)} className="text-accent text-sm hover:underline">
                  Try again
                </button>
              </>
            ) : (
              <>
                <Loader2 className="w-10 h-10 text-accent animate-spin mx-auto" />
                <p className="text-gray-600 text-sm">Generating your export…</p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
