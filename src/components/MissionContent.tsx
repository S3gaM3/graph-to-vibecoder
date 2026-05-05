"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function MissionContent({ source }: { source: string }) {
  return (
    <article className="markdown-body max-w-3xl">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{source}</ReactMarkdown>
    </article>
  );
}
