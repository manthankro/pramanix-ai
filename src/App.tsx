import React, { useState, useEffect } from "react";
import { ModuleId, WorkspaceProject } from "./types";
import { Sidebar } from "./components/Sidebar";
import { Header } from "./components/Header";
import { GithubMentor } from "./components/modules/GithubMentor";
import { ProjectBuilder } from "./components/modules/ProjectBuilder";
import { EngineeringTutor } from "./components/modules/EngineeringTutor";
import { DoubtVivaHelp } from "./components/modules/DoubtVivaHelp";
import { PdfNotesAssistant } from "./components/modules/PdfNotesAssistant";
import { CodingAssistant } from "./components/modules/CodingAssistant";
import { ResearchAssistant } from "./components/modules/ResearchAssistant";
import { CareerPrep } from "./components/modules/CareerPrep";
import { ProjectWorkspace } from "./components/modules/ProjectWorkspace";
import { GeneralChat } from "./components/modules/GeneralChat";
import { getDownloadZipUrl } from "./services/api";

const INITIAL_PROJECTS: WorkspaceProject[] = [
  {
    id: "proj-pramanix-core",
    name: "Pramanix System Architecture",
    domain: "Distributed Python & AI Systems",
    description: "Core microservice and repository architecture for Pramanix platform.",
    connectedRepo: "manthankro/pramanix-ai-",
    tasks: [
      {
        id: "t-1",
        title: "Analyze manthankro/pramanix-ai- dependencies & pyproject.toml",
        status: "done",
        priority: "high",
        milestone: "M1: Architecture & SRS",
        progress: 100,
        startDate: "2026-09-01",
        dueDate: "2026-09-14",
      },
      {
        id: "t-2",
        title: "Dockerize service with multi-stage build container",
        status: "in_progress",
        priority: "high",
        milestone: "M2: Core Subsystems",
        progress: 65,
        startDate: "2026-09-15",
        dueDate: "2026-10-05",
      },
      {
        id: "t-3",
        title: "Write integration tests and Big-O benchmark validation",
        status: "todo",
        priority: "medium",
        milestone: "M3: Integration & Tests",
        progress: 25,
        startDate: "2026-10-06",
        dueDate: "2026-10-20",
      },
      {
        id: "t-4",
        title: "Prepare oral viva defense & external examiner rubrics",
        status: "todo",
        priority: "high",
        milestone: "M4: Viva & Final Defense",
        progress: 0,
        startDate: "2026-10-21",
        dueDate: "2026-11-05",
      },
    ],
    files: [
      {
        name: "main.py",
        content: `"""
Pramanix Core Entry Point
Connected to https://github.com/manthankro/pramanix-ai-
"""
import sys

def main():
    print("[Pramanix Engine] Initializing engineering workspace...")

if __name__ == "__main__":
    main()
`,
        language: "python",
      },
      {
        name: "Dockerfile",
        content: `FROM python:3.11-slim
WORKDIR /app
COPY pyproject.toml .
RUN pip install --no-cache-dir .
COPY . .
CMD ["python", "main.py"]
`,
        language: "dockerfile",
      },
      {
        name: "README.md",
        content: `# Pramanix System Workspace\n\nConnected to https://github.com/manthankro/pramanix-ai-.\nDownload full ZIP via top header.\n`,
        language: "markdown",
      },
    ],
    notes: `## Pramanix Architecture Notes\n- Connected repository: manthankro/pramanix-ai-\n- Default branch: main\n- Tech stack: Python 3.11, Docker, Poetry/pyproject.toml\n- Objective: Comprehensive student project engineering mentor & viva companion.`,
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now(),
  },
];

export default function App() {
  const [currentModule, setCurrentModule] = useState<ModuleId>("github");
  const [projects, setProjects] = useState<WorkspaceProject[]>(() => {
    try {
      const saved = localStorage.getItem("pramanix_projects");
      return saved ? JSON.parse(saved) : INITIAL_PROJECTS;
    } catch {
      return INITIAL_PROJECTS;
    }
  });

  const [activeProjectId, setActiveProjectId] = useState<string>(() => {
    return projects[0]?.id || "proj-pramanix-core";
  });

  const [isDownloadingZip, setIsDownloadingZip] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("pramanix_projects", JSON.stringify(projects));
    } catch (e) {
      console.warn("Failed to persist projects to localStorage:", e);
    }
  }, [projects]);

  const activeProject = projects.find((p) => p.id === activeProjectId) || projects[0];

  // 1-Click Download of manthankro/pramanix-ai- ZIP
  const handleDownloadPramanixZip = () => {
    setIsDownloadingZip(true);
    const targetRepo = activeProject?.connectedRepo || "manthankro/pramanix-ai-";
    const downloadUrl = getDownloadZipUrl(targetRepo);

    // Trigger download
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.setAttribute("download", `${targetRepo.replace("/", "-")}.zip`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      setIsDownloadingZip(false);
    }, 1500);
  };

  // Add project from ProjectBuilder
  const handleAddProjectFromBuilder = (newProj: {
    name: string;
    domain: string;
    description: string;
    notes: string;
  }) => {
    const project: WorkspaceProject = {
      id: "proj-" + Date.now(),
      name: newProj.name,
      domain: newProj.domain,
      description: newProj.description,
      connectedRepo: "manthankro/pramanix-ai-",
      tasks: [
        { id: "t-b1", title: "Review SRS & Functional Requirements", status: "done", priority: "high" },
        { id: "t-b2", title: "Set up repository boilerplate & dependencies", status: "in_progress", priority: "high" },
        { id: "t-b3", title: "Implement core algorithm / subsystem", status: "todo", priority: "high" },
        { id: "t-b4", title: "Prepare viva demonstration & defense questions", status: "todo", priority: "medium" },
      ],
      files: [
        {
          name: "src/index.py",
          content: `# ${newProj.name}\nprint("Initializing ${newProj.name}...")\n`,
          language: "python",
        },
        {
          name: "docs/SRS.md",
          content: newProj.notes,
          language: "markdown",
        },
      ],
      notes: newProj.notes,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    setProjects((prev) => [project, ...prev]);
    setActiveProjectId(project.id);
    setCurrentModule("workspace");
  };

  const handleCreateProject = (name: string, domain: string) => {
    const newP: WorkspaceProject = {
      id: "proj-" + Date.now(),
      name,
      domain,
      description: `New project in ${domain}`,
      connectedRepo: "manthankro/pramanix-ai-",
      tasks: [
        { id: "t-new1", title: "Draft system architecture & modules", status: "todo", priority: "high" },
        { id: "t-new2", title: "Initialize Git repository & README", status: "todo", priority: "medium" },
      ],
      files: [
        {
          name: "README.md",
          content: `# ${name}\n\nDomain: ${domain}\n\nManaged with Pramanix.\n`,
          language: "markdown",
        },
      ],
      notes: `# ${name} Notes\n\n- Created: ${new Date().toLocaleDateString()}\n`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setProjects((prev) => [newP, ...prev]);
    setActiveProjectId(newP.id);
  };

  const handleUpdateProject = (updated: WorkspaceProject) => {
    setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  const handleDeleteProject = (id: string) => {
    if (projects.length <= 1) return;
    const remaining = projects.filter((p) => p.id !== id);
    setProjects(remaining);
    setActiveProjectId(remaining[0].id);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-zinc-950 font-sans antialiased text-zinc-100">
      {/* Left Sidebar Navigation */}
      <Sidebar
        currentModule={currentModule}
        onSelectModule={setCurrentModule}
        onDownloadPramanixZip={handleDownloadPramanixZip}
        activeProjectName={activeProject?.name}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header Bar */}
        <Header
          currentModule={currentModule}
          onDownloadZip={handleDownloadPramanixZip}
          isDownloadingZip={isDownloadingZip}
          activeProjectName={activeProject?.name}
        />

        {/* Dynamic Module Body */}
        <main className="flex-1 overflow-hidden relative bg-gradient-to-br from-zinc-950 via-zinc-900/30 to-zinc-950">
          {currentModule === "github" && (
            <GithubMentor onConnectRepoToWorkspace={(repo) => console.log(repo)} />
          )}
          {currentModule === "builder" && (
            <ProjectBuilder onAddProjectToWorkspace={handleAddProjectFromBuilder} />
          )}
          {currentModule === "tutor" && <EngineeringTutor />}
          {currentModule === "viva" && <DoubtVivaHelp />}
          {currentModule === "notes" && <PdfNotesAssistant />}
          {currentModule === "coding" && <CodingAssistant />}
          {currentModule === "research" && <ResearchAssistant />}
          {currentModule === "career" && <CareerPrep />}
          {currentModule === "workspace" && (
            <ProjectWorkspace
              projects={projects}
              activeProjectId={activeProjectId}
              onSelectProject={setActiveProjectId}
              onCreateProject={handleCreateProject}
              onUpdateProject={handleUpdateProject}
              onDeleteProject={handleDeleteProject}
            />
          )}
          {currentModule === "chat" && <GeneralChat currentProject={activeProject} />}
        </main>
      </div>
    </div>
  );
}
