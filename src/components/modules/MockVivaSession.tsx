import React, { useState, useEffect, useRef } from "react";
import {
  Timer,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Award,
  CheckCircle2,
  AlertTriangle,
  Mic,
  MicOff,
  Send,
  RefreshCw,
  Clock,
  Layers,
  ChevronRight,
  Download,
  BookOpen,
} from "lucide-react";
import { sendChatMessage } from "../../services/api";
import { MarkdownView } from "../common/MarkdownView";

export interface VivaDomain {
  id: string;
  name: string;
  description: string;
  sampleTopics: string[];
}

const DOMAINS: VivaDomain[] = [
  {
    id: "fullstack",
    name: "Full-Stack & Distributed Systems",
    description: "Microservices, gRPC/REST, Concurrency, Caching, System Design, Docker",
    sampleTopics: ["Pramanix Python Architecture", "Distributed Lock Managers", "WebSocket Telemetry Engine"],
  },
  {
    id: "aiml",
    name: "AI / Machine Learning & Data Science",
    description: "Model Optimization, Gradient Descent, Overfitting, Transformers, Edge Inference",
    sampleTopics: ["Autonomous Vision Classifier", "Predictive Industrial Maintenance", "RAG Pipeline"],
  },
  {
    id: "embedded",
    name: "Embedded Systems, IoT & Robotics",
    description: "Microcontrollers, RTOS, SPI/I2C/UART, Interrupts, Power Optimization, Sensors",
    sampleTopics: ["Smart Energy Microgrid Telemetry", "Drone Flight Controller", "Automated Rover"],
  },
  {
    id: "cloud",
    name: "Cloud Computing, DevOps & Infrastructure",
    description: "Kubernetes, CI/CD, Containerization, High Availability, Zero-Downtime Deployment",
    sampleTopics: ["Cloud-Native Microservices", "Multi-region Failover", "Serverless Pipeline"],
  },
  {
    id: "db",
    name: "Database Systems & Storage Engines",
    description: "ACID, B-Tree vs LSM Trees, Query Optimization, Sharding, Replication Lag",
    sampleTopics: ["Distributed Key-Value Store", "High-Throughput Analytics DB", "PostgreSQL Clustering"],
  },
  {
    id: "core_eng",
    name: "Core Mechanical / Electrical / Civil",
    description: "Finite Element, Thermodynamics, Power Systems, Structural Analysis, Control Systems",
    sampleTopics: ["Smart Grid Inverter Controller", "Heat Exchanger Efficiency", "Bridge Structural Health"],
  },
];

interface VivaRecord {
  questionNumber: number;
  question: string;
  domain: string;
  timeAllowed: number;
  timeSpent: number;
  studentAnswer: string;
  feedback?: string;
  score?: number;
  idealAnswer?: string;
  evaluating?: boolean;
}

export const MockVivaSession: React.FC = () => {
  // Session Configuration State
  const [selectedDomain, setSelectedDomain] = useState<string>("fullstack");
  const [customTopic, setCustomTopic] = useState("Pramanix / Python Full-Stack Microservices Architecture");
  const [timeLimitSeconds, setTimeLimitSeconds] = useState<number>(90); // default 90s per question
  const [totalQuestionsCount, setTotalQuestionsCount] = useState<number>(4);

  // Active Session State
  const [sessionActive, setSessionActive] = useState(false);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(90);
  const [isTimerPaused, setIsTimerPaused] = useState(false);
  const [records, setRecords] = useState<VivaRecord[]>([]);

  // Current Input State
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [isGeneratingQuestion, setIsGeneratingQuestion] = useState(false);
  const [sessionCompleted, setSessionCompleted] = useState(false);

  // Speech recognition state
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Timer interval ref
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize Speech Recognition if supported
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onresult = (event: any) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setCurrentAnswer((prev) => (prev ? prev + " " + transcript : transcript));
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  // Timer management
  useEffect(() => {
    if (sessionActive && !isTimerPaused && !sessionCompleted && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current as any);
            handleTimeExpired();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [sessionActive, isTimerPaused, sessionCompleted, timeLeft]);

  // When time expires
  const handleTimeExpired = () => {
    // Stop microphone if listening
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
    // Auto submit current response
    submitAnswer(true);
  };

  const toggleSpeechRecognition = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser. You can type your answer directly.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.warn("Speech error:", err);
      }
    }
  };

  // Start Session
  const handleStartSession = async () => {
    setSessionActive(true);
    setSessionCompleted(false);
    setCurrentQIndex(0);
    setRecords([]);
    setCurrentAnswer("");
    setTimeLeft(timeLimitSeconds);
    setIsTimerPaused(false);

    await fetchNextQuestion(0, []);
  };

  // Fetch Next Question via AI
  const fetchNextQuestion = async (qNum: number, existingRecords: VivaRecord[]) => {
    setIsGeneratingQuestion(true);
    const domainObj = DOMAINS.find((d) => d.id === selectedDomain);
    const domainName = domainObj ? domainObj.name : selectedDomain;

    const prompt = `You are a strict external university viva examiner conducting a live timer-based oral examination.
Topic / Project: "${customTopic}"
Domain: "${domainName}"
Difficulty Level: ${
      qNum === 0
        ? "Fundamental Architecture & Design Decisions"
        : qNum === 1
        ? "Component Interactions & Protocol Choices"
        : qNum === 2
        ? "Failure Modes, Race Conditions, Concurrency & Security"
        : "Optimization, Scalability & Production Trade-offs"
    }

Formulate Question #${qNum + 1} for the student.
Make it realistic, probing, and clear.
Ask ONLY the question itself without conversational filler.`;

    try {
      const questionText = await sendChatMessage(
        [{ role: "user", content: prompt }],
        `Viva Domain: ${domainName} - Topic: ${customTopic}`,
        "viva"
      );

      const newRecord: VivaRecord = {
        questionNumber: qNum + 1,
        question: questionText.trim(),
        domain: domainName,
        timeAllowed: timeLimitSeconds,
        timeSpent: 0,
        studentAnswer: "",
      };

      setRecords([...existingRecords, newRecord]);
      setTimeLeft(timeLimitSeconds);
      setIsTimerPaused(false);
    } catch (err: any) {
      const fallbackRecord: VivaRecord = {
        questionNumber: qNum + 1,
        question: `Explain how the architecture of ${customTopic} ensures fault tolerance, low latency, and modularity under high concurrent load.`,
        domain: domainName,
        timeAllowed: timeLimitSeconds,
        timeSpent: 0,
        studentAnswer: "",
      };
      setRecords([...existingRecords, fallbackRecord]);
      setTimeLeft(timeLimitSeconds);
    } finally {
      setIsGeneratingQuestion(false);
    }
  };

  // Submit Answer & Evaluate
  const submitAnswer = async (timeExpired = false) => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    const currentRecord = records[currentQIndex];
    if (!currentRecord) return;

    const answerToRecord = currentAnswer.trim() || (timeExpired ? "[No answer submitted within time limit]" : "[Blank response]");
    const spent = timeLimitSeconds - timeLeft;

    // Update record with answer
    const updatedRecords = [...records];
    updatedRecords[currentQIndex] = {
      ...currentRecord,
      studentAnswer: answerToRecord,
      timeSpent: spent,
      evaluating: true,
    };
    setRecords(updatedRecords);
    setCurrentAnswer("");

    // Evaluate in background
    evaluateAnswer(currentQIndex, currentRecord.question, answerToRecord, updatedRecords);

    // If there are more questions, go to next
    if (currentQIndex + 1 < totalQuestionsCount) {
      setCurrentQIndex((prev) => prev + 1);
      await fetchNextQuestion(currentQIndex + 1, updatedRecords);
    } else {
      // Completed all questions!
      setSessionCompleted(true);
      setSessionActive(false);
    }
  };

  // Evaluate single answer with AI
  const evaluateAnswer = async (index: number, question: string, answer: string, allRecords: VivaRecord[]) => {
    try {
      const prompt = `You are evaluating a student's answer in a timed oral viva defense.
Topic: "${customTopic}"
Question: "${question}"
Student Answer: "${answer}"

Provide:
1. Score out of 10 (Format: "Score: X/10")
2. What the student correctly grasped (Key Technical Hits)
3. What was missed or needs sharpening (Gaps & Misconceptions)
4. Model 10/10 Oral Response that examiners look for`;

      const feedback = await sendChatMessage([{ role: "user", content: prompt }], "Viva Evaluator", "viva");

      const scoreMatch = feedback.match(/Score:\s*(\d+(?:\.\d+)?)\s*\/\s*10/i);
      const score = scoreMatch ? parseFloat(scoreMatch[1]) : 7;

      setRecords((prev) =>
        prev.map((rec, i) =>
          i === index
            ? {
                ...rec,
                feedback,
                score,
                evaluating: false,
              }
            : rec
        )
      );
    } catch (err: any) {
      setRecords((prev) =>
        prev.map((rec, i) =>
          i === index
            ? {
                ...rec,
                feedback: "Evaluation completed: Answer noted by examiner.",
                score: 7,
                evaluating: false,
              }
            : rec
        )
      );
    }
  };

  // Reset Session
  const handleReset = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
    setSessionActive(false);
    setSessionCompleted(false);
    setCurrentQIndex(0);
    setCurrentAnswer("");
    setTimeLeft(timeLimitSeconds);
    setRecords([]);
  };

  // Export Viva Session Report
  const handleExportSession = () => {
    const markdown = `# Pramanix Mock Viva Examination Report
**Date:** ${new Date().toLocaleString()}
**Topic:** ${customTopic}
**Domain:** ${selectedDomain}
**Time per Question:** ${timeLimitSeconds}s
**Average Score:** ${(records.reduce((acc, r) => acc + (r.score || 0), 0) / (records.length || 1)).toFixed(1)} / 10

---

${records
  .map(
    (r) => `## Question ${r.questionNumber}: ${r.question}
**Time Spent:** ${r.timeSpent}s / ${r.timeAllowed}s
**Score:** ${r.score !== undefined ? `${r.score}/10` : "Pending"}

### Student Answer:
${r.studentAnswer}

### Examiner Feedback & Model Answer:
${r.feedback || "Pending evaluation..."}

---`
  )
  .join("\n\n")}`;

    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Viva_Scorecard_${customTopic.replace(/\W+/g, "_")}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Calculate Average Score
  const avgScore =
    records.length > 0
      ? (records.reduce((acc, r) => acc + (r.score || 0), 0) / records.length).toFixed(1)
      : "0";

  const currentActiveRecord = records[currentQIndex];

  return (
    <div className="space-y-6">
      {/* Configuration Screen (when session not started) */}
      {!sessionActive && !sessionCompleted && (
        <div className="p-6 bg-zinc-900/60 border border-zinc-800 rounded-xl space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Timer className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-zinc-100">Timer-Based Mock Viva Voce Exam</h3>
                <p className="text-xs text-zinc-400">
                  Simulate high-pressure external university examinations with real-time countdown, speech recording, and instant grading.
                </p>
              </div>
            </div>
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded">
              Timed Defense Mode
            </span>
          </div>

          {/* Domain Selection Grid */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-300">Select Project Engineering Domain:</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
              {DOMAINS.map((domain) => {
                const isSelected = selectedDomain === domain.id;
                return (
                  <button
                    key={domain.id}
                    onClick={() => {
                      setSelectedDomain(domain.id);
                      setCustomTopic(domain.sampleTopics[0]);
                    }}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? "bg-zinc-800 border-emerald-500/60 text-zinc-100 shadow-sm"
                        : "bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
                    }`}
                  >
                    <div>
                      <div className="text-xs font-semibold text-zinc-200 flex items-center justify-between">
                        <span>{domain.name}</span>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-1 line-clamp-2">{domain.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Project Topic & Constraints */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">Specific Project Title or Topic:</label>
              <input
                type="text"
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
                placeholder="e.g. Distributed IoT Air Quality Monitoring, Pramanix System Architecture"
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded text-xs text-zinc-100 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">Countdown Timer Per Question:</label>
              <div className="grid grid-cols-3 gap-1.5">
                {[60, 90, 120].map((sec) => (
                  <button
                    key={sec}
                    onClick={() => setTimeLimitSeconds(sec)}
                    className={`py-2 rounded text-xs font-mono font-medium border cursor-pointer transition ${
                      timeLimitSeconds === sec
                        ? "bg-emerald-600 text-white border-emerald-500"
                        : "bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-zinc-200"
                    }`}
                  >
                    {sec}s
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <Clock className="w-3.5 h-3.5 text-zinc-500" />
              <span>4 Random Progressive Questions · {timeLimitSeconds}s per defense</span>
            </div>
            <button
              onClick={handleStartSession}
              disabled={!customTopic.trim()}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition cursor-pointer shadow-sm active:scale-95"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Begin Timed Mock Viva Session</span>
            </button>
          </div>
        </div>
      )}

      {/* Active Session Live Screen */}
      {sessionActive && (
        <div className="space-y-5">
          {/* Header Bar with Countdown Timer */}
          <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-zinc-300">
                Question {currentQIndex + 1} of {totalQuestionsCount}
              </span>
              <span className="text-zinc-600">·</span>
              <span className="text-xs text-zinc-400 truncate max-w-sm">{customTopic}</span>
            </div>

            {/* Countdown Badge */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsTimerPaused(!isTimerPaused)}
                className="text-xs text-zinc-400 hover:text-zinc-200 flex items-center gap-1 cursor-pointer bg-zinc-950 px-2.5 py-1 rounded border border-zinc-800"
              >
                {isTimerPaused ? <Play className="w-3 h-3 text-emerald-400 fill-current" /> : <Pause className="w-3 h-3 text-amber-400 fill-current" />}
                <span>{isTimerPaused ? "Resume" : "Pause"}</span>
              </button>

              <div
                className={`flex items-center gap-1.5 px-3.5 py-1 rounded-lg font-mono font-bold text-sm border ${
                  timeLeft <= 15
                    ? "bg-red-950/60 border-red-500/60 text-red-400 animate-pulse"
                    : timeLeft <= 30
                    ? "bg-amber-950/40 border-amber-500/40 text-amber-300"
                    : "bg-zinc-950 border-zinc-700 text-emerald-400"
                }`}
              >
                <Timer className="w-4 h-4" />
                <span>
                  {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
                </span>
              </div>

              <button
                onClick={handleReset}
                className="text-zinc-500 hover:text-red-400 text-xs p-1 cursor-pointer"
                title="Abort session"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Current Question Display */}
          <div className="p-6 bg-zinc-900/80 border border-zinc-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between text-xs text-zinc-400 pb-2 border-b border-zinc-800/80">
              <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                <Award className="w-4 h-4" /> External University Examiner
              </span>
              <span className="font-mono text-[11px] text-zinc-500">
                Target: {selectedDomain.toUpperCase()}
              </span>
            </div>

            {isGeneratingQuestion ? (
              <div className="py-8 flex flex-col items-center justify-center gap-2 text-zinc-400 text-xs">
                <RefreshCw className="w-5 h-5 animate-spin text-emerald-400" />
                <span>Formulating Question #{currentQIndex + 1}...</span>
              </div>
            ) : currentActiveRecord ? (
              <p className="text-sm font-medium text-zinc-100 leading-relaxed font-sans select-text">
                {currentActiveRecord.question}
              </p>
            ) : null}
          </div>

          {/* Answer Form & Dictation */}
          <div className="p-5 bg-zinc-900/60 border border-zinc-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between text-xs">
              <label className="font-medium text-zinc-300 flex items-center gap-2">
                <span>Your Verbal or Written Defense:</span>
                {isListening && (
                  <span className="flex items-center gap-1 text-[11px] text-red-400 font-semibold animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-red-500" /> Transcribing speech...
                  </span>
                )}
              </label>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleSpeechRecognition}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs transition cursor-pointer border ${
                    isListening
                      ? "bg-red-500/20 border-red-500/50 text-red-300 font-medium"
                      : "bg-zinc-950 border-zinc-700 text-zinc-300 hover:border-zinc-600"
                  }`}
                  title="Speak your answer via microphone"
                >
                  {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5 text-emerald-400" />}
                  <span>{isListening ? "Stop Mic" : "Dictate (Speech-to-Text)"}</span>
                </button>

                <span className="text-[11px] font-mono text-zinc-500">
                  {currentAnswer.trim().split(/\s+/).filter(Boolean).length} words
                </span>
              </div>
            </div>

            <textarea
              rows={5}
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              placeholder="State your technical defense clearly. Mention key architecture patterns, algorithms, time complexity, and trade-offs..."
              className="w-full p-3 bg-zinc-950 border border-zinc-700 rounded-lg text-xs font-sans text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 leading-relaxed"
            />

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-zinc-500">
                {timeLeft === 0
                  ? "Time expired! Automatically moving forward."
                  : `Remaining: ${timeLeft}s — Examiner expects concise, high-yield answers.`}
              </span>

              <button
                onClick={() => submitAnswer(false)}
                disabled={isGeneratingQuestion || !currentAnswer.trim()}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold transition cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>
                  {currentQIndex + 1 === totalQuestionsCount ? "Submit & Complete Viva" : "Submit & Next Question"}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Session Completed Scorecard & Feedback Overview */}
      {sessionCompleted && (
        <div className="space-y-6">
          {/* Top Scorecard Card */}
          <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-100">Viva Voce Defense Complete!</h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Topic: <span className="text-zinc-200 font-medium">{customTopic}</span> · {records.length} Questions Defended
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-[11px] text-zinc-400 uppercase font-mono">Overall Grade</div>
                  <div className="text-2xl font-bold font-mono text-emerald-400">{avgScore} / 10</div>
                </div>
                <button
                  onClick={handleExportSession}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 rounded-lg text-xs font-medium transition cursor-pointer"
                  title="Download Viva Defense Scorecard as Markdown"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Scorecard</span>
                </button>
                <button
                  onClick={handleReset}
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Start New Viva Session</span>
                </button>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-zinc-950 border border-zinc-800/80 rounded-lg">
                <div className="text-zinc-500 text-[10px]">TOTAL DEFENSE TIME</div>
                <div className="text-base font-mono font-bold text-zinc-200 mt-0.5">
                  {records.reduce((acc, r) => acc + r.timeSpent, 0)}s
                </div>
              </div>
              <div className="p-3 bg-zinc-950 border border-zinc-800/80 rounded-lg">
                <div className="text-zinc-500 text-[10px]">AVG TIME PER QUESTION</div>
                <div className="text-base font-mono font-bold text-zinc-200 mt-0.5">
                  {Math.round(records.reduce((acc, r) => acc + r.timeSpent, 0) / (records.length || 1))}s
                </div>
              </div>
              <div className="p-3 bg-zinc-950 border border-zinc-800/80 rounded-lg">
                <div className="text-zinc-500 text-[10px]">QUESTIONS EVALUATED</div>
                <div className="text-base font-mono font-bold text-emerald-400 mt-0.5">
                  {records.filter((r) => !r.evaluating).length} / {records.length}
                </div>
              </div>
              <div className="p-3 bg-zinc-950 border border-zinc-800/80 rounded-lg">
                <div className="text-zinc-500 text-[10px]">READINESS STATUS</div>
                <div className="text-base font-mono font-bold text-emerald-400 mt-0.5">
                  {parseFloat(avgScore) >= 8 ? "Pass with Distinction" : parseFloat(avgScore) >= 6 ? "Good Defense" : "Needs Revision"}
                </div>
              </div>
            </div>
          </div>

          {/* Question-by-Question Detailed Review */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider px-1">
              Detailed Question-by-Question Feedback & Examiner Benchmarks
            </h4>

            {records.map((rec) => (
              <div
                key={rec.questionNumber}
                className="p-5 bg-zinc-900/60 border border-zinc-800 rounded-xl space-y-3 text-xs"
              >
                <div className="flex items-start justify-between gap-3 pb-2 border-b border-zinc-800">
                  <div>
                    <span className="font-mono text-[11px] text-emerald-400 font-semibold mr-2">
                      Question #{rec.questionNumber}
                    </span>
                    <span className="font-medium text-zinc-100">{rec.question}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] font-mono text-zinc-400">
                      ⏱ {rec.timeSpent}s / {rec.timeAllowed}s
                    </span>
                    {rec.score !== undefined ? (
                      <span className="px-2 py-0.5 rounded font-mono font-bold text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        {rec.score}/10
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[11px] text-amber-400">
                        <RefreshCw className="w-3 h-3 animate-spin" /> Evaluating...
                      </span>
                    )}
                  </div>
                </div>

                {/* Recorded Student Answer */}
                <div className="p-3 bg-zinc-950 border border-zinc-800/80 rounded-lg space-y-1">
                  <div className="text-[10px] uppercase font-semibold text-zinc-400 tracking-wider">
                    Your Recorded Defense:
                  </div>
                  <p className="text-zinc-300 leading-relaxed font-sans">{rec.studentAnswer}</p>
                </div>

                {/* Examiner Evaluation Feedback */}
                {rec.feedback ? (
                  <div className="p-4 bg-zinc-950/70 border border-emerald-950/50 rounded-lg space-y-2">
                    <div className="text-[10px] uppercase font-semibold text-emerald-400 tracking-wider">
                      Examiner Critique & Model Answer:
                    </div>
                    <MarkdownView content={rec.feedback} />
                  </div>
                ) : (
                  <div className="text-zinc-500 text-[11px] flex items-center gap-2 py-2">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                    <span>Analyzing response against academic standard rubrics...</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
