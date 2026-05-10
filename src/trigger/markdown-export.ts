import { task } from "@trigger.dev/sdk/v3";
import { prisma } from "@/lib/prisma";
import fs from "fs/promises";
import path from "path";

export const markdownExport = task({
  id: "markdown-export",
  run: async ({ projectId }: { projectId: string }) => {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { sections: true }
    });

    if (!project) throw new Error("Project not found");

    let markdown = `# ${project.title}\n\n`;

    const sortedSections = project.sections.sort((a, b) => a.order - b.order);
    for (const section of sortedSections) {
      markdown += `## ${section.title}\n\n${section.plainText}\n\n`;
    }

    // Export to Artifacts Dir
    const artifactsDir = path.join(process.cwd(), "public", "artifacts", projectId);
    await fs.mkdir(artifactsDir, { recursive: true });
    
    const mdPath = path.join(artifactsDir, "main.md");
    await fs.writeFile(mdPath, markdown);
    
    const mdUrl = `/artifacts/${projectId}/main.md`;

    // Create Artifact record
    const artifact = await prisma.artifact.create({
      data: {
        projectId,
        type: "markdown",
        blobUrl: mdUrl,
      },
    });

    return { success: true, url: mdUrl };
  }
});
