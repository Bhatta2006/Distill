import { useState, useRef, useEffect } from "react";
import { Send, Loader2 } from "lucide-react";
import { ChatMessageBubble } from "./ChatMessage";
import { sendChatMessage } from "../../api/chat";
import type { ChatMessage } from "../../types";

interface Props {
  docId: string;
  onPageJump?: (page: number) => void;
}

export function ChatPanel({ docId, onPageJump }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    const question = input.trim();
    if (!question || loading) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: question,
      citations: [],
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const history = messages.slice(-10).map((m) => ({ role: m.role, content: m.content }));
      const response = await sendChatMessage(docId, { question, history });
      setMessages((prev) => [...prev, response]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "Sorry, something went wrong. Please try again.",
          citations: [],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-thin">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 text-sm pt-8 space-y-2">
            <p className="font-medium text-gray-500">Ask anything about the paper</p>
            <p>e.g. "What's the main contribution?" or "Explain the training procedure"</p>
          </div>
        )}
        {messages.map((m) => (
          <ChatMessageBubble key={m.id} message={m} onCitationClick={onPageJump} />
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <Loader2 className="w-4 h-4 animate-spin" />
            Thinking…
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-100 p-3">
        <div className="flex gap-2 items-end">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder="Ask a question about the paper…"
            rows={1}
            className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent scrollbar-thin"
            style={{ maxHeight: 120, overflowY: "auto" }}
          />
          <button
            onClick={send}
            disabled={!input.trim() || loading}
            className="p-2.5 bg-accent text-white rounded-xl hover:bg-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-1.5 ml-1">Answers cite exact passages from the paper</p>
      </div>
    </div>
  );
}
