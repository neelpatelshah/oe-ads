import { Message } from "ai";
import MarkdownRenderer from "./markdown-renderer";

interface MessageListProps {
  messages: Message[];
}

export const MessageList = ({ messages }: MessageListProps) => (
  <div className="space-y-4">
    {messages.map((item) =>
      item.role === "user" ? (
        <div key={item.id} className="flex justify-end">
          <div className="bg-white p-3 rounded-lg max-w-xl shadow-sm">
            <div
              className="prose prose-sm max-w-none prose-invert"
              dangerouslySetInnerHTML={{
                __html: item.content.replace(/\n/g, "<br />"),
              }}
            />
          </div>
        </div>
      ) : (
        <MarkdownRenderer content={item.content} key={item.id} />
      )
    )}
  </div>
);
