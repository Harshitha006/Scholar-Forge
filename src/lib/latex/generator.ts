import { Project, Section } from "@prisma/client";

export function generateLatex(project: Project, sections: Section[]) {
  const sortedSections = sections.sort((a, b) => a.order - b.order);

  const documentClass = "\\documentclass[11pt,a4paper]{article}";
  const packages = `
\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}
\\usepackage{hyperref}
\\usepackage{booktabs}
\\usepackage{graphicx}
\\usepackage{amsmath}
`;

  const titlePage = `
\\title{${project.title}}
\\author{ScholarForge Generated}
\\date{\\today}
`;

  const body = sortedSections.map(section => {
    const text = (section.plainText || "").replace(/\[CIT:([^\]]+)\]/g, "\\cite{$1}");
    return `\\section{${section.title}}\n${text}\n`;
  }).join("\n");

  return `
${documentClass}
${packages}
${titlePage}

\\begin{document}
\\maketitle

${body}

\\end{document}
`;
}
