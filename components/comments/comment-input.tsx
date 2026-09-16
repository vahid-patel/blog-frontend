'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth-store';
import { Send } from 'lucide-react';

interface CommentInputProps {
  onSubmit: (content: string) => void;
  placeholder?: string;
  initialValue?: string;
  onCancel?: () => void;
  isSubmitting?: boolean;
  submitLabel?: string;
  autoFocus?: boolean;
}

export default function CommentInput({
  onSubmit,
  placeholder = 'Add to the discussion...',
  initialValue = '',
  onCancel,
  isSubmitting = false,
  submitLabel = 'Post Comment',
  autoFocus = false,
}: CommentInputProps) {
  const [content, setContent] = useState(initialValue);
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return (
      <div className="rounded-xl border border-dashed bg-muted/40 p-5 text-center">
        <p className="text-sm text-muted-foreground">
          You need to be logged in to participate in the conversation.
        </p>
        <div className="mt-3 flex items-center justify-center gap-3">
          <Link href="/login">
            <Button size="sm" variant="default">
              Log in
            </Button>
          </Link>
          <Link href="/signup">
            <Button size="sm" variant="outline">
              Sign up
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    onSubmit(content.trim());
    if (!initialValue) {
      setContent('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex items-start gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary mt-1">
          {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
        </span>

        <div className="flex-1">
          <textarea
            autoFocus={autoFocus}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            rows={3}
            maxLength={5000}
            className="w-full resize-y rounded-xl border border-input bg-background p-3 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />

          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {content.length > 0 && `${content.length}/5000 • `}
              <kbd className="rounded border bg-muted px-1.5 py-0.5 text-[10px] font-mono">
                Ctrl + Enter
              </kbd>{' '}
              to post
            </span>

            <div className="flex items-center gap-2">
              {onCancel && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={onCancel}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              )}
              <Button
                type="submit"
                size="sm"
                disabled={!content.trim() || isSubmitting}
                className="gap-1.5"
              >
                <Send className="h-3.5 w-3.5" />
                <span>{isSubmitting ? 'Posting...' : submitLabel}</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
