import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { cn } from "@/lib/utils";

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div
      className={cn(
        "prose prose-sm max-w-none",
        "prose-p:my-1 prose-p:leading-relaxed",
        "prose-headings:my-2 prose-headings:font-medium",
        "prose-a:font-medium prose-a:text-primary prose-a:no-underline hover:prose-a:underline",
        'prose-code:rounded prose-code:bg-primary/10 prose-code:px-1 prose-code:py-0.5 prose-code:text-primary prose-code:before:content-[""] prose-code:after:content-[""]',
        "prose-pre:my-2 prose-pre:rounded prose-pre:border prose-pre:bg-muted/50 prose-pre:p-3 prose-pre:text-foreground/80",
        "prose-ol:my-2 prose-ul:my-2",
        "prose-li:my-0.5 prose-li:marker:text-muted-foreground",
        "prose-blockquote:my-2 prose-blockquote:border-l-4 prose-blockquote:border-primary/50 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-muted-foreground",
        "prose-img:my-2 prose-img:rounded-md prose-img:border"
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          p: ({ children }) => (
            <p className={"whitespace-pre-wrap"}>{children}</p>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
