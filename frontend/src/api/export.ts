import client from "./client";
import type { ExportJob } from "../types";

export const triggerExport = async (
  docId: string,
  format: "pdf" | "markdown" | "docx"
): Promise<ExportJob> => {
  const { data } = await client.post<ExportJob>(`/export/${docId}`, { format });
  return data;
};

export const getExportJob = async (jobId: string): Promise<ExportJob> => {
  const { data } = await client.get<ExportJob>(`/export/jobs/${jobId}`);
  return data;
};

export const getDownloadUrl = (jobId: string) => `/api/export/jobs/${jobId}/download`;
