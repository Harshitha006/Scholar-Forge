"use client";

import { Section } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Save, Eye, Users, Loader2, FileDown } from "lucide-react";
import { CollaborativeEditor } from "@/components/editor/CollaborativeEditor";
import { useOthers } from "@/liveblocks.config";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface SectionEditorProps {
  section: Section;
}

export function SectionEditor({ section }: SectionEditorProps) {
  const others = useOthers();
  const othersCount = others.length;
  const [isDrafting, setIsDrafting] = useState(false);
  const [isSplitView, setIsSplitView] = useState(false);
  const router = useRouter();

  async function handleDraftWithAi() {
    try {
      setIsDrafting(true);
      const response = await fetch(`/api/sections/${section.id}/draft`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instructions: "" }),
      });

      if (response.ok) {
        setIsDrafting(false);
        router.refresh();
        setIsSplitView(true); // Automatically show the LaTeX shadow document
      }
    } catch (error) {
      console.error("AI Drafting failed", error);
      setIsDrafting(false);
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Editor Header */}
      <div className="h-14 border-b border-border-default flex items-center justify-between px-6 bg-bg-surface/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold text-text-primary">{section.title}</h1>
          <Badge variant="outline" className="bg-bg-subtle text-[10px] text-text-muted rounded-xl">
            {section.status.replace("_", " ")}
          </Badge>
          
          {othersCount > 0 && (
            <div className="flex items-center gap-2 ml-2 px-2 py-1 bg-accent-primary-dim rounded-lg border border-accent-primary/20">
              <Users className="h-3 w-3 text-accent-primary" />
              <span className="text-[10px] font-bold text-accent-primary uppercase">
                {othersCount} other{othersCount > 1 ? 's' : ''} editing
              </span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsSplitView(!isSplitView)}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all",
              isSplitView 
                ? "bg-accent-primary text-bg-base shadow-lg shadow-accent-primary/20" 
                : "text-text-muted hover:text-text-primary hover:bg-bg-subtle"
            )}
          >
            <Eye className="h-3.5 w-3.5" />
            {isSplitView ? "Close Split View" : "Preview LaTeX"}
          </button>
          <div className="h-4 w-px bg-border-subtle mx-1" />
          <button 
            onClick={handleDraftWithAi}
            disabled={isDrafting}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold bg-accent-ai text-white hover:opacity-90 disabled:opacity-50 transition-all shadow-lg shadow-accent-ai/20"
          >
            {isDrafting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Sparkles className="h-3.5 w-3.5" />
            )}
            {isDrafting ? "AI Drafting..." : "Draft with AI"}
          </button>
        </div>
      </div>

      {/* Editor Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side: Plain Text Editor */}
        <div className={cn(
          "flex-1 p-8 overflow-y-auto custom-scrollbar transition-all duration-300",
          isSplitView ? "border-r border-border-default" : ""
        )}>
          <div className="max-w-4xl mx-auto w-full">
            <CollaborativeEditor key={section.id} sectionId={section.id} initialContent={section.plainText || ""} />
          </div>
        </div>

        {/* Right Side: LaTeX Panel */}
        {isSplitView && (
          <div className="w-1/2 p-8 bg-bg-base/50 overflow-y-auto custom-scrollbar font-mono animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-border-subtle">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">LaTeX Shadow Document</span>
              <Badge variant="outline" className="text-[9px] bg-bg-surface border-border-subtle text-accent-primary">Read Only</Badge>
            </div>
            
            {section.latexText ? (
              <pre className="text-sm leading-relaxed text-text-secondary whitespace-pre-wrap">
                {section.latexText}
              </pre>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                <Sparkles className="h-8 w-8 text-text-faint" />
                <p className="text-xs text-text-faint max-w-[200px]">
                  No LaTeX generated yet. <br/>
                  <span className="text-accent-ai-text font-bold">Run AI → Convert to LaTeX</span> to see the shadow document here.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Editor Status Bar */}
      <div className="h-8 border-t border-border-default bg-bg-surface/30 flex items-center justify-between px-4 text-[10px] font-bold text-text-faint uppercase tracking-widest">
        <div className="flex items-center gap-4">
          <span>Collaborative Session Active</span>
        </div>
        <div className="flex items-center gap-1 text-state-success">
          <Save className="h-3 w-3" />
          <span>Syncing to secure cloud</span>
        </div>
      </div>
    </div>
  );
}
