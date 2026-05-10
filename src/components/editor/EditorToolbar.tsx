"use client";

import { type Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Code,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface EditorToolbarProps {
  editor: Editor | null;
}

export function EditorToolbar({ editor }: EditorToolbarProps) {
  if (!editor) return null;

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 mb-4 border border-border-subtle bg-bg-surface/50 rounded-xl backdrop-blur-sm sticky top-0 z-20">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={cn(
          "p-2 rounded-lg transition-colors hover:bg-bg-subtle",
          editor.isActive("bold") ? "text-accent-primary bg-accent-primary-dim" : "text-text-muted"
        )}
      >
        <Bold className="h-4 w-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={cn(
          "p-2 rounded-lg transition-colors hover:bg-bg-subtle",
          editor.isActive("italic") ? "text-accent-primary bg-accent-primary-dim" : "text-text-muted"
        )}
      >
        <Italic className="h-4 w-4" />
      </button>
      <div className="w-px h-4 bg-border-subtle mx-1" />
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={cn(
          "p-2 rounded-lg transition-colors hover:bg-bg-subtle",
          editor.isActive("heading", { level: 1 }) ? "text-accent-primary bg-accent-primary-dim" : "text-text-muted"
        )}
      >
        <Heading1 className="h-4 w-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={cn(
          "p-2 rounded-lg transition-colors hover:bg-bg-subtle",
          editor.isActive("heading", { level: 2 }) ? "text-accent-primary bg-accent-primary-dim" : "text-text-muted"
        )}
      >
        <Heading2 className="h-4 w-4" />
      </button>
      <div className="w-px h-4 bg-border-subtle mx-1" />
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={cn(
          "p-2 rounded-lg transition-colors hover:bg-bg-subtle",
          editor.isActive("bulletList") ? "text-accent-primary bg-accent-primary-dim" : "text-text-muted"
        )}
      >
        <List className="h-4 w-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={cn(
          "p-2 rounded-lg transition-colors hover:bg-bg-subtle",
          editor.isActive("orderedList") ? "text-accent-primary bg-accent-primary-dim" : "text-text-muted"
        )}
      >
        <ListOrdered className="h-4 w-4" />
      </button>
      <div className="w-px h-4 bg-border-subtle mx-1" />
      <button
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={cn(
          "p-2 rounded-lg transition-colors hover:bg-bg-subtle",
          editor.isActive("codeBlock") ? "text-accent-primary bg-accent-primary-dim" : "text-text-muted"
        )}
      >
        <Code className="h-4 w-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={cn(
          "p-2 rounded-lg transition-colors hover:bg-bg-subtle",
          editor.isActive("blockquote") ? "text-accent-primary bg-accent-primary-dim" : "text-text-muted"
        )}
      >
        <Quote className="h-4 w-4" />
      </button>
      <div className="ml-auto flex items-center gap-1">
        <button
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().chain().focus().undo().run()}
          className="p-2 rounded-lg transition-colors hover:bg-bg-subtle text-text-faint hover:text-text-primary disabled:opacity-30"
        >
          <Undo className="h-4 w-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().chain().focus().redo().run()}
          className="p-2 rounded-lg transition-colors hover:bg-bg-subtle text-text-faint hover:text-text-primary disabled:opacity-30"
        >
          <Redo className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
