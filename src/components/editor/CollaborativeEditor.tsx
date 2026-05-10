"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { useLiveblocksExtension } from "@liveblocks/react-tiptap";
import { EditorToolbar } from "./EditorToolbar";
import { useSelf } from "@/liveblocks.config";
import { useEffect, useCallback } from "react";
import { debounce } from "lodash";

interface CollaborativeEditorProps {
  sectionId: string;
  initialContent?: string;
}

export function CollaborativeEditor({ sectionId, initialContent }: CollaborativeEditorProps) {
  const liveblocks = useLiveblocksExtension();
  const self = useSelf();

  const saveContent = useCallback(
    debounce(async (content: string) => {
      try {
        await fetch(`/api/sections/${sectionId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plainText: content }),
        });
      } catch (error) {
        console.error("Failed to auto-save", error);
      }
    }, 1500),
    [sectionId]
  );

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        undoRedo: false, // Liveblocks handles history
      }),
      Placeholder.configure({
        placeholder: "Start writing your research...",
      }),
      liveblocks,
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class: "prose prose-invert max-w-none focus:outline-none min-h-[500px] text-lg leading-relaxed text-text-primary",
      },
    },
    onUpdate: ({ editor }) => {
      const content = editor.getText(); // Or getHTML if we want rich text features beyond plain text
      saveContent(content);
    },
  });

  useEffect(() => {
    if (editor && initialContent && editor.isEmpty) {
      editor.commands.setContent(initialContent);
    }
  }, [editor, initialContent]);

  return (
    <div className="relative w-full flex flex-col">
      <EditorToolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
