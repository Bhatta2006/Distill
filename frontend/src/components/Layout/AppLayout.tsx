import { useState } from "react";
import { Key, Download, BookOpen, GitBranch, MessageSquare, LayoutPanelLeft, Loader2 } from "lucide-react";
import { PDFViewer } from "../PDFViewer/PDFViewer";
import { AnnotationToolbar } from "../Annotation/AnnotationToolbar";
import { SummaryPanel } from "../Summary/SummaryPanel";
import { DiagramPanel } from "../Diagram/DiagramPanel";
import { ChatPanel } from "../Chat/ChatPanel";
import { ExportModal } from "../Export/ExportModal";
import { ApiKeyModal } from "../Settings/ApiKeyModal";
import { useDocumentStore } from "../../store/useDocumentStore";
import { useAnnotationStore } from "../../store/useAnnotationStore";
import { getDocumentFileUrl } from "../../api/documents";
import clsx from "clsx";

type SideTab = "summary" | "diagram" | "chat";

const SIDE_TABS: { id: SideTab; icon: React.FC<{ className?: string }>; label: string }[] = [
  { id: "summary", icon: BookOpen, label: "Summary" },
  { id: "diagram", icon: GitBranch, label: "Diagram" },
  { id: "chat", icon: MessageSquare, label: "Chat" },
];

export function AppLayout() {
  const { document, diagram, processingStatus, activeTab, setActiveTab } = useDocumentStore();
  const [exportOpen, setExportOpen] = useState(false);
  const [apiKeyOpen, setApiKeyOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const isProcessing = !!processingStatus;

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Top bar */}
      <header className="h-12 flex items-center gap-4 px-4 border-b border-gray-100 bg-white shrink-0">
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-400 hover:text-gray-600">
          <LayoutPanelLeft className="w-4 h-4" />
        </button>

        <span className="font-semibold text-gray-900 text-sm">Lucid</span>
        {document && (
          <span className="text-gray-400 text-sm truncate max-w-xs">{document.title || document.filename}</span>
        )}

        {isProcessing && (
          <div className="flex items-center gap-2 text-xs text-accent ml-2">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>{processingStatus.message}</span>
            <div className="w-24 h-1 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-accent rounded-full transition-all duration-500"
                style={{ width: `${processingStatus.progress * 100}%` }}
              />
            </div>
          </div>
        )}

        <div className="ml-auto flex items-center gap-2">
          {document?.status === "ready" && (
            <button
              onClick={() => setExportOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-accent rounded-lg hover:bg-indigo-600 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Export
            </button>
          )}
          <button
            onClick={() => setApiKeyOpen(true)}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            title="API Key Settings"
          >
            <Key className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-1 min-h-0">
        {/* Annotation toolbar */}
        <AnnotationToolbar />

        {/* PDF viewer */}
        <div className="flex-1 min-w-0">
          {document ? (
            <PDFViewer url={getDocumentFileUrl(document.id)} />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              Upload a paper to get started
            </div>
          )}
        </div>

        {/* Sidebar */}
        {sidebarOpen && (
          <div className="w-80 border-l border-gray-100 flex flex-col bg-white shrink-0">
            {/* Tab bar */}
            <div className="flex border-b border-gray-100">
              {SIDE_TABS.map(({ id, icon: Icon, label }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={clsx(
                    "flex-1 flex flex-col items-center gap-0.5 py-2.5 text-xs font-medium transition-colors border-b-2",
                    activeTab === id
                      ? "border-accent text-accent"
                      : "border-transparent text-gray-400 hover:text-gray-600"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="flex-1 min-h-0">
              {activeTab === "summary" && <SummaryPanel sections={document?.sections ?? []} />}
              {activeTab === "diagram" && (
                <DiagramPanel diagram={diagram} loading={isProcessing} />
              )}
              {activeTab === "chat" && document?.status === "ready" && (
                <ChatPanel docId={document.id} />
              )}
              {activeTab === "chat" && document?.status !== "ready" && (
                <div className="flex items-center justify-center h-full text-gray-400 text-sm p-6 text-center">
                  Chat will be available once the paper finishes processing
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {document && <ExportModal docId={document.id} open={exportOpen} onClose={() => setExportOpen(false)} />}
      <ApiKeyModal open={apiKeyOpen} onClose={() => setApiKeyOpen(false)} />
    </div>
  );
}
