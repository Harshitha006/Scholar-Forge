import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

export default async function RootPage() {
  const { userId } = await auth();

  if (userId) {
    redirect("/projects");
  }

  // Simple landing hero if not signed in
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-bg-base px-6 text-center">
      <div className="bg-accent-primary/10 p-4 rounded-3xl mb-8 border border-accent-primary/20">
        <div className="bg-accent-primary p-3 rounded-2xl">
          <svg className="h-10 w-10 text-bg-base" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
      </div>
      <h1 className="text-5xl md:text-7xl font-bold text-text-primary tracking-tight mb-6">
        Forge Your <span className="text-accent-primary">Research</span>
      </h1>
      <p className="text-xl text-text-muted max-w-2xl mb-10 leading-relaxed">
        The local-first, AI-powered writing workspace for modern academics. 
        Write in plain English, compile to LaTeX-perfect PDF.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <a href="/sign-up" className="bg-accent-primary hover:bg-accent-primary/90 text-bg-base px-8 py-4 rounded-2xl font-bold text-lg transition-all hover:scale-105">
          Get Started for Free
        </a>
        <a href="/sign-in" className="bg-bg-elevated border border-border-default hover:border-accent-primary text-text-primary px-8 py-4 rounded-2xl font-bold text-lg transition-all">
          Sign In
        </a>
      </div>
      
      <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl text-left">
        <div className="bg-bg-surface p-6 rounded-2xl border border-border-subtle">
          <h3 className="text-accent-ai-text font-bold mb-2">Local AI</h3>
          <p className="text-sm text-text-muted">Privacy-first inference using Llama 3. No external API calls at runtime.</p>
        </div>
        <div className="bg-bg-surface p-6 rounded-2xl border border-border-subtle">
          <h3 className="text-accent-primary font-bold mb-2">LaTeX Shadow</h3>
          <p className="text-sm text-text-muted">Write in plain English while the system maintains a perfect LaTeX document.</p>
        </div>
        <div className="bg-bg-surface p-6 rounded-2xl border border-border-subtle">
          <h3 className="text-state-success font-bold mb-2">RAG Search</h3>
          <p className="text-sm text-text-muted">Search your local literature corpus and cite papers instantly.</p>
        </div>
      </div>
    </div>
  );
}
