import React, { useState } from "react";
import {
  HelpCircle,
  Sparkles,
  Award,
  RefreshCw,
  Send,
  CheckCircle2,
  AlertCircle,
  FileSearch,
  BookOpen,
  Timer,
} from "lucide-react";
import { sendChatMessage, analyzeTask } from "../../services/api";
import { MarkdownView } from "../common/MarkdownView";
import { MockVivaSession } from "./MockVivaSession";

export const DoubtVivaHelp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"timed_viva" | "viva" | "doubt" | "review">("timed_viva");

  // Doubt solver state
  const [doubtText, setDoubtText] = useState("");
  const [doubtLoading, setDoubtLoading] = useState(false);
  const [doubtResult, setDoubtResult] = useState("");

  // Review student attempt state
  const [questionText, setQuestionText] = useState("");
  const [studentAttempt, setStudentAttempt] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewResult, setReviewResult] = useState("");

  // Viva Simulator State
  const [vivaTopic, setVivaTopic] = useState("Pramanix / Python Full-Stack Microservices Architecture");
  const [vivaStarted, setVivaStarted] = useState(false);
  const [vivaTurn, setVivaTurn] = useState(1);
  const [vivaQuestions, setVivaQuestions] = useState<
    Array<{ q: string; answer?: string; feedback?: string; score?: number }>
  >([]);
  const [studentInput, setStudentInput] = useState("");
  const [vivaLoading, setVivaLoading] = useState(false);
  const [vivaFinalScorecard, setVivaFinalScorecard] = useState<string | null>(null);

  // 1. Handle Step-by-Step Doubt
  const handleSolveDoubt = async () => {
    if (!doubtText.trim()) return;
    setDoubtLoading(true);
    try {
      const response = await sendChatMessage(
        [
          {
            role: "user",
            content: `Solve this engineering assignment/doubt question step-by-step:\n\n${doubtText}\n\nFormat with:\n1. Given Parameters & Underlying Physical/Computational Principles\n2. Step-by-Step Worked Solution with Equations & Reasoning\n3. Final Answer Box\n4. Common Exam Traps & Edge Cases.`,
          },
        ],
        "Engineering Assignment & Doubt Solver",
        "doubt"
      );
      setDoubtResult(response);
    } catch (err: any) {
      setDoubtResult(`Failed to solve: ${err.message}`);
    } finally {
      setDoubtLoading(false);
    }
  };

  // 2. Handle Review Attempt
  const handleReviewAttempt = async () => {
    if (!questionText.trim() || !studentAttempt.trim()) return;
    setReviewLoading(true);
    try {
      const prompt = `Review my draft attempt for this engineering question:\n\n[QUESTION]:\n${questionText}\n\n[STUDENT ATTEMPT]:\n${studentAttempt}\n\nProvide:\n1. Constructive Evaluation & Score (/10)\n2. Where the student went wrong (exact step/line)\n3. Corrected Ideal Approach\n4. Examiner tips to secure full marks.`;
      const response = await sendChatMessage([{ role: "user", content: prompt }], "Assignment Reviewer", "doubt");
      setReviewResult(response);
    } catch (err: any) {
      setReviewResult(`Review failed: ${err.message}`);
    } finally {
      setReviewLoading(false);
    }
  };

  // 3. Start Viva Exam
  const handleStartViva = async () => {
    setVivaStarted(true);
    setVivaTurn(1);
    setVivaQuestions([]);
    setVivaFinalScorecard(null);
    setVivaLoading(true);

    try {
      const firstQ = await sendChatMessage(
        [
          {
            role: "user",
            content: `I am presenting my engineering project/topic: "${vivaTopic}". Please act as a senior external university viva examiner. Welcome me briefly and ask Question #1 (a foundational architectural or theoretical question). Ask ONLY Question #1.`,
          },
        ],
        `Viva Defense: ${vivaTopic}`,
        "viva"
      );
      setVivaQuestions([{ q: firstQ }]);
    } catch (err: any) {
      setVivaQuestions([{ q: `Examiner failed to connect: ${err.message}` }]);
    } finally {
      setVivaLoading(false);
    }
  };

  // Submit Answer to Viva Examiner
  const handleSubmitVivaAnswer = async () => {
    if (!studentInput.trim() || vivaLoading) return;
    const currentQIdx = vivaQuestions.length - 1;
    const currentQ = vivaQuestions[currentQIdx];

    setVivaLoading(true);
    try {
      const evalPrompt = `The viva topic is "${vivaTopic}".
Question asked: "${currentQ.q}"
Student's answer: "${studentInput}"

1. Evaluate the student's answer. Give a score from 1 to 10 with clear justification (what was accurate, what was missing).
${
  vivaTurn >= 4
    ? "2. This was Question 4. Conclude the viva examination! Provide a final Viva Defense Scorecard with Overall Grade, Conceptual Strengths, and Preparation Gaps to fix."
    : `2. Then pose Question #${vivaTurn + 1} which should be a more challenging, edge-case, or practical implementation question.`
}`;

      const examinerResponse = await sendChatMessage(
        [{ role: "user", content: evalPrompt }],
        `Viva Defense Turn ${vivaTurn}`,
        "viva"
      );

      // Extract approximate score
      const scoreMatch = examinerResponse.match(/(\d+(?:\.\d+)?)\s*(?:\/|\s*out of\s*)10/i);
      const score = scoreMatch ? parseFloat(scoreMatch[1]) : 8;

      // Update current question with student answer and feedback
      const updated = [...vivaQuestions];
      updated[currentQIdx] = {
        ...currentQ,
        answer: studentInput,
        feedback: examinerResponse,
        score,
      };

      if (vivaTurn >= 4) {
        setVivaFinalScorecard(examinerResponse);
      } else {
        // Next question
        const nextQMatch = examinerResponse.split(/(?:Question\s*#?\d+:?|Next question:?)/i);
        const nextQText =
          nextQMatch.length > 1 ? nextQMatch[nextQMatch.length - 1].trim() : "Explain how your system handles concurrency and failure recovery?";
        updated.push({ q: nextQText });
        setVivaTurn((prev) => prev + 1);
      }

      setVivaQuestions(updated);
      setStudentInput("");
    } catch (err: any) {
      console.error(err);
    } finally {
      setVivaLoading(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-zinc-950 text-zinc-200 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation Tabs */}
        <div className="flex items-center justify-between p-2 bg-zinc-900 border border-zinc-800 rounded-xl">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab("timed_viva")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                activeTab === "timed_viva" ? "bg-zinc-800 text-emerald-400 font-semibold" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Timer className="w-3.5 h-3.5" />
              <span>Timed Mock Viva Session</span>
            </button>
            <button
              onClick={() => setActiveTab("viva")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                activeTab === "viva" ? "bg-zinc-800 text-emerald-400 font-semibold" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Conversational Viva</span>
            </button>
            <button
              onClick={() => setActiveTab("doubt")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                activeTab === "doubt" ? "bg-zinc-800 text-emerald-400 font-semibold" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Step-by-Step Doubt Solver</span>
            </button>
            <button
              onClick={() => setActiveTab("review")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                activeTab === "review" ? "bg-zinc-800 text-emerald-400 font-semibold" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <FileSearch className="w-3.5 h-3.5" />
              <span>Review My Attempt</span>
            </button>
          </div>
        </div>

        {/* Tab 0: Timed Mock Viva Session */}
        {activeTab === "timed_viva" && <MockVivaSession />}

        {/* Tab 1: Viva Simulator */}
        {activeTab === "viva" && (
          <div className="space-y-4">
            {!vivaStarted ? (
              <div className="p-6 bg-zinc-900/60 border border-zinc-800 rounded-xl space-y-4 text-center">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-zinc-100">Interactive Oral Viva Voce Simulator</h3>
                  <p className="text-xs text-zinc-400 max-w-lg mx-auto mt-1 leading-relaxed">
                    Practice defending your project or subject in front of a strict external university examiner. Get
                    live critiques, scoring out of 10 for each response, and an end-of-defense Scorecard.
                  </p>
                </div>

                <div className="max-w-md mx-auto space-y-2 text-left pt-2">
                  <label className="text-xs text-zinc-300 font-medium">Viva Subject / Project Topic:</label>
                  <input
                    type="text"
                    value={vivaTopic}
                    onChange={(e) => setVivaTopic(e.target.value)}
                    placeholder="e.g. Distributed Consensus in Go or manthankro/pramanix Python Backend"
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded text-xs text-zinc-100 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <button
                  onClick={handleStartViva}
                  disabled={vivaLoading || !vivaTopic.trim()}
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold transition cursor-pointer disabled:opacity-60 shadow-sm"
                >
                  Start Oral Viva Defense
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Active topic bar */}
                <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-lg flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-400">Exam Topic:</span>
                    <span className="font-semibold text-zinc-200">{vivaTopic}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-emerald-400 font-mono">Question {vivaTurn} of 4</span>
                    <button
                      onClick={handleStartViva}
                      className="text-zinc-400 hover:text-zinc-200 text-[11px] underline cursor-pointer"
                    >
                      Restart Viva
                    </button>
                  </div>
                </div>

                {/* Conversation log */}
                <div className="space-y-4">
                  {vivaQuestions.map((item, idx) => (
                    <div key={idx} className="space-y-2">
                      {/* Examiner Question */}
                      <div className="p-4 bg-zinc-900/80 border border-zinc-800 rounded-xl space-y-2">
                        <div className="flex items-center justify-between text-[11px] text-zinc-400">
                          <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                            <Award className="w-3.5 h-3.5" /> External Examiner
                          </span>
                          <span className="font-mono">Question #{idx + 1}</span>
                        </div>
                        <p className="text-xs text-zinc-100 font-medium leading-relaxed">{item.q}</p>
                      </div>

                      {/* Student Answer */}
                      {item.answer && (
                        <div className="p-3.5 ml-6 bg-zinc-950 border border-zinc-800 rounded-xl space-y-1">
                          <div className="text-[11px] font-semibold text-zinc-400">Your Answer:</div>
                          <p className="text-xs text-zinc-300 leading-relaxed font-sans">{item.answer}</p>
                        </div>
                      )}

                      {/* Examiner Feedback & Score */}
                      {item.feedback && (
                        <div className="p-4 ml-6 bg-zinc-900/40 border border-emerald-950/60 rounded-xl space-y-2 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-semibold text-emerald-400">Examiner Evaluation:</span>
                            {item.score !== undefined && (
                              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                {item.score} / 10
                              </span>
                            )}
                          </div>
                          <MarkdownView content={item.feedback} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Answer input if not finished */}
                {!vivaFinalScorecard && (
                  <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-xl space-y-3">
                    <label className="text-xs text-zinc-300 font-medium flex items-center justify-between">
                      <span>Formulate your viva defense answer:</span>
                      <span className="text-[11px] text-zinc-400">Be concise, technical, and mention core principles</span>
                    </label>
                    <textarea
                      rows={3}
                      value={studentInput}
                      onChange={(e) => setStudentInput(e.target.value)}
                      placeholder="Speak or type your answer clearly like in a real oral viva..."
                      className="w-full p-2.5 bg-zinc-950 border border-zinc-700 rounded text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSubmitVivaAnswer();
                        }
                      }}
                    />
                    <div className="flex justify-end">
                      <button
                        onClick={handleSubmitVivaAnswer}
                        disabled={vivaLoading || !studentInput.trim()}
                        className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold transition cursor-pointer disabled:opacity-60"
                      >
                        {vivaLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                        <span>{vivaLoading ? "Evaluating Answer..." : "Submit Answer to Examiner"}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Doubt Solver */}
        {activeTab === "doubt" && (
          <div className="space-y-4">
            <div className="p-5 bg-zinc-900/60 border border-zinc-800 rounded-xl space-y-3">
              <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-emerald-400" />
                Step-by-Step Assignment & Doubt Solver
              </h3>
              <p className="text-xs text-zinc-400">
                Paste any theoretical derivation, mathematical formulation, or numerical assignment question.
              </p>
              <textarea
                rows={4}
                value={doubtText}
                onChange={(e) => setDoubtText(e.target.value)}
                placeholder="Paste the problem statement or question here..."
                className="w-full p-3 bg-zinc-950 border border-zinc-700 rounded text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 font-mono"
              />
              <button
                onClick={handleSolveDoubt}
                disabled={doubtLoading || !doubtText.trim()}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold transition cursor-pointer flex items-center gap-2 disabled:opacity-50"
              >
                {doubtLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                <span>{doubtLoading ? "Solving with derivations..." : "Solve Step-by-Step"}</span>
              </button>
            </div>

            {doubtResult && (
              <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-xl">
                <MarkdownView content={doubtResult} />
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Review My Attempt */}
        {activeTab === "review" && (
          <div className="space-y-4">
            <div className="p-5 bg-zinc-900/60 border border-zinc-800 rounded-xl space-y-4">
              <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
                <FileSearch className="w-4 h-4 text-emerald-400" />
                Student Attempt Critique & Rubric
              </h3>
              <div className="space-y-1.5">
                <label className="text-xs text-zinc-300 font-medium">Original Question:</label>
                <input
                  type="text"
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  placeholder="e.g. Find the Norton equivalent circuit at terminals A-B..."
                  className="w-full p-2 bg-zinc-950 border border-zinc-700 rounded text-xs text-zinc-200 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-zinc-300 font-medium">Your Attempt / Solution Draft:</label>
                <textarea
                  rows={4}
                  value={studentAttempt}
                  onChange={(e) => setStudentAttempt(e.target.value)}
                  placeholder="Type or paste what you did, your intermediate equations, or code..."
                  className="w-full p-2.5 bg-zinc-950 border border-zinc-700 rounded text-xs text-zinc-200 font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>
              <button
                onClick={handleReviewAttempt}
                disabled={reviewLoading || !questionText.trim() || !studentAttempt.trim()}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold transition cursor-pointer flex items-center gap-2 disabled:opacity-50"
              >
                {reviewLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                <span>{reviewLoading ? "Critiquing Attempt..." : "Review My Attempt & Grade"}</span>
              </button>
            </div>

            {reviewResult && (
              <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-xl">
                <MarkdownView content={reviewResult} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
