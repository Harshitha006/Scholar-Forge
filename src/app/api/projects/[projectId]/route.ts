import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { userId } = await auth();
    const { projectId } = await params;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const project = await prisma.project.findUnique({
      where: {
        id: projectId,
      },
    });

    if (!project) {
      return new NextResponse("Not Found", { status: 404 });
    }

    // Verify access
    const isOwner = project.ownerId === userId;
    const isCollaborator = await prisma.projectCollaborator.findFirst({
      where: { projectId, userId },
    });

    if (!isOwner && !isCollaborator) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error("[PROJECT_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
