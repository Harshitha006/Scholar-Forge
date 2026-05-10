"use client";

import { Section } from "@prisma/client";
import { 
  FileText, 
  BookOpen, 
  FlaskConical, 
  BarChart2, 
  MessageCircle, 
  BookMarked,
  Plus,
  GripVertical
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface SectionsSidebarProps {
  sections: Section[];
  activeSectionId?: string;
  onSelectSection: (id: string) => void;
  onAddSection: () => void;
}

const SECTION_ICONS: Record<string, any> = {
  intro: FileText,
  lit_review: BookOpen,
  methods: FlaskConical,
  results: BarChart2,
  discussion: MessageCircle,
  conclusion: BookMarked,
  custom: FileText,
};

export function SectionsSidebar({ sections, activeSectionId, onSelectSection, onAddSection }: SectionsSidebarProps) {
  return (
    <div className="flex flex-col h-full py-4">
      <div className="px-4 mb-4 flex justify-between items-center">
        <h2 className="text-xs font-bold text-text-muted uppercase tracking-widest">Outline</h2>
        <button 
          onClick={onAddSection}
          className="p-1 hover:bg-bg-subtle rounded-md text-text-muted hover:text-accent-primary transition-colors"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-2 space-y-1 custom-scrollbar">
        {sections.sort((a, b) => a.order - b.order).map((section) => {
          const Icon = SECTION_ICONS[section.type] || FileText;
          const isActive = section.id === activeSectionId;

          return (
            <button
              key={section.id}
              onClick={() => onSelectSection(section.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group",
                isActive 
                  ? "bg-accent-primary-dim text-accent-primary border border-accent-primary/20" 
                  : "text-text-secondary hover:text-text-primary hover:bg-bg-subtle border border-transparent"
              )}
            >
              <GripVertical className="h-3.5 w-3.5 text-text-faint opacity-0 group-hover:opacity-100 transition-opacity" />
              <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-accent-primary" : "text-text-muted")} />
              <span className="truncate flex-1">{section.title}</span>
              
              {section.status === "draft" && (
                <Badge className="ml-auto bg-[#3A1726] text-[#F75F8F] text-[9px] border-none px-1.5 py-0">Draft</Badge>
              )}
              {section.status === "ai_generated" && (
                <Badge className="ml-auto bg-[#2E1938] text-[#BF7AF0] text-[9px] border-none px-1.5 py-0">AI</Badge>
              )}
              {section.status === "human_reviewed" && (
                <Badge className="ml-auto bg-[#331B00] text-[#FF990A] text-[9px] border-none px-1.5 py-0">Review</Badge>
              )}
              {section.status === "ready" && (
                <Badge className="ml-auto bg-[#0F2E18] text-[#62C073] text-[9px] border-none px-1.5 py-0">Ready</Badge>
              )}
            </button>
          );
        })}
        
        <div className="px-2 mt-2">
          <button 
            onClick={onAddSection}
            className="w-full flex items-center gap-3 px-3 py-2 text-xs font-bold text-text-muted hover:text-accent-primary transition-colors group rounded-xl hover:bg-bg-subtle border border-transparent"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add custom section</span>
          </button>
        </div>
      </div>

      <div className="mt-auto px-4 pt-4 border-t border-border-subtle">
        <div className="bg-bg-subtle p-3 rounded-xl border border-border-subtle">
          <p className="text-[10px] font-bold text-text-faint uppercase tracking-tighter mb-2">Progress</p>
          <div className="h-1.5 w-full bg-bg-surface rounded-full overflow-hidden">
            <div 
              className="h-full bg-accent-primary transition-all duration-500" 
              style={{ width: `${(sections.filter(s => s.status === 'ready').length / sections.length) * 100}%` }} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}
