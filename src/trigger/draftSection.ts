import { task } from "@trigger.dev/sdk/v3";
import { prisma } from "@/lib/prisma";
import { searchCorpus } from "@/lib/rag/vectorStore";

interface DraftSectionPayload {
  sectionId: string;
  projectId: string;
  instructions?: string;
}

export const draftSection = task({
  id: "draft-section",
  run: async (payload: DraftSectionPayload) => {
    const { sectionId, projectId, instructions } = payload;

    // 1. Fetch section and project details
    const section = await prisma.section.findUnique({
      where: { id: sectionId },
      include: { project: true },
    });

    if (!section) throw new Error("Section not found");

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
2. When you reference a claim or finding from the provided context, you MUST append a citation marker in the format [CIT:key], where 'key' is the Citation Key provided in the context (e.g., [CIT:vaswani2017]).
3. If you cannot support a claim using the provided context, do not make the claim.
4. Do not hallucinate external references.
5. Focus on clarity, precision, and academic rigor.
`;

    console.log(`[DRAFT_TASK] Calling Ollama with model llama3.2:latest...`);

    // 4. Call Ollama (local)
    // Note: In a real background task, you'd want to handle timeouts and retries
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

    console.log(`[DRAFT_TASK] Successfully generated ${draftContent.length} characters.`);

    // 5. Update section status and add draft (as a suggestion or directly)
    // For now, we'll update the plainText but mark status as ai_generated
    await prisma.section.update({
      where: { id: sectionId },
      data: {
        plainText: draftContent,
        status: "ai_generated",
      },
    });

    return { success: true, sectionId };
  },
});
