'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import type { JSONContent } from '@tiptap/core';
import { Button } from '@/components/ui/button';

interface PostEditorProps {
  onChange: (content: JSONContent) => void;
}

export default function PostEditor({ onChange }: PostEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],

    content: {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
        },
      ],
    },

    immediatelyRender: false,

    onUpdate: ({ editor }) => {
      onChange(editor.getJSON());
    },
  });

  if (!editor) {
    return null;
  }

  return (
    <div className="overflow-hidden rounded-lg border">
      <div className="flex flex-wrap gap-1 border-b p-2">
        <Button
          type="button"
          variant={editor.isActive('bold') ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          Bold
        </Button>

        <Button
          type="button"
          variant={editor.isActive('italic') ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          Italic
        </Button>

        <Button
          type="button"
          variant={
            editor.isActive('heading', { level: 2 }) ? 'secondary' : 'ghost'
          }
          size="sm"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
        >
          H2
        </Button>

        <Button
          type="button"
          variant={editor.isActive('bulletList') ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          List
        </Button>
      </div>

      <EditorContent editor={editor} className="min-h-[300px] p-4" />
    </div>
  );
}
