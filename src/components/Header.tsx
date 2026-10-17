import React from "react";
import { Download, Sparkles, FolderGit2, Zap, Smartphone, Globe, Layers } from "lucide-react";
import { ModuleId } from "../types";

interface HeaderProps {
  currentModule: ModuleId;
  onDownloadZip: () => void;
  isDownloadingZip?: boolean;
  activeProjectName?: string;
}

const moduleHeadings: Record<ModuleId, { title: string; description: string; badge: string }> = {
  github: {
    title: "GitHub Repository Intelligence",
    description: "Deep repository analysis, architecture breakdown, dependency scanner & oral defense generator.",
    badge: "Repository Hub",
  },
  builder: {
    title: "Capstone Project Builder",
    description: "Transform concepts into complete SRS specifications, modular architecture, and 8-week milestone roadmaps.",
    badge: "Architect",
  },
  tutor: {
    title: "Engineering Conceptual Tutor",
    description: "First-principle mastery across DSA, OS, DBMS, Networks, and System Design with formula derivations.",
    badge: "Theory Lab",
  },
  viva: {
    title: "Oral Viva Examination Simulator",
    description: "External examiner defense questions, student response evaluation, 1-10 scoring rubrics, and exemplar answers.",
    badge: "Defense Simulator",
  },
  notes: {
    title: "PDF & Lecture Notes Assistant",
    description: "Syllabus synthesis, formula cheat-sheets, spaced repetition flashcards, and scored MCQ practice quizzes.",
    badge: "Revision Engine",
  },
  coding: {
    title: "Algorithmic & Code Assistant",
    description: "Multi-language debugger, Big-O time and space complexity audit, race condition scanner, and test suites.",
    badge: "Code Lab",
  },
  research: {
    title: "Academic Research Assistant",
    description: "Literature review synthesis, methodology comparison matrices, and IEEE / APA / ACM citation generator.",
    badge: "Scholar",
  },
  career: {
    title: "Career & Technical Placement Hub",
    description: "ATS resume bullet optimizer with XYZ metrics, system design interview prep, and role-based roadmaps.",
    badge: "Placement",
  },
  workspace: {
    title: "Project Workspace & Roadmap",
    description: "Unified workspace organizing connected repos, codebase files, Kanban sprint tasks, and project notes.",
    badge: "Workspace",
  },
  chat: {
    title: "Pramanix AI Study Companion",
    description: "Real-time engineering mentor for instant derivations, algorithmic debugging, and technical brainstorming.",
    badge: "AI Companion",
  },
};

export const Header: React.FC<HeaderProps> = ({
  currentModule,
  onDownloadZip,
  isDownloadingZip,
  activeProjectName,
}) => {
  const meta = moduleHeadings[currentModule] || {
    title: "Pramanix Studio",
    description: "AI Engineering Mentor & Project Workspace",
    badge: "Core",
  };

  return (
    <header className="h-16 border-b border-zinc-800/80 bg-zinc-950/70 backdrop-blur-md px-6 flex items-center justify-between shrink-0 sticky top-0 z-20">
      {/* Title & Metadata */}
      <div className="min-w-0 pr-4 flex items-center gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-sm font-semibold tracking-tight text-zinc-100 flex items-center gap-2">
              {meta.title}
            </h1>
            <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 shadow-sm shadow-emerald-500/5">
              <Sparkles className="w-2.5 h-2.5" /> {meta.badge}
            </span>
          </div>
          <p className="text-[11px] text-zinc-400 truncate max-w-xl mt-0.5">{meta.description}</p>
        </div>
      </div>

      {/* Right Controls & Status Pills */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Active AI Engine Badge (Groq) */}
        <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-full bg-zinc-900/90 border border-emerald-500/30 text-[11px] font-medium text-zinc-300 shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-semibold text-emerald-300">Groq LPU</span>
          <span className="text-zinc-500">·</span>
          <span className="text-zinc-400 font-mono text-[10px]">gpt-oss-120b</span>
          <span className="text-[10px] text-emerald-400/80 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/20">
            ~180ms
          </span>
        </div>

        {/* Dual Build Indicator: Web + Android */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-900/60 border border-zinc-800 text-[11px] text-zinc-400">
          <span className="flex items-center gap-1 text-zinc-300">
            <Globe className="w-3 h-3 text-cyan-400" /> Web
          </span>
          <span className="text-zinc-600">+</span>
          <span className="flex items-center gap-1 text-zinc-300">
            <Smartphone className="w-3 h-3 text-indigo-400" /> Android
          </span>
        </div>

        {/* 1-Click ZIP Download Button */}
        <button
          onClick={onDownloadZip}
          disabled={isDownloadingZip}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold transition cursor-pointer shadow-md shadow-emerald-900/20 active:scale-[0.98] disabled:opacity-60"
          title="Directly download manthankro/pramanix-ai- archive zip"
        >
          <FolderGit2 className="w-3.5 h-3.5" />
          <Download className="w-3.5 h-3.5" />
          <span>{isDownloadingZip ? "Generating ZIP..." : "Download Repo ZIP"}</span>
        </button>
      </div>
    </header>
  );
};
