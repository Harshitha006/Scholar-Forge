import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateLatex } from "@/lib/latex/generator";
import fs from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { userId } = await auth();
    const { projectId } = await params;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // 1. Fetch project and sections
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { sections: true, collaborators: true },
    });

    if (!project) {
      return new NextResponse("Not Found", { status: 404 });
    }

    // Verify access
    const isOwner = project.ownerId === userId;
    const isCollaborator = project.collaborators.some((c: { userId: string }) => c.userId === userId);
    if (!isOwner && !isCollaborator) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // 2. Generate LaTeX content
    const latexContent = generateLatex(project, project.sections);

    // 3. Create artifacts directory if it doesn't exist
    const artifactsDir = path.join(process.cwd(), "public", "artifacts", projectId);
    await fs.mkdir(artifactsDir, { recursive: true });

    // 4. Write .tex file
    const texPath = path.join(artifactsDir, "main.tex");
    await fs.writeFile(texPath, latexContent);

    // 5. Provide URL (Pointing to .tex for now as per current mock implementation)
    const fileUrl = `/artifacts/${projectId}/main.tex`;

    // 6. Create Artifact record in DB
    const artifact = await prisma.artifact.create({
      data: {
        projectId,
        type: "pdf",
        blobUrl: fileUrl,
      },
    });

    console.log(`[COMPILE] Project ${projectId} compiled to ${fileUrl}`);

    return NextResponse.json({ 
      success: true, 
      artifactId: artifact.id, 
      url: fileUrl 
    });
  } catch (error) {
    console.error("[PROJECT_COMPILE_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
