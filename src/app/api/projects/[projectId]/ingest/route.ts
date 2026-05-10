import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ingestText } from "@/lib/rag/ingest";
import { PDFParse } from "pdf-parse";

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

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return new NextResponse("No file uploaded", { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let text = "";
    if (file.type === "application/pdf") {
      const parser = new PDFParse({ data: buffer });
      const result = await parser.getText();
      text = result.text;
      await parser.destroy();
    } else {
      text = buffer.toString("utf-8");
    }

    // Index the text
    const chunkCount = await ingestText(text, {
      title: file.name,
      projectId,
      source: "upload",
      ingestedAt: new Date().toISOString(),
    });

    return NextResponse.json({ 
      success: true, 
      fileName: file.name,
      chunks: chunkCount 
    });
  } catch (error) {
    console.error("[PROJECT_INGEST_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
