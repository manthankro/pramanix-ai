import React, { useState, useMemo } from "react";
import { WorkspaceProject, ProjectTask } from "../../types";
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Flag,
  Plus,
  SlidersHorizontal,
  ChevronRight,
  TrendingUp,
  Trash2,
  Edit2,
  Check,
  X,
  Sparkles,
} from "lucide-react";

interface ProjectGanttTimelineProps {
  project: WorkspaceProject;
  onUpdateProject: (updated: WorkspaceProject) => void;
  onAddTaskPrompt?: () => void;
}

interface EnrichedTask extends ProjectTask {
  startWeek: number;
  endWeek: number;
}

interface MilestoneGroup {
  id: string;
  name: string;
  color: string;
  tasks: EnrichedTask[];
}

export const ProjectGanttTimeline: React.FC<ProjectGanttTimelineProps> = ({
  project,
  onUpdateProject,
}) => {
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [timeScale, setTimeScale] = useState<"8weeks" | "monthly">("8weeks");
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // New task form state
  const [newTitle, setNewTitle] = useState("");
  const [newPriority, setNewPriority] = useState<"low" | "medium" | "high">("high");
  const [newMilestone, setNewMilestone] = useState("M2: Core Engine");
  const [newStartWeek, setNewStartWeek] = useState(1);
  const [newEndWeek, setNewEndWeek] = useState(3);
  const [newProgress, setNewProgress] = useState(0);

  // Normalize project tasks with start/due dates or default 8-week sprint distribution
  const enrichedTasks = useMemo(() => {
    const today = new Date();
    const baseTime = today.getTime();
    const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

    return project.tasks.map((task, idx) => {
      // Default distributed weeks if not set
      const defaultStartWeek = Math.min(1 + Math.floor(idx * 1.5), 7);
      const defaultDurationWeeks = 2;
      const defaultEndWeek = Math.min(defaultStartWeek + defaultDurationWeeks, 8);

      const calculatedStartDate =
        task.startDate ||
        new Date(baseTime + (defaultStartWeek - 2) * ONE_WEEK_MS).toISOString().split("T")[0];

      const calculatedDueDate =
        task.dueDate ||
        new Date(baseTime + (defaultEndWeek - 2) * ONE_WEEK_MS).toISOString().split("T")[0];

      const defaultProgress =
        task.progress !== undefined
          ? task.progress
          : task.status === "done"
          ? 100
          : task.status === "in_progress"
          ? 55
          : task.status === "review"
          ? 85
          : 0;

      const defaultMilestone =
        task.milestone ||
        (idx === 0
          ? "M1: Architecture & SRS"
          : idx === 1
          ? "M2: Core Subsystems"
          : idx === 2
          ? "M3: Integration & Tests"
          : "M4: Viva & Final Defense");

      return {
        ...task,
        startDate: calculatedStartDate,
        dueDate: calculatedDueDate,
        progress: defaultProgress,
        milestone: defaultMilestone,
        startWeek: defaultStartWeek,
        endWeek: defaultEndWeek,
      };
    });
  }, [project.tasks]);

  // Filtering
  const filteredTasks = useMemo(() => {
    return enrichedTasks.filter((t) => {
      if (filterPriority !== "all" && t.priority !== filterPriority) return false;
      if (filterStatus !== "all" && t.status !== filterStatus) return false;
      return true;
    });
  }, [enrichedTasks, filterPriority, filterStatus]);

  // Milestones summary
  const milestoneGroups: MilestoneGroup[] = useMemo(() => {
    const groups: { [key: string]: EnrichedTask[] } = {};
    const colors: { [key: string]: string } = {
      "M1: Architecture & SRS": "#3b82f6",
      "M2: Core Subsystems": "#10b981",
      "M3: Integration & Tests": "#8b5cf6",
      "M4: Viva & Final Defense": "#f59e0b",
    };

    filteredTasks.forEach((t) => {
      const m = t.milestone || "General Engineering";
      if (!groups[m]) groups[m] = [];
      groups[m].push(t);
    });

    return Object.entries(groups).map(([name, tasks], i) => ({
      id: `m-group-${i}`,
      name,
      color: colors[name] || "#10b981",
      tasks,
    }));
  }, [filteredTasks]);

  // Metrics
  const totalTasks = project.tasks.length;
  const completedTasks = project.tasks.filter((t) => t.status === "done").length;
  const avgProgress =
    enrichedTasks.length > 0
      ? Math.round(enrichedTasks.reduce((acc, t) => acc + (t.progress || 0), 0) / enrichedTasks.length)
      : 0;

  const todayStr = new Date().toISOString().split("T")[0];
  const overdueTasks = enrichedTasks.filter(
    (t) => t.status !== "done" && t.dueDate && t.dueDate < todayStr
  ).length;

  // Task updates
  const handleUpdateTaskField = (taskId: string, updates: Partial<ProjectTask>) => {
    const updatedTasks = project.tasks.map((t) => {
      if (t.id === taskId) {
        return { ...t, ...updates };
      }
      return t;
    });
    onUpdateProject({
      ...project,
      tasks: updatedTasks,
      updatedAt: Date.now(),
    });
  };

  const handleDeleteTask = (taskId: string) => {
    const updatedTasks = project.tasks.filter((t) => t.id !== taskId);
    onUpdateProject({
      ...project,
      tasks: updatedTasks,
      updatedAt: Date.now(),
    });
  };

  const handleAddNewTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const today = new Date();
    const baseTime = today.getTime();
    const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

    const startDate = new Date(baseTime + (newStartWeek - 1) * ONE_WEEK_MS).toISOString().split("T")[0];
    const dueDate = new Date(baseTime + (newEndWeek - 1) * ONE_WEEK_MS).toISOString().split("T")[0];

    const newTask: ProjectTask = {
      id: "task-" + Date.now(),
      title: newTitle.trim(),
      status: newProgress === 100 ? "done" : newProgress > 0 ? "in_progress" : "todo",
      priority: newPriority,
      milestone: newMilestone,
      startDate,
      dueDate,
      progress: newProgress,
    };

    onUpdateProject({
      ...project,
      tasks: [...project.tasks, newTask],
      updatedAt: Date.now(),
    });

    setNewTitle("");
    setNewProgress(0);
    setShowAddModal(false);
  };

  // Weeks range
  const weeks = [1, 2, 3, 4, 5, 6, 7, 8];

  const getStatusColor = (status: ProjectTask["status"]) => {
    switch (status) {
      case "done":
        return "bg-emerald-500 text-emerald-100 border-emerald-400";
      case "in_progress":
        return "bg-blue-600 text-blue-100 border-blue-400";
      case "review":
        return "bg-purple-600 text-purple-100 border-purple-400";
      default:
        return "bg-amber-600 text-amber-100 border-amber-400";
    }
  };

  const getPriorityBadge = (priority: ProjectTask["priority"]) => {
    switch (priority) {
      case "high":
        return <span className="px-1.5 py-0.5 rounded text-[10px] bg-rose-500/10 text-rose-400 border border-rose-500/30">High</span>;
      case "medium":
        return <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/30">Med</span>;
      default:
        return <span className="px-1.5 py-0.5 rounded text-[10px] bg-zinc-800 text-zinc-400 border border-zinc-700">Low</span>;
    }
  };

  return (
    <div className="h-full flex flex-col p-6 space-y-5 overflow-y-auto bg-zinc-950 text-zinc-200">
      {/* Top Banner & Gantt Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-zinc-800 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-zinc-100">Project Gantt Timeline & Milestone Schedule</h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              Interactive Gantt
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Visual milestone roadmap, task sprint schedules, deadline monitoring, and completion trajectory for{" "}
            <span className="text-zinc-200 font-semibold">{project.name}</span>.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition cursor-pointer shadow-sm active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Schedule Task</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3.5 bg-zinc-900/60 border border-zinc-800 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Overall Timeline Adherence</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400">{avgProgress}%</div>
          <p className="text-[10px] text-zinc-400">
            {completedTasks} of {totalTasks} deliverables finished
          </p>
        </div>

        <div className="p-3.5 bg-zinc-900/60 border border-zinc-800 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Total Sprint Duration</span>
            <Clock className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-zinc-100">8 Weeks</div>
          <p className="text-[10px] text-zinc-400">Semester capstone timeline</p>
        </div>

        <div className="p-3.5 bg-zinc-900/60 border border-zinc-800 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Critical Path Milestones</span>
            <Flag className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-zinc-100">{milestoneGroups.length} Phases</div>
          <p className="text-[10px] text-zinc-400">Architecture → Final Defense</p>
        </div>

        <div className="p-3.5 bg-zinc-900/60 border border-zinc-800 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Deadlines At Risk</span>
            <AlertTriangle className={`w-4 h-4 ${overdueTasks > 0 ? "text-rose-400" : "text-emerald-400"}`} />
          </div>
          <div className={`text-2xl font-bold font-mono ${overdueTasks > 0 ? "text-rose-400" : "text-emerald-400"}`}>
            {overdueTasks}
          </div>
          <p className="text-[10px] text-zinc-400">
            {overdueTasks === 0 ? "All milestones on schedule" : "Requires student priority"}
          </p>
        </div>
      </div>

      {/* Filter and View Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-zinc-900/50 border border-zinc-800 rounded-xl text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-zinc-400">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filter:</span>
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="all">All Statuses ({project.tasks.length})</option>
            <option value="todo">Pending / Todo</option>
            <option value="in_progress">In Progress</option>
            <option value="review">In Review</option>
            <option value="done">Completed</option>
          </select>

          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="all">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-[11px] text-zinc-400">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-emerald-500/80 inline-block" />
            <span>Done</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-blue-600/80 inline-block" />
            <span>In Progress</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-purple-600/80 inline-block" />
            <span>Review</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-amber-600/80 inline-block" />
            <span>Todo</span>
          </div>
        </div>
      </div>

      {/* Main Gantt View Table & Chart */}
      <div className="border border-zinc-800 rounded-xl bg-zinc-900/40 overflow-hidden shadow-lg flex flex-col">
        {/* Table & Chart Header */}
        <div className="grid grid-cols-12 bg-zinc-900/90 border-b border-zinc-800 text-[11px] font-semibold text-zinc-300 py-2.5 px-4 items-center">
          <div className="col-span-5 md:col-span-4 flex items-center gap-2">
            <span>Milestone & Deliverable Task</span>
          </div>
          <div className="hidden md:flex col-span-2 items-center justify-between px-2">
            <span>Deadlines</span>
            <span>Progress</span>
          </div>
          <div className="col-span-7 md:col-span-6 grid grid-cols-8 text-center font-mono text-[10px] text-zinc-400 border-l border-zinc-800/80 pl-2">
            {weeks.map((w) => (
              <div key={w} className="py-0.5 border-r border-zinc-800/40 last:border-r-0">
                W{w}
              </div>
            ))}
          </div>
        </div>

        {/* Milestone Groups and Rows */}
        {milestoneGroups.length === 0 ? (
          <div className="p-12 text-center text-zinc-500 text-xs">
            No milestone tasks found matching the selected filter criteria.
          </div>
        ) : (
          milestoneGroups.map((group) => (
            <div key={group.id} className="border-b border-zinc-800/60 last:border-b-0">
              {/* Milestone Header Header */}
              <div className="flex items-center gap-2 px-4 py-2 bg-zinc-950/70 border-b border-zinc-800/50 text-xs font-semibold text-zinc-200">
                <Flag className="w-3.5 h-3.5" style={{ color: group.color }} />
                <span>{group.name}</span>
                <span className="text-[10px] text-zinc-500 font-normal">({group.tasks.length} deliverables)</span>
              </div>

              {/* Task Rows */}
              {group.tasks.map((task) => {
                const isEditing = editingTaskId === task.id;

                // Derive week start and span
                const startW = Math.max(1, Math.min(8, task.startWeek || 1));
                const endW = Math.max(startW, Math.min(8, task.endWeek || Math.min(startW + 1, 8)));
                const colSpan = endW - startW + 1;
                const colStart = startW;

                return (
                  <div
                    key={task.id}
                    className="grid grid-cols-12 px-4 py-2.5 border-b border-zinc-800/30 hover:bg-zinc-800/20 transition items-center text-xs"
                  >
                    {/* Left Col: Task Name, Status, Priority */}
                    <div className="col-span-5 md:col-span-4 pr-3 flex items-center justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full shrink-0 ${
                              task.status === "done"
                                ? "bg-emerald-400"
                                : task.status === "in_progress"
                                ? "bg-blue-400"
                                : task.status === "review"
                                ? "bg-purple-400"
                                : "bg-amber-400"
                            }`}
                          />
                          <p className="font-medium text-zinc-200 truncate text-xs" title={task.title}>
                            {task.title}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 mt-1 pl-4 text-[10px] text-zinc-500">
                          {getPriorityBadge(task.priority)}
                          <select
                            value={task.status}
                            onChange={(e) =>
                              handleUpdateTaskField(task.id, {
                                status: e.target.value as ProjectTask["status"],
                                progress: e.target.value === "done" ? 100 : task.progress,
                              })
                            }
                            className="bg-zinc-950 border border-zinc-800 rounded px-1.5 py-0.5 text-[10px] text-zinc-400 cursor-pointer focus:outline-none"
                          >
                            <option value="todo">Todo</option>
                            <option value="in_progress">In Progress</option>
                            <option value="review">Review</option>
                            <option value="done">Done</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 opacity-60 hover:opacity-100 transition">
                        <button
                          onClick={() => setEditingTaskId(isEditing ? null : task.id)}
                          className="p-1 text-zinc-400 hover:text-zinc-200 cursor-pointer rounded"
                          title="Edit dates and progress"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="p-1 text-zinc-500 hover:text-rose-400 cursor-pointer rounded"
                          title="Delete task"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Middle Col: Date / Progress Slider */}
                    <div className="hidden md:flex col-span-2 items-center justify-between px-2 text-[11px] text-zinc-400">
                      <div className="font-mono text-[10px]">
                        <div>{task.startDate}</div>
                        <div className="text-zinc-500">to {task.dueDate}</div>
                      </div>
                      <div className="flex flex-col items-end gap-1 w-16">
                        <span className="font-mono text-[10px] text-emerald-400">{task.progress}%</span>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="5"
                          value={task.progress || 0}
                          onChange={(e) =>
                            handleUpdateTaskField(task.id, {
                              progress: parseInt(e.target.value, 10),
                              status: parseInt(e.target.value, 10) === 100 ? "done" : task.status,
                            })
                          }
                          className="w-full accent-emerald-500 h-1 bg-zinc-800 rounded cursor-pointer"
                        />
                      </div>
                    </div>

                    {/* Right Col: Gantt Bar Grid */}
                    <div className="col-span-7 md:col-span-6 grid grid-cols-8 relative h-8 items-center border-l border-zinc-800/80 pl-2">
                      {/* Grid background lines */}
                      <div className="absolute inset-0 grid grid-cols-8 pointer-events-none">
                        {weeks.map((w) => (
                          <div
                            key={w}
                            className={`border-r border-zinc-800/30 h-full ${w === 4 ? "bg-emerald-500/5" : ""}`}
                          />
                        ))}
                      </div>

                      {/* Current Sprint/Week Marker (Week 4 active) */}
                      <div
                        className="absolute top-0 bottom-0 w-0.5 bg-emerald-400/80 z-10 shadow-[0_0_8px_rgba(52,211,153,0.5)] pointer-events-none"
                        style={{ left: "45%" }}
                        title="Current Sprint (Week 4)"
                      />

                      {/* Gantt Bar Element */}
                      <div
                        className="relative z-20 h-5.5 rounded-md flex items-center px-2 shadow-sm transition-all overflow-hidden border cursor-pointer hover:brightness-110"
                        style={{
                          gridColumnStart: colStart,
                          gridColumnEnd: `span ${colSpan}`,
                          backgroundColor:
                            task.status === "done"
                              ? "rgba(16, 185, 129, 0.25)"
                              : task.status === "in_progress"
                              ? "rgba(59, 130, 246, 0.25)"
                              : task.status === "review"
                              ? "rgba(139, 92, 246, 0.25)"
                              : "rgba(245, 158, 11, 0.25)",
                          borderColor:
                            task.status === "done"
                              ? "#10b981"
                              : task.status === "in_progress"
                              ? "#3b82f6"
                              : task.status === "review"
                              ? "#8b5cf6"
                              : "#f59e0b",
                        }}
                        title={`${task.title} (Week ${startW} to ${endW}) - ${task.progress}%`}
                      >
                        {/* Progress Fill Background */}
                        <div
                          className="absolute inset-y-0 left-0 transition-all duration-300"
                          style={{
                            width: `${task.progress || 0}%`,
                            backgroundColor:
                              task.status === "done"
                                ? "#10b981"
                                : task.status === "in_progress"
                                ? "#3b82f6"
                                : task.status === "review"
                                ? "#8b5cf6"
                                : "#f59e0b",
                            opacity: 0.65,
                          }}
                        />

                        {/* Bar Label & Percentage */}
                        <div className="relative z-10 flex items-center justify-between w-full text-[10px] font-medium text-white px-1 truncate">
                          <span className="truncate">{task.title}</span>
                          <span className="font-mono text-[9px] shrink-0 ml-1.5 opacity-90">
                            {task.progress}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Inline edit panel if toggled */}
                    {isEditing && (
                      <div className="col-span-12 mt-2 p-3 bg-zinc-950 border border-zinc-700 rounded-lg flex flex-wrap items-center justify-between gap-3 text-xs">
                        <div className="flex flex-wrap items-center gap-3">
                          <div>
                            <span className="text-[10px] text-zinc-500 block">Start Date:</span>
                            <input
                              type="date"
                              value={task.startDate}
                              onChange={(e) => handleUpdateTaskField(task.id, { startDate: e.target.value })}
                              className="bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-200"
                            />
                          </div>
                          <div>
                            <span className="text-[10px] text-zinc-500 block">Due Date:</span>
                            <input
                              type="date"
                              value={task.dueDate}
                              onChange={(e) => handleUpdateTaskField(task.id, { dueDate: e.target.value })}
                              className="bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-200"
                            />
                          </div>
                          <div>
                            <span className="text-[10px] text-zinc-500 block">Milestone:</span>
                            <select
                              value={task.milestone}
                              onChange={(e) => handleUpdateTaskField(task.id, { milestone: e.target.value })}
                              className="bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-200"
                            >
                              <option value="M1: Architecture & SRS">M1: Architecture & SRS</option>
                              <option value="M2: Core Subsystems">M2: Core Subsystems</option>
                              <option value="M3: Integration & Tests">M3: Integration & Tests</option>
                              <option value="M4: Viva & Final Defense">M4: Viva & Final Defense</option>
                            </select>
                          </div>
                          <div>
                            <span className="text-[10px] text-zinc-500 block">Priority:</span>
                            <select
                              value={task.priority}
                              onChange={(e) =>
                                handleUpdateTaskField(task.id, {
                                  priority: e.target.value as ProjectTask["priority"],
                                })
                              }
                              className="bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-200"
                            >
                              <option value="low">Low</option>
                              <option value="medium">Medium</option>
                              <option value="high">High</option>
                            </select>
                          </div>
                        </div>

                        <button
                          onClick={() => setEditingTaskId(null)}
                          className="flex items-center gap-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs cursor-pointer font-medium"
                        >
                          <Check className="w-3.5 h-3.5" /> Done Editing
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))
        )}
      </div>

      {/* Schedule / Milestone Tips Box */}
      <div className="p-4 bg-emerald-950/20 border border-emerald-900/40 rounded-xl flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <h4 className="font-semibold text-emerald-300">Engineering Capstone Milestone Best Practices</h4>
          <p className="text-zinc-400">
            External college vivas and university project evaluations weight adherence to milestone schedules heavily.
            Ensure your <strong>Core Subsystems (M2)</strong> are thoroughly tested before entering <strong>Final Defense (M4)</strong>.
            Export your project bundle as ZIP anytime to back up all source files and runbooks locally.
          </p>
        </div>
      </div>

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-400" />
                <h3 className="font-semibold text-sm text-zinc-100">Schedule New Milestone Task</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-zinc-400 hover:text-zinc-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddNewTask} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Deliverable / Task Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Implement JWT Auth, Benchmark Redis Cache"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Milestone Phase
                  </label>
                  <select
                    value={newMilestone}
                    onChange={(e) => setNewMilestone(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-700 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="M1: Architecture & SRS">M1: Architecture & SRS</option>
                    <option value="M2: Core Subsystems">M2: Core Subsystems</option>
                    <option value="M3: Integration & Tests">M3: Integration & Tests</option>
                    <option value="M4: Viva & Final Defense">M4: Viva & Final Defense</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as "low" | "medium" | "high")}
                    className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-700 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="high">High Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="low">Low Priority</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Start Week (1 - 8)
                  </label>
                  <select
                    value={newStartWeek}
                    onChange={(e) => setNewStartWeek(parseInt(e.target.value, 10))}
                    className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-700 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    {weeks.map((w) => (
                      <option key={w} value={w}>
                        Week {w}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Deadline Week (1 - 8)
                  </label>
                  <select
                    value={newEndWeek}
                    onChange={(e) => setNewEndWeek(parseInt(e.target.value, 10))}
                    className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-700 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    {weeks.map((w) => (
                      <option key={w} value={w}>
                        Week {w}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-zinc-300">Initial Progress %</span>
                  <span className="font-mono text-emerald-400">{newProgress}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={newProgress}
                  onChange={(e) => setNewProgress(parseInt(e.target.value, 10))}
                  className="w-full accent-emerald-500 h-1 bg-zinc-800 rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-sm active:scale-95"
                >
                  Schedule Deliverable
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
