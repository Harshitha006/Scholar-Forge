import { Liveblocks } from "@liveblocks/node";
import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const liveblocks = new Liveblocks({
      secret: process.env.LIVEBLOCKS_SECRET_KEY || "sk_dummy_key_to_prevent_build_crash",
    });

    const { userId } = await auth();
    // const user = await currentUser();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get the room ID from the request
    const body = await request.json();
    const { room } = body;
    
    console.log("[LIVEBLOCKS_AUTH] Authorizing room:", room);

    // The room ID is expected to be `section:{sectionId}`
    if (!room || !room.startsWith("section:")) {
      console.warn("[LIVEBLOCKS_AUTH] Invalid room ID format:", room);
      return NextResponse.json({ error: "Invalid Room" }, { status: 400 });
    }

    const sectionId = room.split(":")[1];

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
      console.warn("[LIVEBLOCKS_AUTH] Section not found:", sectionId);
      return NextResponse.json({ error: "Section not found" }, { status: 404 });
    }

    const isOwner = section.project.ownerId === userId;
    const isCollaborator = section.project.collaborators.some((c: { userId: string }) => c.userId === userId);

    if (!isOwner && !isCollaborator) {
      console.warn("[LIVEBLOCKS_AUTH] User not authorized for room:", userId, room);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Colors for cursors
    const colors = ["#D583F7", "#F0835D", "#85E995", "#85A9E9", "#E98585", "#E9D585"];
    const color = colors[Math.floor(Math.random() * colors.length)];

    // Start a session
    const session = liveblocks.prepareSession(userId, {
      userInfo: {
        name: "Research Collaborator",
        avatar: "https://liveblocks.io/avatars/avatar-1.png",
        color: color,
      },
    });

    // Grant access to the room
    session.allow(room, session.FULL_ACCESS);

    // Authorize the session and return the response
    const { status, body: authBody } = await session.authorize();
    console.log("[LIVEBLOCKS_AUTH] Authorized successfully:", room);
    return new NextResponse(authBody, { 
      status,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("[LIVEBLOCKS_AUTH] Error:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
