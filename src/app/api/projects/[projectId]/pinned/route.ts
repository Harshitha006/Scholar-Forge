import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { userId } = await auth();
    const { projectId } = await params;

    console.log("[PAPER_PIN] Request for project:", projectId, "user:", userId);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { paperId, title, authors, year, abstract, filePath } = body;

    // Create a citation key from first author + year
    const firstAuthor = authors?.[0]?.toLowerCase().replace(/[^a-z]/g, "") || "unknown";
    const citKey = `${firstAuthor}${year || "unknown"}`;

    console.log("[PAPER_PIN] Creating pinned paper with key:", citKey);

    const pinned = await prisma.pinnedPaper.create({
      data: {
        projectId,
        paperId,
        title,
        authors,
        year: year ? parseInt(year) : null,
        abstract,
        filePath,
        citKey,
      },
    });

    return NextResponse.json(pinned);
  } catch (error) {
    console.error("[PAPER_PIN] Error:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { userId } = await auth();
    const { projectId } = await params;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const pinned = await prisma.pinnedPaper.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(pinned);
  } catch (error) {
    console.error("[PINNED_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
