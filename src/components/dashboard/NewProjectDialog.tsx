"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const projectSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  paperType: z.enum(["survey", "empirical", "theoretical", "review"]),
  venue: z.enum(["IEEE", "ACM", "generic"]),
  domain: z.string().min(2, "Domain must be at least 2 characters"),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

export function NewProjectDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: "",
      paperType: "empirical",
      venue: "generic",
      domain: "",
    },
  });

  async function onSubmit(values: ProjectFormValues) {
    try {
      setLoading(true);
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        const project = await response.json();
        setOpen(false);
        router.push(`/projects/${project.id}`);
      }
    } catch (error) {
      console.error("Failed to create project", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-accent-primary hover:bg-accent-primary/90 text-bg-base font-semibold rounded-xl gap-2">
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </DialogTrigger>
      <DialogContent className="glass-panel rounded-3xl max-w-md shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-text-primary">Create New Project</DialogTitle>
          <DialogDescription className="text-text-muted">
            Define your research parameters to initialize the workspace.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-secondary">Title</label>
            <Input
              {...form.register("title")}
              placeholder="Deep Learning in Fitness Tracking..."
              className="bg-bg-surface border-border-subtle text-text-primary focus:border-accent-primary rounded-xl"
            />
            {form.formState.errors.title && (
              <p className="text-xs text-state-error">{form.formState.errors.title.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary">Paper Type</label>
              <Select
                onValueChange={(value) => form.setValue("paperType", value as any)}
                defaultValue={form.getValues("paperType")}
              >
                <SelectTrigger className="bg-bg-surface border-border-subtle text-text-primary rounded-xl">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent className="bg-bg-elevated border-border-default">
                  <SelectItem value="survey">Survey</SelectItem>
                  <SelectItem value="empirical">Empirical</SelectItem>
                  <SelectItem value="theoretical">Theoretical</SelectItem>
                  <SelectItem value="review">Review</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary">Venue</label>
              <Select
                onValueChange={(value) => form.setValue("venue", value as any)}
                defaultValue={form.getValues("venue")}
              >
                <SelectTrigger className="bg-bg-surface border-border-subtle text-text-primary rounded-xl">
                  <SelectValue placeholder="Venue" />
                </SelectTrigger>
                <SelectContent className="bg-bg-elevated border-border-default">
                  <SelectItem value="IEEE">IEEE</SelectItem>
                  <SelectItem value="ACM">ACM</SelectItem>
                  <SelectItem value="generic">Generic</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-text-secondary">Domain</label>
            <Input
              {...form.register("domain")}
              placeholder="Computer Science, Health, AI..."
              className="bg-bg-surface border-border-subtle text-text-primary focus:border-accent-primary rounded-xl"
            />
            {form.formState.errors.domain && (
              <p className="text-xs text-state-error">{form.formState.errors.domain.message}</p>
            )}
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-accent-primary hover:bg-accent-primary/90 text-bg-base font-bold rounded-xl h-11"
            >
              {loading ? "Initializing..." : "Create Project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
