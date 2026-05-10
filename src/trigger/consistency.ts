import { task } from "@trigger.dev/sdk/v3";
import { prisma } from "@/lib/prisma";

export const checkConsistency = task({
  id: "check-consistency",
  run: async ({ projectId }: { projectId: string }) => {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { sections: true }
    });

    if (!project) throw new Error("Project not found");

    const fullText = project.sections
      .sort((a, b) => a.order - b.order)
      .map(s => s.plainText)
      .join("\n\n");

    const prompt = `Review the following research paper draft for consistency. Find: acronyms defined/undefined, tense inconsistencies, duplicate claims. Return a report as a Markdown list.

TEXT:
${fullText}
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

    if (!response.ok) throw new Error("Ollama API failed");
    const data = await response.json();

    return { success: true, report: data.response };
  }
});
