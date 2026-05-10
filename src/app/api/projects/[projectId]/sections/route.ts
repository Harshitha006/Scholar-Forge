import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { userId } = await auth();
    const { projectId } = await params;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { title, order } = body;

    const section = await prisma.section.create({
      data: {
        title,
        order,
        type: "custom",
        projectId,
      },
    });

    return NextResponse.json(section);
  } catch (error) {
    console.error("[SECTIONS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
