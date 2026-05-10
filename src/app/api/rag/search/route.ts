import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { searchCorpus } from "@/lib/rag/vectorStore";
import * as z from "zod";

const searchSchema = z.object({
  query: z.string().min(1),
  projectId: z.string(),
});

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { query, projectId } = searchSchema.parse(body);

    // TODO: Verify project membership if we have project-specific corpora
    // For now, search the global (mocked) corpus
    const results = await searchCorpus(query);

    return NextResponse.json({
      success: true,
      results: results.map(doc => ({
        id: doc.metadata.id,
        content: doc.pageContent,
        metadata: doc.metadata,
      })),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.issues), { status: 400 });
    }
    console.error("[RAG_SEARCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
