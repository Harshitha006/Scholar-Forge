import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

const RAG_SERVICE_URL = process.env.RAG_SERVICE_URL || "http://127.0.0.1:8001";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { query, top_k = 5 } = body;

    if (!query) {
      return new NextResponse("Missing query", { status: 400 });
    }

    const response = await fetch(`${RAG_SERVICE_URL}/search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query, top_k }),
    });

    if (!response.ok) {
      throw new Error("Failed to query RAG service");
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("[LITERATURE_SEARCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
