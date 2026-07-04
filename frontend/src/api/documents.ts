import client from "./client";
import type { Document, Diagram } from "../types";

export const uploadDocument = async (file: File): Promise<Document> => {
  const form = new FormData();
  form.append("file", file);
  const { data } = await client.post<Document>("/documents/upload", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export const getDocument = async (id: string): Promise<Document> => {
  const { data } = await client.get<Document>(`/documents/${id}`);
  return data;
};

export const getDocumentFileUrl = (id: string) => `/api/documents/${id}/file`;

export const getDiagram = async (id: string): Promise<Diagram> => {
  const { data } = await client.get<Diagram>(`/documents/${id}/diagram`);
  return data;
};
