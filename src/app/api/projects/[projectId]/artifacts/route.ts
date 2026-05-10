import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { userId } = await auth();
    const { projectId } = await params;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Verify project access
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { collaborators: true },
    });

    if (!project) {
      return new NextResponse("Not Found", { status: 404 });
    }

    const isOwner = project.ownerId === userId;
    const isCollaborator = project.collaborators.some((c: { userId: string }) => c.userId === userId);

    if (!isOwner && !isCollaborator) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const artifacts = await prisma.artifact.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(artifacts);
  } catch (error) {
    console.error("[PROJECT_ARTIFACTS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
