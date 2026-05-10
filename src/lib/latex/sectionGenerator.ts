export function convertToLatex(text: string): string {
  if (!text) return "";

  let latex = text;

  // 1. Convert [CIT:key] to \cite{key}
  latex = latex.replace(/\[CIT:([^\]]+)\]/g, "\\cite{$1}");

  // 2. Handle basic formatting (Bold, Italic)
  // This is a simple regex approach for the "Shadow Document" preview
  latex = latex.replace(/\*\*([^*]+)\*\*/g, "\\textbf{$1}");
  latex = latex.replace(/\*([^*]+)\*/g, "\\textit{$1}");

  // 3. Handle Lists
  const lines = latex.split("\n");
  let inList = false;
  const processedLines = lines.map(line => {
    const isBullet = line.trim().startsWith("- ") || line.trim().startsWith("* ");
    if (isBullet) {
      const content = line.trim().substring(2);
      if (!inList) {
        inList = true;
        return `\\begin{itemize}\n  \\item ${content}`;
      }
      return `  \\item ${content}`;
    } else {
      if (inList) {
        inList = false;
        return `\\end{itemize}\n${line}`;
      }
      return line;
    }
  });

  if (inList) {
    processedLines.push("\\end{itemize}");
  }

  return processedLines.join("\n");
}
