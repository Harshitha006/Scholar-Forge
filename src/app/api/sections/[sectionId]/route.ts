import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as z from "zod";
import { convertToLatex } from "@/lib/latex/sectionGenerator";

const updateSectionSchema = z.object({
  plainText: z.string().optional(),
  title: z.string().optional(),
  status: z.string().optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ sectionId: string }> }
) {
  try {
    const { userId } = await auth();
    const { sectionId } = await params;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const validatedData = updateSectionSchema.parse(body);

    // Verify project membership
    const section = await prisma.section.findUnique({
      where: { id: sectionId },
      include: {
        project: {
          include: {
            collaborators: true,
          },
        },
      },
    });

    if (!section) {
      return new NextResponse("Not Found", { status: 404 });
    }

    const isOwner = section.project.ownerId === userId;
    const isCollaborator = section.project.collaborators.some((c: { userId: string }) => c.userId === userId);

    if (!isOwner && !isCollaborator) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const dataToUpdate = { 
      ...validatedData,
      ...(validatedData.plainText ? { latexText: convertToLatex(validatedData.plainText) } : {})
    };

    const updatedSection = await prisma.section.update({
      where: { id: sectionId },
      data: dataToUpdate,
    });

    return NextResponse.json(updatedSection);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.issues), { status: 400 });
    }
    console.error("[SECTION_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
