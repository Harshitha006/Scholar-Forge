"use client";

import { useState, useEffect } from "react";
import { ProjectWithRelations } from "@/types/paper";
import { WorkspaceLayout } from "./WorkspaceLayout";
import { SectionsSidebar } from "./SectionsSidebar";
import { SectionEditor } from "./SectionEditor";
import { AiSidebar } from "./AiSidebar";
import { RoomProvider } from "@/liveblocks.config";
import { ClientSideSuspense } from "@liveblocks/react";
import { Loader2 } from "lucide-react";

interface WorkspaceClientProps {
  project: ProjectWithRelations;
}

export function WorkspaceClient({ project }: WorkspaceClientProps) {
  const [sections, setSections] = useState(project.sections);
  const [activeSectionId, setActiveSectionId] = useState<string>(
    project.sections.sort((a, b) => a.order - b.order)[0]?.id || ""
  );

  // Sync state when props change (e.g. after router.refresh())
  useEffect(() => {
    setSections(project.sections);
  }, [project.sections]);

  const activeSection = sections.find((s) => s.id === activeSectionId);

  const handleAddSection = async () => {
    const title = window.prompt("Enter section title:");
    if (!title) return;

    try {
      const res = await fetch(`/api/projects/${project.id}/sections`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, order: sections.length }),
      });
      if (res.ok) {
        const newSection = await res.json();
        setSections([...sections, newSection]);
        setActiveSectionId(newSection.id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <WorkspaceLayout
      leftSidebar={
        <SectionsSidebar
          sections={sections}
          activeSectionId={activeSectionId}
          onSelectSection={setActiveSectionId}
          onAddSection={handleAddSection}
        />
      }
      rightSidebar={<AiSidebar projectId={project.id} activeSectionId={activeSectionId} />}
    >
      {activeSection ? (
        <RoomProvider 
          id={`section:${activeSectionId}`} 
          initialPresence={{ cursor: null }}
        >
          <ClientSideSuspense fallback={
            <div className="flex items-center justify-center h-full text-text-muted gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Connecting to research workspace...</span>
            </div>
          }>
            <SectionEditor section={activeSection} />
          </ClientSideSuspense>
        </RoomProvider>
      ) : (
        <div className="flex items-center justify-center h-full text-text-muted">
          Select a section to start writing.
        </div>
      )}
    </WorkspaceLayout>
  );
}
