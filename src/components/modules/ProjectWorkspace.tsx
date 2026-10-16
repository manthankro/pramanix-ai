import React, { useState } from "react";
import {
  Layers,
  FolderGit2,
  Download,
  Plus,
  CheckCircle2,
  Trash2,
  Edit3,
  FileCode,
  FileText,
  Calendar,
  Sparkles,
  Save,
  Check,
  TrendingUp,
  BarChart3,
  Package,
} from "lucide-react";
import { WorkspaceProject, ProjectTask, ProjectFile } from "../../types";
import { exportWorkspaceZip, exportProjectBundleZip, triggerDownload } from "../../services/zipExport";
import { getDownloadZipUrl } from "../../services/api";
import { ProjectProgressDashboard } from "./ProjectProgressDashboard";

interface ProjectWorkspaceProps {
  projects: WorkspaceProject[];
  activeProjectId: string;
  onSelectProject: (id: string) => void;
  onCreateProject: (name: string, domain: string) => void;
  onUpdateProject: (project: WorkspaceProject) => void;
  onDeleteProject: (id: string) => void;
}

export const ProjectWorkspace: React.FC<ProjectWorkspaceProps> = ({
  projects,
  activeProjectId,
  onSelectProject,
  onCreateProject,
  onUpdateProject,
  onDeleteProject,
}) => {
  const currentProject = projects.find((p) => p.id === activeProjectId) || projects[0];

  const [activeTab, setActiveTab] = useState<"kanban" | "dashboard" | "files" | "notes">("kanban");
  const [isExportingBundle, setIsExportingBundle] = useState(false);

  // New project modal state
  const [showNewModal, setShowNewModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDomain, setNewProjectDomain] = useState("Computer Science & Engineering");

  // New task input state
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<"low" | "medium" | "high">("medium");

  // File editor state
  const [selectedFileIdx, setSelectedFileIdx] = useState(0);
  const [newFileName, setNewFileName] = useState("");
  const [showNewFileModal, setShowNewFileModal] = useState(false);

  // Notes state
  const [notesDraft, setNotesDraft] = useState(currentProject?.notes || "");
  const [savedNotes, setSavedNotes] = useState(false);

  // Download Project Bundle for Offline Use
  const handleDownloadProjectBundle = async () => {
    if (!currentProject) return;
    setIsExportingBundle(true);
    try {
      await exportProjectBundleZip(currentProject);
    } catch (err) {
      console.error("Bundle export error:", err);
    } finally {
      setTimeout(() => setIsExportingBundle(false), 1200);
    }
  };

  if (!currentProject) {
    return (
      <div className="h-full flex items-center justify-center p-6 text-center text-zinc-400">
        <div>
          <p className="text-sm">No project found in workspace.</p>
          <button
            onClick={() => onCreateProject("My Capstone Project", "Computer Science & IT")}
            className="mt-3 px-4 py-2 bg-emerald-600 text-white rounded text-xs font-semibold cursor-pointer"
          >
            Create New Project
          </button>
        </div>
      </div>
    );
  }

  // Task actions
  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;
    const newTask: ProjectTask = {
      id: "task-" + Date.now(),
      title: newTaskTitle.trim(),
      status: "todo",
      priority: newTaskPriority,
    };
    const updated = {
      ...currentProject,
      tasks: [...currentProject.tasks, newTask],
      updatedAt: Date.now(),
    };
    onUpdateProject(updated);
    setNewTaskTitle("");
  };

  const handleUpdateTaskStatus = (taskId: string, newStatus: ProjectTask["status"]) => {
    const updated = {
      ...currentProject,
      tasks: currentProject.tasks.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)),
      updatedAt: Date.now(),
    };
    onUpdateProject(updated);
  };

  const handleDeleteTask = (taskId: string) => {
    const updated = {
      ...currentProject,
      tasks: currentProject.tasks.filter((t) => t.id !== taskId),
      updatedAt: Date.now(),
    };
    onUpdateProject(updated);
  };

  // File actions
  const handleAddFile = () => {
    if (!newFileName.trim()) return;
    const newFile: ProjectFile = {
      name: newFileName.trim(),
      content: `# ${newFileName}\n\n// Created in Pramanix Project Workspace\n`,
      language: newFileName.endsWith(".py") ? "python" : newFileName.endsWith(".json") ? "json" : "markdown",
    };
    const updated = {
      ...currentProject,
      files: [...currentProject.files, newFile],
      updatedAt: Date.now(),
    };
    onUpdateProject(updated);
    setNewFileName("");
    setShowNewFileModal(false);
    setSelectedFileIdx(currentProject.files.length);
  };

  const handleUpdateFileContent = (content: string) => {
    const updatedFiles = [...currentProject.files];
    if (updatedFiles[selectedFileIdx]) {
      updatedFiles[selectedFileIdx] = {
        ...updatedFiles[selectedFileIdx],
        content,
      };
      onUpdateProject({
        ...currentProject,
        files: updatedFiles,
        updatedAt: Date.now(),
      });
    }
  };

  // Save notes
  const handleSaveNotes = () => {
    onUpdateProject({
      ...currentProject,
      notes: notesDraft,
      updatedAt: Date.now(),
    });
    setSavedNotes(true);
    setTimeout(() => setSavedNotes(false), 2000);
  };

  // Export full workspace ZIP
  const handleExportZip = async () => {
    await exportWorkspaceZip(currentProject);
  };

  // Download connected repo ZIP
  const handleDownloadRepoZip = () => {
    const repo = currentProject.connectedRepo || "manthankro/pramanix";
    window.location.href = getDownloadZipUrl(repo);
  };

  const currentFile = currentProject.files[selectedFileIdx];

  const tasksByStatus = {
    todo: currentProject.tasks.filter((t) => t.status === "todo"),
    in_progress: currentProject.tasks.filter((t) => t.status === "in_progress"),
    review: currentProject.tasks.filter((t) => t.status === "review"),
    done: currentProject.tasks.filter((t) => t.status === "done"),
  };

  return (
    <div className="h-full flex flex-col bg-zinc-950 text-zinc-200 overflow-hidden">
      {/* Workspace Header / Project Bar */}
      <div className="p-4 bg-zinc-900/60 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <select
                value={currentProject.id}
                onChange={(e) => onSelectProject(e.target.value)}
                className="bg-zinc-950 border border-zinc-700/80 rounded px-2.5 py-1 text-xs font-semibold text-zinc-100 focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <button
                onClick={() => setShowNewModal(true)}
                className="flex items-center gap-1 px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-xs transition cursor-pointer"
                title="Create a new engineering project"
              >
                <Plus className="w-3 h-3" /> New
              </button>
            </div>
            <div className="text-[11px] text-zinc-400 mt-0.5">
              Domain: {currentProject.domain} · Connected:{" "}
              <span className="font-mono text-emerald-400">
                {currentProject.connectedRepo || "manthankro/pramanix"}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadProjectBundle}
            disabled={isExportingBundle}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold transition cursor-pointer shadow-sm active:scale-95 disabled:opacity-60"
            title="Download complete project bundle (all source files, metadata, offline setup guide) as ZIP"
          >
            <Package className="w-3.5 h-3.5" />
            <span>{isExportingBundle ? "Zipping Bundle..." : "Download Project Bundle"}</span>
          </button>
          <button
            onClick={handleDownloadRepoZip}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-emerald-400 rounded text-xs font-medium transition cursor-pointer shadow-sm"
            title="Download connected GitHub repo archive as ZIP"
          >
            <FolderGit2 className="w-3.5 h-3.5" />
            <span>Repo ZIP</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 py-2 border-b border-zinc-800/80 bg-zinc-900/30 flex items-center justify-between text-xs shrink-0">
        <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800">
          <button
            onClick={() => setActiveTab("kanban")}
            className={`px-3 py-1 rounded cursor-pointer font-medium transition ${
              activeTab === "kanban" ? "bg-zinc-800 text-zinc-100" : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Milestone Tasks ({currentProject.tasks.length})
          </button>
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded cursor-pointer font-medium transition ${
              activeTab === "dashboard" ? "bg-zinc-800 text-emerald-400 font-semibold" : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Progress Dashboard</span>
          </button>
          <button
            onClick={() => setActiveTab("files")}
            className={`px-3 py-1 rounded cursor-pointer font-medium transition ${
              activeTab === "files" ? "bg-zinc-800 text-zinc-100" : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Project Files ({currentProject.files.length})
          </button>
          <button
            onClick={() => {
              setActiveTab("notes");
              setNotesDraft(currentProject.notes || "");
            }}
            className={`px-3 py-1 rounded cursor-pointer font-medium transition ${
              activeTab === "notes" ? "bg-zinc-800 text-zinc-100" : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Research Notes & Docs
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        {/* Progress Dashboard */}
        {activeTab === "dashboard" && (
          <ProjectProgressDashboard
            project={currentProject}
            onAddTaskPrompt={() => setActiveTab("kanban")}
            onDownloadBundle={handleDownloadProjectBundle}
          />
        )}

        {/* Kanban Task Board */}
        {activeTab === "kanban" && (
          <div className="h-full flex flex-col p-6 overflow-hidden">
            {/* Quick add task input */}
            <div className="flex items-center gap-2 mb-4 bg-zinc-900/60 p-2.5 rounded-xl border border-zinc-800 shrink-0">
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Add engineering milestone task (e.g. Implement WebSocket rate limiter, Write Unit tests)..."
                className="flex-1 px-3 py-1.5 bg-zinc-950 border border-zinc-700 rounded text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
              />
              <select
                value={newTaskPriority}
                onChange={(e) => setNewTaskPriority(e.target.value as any)}
                className="px-2 py-1.5 bg-zinc-950 border border-zinc-700 rounded text-xs text-zinc-300 focus:outline-none focus:border-emerald-500"
              >
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
              <button
                onClick={handleAddTask}
                disabled={!newTaskTitle.trim()}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-medium transition cursor-pointer disabled:opacity-50"
              >
                <Plus className="w-3.5 h-3.5" /> Add Task
              </button>
            </div>

            {/* Kanban Columns */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4 overflow-y-auto">
              {(
                [
                  { key: "todo", title: "Backlog / To Do", color: "text-zinc-400" },
                  { key: "in_progress", title: "In Progress", color: "text-blue-400" },
                  { key: "review", title: "Testing / In Review", color: "text-amber-400" },
                  { key: "done", title: "Completed", color: "text-emerald-400" },
                ] as const
              ).map((col) => {
                const columnTasks = tasksByStatus[col.key];
                return (
                  <div
                    key={col.key}
                    className="flex flex-col bg-zinc-900/50 border border-zinc-800 rounded-xl p-3 min-h-[350px]"
                  >
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-800 text-xs font-semibold">
                      <span className={col.color}>{col.title}</span>
                      <span className="font-mono text-[11px] text-zinc-500 bg-zinc-950 px-1.5 py-0.5 rounded">
                        {columnTasks.length}
                      </span>
                    </div>

                    <div className="flex-1 space-y-2 overflow-y-auto pr-1">
                      {columnTasks.map((task) => (
                        <div
                          key={task.id}
                          className="p-3 bg-zinc-950 border border-zinc-800/80 rounded-lg space-y-2 hover:border-zinc-700 transition"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-xs text-zinc-100 font-medium leading-tight">
                              {task.title}
                            </span>
                            <button
                              onClick={() => handleDeleteTask(task.id)}
                              className="text-zinc-500 hover:text-red-400 transition cursor-pointer"
                              title="Delete task"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>

                          <div className="flex items-center justify-between pt-1 text-[10px]">
                            <span
                              className={`px-1.5 py-0.5 rounded font-mono ${
                                task.priority === "high"
                                  ? "bg-red-950/60 text-red-400 border border-red-800/50"
                                  : task.priority === "medium"
                                  ? "bg-amber-950/60 text-amber-400 border border-amber-800/50"
                                  : "bg-zinc-900 text-zinc-400"
                              }`}
                            >
                              {task.priority}
                            </span>

                            {/* Move state triggers */}
                            <div className="flex items-center gap-1 text-zinc-400">
                              {col.key !== "todo" && (
                                <button
                                  onClick={() => handleUpdateTaskStatus(task.id, "todo")}
                                  className="hover:text-zinc-200 cursor-pointer"
                                  title="Move to Todo"
                                >
                                  ←
                                </button>
                              )}
                              {col.key !== "in_progress" && col.key !== "done" && (
                                <button
                                  onClick={() => handleUpdateTaskStatus(task.id, "in_progress")}
                                  className="hover:text-blue-400 cursor-pointer"
                                  title="Move to In Progress"
                                >
                                  ▶
                                </button>
                              )}
                              {col.key !== "done" && (
                                <button
                                  onClick={() => handleUpdateTaskStatus(task.id, "done")}
                                  className="hover:text-emerald-400 cursor-pointer"
                                  title="Mark Done"
                                >
                                  ✓
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Files tab */}
        {activeTab === "files" && (
          <div className="h-full flex divide-x divide-zinc-800">
            {/* File List */}
            <div className="w-64 bg-zinc-950 flex flex-col h-full shrink-0">
              <div className="p-3 border-b border-zinc-800 flex items-center justify-between text-xs">
                <span className="font-semibold text-zinc-300">Project Files</span>
                <button
                  onClick={() => setShowNewFileModal(true)}
                  className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded text-[11px] flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" /> New
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-1.5 space-y-0.5 text-xs font-mono">
                {currentProject.files.map((file, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedFileIdx(idx)}
                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-left transition cursor-pointer truncate ${
                      selectedFileIdx === idx
                        ? "bg-zinc-800 text-emerald-400 font-semibold"
                        : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
                    }`}
                  >
                    <FileCode className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{file.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* File Content Editor */}
            <div className="flex-1 flex flex-col h-full bg-zinc-950">
              {currentFile ? (
                <>
                  <div className="p-3 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between text-xs">
                    <span className="font-mono text-zinc-200">{currentFile.name}</span>
                    <button
                      onClick={() => {
                        const blob = new Blob([currentFile.content], { type: "text/plain" });
                        triggerDownload(blob, currentFile.name);
                      }}
                      className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-[11px] cursor-pointer"
                    >
                      Download File
                    </button>
                  </div>
                  <textarea
                    value={currentFile.content}
                    onChange={(e) => handleUpdateFileContent(e.target.value)}
                    className="flex-1 p-4 bg-zinc-950 font-mono text-xs text-zinc-200 leading-relaxed focus:outline-none resize-none"
                  />
                </>
              ) : (
                <div className="p-6 text-xs text-zinc-500">No file selected.</div>
              )}
            </div>
          </div>
        )}

        {/* Notes tab */}
        {activeTab === "notes" && (
          <div className="h-full flex flex-col p-6 overflow-hidden">
            <div className="flex items-center justify-between mb-3 shrink-0">
              <span className="text-xs text-zinc-300 font-medium">Project Documentation & Architecture Notes:</span>
              <button
                onClick={handleSaveNotes}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-medium transition cursor-pointer"
              >
                {savedNotes ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
                <span>{savedNotes ? "Saved!" : "Save Notes"}</span>
              </button>
            </div>
            <textarea
              value={notesDraft}
              onChange={(e) => setNotesDraft(e.target.value)}
              placeholder="Record architectural decisions, sprint notes, formulas, or examiner tips..."
              className="flex-1 p-4 bg-zinc-900/60 border border-zinc-800 rounded-xl font-mono text-xs text-zinc-200 focus:outline-none focus:border-emerald-500 leading-relaxed resize-none"
            />
          </div>
        )}
      </div>

      {/* New Project Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 w-full max-w-md space-y-4 shadow-2xl">
            <h3 className="text-sm font-semibold text-zinc-100">Create New Engineering Project</h3>
            <div className="space-y-1.5">
              <label className="text-xs text-zinc-300">Project Name:</label>
              <input
                type="text"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="e.g. Smart Grid Load Balancer"
                className="w-full p-2 bg-zinc-950 border border-zinc-700 rounded text-xs text-zinc-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-zinc-300">Engineering Domain:</label>
              <input
                type="text"
                value={newProjectDomain}
                onChange={(e) => setNewProjectDomain(e.target.value)}
                className="w-full p-2 bg-zinc-950 border border-zinc-700 rounded text-xs text-zinc-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowNewModal(false)}
                className="px-3 py-1.5 bg-zinc-800 text-zinc-300 rounded text-xs hover:bg-zinc-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (newProjectName.trim()) {
                    onCreateProject(newProjectName.trim(), newProjectDomain.trim());
                    setShowNewModal(false);
                    setNewProjectName("");
                  }
                }}
                className="px-4 py-1.5 bg-emerald-600 text-white rounded text-xs font-semibold hover:bg-emerald-500 cursor-pointer"
              >
                Create Project
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New File Modal */}
      {showNewFileModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 w-full max-w-sm space-y-4 shadow-2xl">
            <h3 className="text-sm font-semibold text-zinc-100">Add Project File</h3>
            <div className="space-y-1.5">
              <label className="text-xs text-zinc-300">File Name (with extension):</label>
              <input
                type="text"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                placeholder="e.g. main.py, Dockerfile, srs.md"
                className="w-full p-2 bg-zinc-950 border border-zinc-700 rounded text-xs text-zinc-100 font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowNewFileModal(false)}
                className="px-3 py-1.5 bg-zinc-800 text-zinc-300 rounded text-xs hover:bg-zinc-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleAddFile}
                className="px-4 py-1.5 bg-emerald-600 text-white rounded text-xs font-semibold hover:bg-emerald-500 cursor-pointer"
              >
                Add File
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
