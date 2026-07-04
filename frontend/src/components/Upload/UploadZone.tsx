import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, Loader2 } from "lucide-react";
import { uploadDocument } from "../../api/documents";
import { useDocumentStore } from "../../store/useDocumentStore";

interface Props {
  onUploaded: (docId: string) => void;
}

export function UploadZone({ onUploaded }: Props) {
  const { setDocument, processingStatus } = useDocumentStore();
  const isUploading = processingStatus !== null;

  const onDrop = useCallback(
    async (files: File[]) => {
      const file = files[0];
      if (!file) return;
      const doc = await uploadDocument(file);
      setDocument(doc);
      onUploaded(doc.id);
    },
    [onUploaded, setDocument]
  );

  const { getRootProps, getInputProps, isDragActive, isFileDialogActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    disabled: isUploading,
  });

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Lucid</h1>
        <p className="text-gray-500 text-base">
          Upload a research paper. Get highlights, a diagram, and a chatbot — instantly.
        </p>
      </div>

      <div
        {...getRootProps()}
        className={`
          w-full max-w-lg border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer
          transition-all duration-200 bg-white
          ${isDragActive || isFileDialogActive
            ? "border-accent bg-accent-light scale-[1.02]"
            : "border-gray-200 hover:border-accent hover:bg-accent-light/30"
          }
          ${isUploading ? "opacity-50 cursor-not-allowed" : ""}
        `}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-4">
          {isUploading ? (
            <Loader2 className="w-10 h-10 text-accent animate-spin" />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-accent-light flex items-center justify-center">
              <Upload className="w-8 h-8 text-accent" />
            </div>
          )}
          <div>
            <p className="font-medium text-gray-900">
              {isDragActive ? "Drop the PDF here" : "Drag & drop a PDF"}
            </p>
            <p className="text-sm text-gray-500 mt-1">or click to browse — up to 50MB</p>
          </div>
        </div>
      </div>

      <div className="mt-8 flex items-center gap-6 text-sm text-gray-400">
        {["Auto-highlights", "Method diagram", "Chat with paper", "Export"].map((f) => (
          <span key={f} className="flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5" />
            {f}
          </span>
        ))}
      </div>
    </div>
  );
}
