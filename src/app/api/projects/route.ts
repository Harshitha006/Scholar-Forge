import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as z from "zod";

const createProjectSchema = z.object({
  title: z.string().min(3),
  paperType: z.enum(["survey", "empirical", "theoretical", "review"]),
  venue: z.enum(["IEEE", "ACM", "generic"]),
  domain: z.string().min(2),
});

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { title, paperType, venue, domain } = createProjectSchema.parse(body);

    // Sync user to our DB
    await prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: { id: userId },
    });

    const project = await prisma.project.create({
      data: {
        title,
        paperType,
        venue,
        domain,
        ownerId: userId,
        sections: {
          create: [
            { title: "Introduction", type: "intro", order: 0 },
            { title: "Literature Review", type: "lit_review", order: 1 },
            { title: "Methods", type: "methods", order: 2 },
            { title: "Results", type: "results", order: 3 },
            { title: "Discussion", type: "discussion", order: 4 },
            { title: "Conclusion", type: "conclusion", order: 5 },
          ]
        }
      },
    });

    return NextResponse.json(project);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.issues), { status: 400 });
    }
    console.error("[PROJECTS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
