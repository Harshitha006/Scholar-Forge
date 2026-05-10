import { task } from "@trigger.dev/sdk/v3";
import { prisma } from "@/lib/prisma";

interface TopicRefinementPayload {
  projectId: string;
  idea: string;
}

export const topicRefinement = task({
  id: "topic-refinement",
  run: async (payload: TopicRefinementPayload) => {
    const { projectId, idea } = payload;

    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) throw new Error("Project not found");

    const prompt = `
You are an expert academic advisor helping a researcher refine their idea.
The researcher has the following rough idea for a ${project.paperType} paper targeted at ${project.venue} in the domain of ${project.domain}:

IDEA:
"${idea}"

Please provide a JSON response with the following keys:
1. "researchQuestion": A polished, specific, and academic research question.
2. "keywords": An array of 5-7 relevant academic keywords.
3. "outline": A JSON object representing the suggested section structure.

Output strictly valid JSON, no markdown formatting.
`;

    const ollamaUrl = process.env.OLLAMA_HOST || "http://127.0.0.1:11434";
    const response = await fetch(`${ollamaUrl}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3.1:8b",
        prompt: prompt,
        stream: false,
        format: "json",
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API failed: ${response.statusText}`);
    }

    const data = await response.json();
    
    let parsed;
    try {
      parsed = JSON.parse(data.response);
    } catch (e) {
      throw new Error("Failed to parse Ollama JSON response");
    }

    await prisma.project.update({
      where: { id: projectId },
      data: {
        researchQuestion: parsed.researchQuestion,
        keywords: parsed.keywords,
        outline: parsed.outline,
      },
    });

    return { success: true, projectId, refined: parsed };
  },
});
