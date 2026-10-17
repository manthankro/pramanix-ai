import React from "react";
import {
  Github,
  Rocket,
  GraduationCap,
  HelpCircle,
  FileText,
  Code2,
  SearchCode,
  Briefcase,
  Layers,
  BotMessageSquare,
  Download,
  FolderGit2,
  Zap,
  Smartphone,
  Globe,
  Sparkles,
} from "lucide-react";
import { ModuleId } from "../types";
import { PramanixLogo } from "./common/PramanixLogo";

interface SidebarProps {
  currentModule: ModuleId;
  onSelectModule: (id: ModuleId) => void;
  onDownloadPramanixZip: () => void;
  activeProjectName?: string;
}

interface NavCategory {
  title: string;
  items: Array<{
    id: ModuleId;
    label: string;
    icon: React.ReactNode;
    subtitle: string;
    tag?: string;
  }>;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentModule,
  onSelectModule,
  onDownloadPramanixZip,
  activeProjectName,
}) => {
  const categories: NavCategory[] = [
    {
      title: "AI Mentors & Viva Defense",
      items: [
        {
          id: "github",
          label: "Repo Intelligence",
          icon: <Github className="w-4 h-4" />,
          subtitle: "AST analysis, code tree & dependencies",
        },
        {
          id: "viva",
          label: "Oral Viva Simulator",
          icon: <HelpCircle className="w-4 h-4" />,
          subtitle: "Ruthless external examiner defense & rubrics",
          tag: "Core",
        },
        {
          id: "tutor",
          label: "Engineering Tutor",
          icon: <GraduationCap className="w-4 h-4" />,
          subtitle: "First-principle theory & quizzes",
        },
        {
          id: "chat",
          label: "AI Companion Chat",
          icon: <BotMessageSquare className="w-4 h-4" />,
          subtitle: "Instant engineering derivations & Q&A",
        },
      ],
    },
    {
      title: "Capstone Engineering",
      items: [
        {
          id: "builder",
          label: "Project Builder",
          icon: <Rocket className="w-4 h-4" />,
          subtitle: "Automated SRS, architecture & roadmap",
          tag: "New",
        },
        {
          id: "workspace",
          label: "Project Workspace",
          icon: <Layers className="w-4 h-4" />,
          subtitle: "Kanban roadmap, codebase files & notes",
        },
        {
          id: "coding",
          label: "Code & Complexity Audit",
          icon: <Code2 className="w-4 h-4" />,
          subtitle: "Big-O analyzer, bug finder & tests",
        },
      ],
    },
    {
      title: "Academic & Placement Lab",
      items: [
        {
          id: "notes",
          label: "PDF & Lecture Notes",
          icon: <FileText className="w-4 h-4" />,
          subtitle: "Exam cheat-sheets & viva questions",
        },
        {
          id: "research",
          label: "Research Assistant",
          icon: <SearchCode className="w-4 h-4" />,
          subtitle: "Literature review & IEEE citations",
        },
        {
          id: "career",
          label: "Placement & Interview",
          icon: <Briefcase className="w-4 h-4" />,
          subtitle: "ATS resume optimizer & system design",
        },
      ],
    },
  ];

  return (
    <aside className="w-72 bg-zinc-950/95 border-r border-zinc-800/80 flex flex-col h-screen select-none shrink-0 text-zinc-300 backdrop-blur-xl">
      {/* Brand Header with Glowing Logo */}
      <div className="p-3.5 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-950/40">
        <PramanixLogo size="sm" showSubtitle={true} showVersion={true} version="v3.0 Ultra" />
        <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
          <Zap className="w-3 h-3 text-amber-400" /> Groq Active
        </span>
      </div>

      {/* Connected Repository Card */}
      <div className="p-3 mx-3 my-2 bg-gradient-to-br from-zinc-900/90 to-zinc-900/40 border border-zinc-800 rounded-xl text-xs shadow-inner">
        <div className="flex items-center justify-between text-zinc-400 mb-1.5">
          <span className="flex items-center gap-1.5 text-[11px] font-semibold text-zinc-200">
            <FolderGit2 className="w-3.5 h-3.5 text-emerald-400" /> Connected Repo
          </span>
          <span className="text-[10px] text-emerald-400 font-mono bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-500/20">
            main
          </span>
        </div>
        <div className="font-mono text-zinc-100 truncate font-medium text-[11px] bg-zinc-950/60 p-1.5 rounded border border-zinc-800/80">
          manthankro/pramanix-ai-
        </div>
        <button
          onClick={onDownloadPramanixZip}
          className="mt-2 w-full flex items-center justify-center gap-1.5 py-1.5 px-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white border border-zinc-700 rounded-lg text-[11px] font-medium transition cursor-pointer shadow-sm active:scale-[0.98]"
        >
          <Download className="w-3 h-3 text-emerald-400" /> Download Full Archive (.zip)
        </button>
      </div>

      {/* Grouped Navigation List */}
      <div className="flex-1 overflow-y-auto px-2 space-y-4 py-2 text-xs scrollbar-thin scrollbar-thumb-zinc-800">
        {categories.map((cat, idx) => (
          <div key={idx} className="space-y-1">
            <div className="px-2.5 py-1 text-[10px] font-bold tracking-wider text-zinc-400 uppercase flex items-center justify-between">
              <span>{cat.title}</span>
            </div>
            {cat.items.map((item) => {
              const isActive = currentModule === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectModule(item.id)}
                  className={`w-full flex items-start gap-2.5 px-2.5 py-2 rounded-lg transition-all text-left cursor-pointer group ${
                    isActive
                      ? "bg-gradient-to-r from-indigo-950/80 to-zinc-900 text-white font-medium border border-indigo-500/40 shadow-md shadow-indigo-950/50"
                      : "text-zinc-400 hover:bg-zinc-900/60 hover:text-zinc-200 border border-transparent"
                  }`}
                >
                  <div
                    className={`mt-0.5 p-1 rounded-md transition-colors ${
                      isActive
                        ? "text-cyan-400 bg-cyan-500/10"
                        : "text-zinc-400 group-hover:text-zinc-200"
                    }`}
                  >
                    {item.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="leading-tight truncate text-xs flex items-center justify-between">
                      <span className={isActive ? "text-white font-semibold" : ""}>{item.label}</span>
                      {item.tag && (
                        <span className="text-[9px] font-semibold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                          {item.tag}
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-zinc-400 truncate mt-0.5">{item.subtitle}</div>
                  </div>
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer / Dual Platform Architecture Indicator */}
      <div className="p-3 border-t border-zinc-800/80 text-xs bg-zinc-950/80 backdrop-blur">
        <div className="flex items-center justify-between text-zinc-400 mb-1.5">
          <span className="text-[11px] font-medium text-zinc-300">Active Workspace:</span>
          <span className="text-emerald-400 font-semibold truncate max-w-[130px] text-[11px]">
            {activeProjectName || "Pramanix Core"}
          </span>
        </div>
        <div className="p-2 rounded-lg bg-zinc-900/60 border border-zinc-800 flex items-center justify-between text-[10px] text-zinc-400">
          <div className="flex items-center gap-1 text-zinc-300">
            <Globe className="w-3 h-3 text-cyan-400" />
            <span>Web App</span>
          </div>
          <span className="text-zinc-600">|</span>
          <div className="flex items-center gap-1 text-zinc-300">
            <Smartphone className="w-3 h-3 text-indigo-400" />
            <span>Android Native</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
