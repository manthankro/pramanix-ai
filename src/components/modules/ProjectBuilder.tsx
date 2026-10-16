import React, { useState } from "react";
import {
  Rocket,
  Sparkles,
  Download,
  FolderPlus,
  RefreshCw,
  CheckCircle,
  Cpu,
  Layers,
  Calendar,
  ShieldCheck,
  Award,
} from "lucide-react";
import { analyzeTask } from "../../services/api";
import { exportProjectZip } from "../../services/zipExport";
import { MarkdownView } from "../common/MarkdownView";

interface ProjectBuilderProps {
  onAddProjectToWorkspace?: (project: {
    name: string;
    domain: string;
    description: string;
    notes: string;
  }) => void;
}

export const ProjectBuilder: React.FC<ProjectBuilderProps> = ({ onAddProjectToWorkspace }) => {
  const [idea, setIdea] = useState("AI-Powered Autonomous Microgrid Energy Balancer & Fault Detector");
  const [domain, setDomain] = useState("Electrical & Computer Engineering");
  const [level, setLevel] = useState("Final Year Capstone / Major Project");
  const [constraints, setConstraints] = useState("Real-time telemetry, edge inference on Raspberry Pi, low-latency WebSocket dashboard");

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>("");
  const [savedSuccess, setSavedSuccess] = useState(false);

  const presets = [
    {
      title: "AI Autonomous Microgrid Energy Balancer",
      domain: "Electrical & Computer Engineering",
      constraints: "Edge computing, solar telemetry, inverter load balancing",
    },
    {
      title: "Decentralized Medical Record & Audit Ledger",
      domain: "Computer Science & IT",
      constraints: "Zero-knowledge proofs, HIPAA compliance, IPFS storage",
    },
    {
      title: "Low-Cost Smart Vibration Monitoring for Industrial Motors",
      domain: "Mechanical & Mechatronics",
      constraints: "MEMS accelerometer, FFT frequency analysis, predictive maintenance alerts",
    },
    {
      title: "Structural Health Monitoring of Bridges via IoT Strain Sensors",
      domain: "Civil & Structural Engineering",
      constraints: "Wireless sensor network, LoRaWAN, deflection stress models",
    },
    {
      title: "Automated Drone Vision for Search & Rescue",
      domain: "Robotics & AI",
      constraints: "Edge YOLOv8, thermal camera, offline GPS mapping",
    },
  ];

  const handleGenerate = async () => {
    if (!idea.trim()) return;
    setLoading(true);
    setSavedSuccess(false);
    try {
      const plan = await analyzeTask("project_builder", {
        idea,
        domain,
        level,
        constraints,
      });
      setResult(plan);
    } catch (err: any) {
      setResult(`Generation failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleExportZip = async () => {
    if (!result) return;
    await exportProjectZip(
      idea,
      [
        {
          name: "src/main.py",
          content: `# Main entrypoint for ${idea}\n\ndef init():\n    print("[Pramanix] Initializing ${idea} subsystem...")\n\nif __name__ == '__main__':\n    init()\n`,
          language: "python",
        },
        {
          name: "config.json",
          content: JSON.stringify(
            {
              projectName: idea,
              domain,
              level,
              version: "1.0.0",
              status: "planned",
            },
            null,
            2
          ),
          language: "json",
        },
      ],
      {
        srs: result,
        roadmap: `8-Week Milestone roadmap for ${idea}.\nRefer to SRS for detailed sprint breakdowns.`,
        vivaGuide: `Viva Defense & Examiner Q&A Guide for ${idea}.\nIncluded in master specification.`,
        readme: `# ${idea}\n\n## Overview\nDomain: ${domain}\nLevel: ${level}\n\nGenerated with Pramanix - AI Engineering Mentor.\n\n### Included in this package:\n- \`/docs/SRS_REQUIREMENTS.md\`\n- \`/docs/MILESTONES_ROADMAP.md\`\n- \`/docs/VIVA_DEFENSE_GUIDE.md\`\n- \`/src/main.py\`\n`,
      }
    );
  };

  const handleSaveToWorkspace = () => {
    if (onAddProjectToWorkspace && result) {
      onAddProjectToWorkspace({
        name: idea,
        domain,
        description: `Project Specification & Blueprint for ${idea}`,
        notes: result,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-zinc-950 text-zinc-200 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Input Formulation Form */}
        <div className="p-6 bg-zinc-900/60 border border-zinc-800 rounded-xl space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
            <h2 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
              <Rocket className="w-4 h-4 text-emerald-400" />
              Engineering Student Project Architect
            </h2>
            <span className="text-[11px] text-zinc-400">Turn an idea into a complete engineering specification</span>
          </div>

          {/* Quick presets */}
          <div>
            <div className="text-[11px] text-zinc-400 mb-2 font-medium">Quick Ideas & Presets:</div>
            <div className="flex flex-wrap gap-1.5">
              {presets.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setIdea(p.title);
                    setDomain(p.domain);
                    setConstraints(p.constraints);
                  }}
                  className="px-2.5 py-1 rounded bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200 text-xs transition cursor-pointer"
                >
                  {p.title}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">Project Title / Raw Idea</label>
              <input
                type="text"
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                placeholder="e.g. AI-Powered Autonomous Microgrid Energy Balancer"
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700/80 rounded text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">Engineering Branch / Domain</label>
              <select
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700/80 rounded text-xs text-zinc-100 focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="Computer Science & IT">Computer Science & IT (Full-Stack, Distributed, Systems)</option>
                <option value="Electrical & Computer Engineering">Electrical & Computer Engineering (Power, Microgrids, IoT)</option>
                <option value="Electronics & Communication (ECE)">Electronics & Communication (VLSI, DSP, Embedded, RF)</option>
                <option value="Mechanical & Mechatronics">Mechanical & Mechatronics (Robotics, CAD/CAM, Thermal, Fluids)</option>
                <option value="Civil & Structural Engineering">Civil & Structural Engineering (BIM, Structural, Geotech)</option>
                <option value="Artificial Intelligence & Data Science">Artificial Intelligence & Data Science (ML, CV, NLP)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">Target Academic Scope</label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700/80 rounded text-xs text-zinc-100 focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="Final Year Capstone / Major Project">Final Year Capstone / Major Project (Rigorous)</option>
                <option value="Pre-final Year Mini-Project">Pre-final Year Mini-Project (Focused)</option>
                <option value="Hackathon MVP / Prototype">Hackathon 48hr MVP / Working Prototype</option>
                <option value="Master Thesis / Research Paper Project">Master Thesis / Research Paper Implementation</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">Key Constraints / Requirements</label>
              <input
                type="text"
                value={constraints}
                onChange={(e) => setConstraints(e.target.value)}
                placeholder="e.g. Budget < $100, Raspberry Pi 4, low-latency WebSocket, offline first"
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700/80 rounded text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end pt-2">
            <button
              onClick={handleGenerate}
              disabled={loading || !idea.trim()}
              className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold transition cursor-pointer disabled:opacity-60 shadow-sm"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>{loading ? "Architecting Project..." : "Generate Full Project Plan & SRS"}</span>
            </button>
          </div>
        </div>

        {/* Generated Deliverables Section */}
        {result && (
          <div className="space-y-4">
            {/* Action bar for generated result */}
            <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-zinc-100">Project Blueprint Generated</h3>
                  <div className="text-[11px] text-zinc-400">
                    Includes SRS, Architecture, Tech Stack, 8-Week Roadmap & Viva Defense
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleSaveToWorkspace}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 rounded text-xs font-medium transition cursor-pointer"
                >
                  {savedSuccess ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <FolderPlus className="w-3.5 h-3.5" />}
                  <span>{savedSuccess ? "Saved to Workspace!" : "Save to Workspace"}</span>
                </button>
                <button
                  onClick={handleExportZip}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-medium transition cursor-pointer shadow-sm active:scale-95"
                  title="Export full project package as a downloadable ZIP"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Project Package (.ZIP)</span>
                </button>
              </div>
            </div>

            {/* Markdown Display */}
            <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-xl">
              <MarkdownView content={result} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
