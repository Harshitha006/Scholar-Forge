import { Project } from "@prisma/client";
import { ProjectCard } from "./ProjectCard";
import { FolderOpen } from "lucide-react";
import { NewProjectDialog } from "./NewProjectDialog";

interface ProjectGridProps {
  projects: Project[];
}

export function ProjectGrid({ projects }: ProjectGridProps) {
  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="bg-bg-elevated p-6 rounded-3xl mb-4 border border-border-default">
          <FolderOpen className="h-8 w-8 text-text-muted" />
        </div>
        <h3 className="text-xl font-medium text-text-primary mb-2">No projects yet. Create your first paper.</h3>
        <p className="text-text-muted max-w-xs mx-auto mb-6">
          Initialize a workspace to start drafting and discovering literature.
        </p>
        <NewProjectDialog />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}
