import { task } from "@trigger.dev/sdk/v3";
import { prisma } from "@/lib/prisma";

interface PlainToLatexPayload {
  sectionId: string;
  venue: string;
}

export const plainToLatex = task({
  id: "plain-to-latex",
  run: async (payload: PlainToLatexPayload) => {
    const { sectionId, venue } = payload;

    const section = await prisma.section.findUnique({
      where: { id: sectionId },
    });

    if (!section) throw new Error("Section not found");

    const prompt = `
You are an expert LaTeX typesetter for academic papers.
Convert the following plain text into valid LaTeX suitable for a ${venue} paper.
Only return the LaTeX code, no explanations. 
Convert [CIT:key] to \\cite{key}.
Preserve paragraph breaks and convert standard markdown headings (if any) to \\section{} or \\subsection{}.

TEXT:
${section.plainText}
`;

    const ollamaUrl = process.env.OLLAMA_HOST || "http://127.0.0.1:11434";
    const response = await fetch(`${ollamaUrl}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3.1:8b",
        prompt: prompt,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API failed: ${response.statusText}`);
    }

    const data = await response.json();
    const latexText = data.response;

    await prisma.section.update({
      where: { id: sectionId },
      data: {
        latexText: latexText,
      },
    });

    return { success: true, sectionId };
  },
});
