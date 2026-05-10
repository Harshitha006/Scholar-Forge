"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, Send } from "lucide-react";
import { Input } from "@/components/ui/input";

interface PaperViewDialogProps {
  paper: any;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PaperViewDialog({ paper, isOpen, onOpenChange }: PaperViewDialogProps) {
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleAsk(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;

    try {
      setIsLoading(true);
      const res = await fetch("/api/rag/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paperId: paper.paperId,
          query: query,
          abstract: paper.abstract || paper.content,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setAnswer(data.answer);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }

  if (!paper) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-bg-elevated border-border-default rounded-3xl glass-panel text-text-primary">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-accent-primary/10 text-accent-primary text-[10px] border-none">
              {paper.metadata?.year || paper.year || "N/A"}
            </Badge>
            <Badge variant="outline" className="text-[10px] border-border-subtle text-text-muted">
              {paper.metadata?.venue || "Local Corpus"}
            </Badge>
          </div>
          <DialogTitle className="text-xl font-bold leading-tight">
            {paper.metadata?.title || paper.title}
          </DialogTitle>
          <DialogDescription className="text-xs text-text-muted mt-1 font-medium">
            {Array.isArray(paper.metadata?.authors) 
              ? paper.metadata.authors.join(", ") 
              : paper.authors?.join(", ") || "Unknown Authors"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold text-text-faint uppercase tracking-widest">Abstract</h4>
            <p className="text-sm text-text-secondary leading-relaxed max-h-[200px] overflow-y-auto custom-scrollbar">
              {paper.abstract || paper.content}
            </p>
          </div>

          <div className="bg-bg-subtle p-4 rounded-2xl border border-border-subtle space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-accent-ai" />
              <h4 className="text-xs font-bold text-text-primary">Ask this paper</h4>
            </div>

            {answer && (
              <div className="bg-bg-surface p-3 rounded-xl border border-border-subtle text-xs text-text-secondary leading-relaxed animate-in fade-in slide-in-from-bottom-1">
                {answer}
              </div>
            )}

            <form onSubmit={handleAsk} className="flex gap-2">
              <Input 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="What is the main contribution of this paper?"
                className="bg-bg-surface border-border-subtle text-xs rounded-xl focus:border-accent-ai"
              />
              <button 
                type="submit"
                disabled={isLoading}
                className="p-2 bg-accent-ai rounded-xl text-white disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </button>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
