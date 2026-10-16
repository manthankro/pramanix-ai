import React, { useState } from "react";
import {
  SearchCode,
  Sparkles,
  ArrowRightLeft,
  CheckCircle2,
  FileText,
  RefreshCw,
  Scale,
  ShieldCheck,
} from "lucide-react";
import { analyzeTask, sendChatMessage } from "../../services/api";
import { MarkdownView } from "../common/MarkdownView";

export const ResearchAssistant: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"compare" | "paper">("compare");

  // Compare state
  const [techA, setTechA] = useState("gRPC (HTTP/2 + Protocol Buffers)");
  const [techB, setTechB] = useState("RESTful APIs (HTTP/1.1 + JSON)");
  const [domain, setDomain] = useState("Microservices & High-Throughput Distributed Systems");
  const [compareLoading, setCompareLoading] = useState(false);
  const [compareResult, setCompareResult] = useState("");

  // Paper query state
  const [paperTopic, setPaperTopic] = useState("RAFT vs Multi-Paxos Distributed Consensus Latency & Leader Election");
  const [paperLoading, setPaperLoading] = useState(false);
  const [paperResult, setPaperResult] = useState("");

  const comparisonPresets = [
    { a: "gRPC (HTTP/2 + Protobuf)", b: "REST (HTTP/1.1 + JSON)", domain: "Microservice Inter-Service Communication" },
    { a: "PostgreSQL (Relational + ACID)", b: "MongoDB (Document Store)", domain: "Transactional Data Architecture" },
    { a: "Apache Kafka (Log-based Streaming)", b: "RabbitMQ (AMQP Message Broker)", domain: "Event-Driven Systems" },
    { a: "Docker Containers", b: "WebAssembly (Wasm Micro-runtimes)", domain: "Edge & Serverless Compute" },
    { a: "Redis (In-Memory K/V)", b: "Memcached (Multi-Threaded Cache)", domain: "High-Performance Distributed Caching" },
  ];

  const handleCompare = async () => {
    if (!techA.trim() || !techB.trim()) return;
    setCompareLoading(true);
    try {
      const result = await analyzeTask("compare_tech", {
        techA,
        techB,
        domain,
      });
      setCompareResult(result);
    } catch (err: any) {
      setCompareResult(`Comparison failed: ${err.message}`);
    } finally {
      setCompareLoading(false);
    }
  };

  const handleSynthesizePaper = async () => {
    if (!paperTopic.trim()) return;
    setPaperLoading(true);
    try {
      const prompt = `Synthesize an academic technical literature brief on: "${paperTopic}".
Strict guidelines:
1. Clearly differentiate between [VERIFIED INDUSTRY SPECIFICATIONS / FACTS] and [ARCHITECTURAL RECOMMENDATIONS / TRADEOFFS].
2. Provide cited references in IEEE citation format.
3. Include an empirical comparison table comparing algorithmic complexity, message roundtrips, and failure modes.`;
      const response = await sendChatMessage([{ role: "user", content: prompt }], "Research Assistant", "research");
      setPaperResult(response);
    } catch (err: any) {
      setPaperResult(`Synthesis failed: ${err.message}`);
    } finally {
      setPaperLoading(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-zinc-950 text-zinc-200 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 p-1 bg-zinc-900 border border-zinc-800 rounded-xl text-xs">
          <button
            onClick={() => setActiveTab("compare")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg cursor-pointer transition ${
              activeTab === "compare" ? "bg-zinc-800 text-emerald-400 font-semibold" : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>Technology Face-Off Matrix</span>
          </button>
          <button
            onClick={() => setActiveTab("paper")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg cursor-pointer transition ${
              activeTab === "paper" ? "bg-zinc-800 text-emerald-400 font-semibold" : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Technical Literature & IEEE Synthesizer</span>
          </button>
        </div>

        {/* Tab 1: Compare */}
        {activeTab === "compare" && (
          <div className="space-y-4">
            <div className="p-5 bg-zinc-900/60 border border-zinc-800 rounded-xl space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
                  <Scale className="w-4 h-4 text-emerald-400" />
                  Grounded Technical Comparison Engine
                </h3>
                <span className="text-[11px] text-zinc-400">
                  Strictly demarcates Verified Industry Specs vs Design Opinions
                </span>
              </div>

              {/* Presets */}
              <div>
                <div className="text-[11px] text-zinc-400 font-medium mb-1.5">Common Tech Battles:</div>
                <div className="flex flex-wrap gap-1.5">
                  {comparisonPresets.map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setTechA(p.a);
                        setTechB(p.b);
                        setDomain(p.domain);
                      }}
                      className="px-2.5 py-1 rounded bg-zinc-950 border border-zinc-800 text-zinc-300 hover:text-emerald-400 hover:border-zinc-700 text-xs transition cursor-pointer"
                    >
                      {p.a.split(" ")[0]} vs {p.b.split(" ")[0]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-300 font-medium">Technology / Architecture A:</label>
                  <input
                    type="text"
                    value={techA}
                    onChange={(e) => setTechA(e.target.value)}
                    className="w-full p-2 bg-zinc-950 border border-zinc-700 rounded text-xs text-zinc-100 font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-300 font-medium">Technology / Architecture B:</label>
                  <input
                    type="text"
                    value={techB}
                    onChange={(e) => setTechB(e.target.value)}
                    className="w-full p-2 bg-zinc-950 border border-zinc-700 rounded text-xs text-zinc-100 font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-zinc-300 font-medium">System Domain & Scale Constraints:</label>
                <input
                  type="text"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  className="w-full p-2 bg-zinc-950 border border-zinc-700 rounded text-xs text-zinc-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end pt-1">
                <button
                  onClick={handleCompare}
                  disabled={compareLoading || !techA.trim() || !techB.trim()}
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold transition cursor-pointer disabled:opacity-60"
                >
                  {compareLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  <span>{compareLoading ? "Synthesizing Benchmarks..." : "Generate Technical Comparison"}</span>
                </button>
              </div>
            </div>

            {compareResult && (
              <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Technical Evaluation Matrix</span>
                </div>
                <MarkdownView content={compareResult} />
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Academic Paper */}
        {activeTab === "paper" && (
          <div className="space-y-4">
            <div className="p-5 bg-zinc-900/60 border border-zinc-800 rounded-xl space-y-3">
              <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                Technical Literature Review & IEEE Synthesizer
              </h3>
              <p className="text-xs text-zinc-400">
                Pramanix formats academic literature with formal citations, theoretical foundations, and empirical trade-offs.
              </p>
              <textarea
                rows={3}
                value={paperTopic}
                onChange={(e) => setPaperTopic(e.target.value)}
                placeholder="Enter technical research question or architecture topic..."
                className="w-full p-2.5 bg-zinc-950 border border-zinc-700 rounded text-xs text-zinc-100 font-mono focus:outline-none focus:border-emerald-500"
              />
              <button
                onClick={handleSynthesizePaper}
                disabled={paperLoading || !paperTopic.trim()}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold transition cursor-pointer flex items-center gap-2 disabled:opacity-50"
              >
                {paperLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                <span>{paperLoading ? "Synthesizing Literature..." : "Synthesize Literature Review"}</span>
              </button>
            </div>

            {paperResult && (
              <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-xl">
                <MarkdownView content={paperResult} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
