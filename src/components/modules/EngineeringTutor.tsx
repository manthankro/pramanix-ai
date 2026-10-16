import React, { useState } from "react";
import {
  GraduationCap,
  Sparkles,
  Calculator,
  Cpu,
  Zap,
  Wrench,
  Building2,
  Binary,
  RefreshCw,
  HelpCircle,
} from "lucide-react";
import { sendChatMessage } from "../../services/api";
import { MarkdownView } from "../common/MarkdownView";

type BranchId = "cs" | "ece" | "ee" | "me" | "ce";

export const EngineeringTutor: React.FC = () => {
  const [selectedBranch, setSelectedBranch] = useState<BranchId>("cs");
  const [customQuestion, setCustomQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [explanation, setExplanation] = useState<string>("");

  // Interactive Calculators state
  const [activeCalculator, setActiveCalculator] = useState<"circuits" | "complexity" | "stress" | "shannon">("complexity");

  // Circuit calculator inputs
  const [voltage, setVoltage] = useState(12);
  const [resistance, setResistance] = useState(100);
  const [capacitance, setCapacitance] = useState(10); // uF

  // Mechanical stress inputs
  const [force, setForce] = useState(5000); // N
  const [area, setArea] = useState(0.002); // m^2
  const [origLength, setOrigLength] = useState(1.0); // m
  const [deltaLength, setDeltaLength] = useState(0.0005); // m

  // Shannon inputs
  const [bandwidth, setBandwidth] = useState(20); // MHz
  const [snrDb, setSnrDb] = useState(30); // dB

  // Big-O visualizer input
  const [inputSizeN, setInputSizeN] = useState(50);

  const branchData: Record<
    BranchId,
    { name: string; icon: React.ReactNode; topics: string[]; samplePrompt: string }
  > = {
    cs: {
      name: "Computer Science & IT",
      icon: <Binary className="w-4 h-4" />,
      topics: [
        "Virtual Memory & Paging Mechanisms",
        "Paxos and Raft Consensus in Distributed Systems",
        "B-Trees vs LSM-Trees in Modern Databases",
        "TCP Slow Start and Congestion Avoidance",
        "Dijkstra vs A* Shortest Path Derivation",
      ],
      samplePrompt: "Explain how Virtual Memory and the Translation Lookaside Buffer (TLB) work step-by-step with hardware memory access flows.",
    },
    ece: {
      name: "Electronics & Communication",
      icon: <Cpu className="w-4 h-4" />,
      topics: [
        "Nyquist-Shannon Sampling Theorem & Aliasing",
        "CMOS Inverter Dynamic Power Dissipation & Propagation Delay",
        "Phase-Locked Loops (PLL) Operating Principles",
        "QAM (Quadrature Amplitude Modulation) Constellations",
        "SPI vs I2C vs UART Bus Protocol Comparison",
      ],
      samplePrompt: "Derive the Nyquist sampling criterion and explain why anti-aliasing low-pass filtering is required before ADC conversion.",
    },
    ee: {
      name: "Electrical Engineering",
      icon: <Zap className="w-4 h-4" />,
      topics: [
        "Three-Phase Balanced vs Unbalanced Power Calculations",
        "Synchronous Generator V-Curves and Reactive Power",
        "Buck-Boost DC-DC Converter CCM vs DCM Operation",
        "Root Locus Stability Analysis in Feedback Control",
        "Transformer Equivalent Circuit & Open/Short-Circuit Tests",
      ],
      samplePrompt: "Explain Buck Converter continuous conduction mode (CCM) with inductor volt-second balance and capacitor charge balance equations.",
    },
    me: {
      name: "Mechanical Engineering",
      icon: <Wrench className="w-4 h-4" />,
      topics: [
        "Rankine Cycle with Reheat & Regeneration",
        "Bernoulli's Principle & Venturi Flow Measurement",
        "Mohr's Circle for 2D Principal Stresses",
        "Heat Exchanger LMTD vs NTU Effectiveness",
        "Four-Bar Linkage Grashof Condition & Inversions",
      ],
      samplePrompt: "Explain Mohr's Circle step-by-step: how to determine principal stresses sigma_1 and sigma_2 and maximum shear stress from stress tensors.",
    },
    ce: {
      name: "Civil Engineering",
      icon: <Building2 className="w-4 h-4" />,
      topics: [
        "Shear Force & Bending Moment Diagrams for Cantilever & Simply Supported Beams",
        "Terzaghi's 1D Soil Consolidation Theory",
        "Concrete Mix Design (IS 10262 / ACI 211) Principles",
        "Darcy's Law and Hydraulic Conductivity in Aquifers",
        "Method of Joints vs Method of Sections in Truss Analysis",
      ],
      samplePrompt: "Explain how to construct Shear Force and Bending Moment Diagrams for a simply supported beam with both UDL and point loads.",
    },
  };

  const handleAskConcept = async (promptToAsk?: string) => {
    const p = promptToAsk || customQuestion;
    if (!p.trim()) return;
    setLoading(true);
    try {
      const response = await sendChatMessage(
        [
          {
            role: "user",
            content: `[ENGINEERING TUTOR - ${branchData[selectedBranch].name}]:\nPlease explain this engineering concept thoroughly:\n"${p}"\n\nInclude:\n1. First-Principles Physical/Mathematical Intuition\n2. Step-by-Step Mechanism / Mathematical Derivation\n3. Practical Real-World Engineering Example\n4. Typical Exam Questions & External Viva Tips.`,
          },
        ],
        `Branch: ${branchData[selectedBranch].name}`,
        "doubt"
      );
      setExplanation(response);
    } catch (err: any) {
      setExplanation(`Tutoring request failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Calculations
  const circuitCurrent = resistance > 0 ? (voltage / resistance) : 0;
  const circuitPower = voltage * circuitCurrent;
  const timeConstantMs = (resistance * (capacitance * 1e-6)) * 1000;

  const stressPa = area > 0 ? (force / area) : 0;
  const strain = origLength > 0 ? (deltaLength / origLength) : 0;
  const youngsModulusGpa = strain > 0 ? ((stressPa / strain) / 1e9) : 0;

  const snrLinear = Math.pow(10, snrDb / 10);
  const shannonCapacityMbps = (bandwidth * 1e6 * Math.log2(1 + snrLinear)) / 1e6;

  return (
    <div className="h-full overflow-y-auto bg-zinc-950 text-zinc-200 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Branch Selector Header */}
        <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-xl space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
            <h2 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-emerald-400" />
              Multi-Discipline Engineering Tutor
            </h2>
            <span className="text-[11px] text-zinc-400">Step-by-step conceptual mastery</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {(Object.keys(branchData) as BranchId[]).map((b) => {
              const info = branchData[b];
              const isSelected = selectedBranch === b;
              return (
                <button
                  key={b}
                  onClick={() => {
                    setSelectedBranch(b);
                    setCustomQuestion(info.samplePrompt);
                  }}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition cursor-pointer border ${
                    isSelected
                      ? "bg-zinc-800 text-emerald-400 border-emerald-500/40 shadow-sm"
                      : "bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-zinc-200 hover:bg-zinc-900"
                  }`}
                >
                  {info.icon}
                  <span>{info.name}</span>
                </button>
              );
            })}
          </div>

          {/* Curated High-Yield Syllabus Topics */}
          <div>
            <div className="text-[11px] text-zinc-400 font-medium mb-1.5">
              High-Yield {branchData[selectedBranch].name} Topics:
            </div>
            <div className="flex flex-wrap gap-1.5">
              {branchData[selectedBranch].topics.map((t, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setCustomQuestion(`Explain ${t} step-by-step with practical derivations.`);
                    handleAskConcept(`Explain ${t} step-by-step with practical derivations.`);
                  }}
                  className="px-2.5 py-1 rounded bg-zinc-950 border border-zinc-800 text-[11px] text-zinc-300 hover:border-emerald-500/50 hover:text-emerald-400 transition cursor-pointer"
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Concept Input */}
          <div className="pt-2 flex gap-2">
            <input
              type="text"
              value={customQuestion}
              onChange={(e) => setCustomQuestion(e.target.value)}
              placeholder="Ask any engineering concept or derivation..."
              className="flex-1 px-3 py-2 bg-zinc-950 border border-zinc-700 rounded text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
              onKeyDown={(e) => e.key === "Enter" && handleAskConcept()}
            />
            <button
              onClick={() => handleAskConcept()}
              disabled={loading || !customQuestion.trim()}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold transition cursor-pointer disabled:opacity-60 shrink-0"
            >
              {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              <span>{loading ? "Explaining..." : "Explain Step-by-Step"}</span>
            </button>
          </div>
        </div>

        {/* Interactive Engineering Calculators & Simulators */}
        <div className="p-5 bg-zinc-900/60 border border-zinc-800 rounded-xl space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-200">
              <Calculator className="w-4 h-4 text-emerald-400" />
              <span>Interactive Engineering Simulators & Calculators</span>
            </div>
            <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800 text-xs">
              <button
                onClick={() => setActiveCalculator("complexity")}
                className={`px-2.5 py-1 rounded cursor-pointer ${
                  activeCalculator === "complexity" ? "bg-zinc-800 text-zinc-100 font-medium" : "text-zinc-400"
                }`}
              >
                Big-O Scaler (CS)
              </button>
              <button
                onClick={() => setActiveCalculator("circuits")}
                className={`px-2.5 py-1 rounded cursor-pointer ${
                  activeCalculator === "circuits" ? "bg-zinc-800 text-zinc-100 font-medium" : "text-zinc-400"
                }`}
              >
                Circuits & RC (EE/ECE)
              </button>
              <button
                onClick={() => setActiveCalculator("stress")}
                className={`px-2.5 py-1 rounded cursor-pointer ${
                  activeCalculator === "stress" ? "bg-zinc-800 text-zinc-100 font-medium" : "text-zinc-400"
                }`}
              >
                Stress-Strain (ME/CE)
              </button>
              <button
                onClick={() => setActiveCalculator("shannon")}
                className={`px-2.5 py-1 rounded cursor-pointer ${
                  activeCalculator === "shannon" ? "bg-zinc-800 text-zinc-100 font-medium" : "text-zinc-400"
                }`}
              >
                Shannon Capacity (ECE)
              </button>
            </div>
          </div>

          {/* Big-O visualizer */}
          {activeCalculator === "complexity" && (
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-zinc-300">Scale Input Size (N): <span className="font-mono text-emerald-400 font-bold">{inputSizeN}</span> elements</span>
                <input
                  type="range"
                  min="5"
                  max="500"
                  value={inputSizeN}
                  onChange={(e) => setInputSizeN(parseInt(e.target.value, 10))}
                  className="w-48 cursor-pointer accent-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-2">
                <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-lg">
                  <div className="text-zinc-400 text-[11px]">O(1) Constant</div>
                  <div className="text-base font-mono font-bold text-emerald-400 mt-1">1 op</div>
                  <div className="text-[10px] text-zinc-400 mt-0.5">Hash table lookup</div>
                </div>
                <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-lg">
                  <div className="text-zinc-400 text-[11px]">O(log N) Logarithmic</div>
                  <div className="text-base font-mono font-bold text-teal-400 mt-1">
                    {Math.ceil(Math.log2(inputSizeN))} ops
                  </div>
                  <div className="text-[10px] text-zinc-400 mt-0.5">Binary Search</div>
                </div>
                <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-lg">
                  <div className="text-zinc-400 text-[11px]">O(N) Linear</div>
                  <div className="text-base font-mono font-bold text-blue-400 mt-1">
                    {inputSizeN} ops
                  </div>
                  <div className="text-[10px] text-zinc-400 mt-0.5">Linear traversal</div>
                </div>
                <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-lg">
                  <div className="text-zinc-400 text-[11px]">O(N log N) Linearithmic</div>
                  <div className="text-base font-mono font-bold text-amber-400 mt-1">
                    {Math.round(inputSizeN * Math.log2(inputSizeN))} ops
                  </div>
                  <div className="text-[10px] text-zinc-400 mt-0.5">Merge / Quick Sort</div>
                </div>
                <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-lg">
                  <div className="text-zinc-400 text-[11px]">O(N²) Quadratic</div>
                  <div className="text-base font-mono font-bold text-rose-400 mt-1">
                    {(inputSizeN * inputSizeN).toLocaleString()} ops
                  </div>
                  <div className="text-[10px] text-zinc-400 mt-0.5">Nested loops</div>
                </div>
              </div>
            </div>
          )}

          {/* Circuit calculator */}
          {activeCalculator === "circuits" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="space-y-2 p-3 bg-zinc-950 border border-zinc-800 rounded-lg">
                <label className="text-zinc-400">Voltage (V):</label>
                <input
                  type="number"
                  value={voltage}
                  onChange={(e) => setVoltage(parseFloat(e.target.value) || 0)}
                  className="w-full p-1.5 bg-zinc-900 border border-zinc-700 rounded font-mono text-zinc-200"
                />
                <label className="text-zinc-400">Resistance (Ω):</label>
                <input
                  type="number"
                  value={resistance}
                  onChange={(e) => setResistance(parseFloat(e.target.value) || 0)}
                  className="w-full p-1.5 bg-zinc-900 border border-zinc-700 rounded font-mono text-zinc-200"
                />
                <label className="text-zinc-400">Capacitance (μF):</label>
                <input
                  type="number"
                  value={capacitance}
                  onChange={(e) => setCapacitance(parseFloat(e.target.value) || 0)}
                  className="w-full p-1.5 bg-zinc-900 border border-zinc-700 rounded font-mono text-zinc-200"
                />
              </div>

              <div className="col-span-2 p-4 bg-zinc-950 border border-zinc-800 rounded-lg space-y-2 font-mono">
                <div className="text-zinc-400 font-sans font-semibold text-[11px]">Calculated Output:</div>
                <div className="flex justify-between py-1 border-b border-zinc-800">
                  <span className="text-zinc-400">Current (I = V / R):</span>
                  <span className="text-emerald-400 font-bold">{circuitCurrent.toFixed(4)} Amperes ({(circuitCurrent * 1000).toFixed(1)} mA)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-zinc-800">
                  <span className="text-zinc-400">Power Dissipated (P = V × I):</span>
                  <span className="text-blue-400 font-bold">{circuitPower.toFixed(4)} Watts</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-zinc-400">RC Time Constant (τ = R × C):</span>
                  <span className="text-teal-400 font-bold">{timeConstantMs.toFixed(3)} milliseconds</span>
                </div>
              </div>
            </div>
          )}

          {/* Stress-strain */}
          {activeCalculator === "stress" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div className="space-y-2 p-3 bg-zinc-950 border border-zinc-800 rounded-lg">
                <label className="text-zinc-400">Axial Force (N):</label>
                <input
                  type="number"
                  value={force}
                  onChange={(e) => setForce(parseFloat(e.target.value) || 0)}
                  className="w-full p-1.5 bg-zinc-900 border border-zinc-700 rounded text-zinc-200"
                />
                <label className="text-zinc-400">Cross-Sectional Area (m²):</label>
                <input
                  type="number"
                  step="0.0001"
                  value={area}
                  onChange={(e) => setArea(parseFloat(e.target.value) || 0)}
                  className="w-full p-1.5 bg-zinc-900 border border-zinc-700 rounded text-zinc-200"
                />
                <label className="text-zinc-400">Deformation ΔL (m):</label>
                <input
                  type="number"
                  step="0.0001"
                  value={deltaLength}
                  onChange={(e) => setDeltaLength(parseFloat(e.target.value) || 0)}
                  className="w-full p-1.5 bg-zinc-900 border border-zinc-700 rounded text-zinc-200"
                />
              </div>

              <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-lg space-y-2">
                <div className="text-zinc-400 font-sans font-semibold text-[11px]">Mechanics Output:</div>
                <div className="flex justify-between py-1 border-b border-zinc-800">
                  <span className="text-zinc-400">Normal Stress (σ = F / A):</span>
                  <span className="text-emerald-400 font-bold">{(stressPa / 1e6).toFixed(2)} MPa</span>
                </div>
                <div className="flex justify-between py-1 border-b border-zinc-800">
                  <span className="text-zinc-400">Engineering Strain (ε = ΔL / L):</span>
                  <span className="text-blue-400 font-bold">{strain.toExponential(3)}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-zinc-400">Young&apos;s Modulus (E = σ / ε):</span>
                  <span className="text-teal-400 font-bold">{youngsModulusGpa.toFixed(2)} GPa</span>
                </div>
              </div>
            </div>
          )}

          {/* Shannon Capacity */}
          {activeCalculator === "shannon" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div className="space-y-2 p-3 bg-zinc-950 border border-zinc-800 rounded-lg">
                <label className="text-zinc-400">Channel Bandwidth (MHz):</label>
                <input
                  type="number"
                  value={bandwidth}
                  onChange={(e) => setBandwidth(parseFloat(e.target.value) || 0)}
                  className="w-full p-1.5 bg-zinc-900 border border-zinc-700 rounded text-zinc-200"
                />
                <label className="text-zinc-400">Signal-to-Noise Ratio (dB):</label>
                <input
                  type="number"
                  value={snrDb}
                  onChange={(e) => setSnrDb(parseFloat(e.target.value) || 0)}
                  className="w-full p-1.5 bg-zinc-900 border border-zinc-700 rounded text-zinc-200"
                />
              </div>

              <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-lg space-y-2">
                <div className="text-zinc-400 font-sans font-semibold text-[11px]">Hartley-Shannon Capacity:</div>
                <div className="flex justify-between py-1 border-b border-zinc-800">
                  <span className="text-zinc-400">Linear SNR (10^(dB/10)):</span>
                  <span className="text-blue-400 font-bold">{snrLinear.toFixed(1)}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-zinc-400">Max Theoretical Capacity (C):</span>
                  <span className="text-emerald-400 font-bold text-sm">{shannonCapacityMbps.toFixed(2)} Mbps</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Explanation output */}
        {explanation && (
          <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-xl space-y-3">
            <h3 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              Step-by-Step Engineering Walkthrough
            </h3>
            <MarkdownView content={explanation} />
          </div>
        )}
      </div>
    </div>
  );
};
