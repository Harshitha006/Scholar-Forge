import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { ProjectGrid } from "@/components/dashboard/ProjectGrid";
import { NewProjectDialog } from "@/components/dashboard/NewProjectDialog";

export default async function ProjectsPage() {
  const { userId } = await auth();

  if (!userId) {
    return null; // Should be handled by middleware, but for safety
  }

  const projects = await prisma.project.findMany({
    where: {
      OR: [
        { ownerId: userId },
        { collaborators: { some: { userId } } }
      ]
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-text-primary tracking-tight">Research Projects</h1>
          <p className="text-text-muted mt-1">Manage and collaborate on your academic manuscripts.</p>
        </div>
        <NewProjectDialog />
      </div>

      <ProjectGrid projects={projects} />
    </div>
  );
}
