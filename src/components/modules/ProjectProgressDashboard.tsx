import React, { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  Target,
  Layers,
  Calendar,
  Flame,
  Award,
  Package,
  Download,
} from "lucide-react";
import { WorkspaceProject, ProjectTask } from "../../types";

interface ProjectProgressDashboardProps {
  project: WorkspaceProject;
  onAddTaskPrompt?: () => void;
  onDownloadBundle?: () => void;
}

const STATUS_COLORS: Record<string, string> = {
  done: "#10b981", // Emerald
  in_progress: "#3b82f6", // Blue
  review: "#f59e0b", // Amber
  todo: "#71717a", // Zinc / Gray
};

const PRIORITY_COLORS: Record<string, string> = {
  high: "#f43f5e", // Rose
  medium: "#f59e0b", // Amber
  low: "#10b981", // Emerald
};

export const ProjectProgressDashboard: React.FC<ProjectProgressDashboardProps> = ({
  project,
  onAddTaskPrompt,
  onDownloadBundle,
}) => {
  const totalTasks = project.tasks.length;

  // 1. Task Completion Status Data
  const statusData = useMemo(() => {
    const counts = {
      done: 0,
      in_progress: 0,
      review: 0,
      todo: 0,
    };

    project.tasks.forEach((t) => {
      counts[t.status] = (counts[t.status] || 0) + 1;
    });

    return [
      { name: "Completed", key: "done", count: counts.done, color: STATUS_COLORS.done },
      { name: "In Progress", key: "in_progress", count: counts.in_progress, color: STATUS_COLORS.in_progress },
      { name: "In Review", key: "review", count: counts.review, color: STATUS_COLORS.review },
      { name: "To Do", key: "todo", count: counts.todo, color: STATUS_COLORS.todo },
    ];
  }, [project.tasks]);

  // 2. Priority Distribution Data
  const priorityData = useMemo(() => {
    const counts = {
      high: 0,
      medium: 0,
      low: 0,
    };

    project.tasks.forEach((t) => {
      counts[t.priority] = (counts[t.priority] || 0) + 1;
    });

    return [
      { name: "High Priority", key: "high", count: counts.high, color: PRIORITY_COLORS.high },
      { name: "Medium Priority", key: "medium", count: counts.medium, color: PRIORITY_COLORS.medium },
      { name: "Low Priority", key: "low", count: counts.low, color: PRIORITY_COLORS.low },
    ];
  }, [project.tasks]);

  // 3. Milestone Timeline / Sprint Trajectory Data
  const timelineMilestones = useMemo(() => {
    const completedCount = project.tasks.filter((t) => t.status === "done").length;
    const inProgressCount = project.tasks.filter((t) => t.status === "in_progress").length;

    // Projected 8-week sprint milestone roadmap based on project scope
    return [
      { week: "W1 Setup", planned: 2, completed: Math.min(2, completedCount), target: "Repo, SRS & Specs" },
      { week: "W2 Design", planned: 4, completed: Math.min(4, Math.max(0, completedCount)), target: "Architecture & DB" },
      {
        week: "W3 Core Logic",
        planned: 6,
        completed: Math.min(6, Math.max(0, completedCount)),
        target: "Core Subsystems",
      },
      {
        week: "W4 Integration",
        planned: 8,
        completed: Math.min(8, Math.max(0, completedCount + (inProgressCount > 0 ? 1 : 0))),
        target: "APIs & Interconnect",
      },
      { week: "W5 Testing", planned: 10, completed: Math.min(10, completedCount), target: "Unit & Stress Tests" },
      { week: "W6 Optimization", planned: 11, completed: Math.min(11, completedCount), target: "Latency & Big-O" },
      { week: "W7 Docs", planned: 12, completed: Math.min(12, completedCount), target: "Documentation & Video" },
      { week: "W8 Defense", planned: 12, completed: Math.min(12, completedCount), target: "Viva Voce Demo" },
    ];
  }, [project.tasks]);

  // Metrics
  const completedTasks = project.tasks.filter((t) => t.status === "done").length;
  const inProgressTasks = project.tasks.filter((t) => t.status === "in_progress").length;
  const highPriorityPending = project.tasks.filter(
    (t) => t.priority === "high" && t.status !== "done"
  ).length;
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="h-full overflow-y-auto p-6 max-w-6xl mx-auto space-y-6 text-zinc-200">
      {/* Offline Bundle Quick Export Banner */}
      <div className="p-4 bg-emerald-950/20 border border-emerald-500/30 rounded-xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-zinc-100 flex items-center gap-2">
              <span>Local Offline Project Bundle</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Ready to ZIP
              </span>
            </h3>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Packages all {project.files.length} source code files, project metadata, task backlog, and offline run scripts into a standalone package.
            </p>
          </div>
        </div>

        {onDownloadBundle && (
          <button
            onClick={onDownloadBundle}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium transition cursor-pointer shadow-sm active:scale-95 shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Project Bundle (.ZIP)</span>
          </button>
        )}
      </div>

      {/* Top Project KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Completion % */}
        <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Overall Progress</span>
            <Target className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400">{completionPercentage}%</div>
          <div className="w-full bg-zinc-950 h-1.5 rounded-full overflow-hidden mt-1.5 border border-zinc-800">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
          <p className="text-[10px] text-zinc-500 mt-1">
            {completedTasks} of {totalTasks} milestone tasks done
          </p>
        </div>

        {/* In Flight Tasks */}
        <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>In Flight / Review</span>
            <Clock className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-zinc-100">
            {inProgressTasks + project.tasks.filter((t) => t.status === "review").length}
          </div>
          <p className="text-[10px] text-zinc-400 mt-2">Active sprints being built</p>
        </div>

        {/* High Priority Blockers */}
        <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>High-Priority Pending</span>
            <AlertCircle className="w-4 h-4 text-rose-400" />
          </div>
          <div
            className={`text-2xl font-bold font-mono ${
              highPriorityPending > 0 ? "text-rose-400" : "text-emerald-400"
            }`}
          >
            {highPriorityPending}
          </div>
          <p className="text-[10px] text-zinc-400 mt-2">
            {highPriorityPending === 0 ? "No critical blockers" : "Requires student focus"}
          </p>
        </div>

        {/* Code Files & Artifacts */}
        <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Project Artifacts</span>
            <Layers className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-zinc-100">{project.files.length}</div>
          <p className="text-[10px] text-zinc-400 mt-2">Source files & docs authored</p>
        </div>
      </div>

      {/* Row 1: Task Completion Bar Chart & Priority Distribution Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Task Completion Status Bar Chart (2 Cols) */}
        <div className="lg:col-span-2 p-5 bg-zinc-900/60 border border-zinc-800 rounded-xl space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-semibold text-zinc-100">Task Completion Status Breakdown</h3>
            </div>
            <span className="text-[11px] font-mono text-zinc-400">{totalTasks} Total Tasks</span>
          </div>

          <div className="h-60 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="name" stroke="#71717a" fontSize={11} tickLine={false} />
                <YAxis stroke="#71717a" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip
                  formatter={(val: any) => [`${val} tasks`, "Count"]}
                  contentStyle={{
                    backgroundColor: "#09090b",
                    borderColor: "#27272a",
                    borderRadius: "8px",
                    fontSize: "12px",
                    color: "#f4f4f5",
                  }}
                />
                <Bar dataKey="count" name="Tasks" radius={[4, 4, 0, 0]}>
                  {statusData.map((entry, index) => (
                    <Cell key={`status-cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80 text-xs">
            {statusData.map((s) => (
              <div key={s.name} className="flex items-center gap-1.5 text-[11px]">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                <span className="text-zinc-400">{s.name}:</span>
                <span className="font-mono font-semibold text-zinc-200">{s.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Priority Distribution Donut (1 Col) */}
        <div className="p-5 bg-zinc-900/60 border border-zinc-800 rounded-xl space-y-3 flex flex-col">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-rose-400" />
              <h3 className="text-xs font-semibold text-zinc-100">Priority Distribution</h3>
            </div>
            <span className="text-[11px] font-mono text-zinc-400">Risk Profile</span>
          </div>

          <div className="h-52 w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={priorityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={46}
                  outerRadius={72}
                  paddingAngle={5}
                  dataKey="count"
                >
                  {priorityData.map((entry, index) => (
                    <Cell key={`priority-cell-${index}`} fill={entry.color} stroke="#18181b" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => [`${val} tasks`, "Tasks"]}
                  contentStyle={{
                    backgroundColor: "#09090b",
                    borderColor: "#27272a",
                    borderRadius: "8px",
                    fontSize: "12px",
                    color: "#f4f4f5",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-zinc-800/80 text-xs">
            {priorityData.map((item) => {
              const pct = totalTasks > 0 ? Math.round((item.count / totalTasks) * 100) : 0;
              return (
                <div key={item.name} className="flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-zinc-300 font-medium">{item.name}</span>
                  </div>
                  <div className="font-mono text-zinc-400">
                    {item.count} tasks ({pct}%)
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Row 2: Timeline Milestones & Sprint Trajectory */}
      <div className="p-5 bg-zinc-900/60 border border-zinc-800 rounded-xl space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-semibold text-zinc-100">8-Week Timeline Milestones & Trajectory</h3>
          </div>
          <span className="text-[11px] font-mono text-zinc-400">Sprint Target Progression</span>
        </div>

        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timelineMilestones} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="plannedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="completedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis dataKey="week" stroke="#71717a" fontSize={11} tickLine={false} />
              <YAxis stroke="#71717a" fontSize={11} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#09090b",
                  borderColor: "#27272a",
                  borderRadius: "8px",
                  fontSize: "12px",
                  color: "#f4f4f5",
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }}
                iconType="circle"
              />
              <Area
                type="monotone"
                dataKey="planned"
                name="Target Deliverables"
                stroke="#3b82f6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#plannedGrad)"
              />
              <Area
                type="monotone"
                dataKey="completed"
                name="Completed Milestones"
                stroke="#10b981"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#completedGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Sprint Milestone Goals */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2 border-t border-zinc-800/80 text-[11px]">
          {timelineMilestones.slice(0, 4).map((m, idx) => (
            <div key={idx} className="p-2 bg-zinc-950 border border-zinc-800 rounded">
              <span className="font-mono text-emerald-400 font-semibold">{m.week}:</span>{" "}
              <span className="text-zinc-300">{m.target}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
