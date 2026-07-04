import { useState, useEffect } from "react";
import { UploadZone } from "./components/Upload/UploadZone";
import { AppLayout } from "./components/Layout/AppLayout";
import { ApiKeyModal } from "./components/Settings/ApiKeyModal";
import { useDocumentStore } from "./store/useDocumentStore";
import { useSettingsStore } from "./store/useSettingsStore";
import { useProcessingStatus } from "./hooks/useProcessingStatus";
import { useAnnotations } from "./hooks/useAnnotations";

export default function App() {
  const { document, setDocument } = useDocumentStore();
  const { apiKey } = useSettingsStore();
  const [docId, setDocId] = useState<string | null>(null);
  const [showApiKey, setShowApiKey] = useState(!apiKey);

  useProcessingStatus(docId);
  useAnnotations(docId);

  const handleUploaded = (id: string) => {
    setDocId(id);
  };

  // Show API key modal on first load if not set
  useEffect(() => {
    if (!apiKey) setShowApiKey(true);
  }, []);

  return (
    <>
      <ApiKeyModal open={showApiKey && !document} onClose={() => setShowApiKey(false)} />
      {document ? (
        <AppLayout />
      ) : (
        <UploadZone onUploaded={handleUploaded} />
      )}
    </>
  );
}
