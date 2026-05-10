import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { BookText, Calendar, Database } from "lucide-react";
import { Project } from "@prisma/client";
import Link from "next/link";

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link href={`/projects/${project.id}`}>
      <Card className="bg-bg-elevated border-border-default hover:border-accent-primary transition-all cursor-pointer group rounded-2xl overflow-hidden h-full flex flex-col">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start gap-4">
            <CardTitle className="text-xl font-semibold text-text-primary line-clamp-2 group-hover:text-accent-primary transition-colors">
              {project.title}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="flex-1">
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="outline" className="bg-bg-subtle border-border-subtle text-text-secondary rounded-xl uppercase text-[10px] font-bold tracking-wider">
              {project.paperType}
            </Badge>
            <Badge variant="outline" className="bg-bg-subtle border-border-subtle text-accent-primary rounded-xl uppercase text-[10px] font-bold tracking-wider">
              {project.venue}
            </Badge>
          </div>
          <div className="space-y-2 text-sm text-text-muted">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              <span>{project.domain}</span>
            </div>
            {project.researchQuestion && (
              <div className="flex items-start gap-2 italic text-xs mt-2 line-clamp-2">
                <span className="text-accent-ai-text">RQ:</span>
                <span>{project.researchQuestion}</span>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="pt-0 pb-4 text-xs text-text-faint flex justify-between items-center">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>Updated {formatDistanceToNow(new Date(project.updatedAt))} ago</span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
