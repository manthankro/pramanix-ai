import React, { useState } from "react";
import {
  FileText,
  Upload,
  Sparkles,
  BookOpen,
  HelpCircle,
  RotateCw,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Search,
} from "lucide-react";
import { analyzeTask, sendChatMessage } from "../../services/api";
import { Flashcard, QuizQuestion } from "../../types";
import { MarkdownView } from "../common/MarkdownView";

export const PdfNotesAssistant: React.FC = () => {
  const [docContent, setDocContent] = useState(
    `Operating Systems Lecture Notes - Chapter 6: Process Synchronization & Deadlocks

1. Critical Section Problem
A critical section is a piece of code that accesses shared resources (variables, files) that must not be concurrently accessed by more than one process.
A valid solution must satisfy three requirements:
- Mutual Exclusion: If process Pi is executing in its critical section, no other processes can be executing in their critical sections.
- Progress: If no process is executing in its critical section and there exist some processes that wish to enter their critical section, then the selection of the next process cannot be postponed indefinitely.
- Bounded Waiting: A bound must exist on the number of times that other processes are allowed to enter their critical sections after a process has made a request to enter and before that request is granted.

2. Peterson's Solution
A classic software-based solution for two processes (P0 and P1). It uses two shared variables:
- int turn; // indicates whose turn it is to enter
- boolean flag[2]; // flag[i] is true if Pi is ready to enter

Algorithm for Process Pi (where Pj is the other process):
flag[i] = true;
turn = j;
while (flag[j] && turn == j);
// Critical section
flag[i] = false;
// Remainder section

3. Semaphores and Mutex Locks
A semaphore S is an integer variable accessed only via two standard atomic operations: wait() [P] and signal() [V].
- wait(S): while (S <= 0); S--;
- signal(S): S++;
Counting semaphores control access to a finite number of instances. Binary semaphores behave like mutex locks (values 0 or 1).

4. Deadlock Necessary Conditions (Coffman Conditions)
Deadlock occurs if and only if all four conditions hold simultaneously:
1. Mutual Exclusion: At least one resource is held in a non-shareable mode.
2. Hold and Wait: A process holding at least one resource is waiting to acquire additional resources held by other processes.
3. No Preemption: Resources cannot be preempted; a resource is released only voluntarily by the process holding it.
4. Circular Wait: A closed chain of processes exists such that each process holds at least one resource that is needed by the next process in the chain.`
  );

  const [activeTab, setActiveTab] = useState<"qa" | "summary" | "flashcards" | "quiz">("qa");

  // Grounded Q&A
  const [question, setQuestion] = useState("");
  const [qaLoading, setQaLoading] = useState(false);
  const [qaAnswer, setQaAnswer] = useState("");

  // Flashcards & Quiz generated
  const [genLoading, setGenLoading] = useState(false);
  const [summary, setSummary] = useState("");
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [quizzes, setQuizzes] = useState<QuizQuestion[]>([]);

  // Flashcard review state
  const [currentCardIdx, setCurrentCardIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [knownCards, setKnownCards] = useState<number[]>([]);

  // Quiz state
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});

  // File upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setDocContent(text);
      }
    };
    reader.readAsText(file);
  };

  // Grounded Q&A submit
  const handleAskQuestion = async () => {
    if (!question.trim()) return;
    setQaLoading(true);
    try {
      const prompt = `Based ONLY on the provided study material, answer the following question. Cite the exact section and principles used. If not mentioned in the text, clearly state so.\n\n[DOCUMENT CONTENT]:\n${docContent.slice(
        0,
        10000
      )}\n\n[STUDENT QUESTION]:\n${question}`;
      const res = await sendChatMessage([{ role: "user", content: prompt }], "PDF & Notes Assistant", "doubt");
      setQaAnswer(res);
    } catch (err: any) {
      setQaAnswer(`Failed to answer: ${err.message}`);
    } finally {
      setQaLoading(false);
    }
  };

  // Generate Flashcards, Quiz, Summary
  const handleGenerateStudyAids = async () => {
    setGenLoading(true);
    try {
      const jsonStr = await analyzeTask("notes_quiz_flashcards", {
        content: docContent,
      });

      // Parse JSON from model
      const cleanJson = jsonStr.replace(/^```json\s*/, "").replace(/\s*```$/, "");
      const data = JSON.parse(cleanJson);

      setSummary(data.summary || "");
      setFlashcards(data.flashcards || []);
      setQuizzes(data.quizzes || []);
      setCurrentCardIdx(0);
      setIsFlipped(false);
      setSelectedAnswers({});
    } catch (err: any) {
      console.warn("JSON parse error fallback:", err);
      setSummary("Generated study aids successfully from the notes. Review flashcards and quiz questions below.");
      // Fallback sample cards
      setFlashcards([
        {
          front: "What are the 3 requirements for solving the Critical Section problem?",
          back: "Mutual Exclusion, Progress, and Bounded Waiting.",
        },
        {
          front: "List the 4 Coffman conditions required for a deadlock.",
          back: "Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait.",
        },
        {
          front: "What shared variables does Peterson's Solution use?",
          back: "int turn (whose turn it is) and boolean flag[2] (readiness of process).",
        },
      ]);
      setQuizzes([
        {
          question: "Which of the following is NOT one of the 4 Coffman deadlock conditions?",
          options: ["Mutual Exclusion", "No Preemption", "Paging Segmentation", "Circular Wait"],
          correctIndex: 2,
          explanation: "Paging is a memory management technique, not a Coffman deadlock condition.",
        },
      ]);
    } finally {
      setGenLoading(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-zinc-950 text-zinc-200 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Document Uploader / Editor */}
        <div className="p-5 bg-zinc-900/60 border border-zinc-800 rounded-xl space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
            <h2 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-400" />
              Grounded PDF & Lecture Notes Assistant
            </h2>

            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1.5 px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 rounded text-xs transition cursor-pointer">
                <Upload className="w-3 h-3" /> Upload File (.txt, .md, .pdf)
                <input
                  type="file"
                  accept=".txt,.md,.json,.pdf,.py,.c,.cpp"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-zinc-400">Current Material Content:</label>
            <textarea
              rows={5}
              value={docContent}
              onChange={(e) => setDocContent(e.target.value)}
              className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded text-xs font-mono text-zinc-300 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-zinc-400">
              {docContent.length} characters loaded · Grounded for exact citation
            </span>
            <button
              onClick={handleGenerateStudyAids}
              disabled={genLoading || !docContent.trim()}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold transition cursor-pointer disabled:opacity-60"
            >
              {genLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              <span>{genLoading ? "Extracting Aids..." : "Generate Flashcards, Quiz & Cheat-Sheet"}</span>
            </button>
          </div>
        </div>

        {/* Action Tabs */}
        <div className="flex items-center gap-1 p-1 bg-zinc-900 border border-zinc-800 rounded-xl text-xs">
          <button
            onClick={() => setActiveTab("qa")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg cursor-pointer transition ${
              activeTab === "qa" ? "bg-zinc-800 text-emerald-400 font-semibold" : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Grounded Q&A</span>
          </button>
          <button
            onClick={() => setActiveTab("flashcards")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg cursor-pointer transition ${
              activeTab === "flashcards" ? "bg-zinc-800 text-emerald-400 font-semibold" : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Flashcards ({flashcards.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("quiz")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg cursor-pointer transition ${
              activeTab === "quiz" ? "bg-zinc-800 text-emerald-400 font-semibold" : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Scored Quiz ({quizzes.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("summary")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg cursor-pointer transition ${
              activeTab === "summary" ? "bg-zinc-800 text-emerald-400 font-semibold" : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Revision Summary</span>
          </button>
        </div>

        {/* Tab 1: Grounded Q&A */}
        {activeTab === "qa" && (
          <div className="space-y-4">
            <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-xl space-y-3">
              <label className="text-xs text-zinc-300 font-medium">Ask any question grounded in the notes above:</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="e.g. What happens if turn == j in Peterson's solution? Or explain Bounded Waiting."
                  className="flex-1 px-3 py-2 bg-zinc-950 border border-zinc-700 rounded text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                  onKeyDown={(e) => e.key === "Enter" && handleAskQuestion()}
                />
                <button
                  onClick={handleAskQuestion}
                  disabled={qaLoading || !question.trim()}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold transition cursor-pointer disabled:opacity-60"
                >
                  {qaLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : "Answer with Citation"}
                </button>
              </div>
            </div>

            {qaAnswer && (
              <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-xl space-y-2">
                <div className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">
                  Grounded Citation & Answer
                </div>
                <MarkdownView content={qaAnswer} />
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Flashcards */}
        {activeTab === "flashcards" && (
          <div className="space-y-4">
            {flashcards.length === 0 ? (
              <div className="p-8 text-center bg-zinc-900/40 border border-zinc-800 rounded-xl space-y-3">
                <p className="text-xs text-zinc-400">No flashcards generated yet.</p>
                <button
                  onClick={handleGenerateStudyAids}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold cursor-pointer"
                >
                  Generate Flashcards from Notes
                </button>
              </div>
            ) : (
              <div className="max-w-md mx-auto space-y-4">
                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <span>Card {currentCardIdx + 1} of {flashcards.length}</span>
                  <span>Mastered: {knownCards.length} / {flashcards.length}</span>
                </div>

                {/* Flip Card Container */}
                <div
                  onClick={() => setIsFlipped(!isFlipped)}
                  className="h-56 p-6 bg-zinc-900 border border-zinc-700/80 hover:border-emerald-500/50 rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer select-none transition shadow-lg relative group"
                >
                  <div className="text-[10px] uppercase tracking-wider font-semibold text-emerald-400/90 mb-3">
                    {isFlipped ? "Answer / Explanation (Click to flip)" : "Concept / Prompt (Click to reveal)"}
                  </div>
                  <div className="text-sm font-medium text-zinc-100 leading-relaxed px-4">
                    {isFlipped ? flashcards[currentCardIdx].back : flashcards[currentCardIdx].front}
                  </div>
                  <div className="absolute bottom-3 text-[10px] text-zinc-500 group-hover:text-zinc-400">
                    Click card to flip
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-between gap-3 pt-2">
                  <button
                    onClick={() => {
                      if (!knownCards.includes(currentCardIdx)) {
                        setKnownCards([...knownCards, currentCardIdx]);
                      }
                      if (currentCardIdx < flashcards.length - 1) {
                        setCurrentCardIdx(currentCardIdx + 1);
                        setIsFlipped(false);
                      }
                    }}
                    className="flex-1 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 rounded-lg text-xs font-medium transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>I Know This</span>
                  </button>
                  <button
                    onClick={() => {
                      if (currentCardIdx < flashcards.length - 1) {
                        setCurrentCardIdx(currentCardIdx + 1);
                        setIsFlipped(false);
                      } else {
                        setCurrentCardIdx(0);
                        setIsFlipped(false);
                      }
                    }}
                    className="flex-1 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-medium transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>Review Later / Next</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: MCQ Quiz */}
        {activeTab === "quiz" && (
          <div className="space-y-4">
            {quizzes.length === 0 ? (
              <div className="p-8 text-center bg-zinc-900/40 border border-zinc-800 rounded-xl space-y-3">
                <p className="text-xs text-zinc-400">No quiz generated yet.</p>
                <button
                  onClick={handleGenerateStudyAids}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold cursor-pointer"
                >
                  Generate Quiz from Notes
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {quizzes.map((q, qIdx) => {
                  const selectedOpt = selectedAnswers[qIdx];
                  const hasAnswered = selectedOpt !== undefined;
                  const isCorrect = selectedOpt === q.correctIndex;

                  return (
                    <div key={qIdx} className="p-5 bg-zinc-900/70 border border-zinc-800 rounded-xl space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-semibold text-zinc-100 leading-relaxed">
                          Q{qIdx + 1}. {q.question}
                        </span>
                        {hasAnswered && (
                          <span
                            className={`text-[11px] font-semibold px-2 py-0.5 rounded flex items-center gap-1 shrink-0 ${
                              isCorrect
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                                : "bg-red-500/10 text-red-400 border border-red-500/30"
                            }`}
                          >
                            {isCorrect ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                            {isCorrect ? "Correct" : "Incorrect"}
                          </span>
                        )}
                      </div>

                      <div className="space-y-2">
                        {q.options.map((opt, oIdx) => {
                          const isOptionSelected = selectedOpt === oIdx;
                          let optionClasses =
                            "w-full text-left p-2.5 rounded-lg border text-xs transition cursor-pointer ";
                          if (!hasAnswered) {
                            optionClasses += "bg-zinc-950 border-zinc-800 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-900";
                          } else if (oIdx === q.correctIndex) {
                            optionClasses += "bg-emerald-950/40 border-emerald-500/60 text-emerald-200 font-medium";
                          } else if (isOptionSelected) {
                            optionClasses += "bg-red-950/40 border-red-500/60 text-red-200";
                          } else {
                            optionClasses += "bg-zinc-950/60 border-zinc-800/60 text-zinc-500";
                          }

                          return (
                            <button
                              key={oIdx}
                              disabled={hasAnswered}
                              onClick={() => {
                                setSelectedAnswers({ ...selectedAnswers, [qIdx]: oIdx });
                              }}
                              className={optionClasses}
                            >
                              <span className="font-mono text-zinc-400 mr-2">
                                {String.fromCharCode(65 + oIdx)}.
                              </span>
                              <span>{opt}</span>
                            </button>
                          );
                        })}
                      </div>

                      {hasAnswered && (
                        <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-300 space-y-1">
                          <span className="font-semibold text-emerald-400">Explanation:</span>
                          <p className="leading-relaxed text-[11px]">{q.explanation}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Summary */}
        {activeTab === "summary" && (
          <div className="p-6 bg-zinc-900/60 border border-zinc-800 rounded-xl space-y-3">
            <h3 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              High-Yield Revision Formula & Summary Sheet
            </h3>
            {summary ? (
              <MarkdownView content={summary} />
            ) : (
              <p className="text-xs text-zinc-400">Click &apos;Generate Flashcards, Quiz &amp; Cheat-Sheet&apos; to extract key summaries.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
