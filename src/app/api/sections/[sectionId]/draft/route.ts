import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { searchCorpus } from "@/lib/rag/vectorStore";
import { convertToLatex } from "@/lib/latex/sectionGenerator";

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

    // 1. Fetch section and project details
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

    if (!section) {
      return new NextResponse("Not Found", { status: 404 });
    }

    // Verify access
    const isOwner = section.project.ownerId === userId;
    const isCollaborator = section.project.collaborators.some((c: { userId: string }) => c.userId === userId);
    if (!isOwner && !isCollaborator) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { instructions } = body;

    // 2. Perform RAG search for context
    const searchQuery = `${section.project.title} ${section.title} ${section.project.domain}`;
    const contextResults = await searchCorpus(searchQuery, 3);
    const contextText = contextResults
      .map((r) => `Citation Key: ${r.metadata.id}\nTitle: ${r.metadata.title}\nContent: ${r.pageContent}`)
      .join("\n\n");

    // 3. Construct prompt for Ollama
    const prompt = `
You are an expert academic writer. Draft a research paper section based on the following context and instructions.
Write in a professional, academic tone suitable for a ${section.project.paperType} paper intended for ${section.project.venue}.

PROJECT TITLE: ${section.project.title}
SECTION: ${section.title}
DOMAIN: ${section.project.domain}

LITERATURE CONTEXT:
${contextText}

INSTRUCTIONS:
${instructions || `Draft the ${section.title} section for this research paper.`}

IMPORTANT GUIDELINES:
1. Only use the provided excerpts from the literature context.
2. When you reference a claim, you MUST append a citation marker in the format [CIT:key], where 'key' is the Citation Key provided in the context (e.g., [CIT:vaswani2017]).
3. If you cannot support a claim using the provided context, do not make the claim.
4. Do not hallucinate external references.
5. Focus on clarity, precision, and academic rigor.
`;

    console.log(`[AI_DRAFT] Generating draft for: ${section.title}`);

    // 4. Call Ollama (local)
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
    const draftContent = data.response;

    // 5. Update section status and add draft
    // Note: The PATCH auto-sync will handle the LaTeX conversion automatically
    await prisma.section.update({
      where: { id: sectionId },
      data: {
        plainText: draftContent,
        latexText: convertToLatex(draftContent), // Force an initial conversion
        status: "ai_generated",
      },
    });

    return NextResponse.json({ success: true, draft: draftContent });
  } catch (error) {
    console.error("[SECTION_DRAFT_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
