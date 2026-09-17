'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import type { JSONContent } from '@tiptap/core';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  FileCode,
  Minus,
  Link as LinkIcon,
  Unlink,
  Image as ImageIcon,
  Undo,
  Redo,
  RemoveFormatting,
  Loader2,
  Upload,
  Globe,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { uploadImage } from '@/services/upload';

interface PostEditorProps {
  initialContent?: JSONContent;
  onChange: (content: JSONContent) => void;
  placeholder?: string;
  minHeight?: string;
}

export default function PostEditor({
  initialContent,
  onChange,
  placeholder = 'Write your story with passion...',
  minHeight = '320px',
}: PostEditorProps) {
  const [wordCount, setWordCount] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline underline-offset-4 hover:opacity-80 transition-opacity',
        },
      }),
      Image.configure({
        allowBase64: false,
        HTMLAttributes: {
          class: 'rounded-2xl max-w-full my-6 shadow-sm border border-border/60 mx-auto block',
        },
      }),
      Placeholder.configure({
        placeholder,
        emptyEditorClass: 'is-editor-empty',
      }),
    ],

    content: initialContent || {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
        },
      ],
    },

    immediatelyRender: false,

    onUpdate: ({ editor }) => {
      const json = editor.getJSON();
      onChange(json);
      const text = editor.getText();
      const words = text.trim() ? text.trim().split(/\s+/).length : 0;
      setWordCount(words);
    },
  });

  const uploadAndInsertImage = useCallback(
    async (file: File) => {
      if (!editor) return;

      // Validate file type
      if (!file.type.match(/^image\/(jpeg|jpg|png|webp|gif)$/i)) {
        setUploadError('Only JPG, PNG, WebP, and GIF images are supported.');
        return;
      }

      // Max 10MB limit
      if (file.size > 10 * 1024 * 1024) {
        setUploadError('Image size exceeds 10MB limit.');
        return;
      }

      try {
        setIsUploading(true);
        setUploadError('');

        const result = await uploadImage(file);
        if (result?.url) {
          editor.chain().focus().setImage({ src: result.url }).run();
        }
      } catch (err: any) {
        setUploadError(
          err?.response?.data?.message || 'Failed to upload image. Please try again.'
        );
      } finally {
        setIsUploading(false);
      }
    },
    [editor]
  );

  // Handle paste image from clipboard
  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            e.preventDefault();
            uploadAndInsertImage(file);
            return;
          }
        }
      }
    },
    [uploadAndInsertImage]
  );

  // Handle drag and drop image file into editor
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      const files = e.dataTransfer?.files;
      if (files && files.length > 0) {
        const file = files[0];
        if (file.type.startsWith('image/')) {
          e.preventDefault();
          uploadAndInsertImage(file);
        }
      }
    },
    [uploadAndInsertImage]
  );

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadAndInsertImage(file);
    }
    // reset input value so same file can be selected again if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleInsertImageUrl = () => {
    if (!editor) return;
    const url = window.prompt('Enter image URL:', 'https://');
    if (url && url.trim()) {
      editor.chain().focus().setImage({ src: url.trim() }).run();
    }
  };

  useEffect(() => {
    if (editor && initialContent && !editor.isDestroyed) {
      const current = JSON.stringify(editor.getJSON());
      const incoming = JSON.stringify(initialContent);
      if (current !== incoming) {
        editor.commands.setContent(initialContent);
        const text = editor.getText();
        setWordCount(text.trim() ? text.trim().split(/\s+/).length : 0);
      }
    }
  }, [editor, initialContent]);

  if (!editor) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl border border-border/70 bg-card">
        <p className="text-sm text-muted-foreground animate-pulse">Initializing editor...</p>
      </div>
    );
  }

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Enter link URL:', previousUrl || 'https://');
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  return (
    <div
      onPaste={handlePaste}
      onDrop={handleDrop}
      className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-xs transition-all focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/10"
    >
      {/* Hidden file input for device image upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
      />

      {/* Sleek Toolbar */}
      <div className="flex flex-wrap items-center gap-1 border-b border-border/70 bg-muted/40 p-2 backdrop-blur-xs">
        {/* Undo / Redo */}
        <div className="flex items-center gap-0.5 pr-1 border-r border-border/60">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            title="Undo (Ctrl+Z)"
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            title="Redo (Ctrl+Y)"
          >
            <Redo className="h-4 w-4" />
          </Button>
        </div>

        {/* Headings */}
        <div className="flex items-center gap-0.5 px-1 border-r border-border/60">
          <Button
            type="button"
            variant={editor.isActive('heading', { level: 1 }) ? 'secondary' : 'ghost'}
            size="icon"
            className="h-8 w-8"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            title="Heading 1"
          >
            <Heading1 className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant={editor.isActive('heading', { level: 2 }) ? 'secondary' : 'ghost'}
            size="icon"
            className="h-8 w-8"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            title="Heading 2"
          >
            <Heading2 className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant={editor.isActive('heading', { level: 3 }) ? 'secondary' : 'ghost'}
            size="icon"
            className="h-8 w-8"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            title="Heading 3"
          >
            <Heading3 className="h-4 w-4" />
          </Button>
        </div>

        {/* Formatting */}
        <div className="flex items-center gap-0.5 px-1 border-r border-border/60">
          <Button
            type="button"
            variant={editor.isActive('bold') ? 'secondary' : 'ghost'}
            size="icon"
            className="h-8 w-8 font-bold"
            onClick={() => editor.chain().focus().toggleBold().run()}
            title="Bold (Ctrl+B)"
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant={editor.isActive('italic') ? 'secondary' : 'ghost'}
            size="icon"
            className="h-8 w-8 italic"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            title="Italic (Ctrl+I)"
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant={editor.isActive('underline') ? 'secondary' : 'ghost'}
            size="icon"
            className="h-8 w-8 underline"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            title="Underline (Ctrl+U)"
          >
            <UnderlineIcon className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant={editor.isActive('strike') ? 'secondary' : 'ghost'}
            size="icon"
            className="h-8 w-8 line-through"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            title="Strikethrough"
          >
            <Strikethrough className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant={editor.isActive('code') ? 'secondary' : 'ghost'}
            size="icon"
            className="h-8 w-8"
            onClick={() => editor.chain().focus().toggleCode().run()}
            title="Inline Code"
          >
            <Code className="h-4 w-4" />
          </Button>
        </div>

        {/* Lists & Quotes */}
        <div className="flex items-center gap-0.5 px-1 border-r border-border/60">
          <Button
            type="button"
            variant={editor.isActive('bulletList') ? 'secondary' : 'ghost'}
            size="icon"
            className="h-8 w-8"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            title="Bullet List"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant={editor.isActive('orderedList') ? 'secondary' : 'ghost'}
            size="icon"
            className="h-8 w-8"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            title="Numbered List"
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant={editor.isActive('blockquote') ? 'secondary' : 'ghost'}
            size="icon"
            className="h-8 w-8"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            title="Blockquote"
          >
            <Quote className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant={editor.isActive('codeBlock') ? 'secondary' : 'ghost'}
            size="icon"
            className="h-8 w-8"
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            title="Code Block"
          >
            <FileCode className="h-4 w-4" />
          </Button>
        </div>

        {/* Media & Links */}
        <div className="flex items-center gap-0.5 px-1 border-r border-border/60">
          <Button
            type="button"
            variant={editor.isActive('link') ? 'secondary' : 'ghost'}
            size="icon"
            className="h-8 w-8"
            onClick={setLink}
            title="Insert Link"
          >
            <LinkIcon className="h-4 w-4" />
          </Button>
          {editor.isActive('link') && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive"
              onClick={() => editor.chain().focus().unsetLink().run()}
              title="Remove Link"
            >
              <Unlink className="h-4 w-4" />
            </Button>
          )}

          {/* Upload Image from Device */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-primary hover:bg-primary/10"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            title="Upload Image from Computer (or drag & drop / paste directly)"
          >
            {isUploading ? (
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
          </Button>

          {/* Insert Image via URL */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleInsertImageUrl}
            title="Insert Image by Web URL"
          >
            <Globe className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            title="Divider Line"
          >
            <Minus className="h-4 w-4" />
          </Button>
        </div>

        {/* Clear Formatting */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground ml-auto"
          onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
          title="Clear formatting"
        >
          <RemoveFormatting className="h-4 w-4" />
        </Button>
      </div>

      {/* Upload Banner status if uploading or error */}
      {isUploading && (
        <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 text-xs font-medium text-primary border-b border-primary/20">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          <span>Uploading and auto-optimizing image with Cloudinary...</span>
        </div>
      )}

      {uploadError && (
        <div className="flex items-center justify-between bg-destructive/10 px-4 py-2 text-xs font-medium text-destructive border-b border-destructive/20">
          <span>{uploadError}</span>
          <button
            type="button"
            onClick={() => setUploadError('')}
            className="text-xs font-bold hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Editor Content Area */}
      <div className="relative p-4 sm:p-6">
        <EditorContent
          editor={editor}
          style={{ minHeight }}
          className="prose prose-slate dark:prose-invert max-w-none focus:outline-none min-h-[300px] leading-relaxed prose-headings:font-bold prose-headings:tracking-tight prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-pre:bg-muted/80 prose-pre:border prose-pre:border-border/60 prose-pre:rounded-xl prose-blockquote:border-l-4 prose-blockquote:border-l-primary prose-blockquote:italic prose-img:rounded-2xl prose-img:shadow-md"
        />
      </div>

      {/* Editor Bottom Stats Bar */}
      <div className="flex items-center justify-between border-t border-border/60 bg-muted/20 px-4 py-2 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <ImageIcon className="h-3.5 w-3.5" />
          <span>Supports pasting & dragging images between text</span>
        </span>
        <div className="flex items-center gap-3">
          <span>{wordCount} words</span>
          <span>•</span>
          <span>~{Math.max(1, Math.ceil(wordCount / 200))} min read</span>
        </div>
      </div>
    </div>
  );
}
