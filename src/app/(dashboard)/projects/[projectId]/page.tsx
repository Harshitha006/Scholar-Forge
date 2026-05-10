import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { WorkspaceClient } from "@/components/workspace/WorkspaceClient";
import { ProjectWithRelations } from "@/types/paper";

interface ProjectPageProps {
  params: Promise<{
    projectId: string;
  }>;
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { userId } = await auth();
  const { projectId } = await params;

  if (!userId) {
    redirect("/sign-in");
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      sections: true,
      citations: true,
      pinnedPapers: true,
      artifacts: true,
      taskRuns: true,
    },
  });

  if (!project) {
    notFound();
  }

  // Check access
  const isOwner = project.ownerId === userId;
  const isCollaborator = await prisma.projectCollaborator.findFirst({
    where: { projectId, userId },
  });

  if (!isOwner && !isCollaborator) {
    redirect("/projects");
  }

  return (
    <div className="fixed inset-0 top-16 bg-bg-base overflow-hidden">
      <WorkspaceClient project={project as ProjectWithRelations} />
    </div>
  );
}
