import client from "./client";
import type { Highlight, Drawing, Rect } from "../types";

interface AnnotationsResponse {
  highlights: Highlight[];
  drawings: Drawing[];
}

export const getAnnotations = async (docId: string): Promise<AnnotationsResponse> => {
  const { data } = await client.get<AnnotationsResponse>(`/annotations/${docId}`);
  return data;
};

export const createHighlight = async (params: {
  document_id: string;
  page: number;
  rects: Rect[];
  text: string;
  color?: string;
  comment?: string;
}): Promise<Highlight> => {
  const { data } = await client.post<Highlight>("/annotations/highlights", params);
  return data;
};

export const updateHighlight = async (
  id: string,
  updates: { color?: string; comment?: string }
): Promise<Highlight> => {
  const { data } = await client.patch<Highlight>(`/annotations/highlights/${id}`, updates);
  return data;
};

export const deleteHighlight = async (id: string): Promise<void> => {
  await client.delete(`/annotations/highlights/${id}`);
};

export const saveDrawing = async (params: {
  document_id: string;
  page: number;
  canvas_data: string;
}): Promise<Drawing> => {
  const { data } = await client.post<Drawing>("/annotations/drawings", params);
  return data;
};
