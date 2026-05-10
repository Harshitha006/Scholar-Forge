import { Project, Section, Citation, PinnedPaper, Artifact, TaskRun } from "@prisma/client";

export type ProjectWithRelations = Project & {
  sections: Section[];
  citations: Citation[];
  pinnedPapers: PinnedPaper[];
  artifacts: Artifact[];
  taskRuns: TaskRun[];
};

export type PaperType = "survey" | "empirical" | "theoretical" | "review";
export type Venue = "IEEE" | "ACM" | "generic";

export interface CreateProjectInput {
  title: string;
  paperType: PaperType;
  venue: Venue;
  domain: string;
}
