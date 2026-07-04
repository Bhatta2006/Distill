import client from "./client";
import type { ChatMessage } from "../types";

interface ChatRequest {
  question: string;
  history: { role: "user" | "assistant"; content: string }[];
}

export const sendChatMessage = async (
  docId: string,
  request: ChatRequest
): Promise<ChatMessage> => {
  const { data } = await client.post<ChatMessage>(`/documents/${docId}/chat`, request);
  return data;
};
