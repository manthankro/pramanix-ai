import React from "react";
import { Download, Sparkles, FolderGit2 } from "lucide-react";
import { ModuleId } from "../types";

interface HeaderProps {
  currentModule: ModuleId;
  onDownloadZip: () => void;
  isDownloadingZip?: boolean;
}

const moduleHeadings: Record<ModuleId, { title: string; description: string }> = {
  github: {
    title: "GitHub Project Mentor & Repository Hub",
    description: "Deep repository analysis, architecture breakdown, setup guidance, error diagnostics & instant ZIP download.",
  },
  builder: {
    title: "Student Project Builder & Architect",
    description: "Transform ideas into full SRS specifications, modern tech stacks, 8-week milestone roadmaps, and viva defense plans.",
  },
  tutor: {
    title: "Engineering Conceptual Tutor",
    description: "Step-by-step first-principle mastery across CS, IT, ECE, EE, ME, and Civil engineering with domain calculators.",
  },
  viva: {
    title: "Doubt Solver & Oral Viva Examination Simulator",
    description: "Rigorous step-by-step problem solver, student attempt review, and interactive examiner oral defense simulator.",
  },
  notes: {
    title: "PDF & Lecture Notes Assistant",
    description: "Grounded technical Q&A, formula cheat-sheets, spaced repetition flashcards, and scored MCQ practice quizzes.",
  },
  coding: {
    title: "Coding Assistant & Algorithm Visualizer",
    description: "Multi-language debugging, Big-O complexity breakdown, edge-case test case generator, and technical interview prep.",
  },
  research: {
    title: "Research Assistant & Technology Comparison",
    description: "Evidence-backed technology comparisons, citation discovery, and verified industry standards vs architectural tradeoffs.",
  },
  career: {
    title: "Career & Engineering Placement Hub",
    description: "ATS resume optimizer, XYZ impact metric rewriter, GitHub portfolio audit, and role-based technical interview prep.",
  },
  workspace: {
    title: "Project Workspace & Package Exporter",
    description: "Unified workspace organizing connected repositories, code files, Kanban sprint tasks, notes, and full ZIP packaging.",
  },
  chat: {
    title: "General AI Engineering Companion",
    description: "Context-aware conversational assistance for engineering questions, code explanations, and academic writing.",
  },
};

export const Header: React.FC<HeaderProps> = ({
  currentModule,
  onDownloadZip,
  isDownloadingZip,
}) => {
  const meta = moduleHeadings[currentModule] || {
    title: "Pramanix",
    description: "AI Engineering Mentor & Project Workspace",
  };

  return (
    <header className="h-16 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur px-6 flex items-center justify-between shrink-0">
      <div className="min-w-0 pr-4">
        <h1 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
          {meta.title}
          <span className="flex items-center gap-1 text-[11px] font-normal text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            <Sparkles className="w-3 h-3" /> AI Mentor Active
          </span>
        </h1>
        <p className="text-xs text-zinc-400 truncate max-w-2xl">{meta.description}</p>
      </div>

      <div className="flex items-center gap-2.5 shrink-0">
        <button
          onClick={onDownloadZip}
          disabled={isDownloadingZip}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 text-xs font-medium text-zinc-200 transition cursor-pointer shadow-sm disabled:opacity-60"
          title="Directly download manthankro/pramanix archive zip"
        >
          <FolderGit2 className="w-3.5 h-3.5 text-emerald-400" />
          <Download className="w-3.5 h-3.5 text-zinc-400" />
          <span>{isDownloadingZip ? "Preparing ZIP..." : "Download manthankro/pramanix ZIP"}</span>
        </button>
      </div>
    </header>
  );
};
