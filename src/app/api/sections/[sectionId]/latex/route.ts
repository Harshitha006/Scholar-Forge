import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ sectionId: string }> }
) {
  try {
    const { userId } = await auth();
    const { sectionId } = await params;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // 1. Fetch section
    const section = await prisma.section.findUnique({
      where: { id: sectionId },
      include: {
        project: {
          include: {
            collaborators: true,
          },
        },
      },
    });

    if (!section || !section.plainText) {
      return new NextResponse("Not Found or Empty", { status: 404 });
    }

    // Verify access
    const isOwner = section.project.ownerId === userId;
    const isCollaborator = section.project.collaborators.some((c: { userId: string }) => c.userId === userId);
    if (!isOwner && !isCollaborator) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // 2. Construct prompt for Ollama
    const prompt = `
You are a LaTeX expert. Convert the following academic text into high-quality LaTeX code.
Ensure that:
1. Citation markers like [CIT:key] are converted to \\cite{key}.
2. Use proper LaTeX environments for lists, bold, italics, etc.
3. Only return the LaTeX content for this section (not the whole document).
4. No preamble or \\begin{document} needed.

TEXT TO CONVERT:
${section.plainText}
`;

    console.log(`[AI_LATEX] Converting section ${section.title} to LaTeX`);

    // 3. Call Ollama (local)
    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3.2:latest",
        prompt: prompt,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API failed: ${response.statusText}`);
    }

    const data = await response.json();
    const latexDraft = data.response;

    // 4. Update section latexText
    await prisma.section.update({
      where: { id: sectionId },
      data: {
        latexText: latexDraft,
      },
    });

    return NextResponse.json({ success: true, latexText: latexDraft });
  } catch (error) {
    console.error("[SECTION_LATEX_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
