"use client";

import { useState, useRef, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, Library, FileText, Search, Loader2, Download, ExternalLink, Plus, Upload } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Artifact, PinnedPaper } from "@prisma/client";
import { PaperViewDialog } from "./PaperViewDialog";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface AiSidebarProps {
  projectId: string;
  activeSectionId?: string;
}

export function AiSidebar({ projectId, activeSectionId }: AiSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [isLoadingArtifacts, setIsLoadingArtifacts] = useState(false);
  const [isIngesting, setIsIngesting] = useState(false);
  const [activeTask, setActiveTask] = useState<string | null>(null);
  const [pinnedPapers, setPinnedPapers] = useState<PinnedPaper[]>([]);
  const [isLoadingPinned, setIsLoadingPinned] = useState(false);
  const [selectedPaper, setSelectedPaper] = useState<any>(null);
  const [isPaperModalOpen, setIsPaperModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchPinned();
  }, [projectId]);

  async function fetchPinned() {
    try {
      setIsLoadingPinned(true);
      const res = await fetch(`/api/projects/${projectId}/pinned`);
      if (res.ok) {
        const data = await res.json();
        setPinnedPapers(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingPinned(false);
    }
  }

  async function handlePin(paper: any) {
    try {
      const res = await fetch(`/api/projects/${projectId}/pinned`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paperId: paper.id || paper.metadata.title.toLowerCase().replace(/[^a-z0-9]/g, "-"),
          title: paper.metadata.title,
          authors: paper.metadata.authors,
          year: paper.metadata.year,
          abstract: paper.content,
          filePath: paper.metadata.filePath,
        })
      });
      if (res.ok) {
        fetchPinned();
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function triggerTask(taskName: string, payload: any) {
    try {
      setActiveTask(taskName);
      
      // Use direct endpoint for drafting to bypass Trigger.dev setup for local demo
      const endpoint = taskName === "draft-section" 
        ? `/api/sections/${payload.sectionId}/draft` 
        : "/api/tasks";

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskName === "draft-section" ? { instructions: "" } : { taskName, payload })
      });

      if (res.ok) {
        const data = await res.json();
        console.log(`[TASK] ${taskName} completed/triggered, id: ${data.jobId || data.taskId || "direct"}`);
        
        if (taskName === "draft-section") {
          window.location.reload(); // Refresh to show the AI draft
        } else {
          alert(`${taskName} started! Check progress in dashboard.`);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActiveTask(null);
    }
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      setIsSearching(true);
      const response = await fetch("/api/rag/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery, projectId }),
      });

      if (response.ok) {
        const data = await response.json();
        setResults(data.results);
      }
    } catch (error) {
      console.error("Search failed", error);
    } finally {
      setIsSearching(false);
    }
  }

  async function fetchArtifacts() {
    try {
      setIsLoadingArtifacts(true);
      const response = await fetch(`/api/projects/${projectId}/artifacts`);
      if (response.ok) {
        const data = await response.json();
        setArtifacts(data);
      }
    } catch (error) {
      console.error("Failed to fetch artifacts", error);
    } finally {
      setIsLoadingArtifacts(false);
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsIngesting(true);
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`/api/projects/${projectId}/ingest`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        // Successfully ingested!
        alert("Paper ingested and indexed!");
      }
    } catch (error) {
      console.error("Ingestion failed", error);
    } finally {
      setIsIngesting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <div className="flex flex-col h-full">
      <Tabs defaultValue="ai-assist" className="flex flex-col h-full">
        <div className="px-4 pt-4">
          <TabsList className="bg-bg-subtle border border-border-subtle rounded-xl w-full p-1 h-11">
            <TabsTrigger 
              value="ai-assist" 
              className="flex-1 rounded-lg data-[state=active]:bg-bg-elevated data-[state=active]:text-accent-ai data-[state=active]:shadow-sm transition-all"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              <span className="text-xs font-bold uppercase tracking-wider">AI Assist</span>
            </TabsTrigger>
            <TabsTrigger 
              value="literature" 
              className="flex-1 rounded-lg data-[state=active]:bg-bg-elevated data-[state=active]:text-accent-primary data-[state=active]:shadow-sm transition-all"
            >
              <Library className="h-4 w-4 mr-2" />
              <span className="text-xs font-bold uppercase tracking-wider">Literature</span>
            </TabsTrigger>
            <TabsTrigger 
              value="citations" 
              onClick={fetchPinned}
              className="flex-1 rounded-lg data-[state=active]:bg-bg-elevated data-[state=active]:text-accent-primary data-[state=active]:shadow-sm transition-all"
            >
              <FileText className="h-4 w-4 mr-2" />
              <span className="text-xs font-bold uppercase tracking-wider">Citations</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          <TabsContent value="ai-assist" className="m-0 space-y-4">
            <div className="bg-bg-subtle p-4 rounded-2xl border border-border-subtle space-y-3">
              <h3 className="text-sm font-bold text-text-primary">Research Copilot</h3>
              <p className="text-xs text-text-muted leading-relaxed">
                Describe your research goal or ask for help with the current section.
              </p>
              <div className="relative">
                <textarea 
                  placeholder="How can I improve the academic tone..."
                  className="w-full bg-bg-surface border-border-subtle rounded-xl p-3 text-xs text-text-primary focus:border-accent-ai min-h-[100px] resize-none"
                />
                <button className="absolute bottom-2 right-2 p-1.5 bg-accent-ai rounded-lg text-white">
                  <Sparkles className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => triggerTask("topic-refinement", { projectId, idea: "Please refine my topic." })}
                disabled={activeTask === "topic-refinement"}
                className="p-3 bg-bg-surface border border-border-subtle rounded-xl text-[10px] font-bold text-text-secondary hover:border-accent-ai transition-colors text-left uppercase tracking-widest disabled:opacity-50"
              >
                {activeTask === "topic-refinement" ? <Loader2 className="h-3 w-3 animate-spin inline mr-2"/> : null}
                Refine Topic
              </button>
              <button 
                onClick={() => triggerTask("draft-section", { projectId, sectionId: activeSectionId })}
                disabled={activeTask === "draft-section" || !activeSectionId}
                className="p-3 bg-bg-surface border border-border-subtle rounded-xl text-[10px] font-bold text-text-secondary hover:border-accent-ai transition-colors text-left uppercase tracking-widest disabled:opacity-50"
              >
                {activeTask === "draft-section" ? <Loader2 className="h-3 w-3 animate-spin inline mr-2"/> : null}
                Draft Outline
              </button>
              <button 
                onClick={() => triggerTask("edit-section", { sectionId: activeSectionId, mode: "academic", text: "placeholder text" })}
                disabled={activeTask === "edit-section" || !activeSectionId}
                className="p-3 bg-bg-surface border border-border-subtle rounded-xl text-[10px] font-bold text-text-secondary hover:border-accent-ai transition-colors text-left uppercase tracking-widest disabled:opacity-50"
              >
                Academic Tone
              </button>
              <button 
                onClick={() => triggerTask("edit-section", { sectionId: activeSectionId, mode: "concise", text: "placeholder text" })}
                disabled={activeTask === "edit-section" || !activeSectionId}
                className="p-3 bg-bg-surface border border-border-subtle rounded-xl text-[10px] font-bold text-text-secondary hover:border-accent-ai transition-colors text-left uppercase tracking-widest disabled:opacity-50"
              >
                Concise
              </button>
              <button 
                onClick={() => triggerTask("edit-section", { sectionId: activeSectionId, mode: "grammar", text: "placeholder text" })}
                disabled={activeTask === "edit-section" || !activeSectionId}
                className="p-3 bg-bg-surface border border-border-subtle rounded-xl text-[10px] font-bold text-text-secondary hover:border-accent-ai transition-colors text-left uppercase tracking-widest disabled:opacity-50"
              >
                Grammar Only
              </button>
              <button 
                onClick={() => triggerTask("check-consistency", { projectId })}
                disabled={activeTask === "check-consistency"}
                className="p-3 bg-bg-surface border border-border-subtle rounded-xl text-[10px] font-bold text-text-secondary hover:border-accent-ai transition-colors text-left uppercase tracking-widest disabled:opacity-50"
              >
                {activeTask === "check-consistency" ? <Loader2 className="h-3 w-3 animate-spin inline mr-2"/> : null}
                Check Consistency
              </button>
            </div>
          </TabsContent>

          <TabsContent value="literature" className="m-0 space-y-4">
            <div className="flex items-center gap-2">
              <form onSubmit={handleSearch} className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-faint" />
                <Input 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search corpus..." 
                  className="pl-10 bg-bg-surface border-border-subtle rounded-xl text-xs text-text-primary focus:border-accent-primary"
                />
                {isSearching && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-accent-primary animate-spin" />
                )}
              </form>
              
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isIngesting}
                className="p-2 bg-bg-surface border border-border-subtle rounded-xl text-text-muted hover:text-accent-primary transition-colors disabled:opacity-50"
              >
                {isIngesting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                accept=".pdf,.txt" 
                className="hidden" 
              />
            </div>
            
            <div className="space-y-3">
              {results.length > 0 ? (
                results.map((result, i) => {
                  const isPinned = pinnedPapers.some(p => p.paperId === result.id);
                  return (
                    <div key={i} className="bg-bg-subtle p-3 rounded-xl border border-border-subtle space-y-2 hover:border-accent-primary/30 transition-colors group">
                      <div className="flex justify-between items-start gap-2">
                        <h4 
                          onClick={() => { setSelectedPaper(result); setIsPaperModalOpen(true); }}
                          className="text-[11px] font-bold text-text-primary line-clamp-2 cursor-pointer hover:text-accent-primary transition-colors"
                        >
                          {result.metadata.title}
                        </h4>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <Badge className="bg-accent-primary/10 text-accent-primary text-[9px] border-none">
                            {result.metadata.year || "N/A"}
                          </Badge>
                          <span className="text-[8px] font-bold text-text-faint">
                            {Math.round(result.score * 100)}% Match
                          </span>
                        </div>
                      </div>
                      <p className="text-[10px] text-text-muted line-clamp-3 leading-relaxed italic">
                        "...{result.content.substring(0, 150)}..."
                      </p>
                      <div className="flex justify-between items-center pt-1">
                        <span className="text-[9px] text-text-faint font-medium">
                          {Array.isArray(result.metadata.authors) ? result.metadata.authors.join(", ") : "Unknown Authors"}
                        </span>
                        <button 
                          onClick={() => handlePin(result)}
                          disabled={isPinned}
                          className={cn(
                            "text-[9px] font-bold uppercase tracking-wider transition-all px-2 py-1 rounded-lg flex items-center gap-1",
                            isPinned 
                              ? "bg-state-success/10 text-state-success" 
                              : "text-accent-primary hover:bg-accent-primary/10"
                          )}
                        >
                          {isPinned ? (
                            <>
                              <Check className="h-2.5 w-2.5" />
                              Pinned
                            </>
                          ) : (
                            <>
                              <Plus className="h-2.5 w-2.5" />
                              Pin to project
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : !isSearching && searchQuery ? (
                <p className="text-center text-xs text-text-faint py-10">No results found for "{searchQuery}"</p>
              ) : !isSearching && (
                <div className="flex flex-col items-center justify-center py-10 text-center space-y-3">
                  <div className="bg-bg-subtle p-4 rounded-2xl border border-border-subtle">
                    <Library className="h-6 w-6 text-text-faint" />
                  </div>
                  <p className="text-xs text-text-faint">Search literature or upload<br/>your own research PDFs.</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="citations" className="m-0 space-y-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-[10px] font-bold text-text-faint uppercase tracking-widest">Pinned Papers</h3>
              <Badge variant="outline" className="text-[9px] border-border-subtle text-text-muted">{pinnedPapers.length}</Badge>
            </div>
            {isLoadingPinned ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-6 w-6 text-accent-primary animate-spin" />
              </div>
            ) : pinnedPapers.length > 0 ? (
              pinnedPapers.map((paper) => (
                <div key={paper.id} className="bg-bg-subtle p-3 rounded-xl border border-border-subtle space-y-1 group hover:border-accent-primary/20 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <h4 
                      onClick={() => { setSelectedPaper(paper); setIsPaperModalOpen(true); }}
                      className="text-[10px] font-bold text-text-primary leading-tight line-clamp-2 cursor-pointer hover:text-accent-primary"
                    >
                      {paper.title}
                    </h4>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[8px] text-text-faint font-medium truncate max-w-[120px]">
                      {paper.authors.join(", ")}
                    </span>
                    <code className="text-[8px] bg-bg-surface px-1 py-0.5 rounded text-accent-primary font-bold">
                      {paper.citKey}
                    </code>
                  </div>
                  <div className="flex items-center gap-2 text-[8px] text-text-muted">
                    <span>{paper.year || "N/A"}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center space-y-3">
                <div className="bg-bg-subtle p-4 rounded-2xl border border-border-subtle">
                  <FileText className="h-6 w-6 text-text-faint" />
                </div>
                <p className="text-xs text-text-faint">No citations pinned yet.<br/>Search literature to discover papers.</p>
              </div>
            )}

            <div className="h-px bg-border-subtle my-4" />
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-[10px] font-bold text-text-faint uppercase tracking-widest">Artifacts</h3>
            </div>
            {isLoadingArtifacts ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-4 w-4 text-accent-primary animate-spin" />
              </div>
            ) : artifacts.length > 0 ? (
              artifacts.map((artifact) => (
                <div key={artifact.id} className="bg-bg-subtle p-3 rounded-xl border border-border-subtle flex items-center justify-between group mb-2">
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-accent-primary" />
                    <div>
                      <p className="text-[10px] font-bold text-text-primary">Paper Draft</p>
                      <p className="text-[8px] text-text-faint capitalize">{artifact.type} • {new Date(artifact.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <a href={artifact.blobUrl} target="_blank" className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <ExternalLink className="h-3.5 w-3.5 text-text-muted hover:text-text-primary" />
                  </a>
                </div>
              ))
            ) : null}
          </TabsContent>
        </div>
      </Tabs>

      <PaperViewDialog 
        paper={selectedPaper}
        isOpen={isPaperModalOpen}
        onOpenChange={setIsPaperModalOpen}
      />
    </div>
  );
}
