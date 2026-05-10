import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { tasks } from "@trigger.dev/sdk/v3";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { taskName, payload } = body;

    if (!taskName || !payload) {
      return new NextResponse("Missing taskName or payload", { status: 400 });
    }

    // Trigger the task asynchronously
    const handle = await tasks.trigger(taskName, payload);

    return NextResponse.json({ success: true, jobId: handle.id });
  } catch (error) {
    console.error("[TASK_TRIGGER]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
