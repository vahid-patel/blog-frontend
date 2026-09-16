'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import type { JSONContent } from '@tiptap/core';
import { useEffect } from 'react';

interface PostContentProps {
  content: JSONContent;
  className?: string;
}

export default function PostContent({
  content,
  className = '',
}: PostContentProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      Link.configure({
        openOnClick: true,
        HTMLAttributes: {
          class: 'text-primary underline underline-offset-4 hover:opacity-80 transition-opacity',
          target: '_blank',
          rel: 'noopener noreferrer',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-xl max-w-full my-4 shadow-sm border border-border/50',
        },
      }),
    ],
    content,
    editable: false,
    immediatelyRender: false,
  });

  useEffect(() => {
    if (editor && content && !editor.isDestroyed) {
      editor.commands.setContent(content);
    }
  }, [editor, content]);

  if (!editor) {
    return null;
  }

  return (
    <div
      className={`prose prose-slate dark:prose-invert max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-p:leading-relaxed prose-pre:bg-muted/80 prose-pre:border prose-pre:border-border/60 prose-pre:text-foreground prose-blockquote:border-l-primary prose-blockquote:italic ${className}`}
    >
      <EditorContent editor={editor} />
    </div>
  );
}