"use client";

import { UserButton } from "@clerk/nextjs";
import { BookOpenCheck, FileDown, Loader2 } from "lucide-react";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";

export function Navbar() {
  const pathname = usePathname();
  const params = useParams();
  const projectId = params.projectId as string;
  const [isCompiling, setIsCompiling] = useState(false);
  const [project, setProject] = useState<{ title: string; paperType: string } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (projectId) {
      fetch(`/api/projects/${projectId}`)
        .then(res => {
          if (!res.ok) throw new Error("Failed to fetch project");
          return res.json();
        })
        .then(data => setProject(data))
        .catch(err => console.error("Failed to fetch project for navbar", err));
    } else {
      setProject(null);
    }
  }, [projectId]);

  async function handleCompile() {
    if (!projectId) return;
    try {
      setIsCompiling(true);
      const response = await fetch(`/api/projects/${projectId}/compile`, {
        method: "POST",
      });
      if (response.ok) {
        const data = await response.json();
        setIsCompiling(false);
        // Open the compiled file in a new tab
        if (data.url) {
          window.open(data.url, "_blank");
        }
      }
    } catch (error) {
      console.error("Compilation failed", error);
      setIsCompiling(false);
    }
  }

  if (!mounted) return (
    <nav className="h-16 border-b border-border-default bg-bg-surface flex items-center justify-between px-6 sticky top-0 z-50">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-2">
          <div className="bg-accent-primary p-1.5 rounded-lg">
            <BookOpenCheck className="h-5 w-5 text-bg-base" />
          </div>
          <span className="text-xl font-bold tracking-tight text-text-primary">ScholarForge</span>
        </div>
      </div>
    </nav>
  );

  return (
    <nav className="h-16 border-b border-border-default bg-bg-surface flex items-center justify-between px-6 sticky top-0 z-50">
      <div className="flex items-center gap-8">
        <Link href="/projects" className="flex items-center gap-2 group">
          <div className="bg-accent-primary p-1.5 rounded-lg group-hover:scale-105 transition-transform">
            <BookOpenCheck className="h-5 w-5 text-bg-base" />
          </div>
          <span className="text-xl font-bold tracking-tight text-text-primary">ScholarForge</span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          <Link
            href="/projects"
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              pathname === "/projects" 
                ? "bg-bg-elevated text-accent-primary" 
                : "text-text-muted hover:text-text-primary hover:bg-bg-subtle"
            }`}
          >
            Projects
          </Link>
          {projectId && (
            <>
              <span className="text-text-faint mx-1">/</span>
              <span className="px-3 py-1.5 text-sm font-semibold text-text-primary bg-bg-subtle rounded-lg border border-border-subtle">
                Workspace
              </span>
            </>
          )}
        </div>
      </div>

      {project && (
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-3">
          <span className="text-sm font-bold text-text-primary truncate max-w-[200px] md:max-w-[400px]">
            {project.title}
          </span>
          <Badge className="bg-bg-elevated border-border-subtle text-accent-primary rounded-xl uppercase text-[10px] font-bold tracking-wider">
            {project.paperType}
          </Badge>
        </div>
      )}

      <div className="flex items-center gap-4">
        {projectId && (
          <button
            onClick={handleCompile}
            disabled={isCompiling}
            className="flex items-center gap-2 px-4 py-2 bg-accent-primary hover:bg-accent-primary/90 text-bg-base rounded-xl text-xs font-bold transition-all disabled:opacity-50 shadow-lg shadow-accent-primary/20"
          >
            {isCompiling ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <FileDown className="h-3.5 w-3.5" />
            )}
            {isCompiling ? "Compiling..." : "Compile PDF"}
          </button>
        )}

        <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-bg-elevated rounded-xl border border-border-subtle">
          <div className="h-2 w-2 rounded-full bg-state-success animate-pulse" />
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Local Engine Active</span>
        </div>
        
        <UserButton 
          appearance={{
            elements: {
              avatarBox: "h-8 w-8 rounded-xl border border-border-subtle"
            }
          }}
        />
      </div>
    </nav>
  );
}
