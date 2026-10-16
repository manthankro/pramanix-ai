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
} from "lucide-react";
import { ModuleId } from "../types";
import { PramanixLogo } from "./common/PramanixLogo";

interface SidebarProps {
  currentModule: ModuleId;
  onSelectModule: (id: ModuleId) => void;
  onDownloadPramanixZip: () => void;
  activeProjectName?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentModule,
  onSelectModule,
  onDownloadPramanixZip,
  activeProjectName,
}) => {
  const navItems: Array<{ id: ModuleId; label: string; icon: React.ReactNode; subtitle: string }> = [
    {
      id: "github",
      label: "GitHub Project Mentor",
      icon: <Github className="w-4 h-4" />,
      subtitle: "Repo analysis, zip & architecture",
    },
    {
      id: "builder",
      label: "Project Builder",
      icon: <Rocket className="w-4 h-4" />,
      subtitle: "SRS, tech stack, roadmap & plan",
    },
    {
      id: "tutor",
      label: "Engineering Tutor",
      icon: <GraduationCap className="w-4 h-4" />,
      subtitle: "CS, ECE, EE, ME, CE concepts",
    },
    {
      id: "viva",
      label: "Doubt & Viva Help",
      icon: <HelpCircle className="w-4 h-4" />,
      subtitle: "Worked steps & oral viva exam",
    },
    {
      id: "notes",
      label: "PDF & Notes Assistant",
      icon: <FileText className="w-4 h-4" />,
      subtitle: "Grounded Q&A, flashcards & quiz",
    },
    {
      id: "coding",
      label: "Coding Assistant",
      icon: <Code2 className="w-4 h-4" />,
      subtitle: "Debug, Big-O, tests & DSA prep",
    },
    {
      id: "research",
      label: "Research Assistant",
      icon: <SearchCode className="w-4 h-4" />,
      subtitle: "Tech comparison & citations",
    },
    {
      id: "career",
      label: "Career Preparation",
      icon: <Briefcase className="w-4 h-4" />,
      subtitle: "ATS resume, GitHub & interview",
    },
    {
      id: "workspace",
      label: "Project Workspace",
      icon: <Layers className="w-4 h-4" />,
      subtitle: "Files, Kanban tasks & export",
    },
    {
      id: "chat",
      label: "General AI Mentor",
      icon: <BotMessageSquare className="w-4 h-4" />,
      subtitle: "Contextual conversation",
    },
  ];

  return (
    <aside className="w-72 bg-zinc-950 border-r border-zinc-800 flex flex-col h-screen select-none shrink-0 text-zinc-300">
      {/* Brand Header */}
      <div className="p-3.5 border-b border-zinc-800 flex items-center justify-between">
        <PramanixLogo size="sm" showSubtitle={true} showVersion={true} version="v2.6" />
      </div>

      {/* Target Repository Quick Card */}
      <div className="p-3 mx-3 my-2.5 bg-zinc-900/80 border border-zinc-800 rounded-lg text-xs">
        <div className="flex items-center justify-between text-zinc-400 mb-1.5">
          <span className="flex items-center gap-1 text-[11px] font-medium text-zinc-300">
            <FolderGit2 className="w-3.5 h-3.5 text-emerald-400" /> Connected Repo
          </span>
          <span className="text-[10px] text-emerald-400/90 font-mono">Python</span>
        </div>
        <div className="font-mono text-zinc-200 truncate font-medium text-[11px]">
          manthankro/pramanix
        </div>
        <button
          onClick={onDownloadPramanixZip}
          className="mt-2 w-full flex items-center justify-center gap-1.5 py-1.5 px-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px] font-medium transition cursor-pointer shadow-sm active:scale-[0.98]"
        >
          <Download className="w-3 h-3" /> Download Repo ZIP
        </button>
      </div>

      {/* Navigation list */}
      <div className="flex-1 overflow-y-auto px-2 space-y-0.5 py-1 text-xs scrollbar-thin scrollbar-thumb-zinc-800">
        <div className="px-2 py-1 text-[10px] font-semibold tracking-wider text-zinc-400 uppercase">
          Engineering Modules
        </div>
        {navItems.map((item) => {
          const isActive = currentModule === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectModule(item.id)}
              className={`w-full flex items-start gap-2.5 px-2.5 py-2 rounded-md transition text-left cursor-pointer ${
                isActive
                  ? "bg-zinc-800/90 text-white font-medium border border-zinc-700/60 shadow-sm"
                  : "text-zinc-400 hover:bg-zinc-900/80 hover:text-zinc-200"
              }`}
            >
              <div
                className={`mt-0.5 p-1 rounded ${
                  isActive ? "text-emerald-400 bg-emerald-500/10" : "text-zinc-400"
                }`}
              >
                {item.icon}
              </div>
              <div className="min-w-0 flex-1">
                <div className="leading-tight truncate text-xs">{item.label}</div>
                <div className="text-[10px] text-zinc-400 truncate mt-0.5">{item.subtitle}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer / Active Workspace */}
      <div className="p-3 border-t border-zinc-800 text-xs bg-zinc-950/60">
        <div className="flex items-center justify-between text-zinc-400">
          <span className="text-[11px]">Workspace:</span>
          <span className="text-zinc-200 font-medium truncate max-w-[120px]">
            {activeProjectName || "Capstone 2026"}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-2 text-[10px] text-zinc-400">
          <span>AI-Powered</span>
          <span>·</span>
          <span>Offline Ready</span>
          <span>·</span>
          <span className="text-emerald-400">Active</span>
        </div>
      </div>
    </aside>
  );
};
