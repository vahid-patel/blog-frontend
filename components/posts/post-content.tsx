"use client";

import { generateHTML } from "@tiptap/html";
import StarterKit from "@tiptap/starter-kit";
import type { JSONContent } from "@tiptap/core";

interface PostContentProps {
  content: JSONContent;
}

export default function PostContent({
  content,
}: PostContentProps) {
  const html = generateHTML(content, [StarterKit]);

  return (
    <div
      className="prose prose-sm max-w-none"
      dangerouslySetInnerHTML={{
        __html: html,
      }}
    />
  );
}