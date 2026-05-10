import { task } from "@trigger.dev/sdk/v3";
import { prisma } from "@/lib/prisma";

interface EditSectionPayload {
  sectionId: string;
  mode: "academic" | "concise" | "grammar";
  text: string;
}

export const editSection = task({
  id: "edit-section",
  run: async (payload: EditSectionPayload) => {
    const { sectionId, mode, text } = payload;

    const prompts = {
      academic: "Rewrite the following text to be more formal and academic. Do not change meaning. Do not change citations. Only improve academic tone.",
      concise: "Shorten the following text to make it concise. Do not change meaning. Do not change citations. Only improve conciseness.",
      grammar: "Fix grammar and punctuation in the following text. Do not change meaning. Do not change citations. Only improve grammar."
    };

    const prompt = `${prompts[mode]}\n\nTEXT:\n${text}`;

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
    return { success: true, sectionId, revisedText: data.response };
  },
});
