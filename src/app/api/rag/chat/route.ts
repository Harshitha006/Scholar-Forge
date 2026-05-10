import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { paperId, query, abstract } = await req.json();

    // In a real RAG app, we'd use the paper's full text from the vector DB.
    // For this implementation, we'll prompt the local Ollama with the abstract and query.
    
    const prompt = `You are a research assistant. Answer the user's question about the following research paper. 
Use only the context provided in the abstract. If the information is not in the abstract, say you don't know.

Paper Abstract:
${abstract}

Question:
${query}

Answer:`;

    const response = await fetch(`${process.env.OLLAMA_HOST || "http://localhost:11434"}/api/generate`, {
      method: "POST",
      body: JSON.stringify({
        model: "llama3.1:8b",
        prompt: prompt,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error("Ollama connection failed");
    }

    const data = await response.json();
    return NextResponse.json({ answer: data.response });
  } catch (error) {
    console.error("[PAPER_CHAT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
