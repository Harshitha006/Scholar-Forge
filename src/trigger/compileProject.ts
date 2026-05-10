import { task } from "@trigger.dev/sdk/v3";
import { prisma } from "@/lib/prisma";
import { generateLatex } from "@/lib/latex/generator";
import fs from "fs/promises";
import path from "path";

interface CompileProjectPayload {
  projectId: string;
}

export const compileProject = task({
  id: "compile-project",
  run: async (payload: CompileProjectPayload) => {
    const { projectId } = payload;

    // 1. Fetch project and sections
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { sections: true },
    });

    if (!project) throw new Error("Project not found");

    // 2. Generate LaTeX content
    const latexContent = generateLatex(project, project.sections);

    // 3. Create artifacts directory if it doesn't exist
    const artifactsDir = path.join(process.cwd(), "public", "artifacts", projectId);
    await fs.mkdir(artifactsDir, { recursive: true });

    // 4. Write .tex file
    const texPath = path.join(artifactsDir, "main.tex");
    await fs.writeFile(texPath, latexContent);

    // 5. Compile to PDF (Mocking for now, as local pdflatex might not be present)
    // In a real production environment, we'd run 'pdflatex main.tex' via exec or a Dockerized service
    const pdfUrl = `/artifacts/${projectId}/main.tex`; // Pointing to .tex for now as a fallback

    // 6. Create Artifact record in DB
    const artifact = await prisma.artifact.create({
      data: {
        projectId,
        type: "pdf",
        blobUrl: pdfUrl,
      },
    });

    return { success: true, artifactId: artifact.id, url: pdfUrl };
  },
});
