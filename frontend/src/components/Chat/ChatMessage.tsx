import { BookOpen } from "lucide-react";
import type { ChatMessage } from "../../types";
import ReactMarkdown from "react-markdown";
import clsx from "clsx";

interface Props {
  message: ChatMessage;
  onCitationClick?: (page: number) => void;
}

export function ChatMessageBubble({ message, onCitationClick }: Props) {
  const isUser = message.role === "user";

  return (
    <div className={clsx("flex gap-3", isUser && "flex-row-reverse")}>
      <div
        className={clsx(
          "w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-xs font-bold mt-0.5",
          isUser ? "bg-accent text-white" : "bg-gray-100 text-gray-600"
        )}
      >
        {isUser ? "U" : "L"}
      </div>

      <div className={clsx("max-w-[85%] space-y-2", isUser && "items-end flex flex-col")}>
        <div
          className={clsx(
            "px-4 py-3 rounded-2xl text-sm leading-relaxed",
            isUser
              ? "bg-accent text-white rounded-tr-sm"
              : "bg-white border border-gray-100 text-gray-800 rounded-tl-sm shadow-sm"
          )}
        >
          {isUser ? (
            message.content
          ) : (
            <ReactMarkdown className="prose prose-sm max-w-none prose-p:my-1">
              {message.content}
            </ReactMarkdown>
          )}
        </div>

        {/* Citations */}
        {message.citations.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {message.citations.map((c, i) => (
              <button
                key={i}
                onClick={() => onCitationClick?.(c.page)}
                className="flex items-center gap-1 text-xs px-2 py-0.5 bg-accent-light text-accent rounded-full hover:bg-indigo-100 transition-colors"
              >
                <BookOpen className="w-3 h-3" />
                p.{c.page}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
