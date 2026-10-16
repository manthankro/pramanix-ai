import React, { useState } from "react";
import {
  Briefcase,
  FileText,
  Github,
  Award,
  Sparkles,
  RefreshCw,
  TrendingUp,
  Compass,
  CheckCircle2,
} from "lucide-react";
import { analyzeTask } from "../../services/api";
import { MarkdownView } from "../common/MarkdownView";

export const CareerPrep: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"resume" | "github" | "interview" | "roadmap">("resume");

  // Resume state
  const [targetRole, setTargetRole] = useState("Software Engineer / Backend Developer");
  const [resumeText, setResumeText] = useState(
    `Manthan - Final Year Computer Engineering Student
Skills: Python, TypeScript, React, Docker, SQL, Git, Linux
Projects:
- Pramanix: Built an engineering mentor platform with repository analysis and study tools. Used Python, FastAPI, and Docker.
- Air Quality Telemetry: Created IoT dashboard with ESP32 and MQTT.
Experience:
- Software Engineering Intern at XYZ Tech (3 months): Worked on bug fixes in Python backend and wrote unit tests.`
  );
  const [resumeLoading, setResumeLoading] = useState(false);
  const [resumeResult, setResumeResult] = useState("");

  // Roadmap state
  const [roadmapRole, setRoadmapRole] = useState("Full-Stack / Distributed Systems Engineer");
  const [roadmapLoading, setRoadmapLoading] = useState(false);
  const [roadmapResult, setRoadmapResult] = useState("");

  const handleAuditResume = async () => {
    if (!resumeText.trim()) return;
    setResumeLoading(true);
    try {
      const result = await analyzeTask("resume_audit", {
        targetRole,
        resumeText,
      });
      setResumeResult(result);
    } catch (err: any) {
      setResumeResult(`Audit failed: ${err.message}`);
    } finally {
      setResumeLoading(false);
    }
  };

  const handleGenerateRoadmap = async () => {
    setRoadmapLoading(true);
    try {
      const result = await analyzeTask("project_builder", {
        idea: `6-Month Career & Technical Competency Roadmap for ${roadmapRole}`,
        domain: "Engineering Career Transition",
        level: "Campus Placement / Junior Engineer to Mid-level",
        constraints: "Structured month-by-month roadmap with portfolio projects, DSA milestones, and system design topics.",
      });
      setRoadmapResult(result);
    } catch (err: any) {
      setRoadmapResult(`Roadmap generation failed: ${err.message}`);
    } finally {
      setRoadmapLoading(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-zinc-950 text-zinc-200 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Sub-nav */}
        <div className="flex items-center gap-1 p-1 bg-zinc-900 border border-zinc-800 rounded-xl text-xs">
          <button
            onClick={() => setActiveTab("resume")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg cursor-pointer transition ${
              activeTab === "resume" ? "bg-zinc-800 text-emerald-400 font-semibold" : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>ATS Resume & XYZ Impact Rewriter</span>
          </button>
          <button
            onClick={() => setActiveTab("github")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg cursor-pointer transition ${
              activeTab === "github" ? "bg-zinc-800 text-emerald-400 font-semibold" : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Github className="w-3.5 h-3.5" />
            <span>GitHub Profile & Portfolio Strategy</span>
          </button>
          <button
            onClick={() => setActiveTab("roadmap")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg cursor-pointer transition ${
              activeTab === "roadmap" ? "bg-zinc-800 text-emerald-400 font-semibold" : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>6-Month Engineering Career Roadmap</span>
          </button>
        </div>

        {/* Tab 1: ATS Resume Review */}
        {activeTab === "resume" && (
          <div className="space-y-4">
            <div className="p-5 bg-zinc-900/60 border border-zinc-800 rounded-xl space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-emerald-400" />
                  Engineering ATS Resume Reviewer & XYZ Rewriter
                </h3>
                <span className="text-[11px] text-zinc-400">FAANG & Top Tech Recruiter Standards</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-zinc-300 font-medium">Target Engineering Role:</label>
                <input
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="e.g. Backend Distributed Systems Engineer, Embedded IoT Developer"
                  className="w-full p-2 bg-zinc-950 border border-zinc-700 rounded text-xs text-zinc-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-zinc-300 font-medium">Resume Text / Project Descriptions:</label>
                <textarea
                  rows={8}
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  className="w-full p-3 bg-zinc-950 border border-zinc-700 rounded text-xs font-mono text-zinc-200 focus:outline-none focus:border-emerald-500 leading-relaxed"
                />
              </div>

              <div className="flex justify-end pt-1">
                <button
                  onClick={handleAuditResume}
                  disabled={resumeLoading || !resumeText.trim()}
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold transition cursor-pointer disabled:opacity-60"
                >
                  {resumeLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  <span>{resumeLoading ? "Auditing Resume..." : "Audit Resume & Rewrite Bullet Points"}</span>
                </button>
              </div>
            </div>

            {resumeResult && (
              <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-xl space-y-3">
                <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                  ATS Audit & Project Bullet Point Rewrites
                </h4>
                <MarkdownView content={resumeResult} />
              </div>
            )}
          </div>
        )}

        {/* Tab 2: GitHub Profile Strategy */}
        {activeTab === "github" && (
          <div className="space-y-4">
            <div className="p-6 bg-zinc-900/60 border border-zinc-800 rounded-xl space-y-4">
              <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
                <Github className="w-4 h-4 text-emerald-400" />
                Engineering GitHub Portfolio Blueprint
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Technical hiring managers spend under 60 seconds reviewing a student&apos;s GitHub. Here is how to make
                repositories like <code>manthankro/pramanix</code> stand out immediately:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
                <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-lg space-y-2">
                  <div className="font-semibold text-zinc-100 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> 1. The 30-Second README Rule
                  </div>
                  <p className="text-zinc-400 leading-relaxed">
                    Lead with an animated GIF / screenshot, architectural diagram, and a 1-line problem statement.
                    Include a &quot;Quick Start&quot; section that actually runs in &le; 2 shell commands (e.g. <code>docker compose up</code>).
                  </p>
                </div>

                <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-lg space-y-2">
                  <div className="font-semibold text-zinc-100 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> 2. Pin 3 Tier-1 Repositories
                  </div>
                  <p className="text-zinc-400 leading-relaxed">
                    Avoid pinning tutorial clones or unpolished coursework. Pin: (1) A full-stack system with tests
                    and Docker, (2) A specialized performance/hardware project, (3) An open-source contribution.
                  </p>
                </div>

                <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-lg space-y-2">
                  <div className="font-semibold text-zinc-100 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> 3. Test Coverage & CI Badges
                  </div>
                  <p className="text-zinc-400 leading-relaxed">
                    Add GitHub Actions workflow (<code>.github/workflows/ci.yml</code>) running linting and tests on
                    every pull request. Badges demonstrate professional software engineering discipline.
                  </p>
                </div>

                <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-lg space-y-2">
                  <div className="font-semibold text-zinc-100 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> 4. Conventional Commits & Git Hygiene
                  </div>
                  <p className="text-zinc-400 leading-relaxed">
                    Use clear commit messages (<code>feat(api): add auth middleware</code>, <code>fix(db): optimize connection pool</code>).
                    Eliminate commits like &quot;update&quot;, &quot;fix bug&quot;, &quot;final final&quot;.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Roadmap */}
        {activeTab === "roadmap" && (
          <div className="space-y-4">
            <div className="p-5 bg-zinc-900/60 border border-zinc-800 rounded-xl space-y-3">
              <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
                <Compass className="w-4 h-4 text-emerald-400" />
                Personalized 6-Month Engineering Roadmap
              </h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={roadmapRole}
                  onChange={(e) => setRoadmapRole(e.target.value)}
                  placeholder="Target Role (e.g. Distributed Systems Engineer)"
                  className="flex-1 p-2 bg-zinc-950 border border-zinc-700 rounded text-xs text-zinc-100 focus:outline-none focus:border-emerald-500"
                />
                <button
                  onClick={handleGenerateRoadmap}
                  disabled={roadmapLoading || !roadmapRole.trim()}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold transition cursor-pointer disabled:opacity-60 shrink-0"
                >
                  {roadmapLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : "Build Career Roadmap"}
                </button>
              </div>
            </div>

            {roadmapResult && (
              <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-xl">
                <MarkdownView content={roadmapResult} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
