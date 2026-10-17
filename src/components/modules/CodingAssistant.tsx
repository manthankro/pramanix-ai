import React, { useState } from "react";
import {
  Code2,
  Bug,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  CheckCircle2,
  Terminal,
  BookOpen,
  HelpCircle,
  Upload,
} from "lucide-react";
import { analyzeTask } from "../../services/api";
import { MarkdownView } from "../common/MarkdownView";

export const CodingAssistant: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"debugger" | "interview" | "complexity">("debugger");

  // Debugger state
  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState(
    `def find_duplicates(arr):
    # Buggy attempt with O(N^2) complexity and off-by-one
    duplicates = []
    for i in range(len(arr)):
        for j in range(i + 1, len(arr) + 1): # Index error here!
            if arr[i] == arr[j]:
                duplicates.append(arr[i])
    return duplicates

# Test case
print(find_duplicates([1, 2, 3, 2, 4, 1]))`
  );
  const [errorLog, setErrorLog] = useState("IndexError: list index out of range at line 6");
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewResult, setReviewResult] = useState("");
  const [uploadedFileName, setUploadedFileName] = useState("");

  // Interview Bank State
  const [selectedProblemIdx, setSelectedProblemIdx] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [showSolution, setShowSolution] = useState(false);

  const interviewProblems = [
    {
      title: "LRU (Least Recently Used) Cache",
      difficulty: "Medium / Hard",
      tags: ["Hash Map", "Doubly Linked List", "O(1) Get/Put"],
      prompt: `Design a data structure that follows the constraints of a Least Recently Used (LRU) cache.
Implement the LRUCache class:
- LRUCache(int capacity) Initialize the LRU cache with positive size capacity.
- int get(int key) Return the value of the key if the key exists, otherwise return -1.
- void put(int key, int value) Update the value of the key if the key exists. Otherwise, add the key-value pair to the cache. If the number of keys exceeds the capacity from this operation, evict the least recently used key.
Constraints: Must run in O(1) average time complexity for both get and put.`,
      hint: "Use a Hash Map paired with a Doubly Linked List. The Hash Map provides O(1) key lookups to node references, while the Doubly Linked List allows O(1) node removal and insertion to the head.",
      solution: `class Node:
    def __init__(self, key=0, val=0):
        self.key = key
        self.val = val
        self.prev = None
        self.next = None

class LRUCache:
    def __init__(self, capacity: int):
        self.cap = capacity
        self.map = {}
        # Dummy head and tail
        self.head = Node()
        self.tail = Node()
        self.head.next = self.tail
        self.tail.prev = self.head

    def _remove(self, node):
        node.prev.next = node.next
        node.next.prev = node.prev

    def _add_to_front(self, node):
        node.next = self.head.next
        node.prev = self.head
        self.head.next.prev = node
        self.head.next = node

    def get(self, key: int) -> int:
        if key not in self.map:
            return -1
        node = self.map[key]
        self._remove(node)
        self._add_to_front(node)
        return node.val

    def put(self, key: int, value: int) -> None:
        if key in self.map:
            self._remove(self.map[key])
        node = Node(key, value)
        self.map[key] = node
        self._add_to_front(node)
        if len(self.map) > self.cap:
            lru = self.tail.prev
            self._remove(lru)
            del self.map[lru.key]`,
    },
    {
      title: "Course Schedule (Topological Sort / Cycle Detection)",
      difficulty: "Medium",
      tags: ["Graph", "BFS / Kahn's Algorithm", "DFS"],
      prompt: `There are a total of numCourses courses you have to take, labeled from 0 to numCourses - 1. You are given an array prerequisites where prerequisites[i] = [ai, bi] indicates that you must take course bi first if you want to take course ai.
Return true if you can finish all courses. Otherwise, return false.`,
      hint: "Model this as a directed graph. Detect if the graph has a cycle using Kahn's Algorithm with in-degrees (BFS) or DFS with 3 states (unvisited, visiting, visited).",
      solution: `from collections import deque, defaultdict

def canFinish(numCourses: int, prerequisites: list[list[int]]) -> bool:
    adj = defaultdict(list)
    in_degree = [0] * numCourses

    for dest, src in prerequisites:
        adj[src].append(dest)
        in_degree[dest] += 1

    queue = deque([i for i in range(numCourses) if in_degree[i] == 0])
    visited_count = 0

    while queue:
        node = queue.popleft()
        visited_count += 1
        for neighbor in adj[node]:
            in_degree[neighbor] -= 1
            if in_degree[neighbor] == 0:
                queue.append(neighbor)

    return visited_count == numCourses`,
    },
    {
      title: "Longest Substring Without Repeating Characters",
      difficulty: "Medium",
      tags: ["Sliding Window", "Hash Set / Map"],
      prompt: `Given a string s, find the length of the longest substring without duplicate characters.
Example: s = "abcabcbb" -> Answer = 3 ("abc").`,
      hint: "Use a sliding window with two pointers (left and right) and a hash map storing the last seen index of each character to jump the left pointer forward in O(1).",
      solution: `def lengthOfLongestSubstring(s: str) -> int:
    char_map = {}
    left = 0
    max_len = 0

    for right, char in enumerate(s):
        if char in char_map and char_map[char] >= left:
            left = char_map[char] + 1
        char_map[char] = right
        max_len = max(max_len, right - left + 1)

    return max_len`,
    },
  ];

  const handleCodeFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      setCode(text.slice(0, 120000));
      setUploadedFileName(file.name);
      const extension = file.name.split(".").pop()?.toLowerCase();
      const languageByExtension: Record<string, string> = {
        py: "python", js: "javascript", jsx: "javascript", ts: "javascript", tsx: "javascript",
        cpp: "cpp", cc: "cpp", c: "cpp", java: "java", rs: "rust", go: "go", sql: "sql",
      };
      if (extension && languageByExtension[extension]) setLanguage(languageByExtension[extension]);
      setReviewResult("");
    } catch {
      setReviewResult("Could not read this file. Please choose a plain-text source file.");
    } finally {
      event.target.value = "";
    }
  };

  const handleReviewCode = async () => {
    if (!code.trim()) return;
    setReviewLoading(true);
    try {
      const result = await analyzeTask("code_review", {
        language,
        code,
        description: errorLog ? `Error output: ${errorLog}` : "Analyze bugs, Big-O complexity, and suggest tests",
      });
      setReviewResult(result);
    } catch (err: any) {
      setReviewResult(`Review failed: ${err.message}`);
    } finally {
      setReviewLoading(false);
    }
  };

  const currentProblem = interviewProblems[selectedProblemIdx];

  return (
    <div className="h-full overflow-y-auto bg-zinc-950 text-zinc-200 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 p-1 bg-zinc-900 border border-zinc-800 rounded-xl text-xs">
          <button
            onClick={() => setActiveTab("debugger")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg cursor-pointer transition ${
              activeTab === "debugger" ? "bg-zinc-800 text-emerald-400 font-semibold" : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Bug className="w-3.5 h-3.5" />
            <span>Code Reviewer & Debugger</span>
          </button>
          <button
            onClick={() => setActiveTab("interview")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg cursor-pointer transition ${
              activeTab === "interview" ? "bg-zinc-800 text-emerald-400 font-semibold" : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Technical & DSA Interview Bank</span>
          </button>
        </div>

        {/* Tab 1: Debugger */}
        {activeTab === "debugger" && (
          <div className="space-y-4">
            <div className="p-5 bg-zinc-900/60 border border-zinc-800 rounded-xl space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-emerald-400" />
                  Code Diagnostics, Big-O Audit & Unit Test Generator
                </h3>
                <div className="flex items-center gap-2">
                  <label className="text-[11px] text-zinc-400">Language:</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="px-2 py-1 bg-zinc-950 border border-zinc-700 rounded text-xs text-zinc-200 focus:outline-none focus:border-emerald-500 font-mono"
                  >
                    <option value="python">Python</option>
                    <option value="javascript">JavaScript / TypeScript</option>
                    <option value="cpp">C++</option>
                    <option value="java">Java</option>
                    <option value="rust">Rust</option>
                    <option value="go">Go</option>
                    <option value="sql">SQL</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <label className="text-xs text-zinc-300 font-medium font-mono">Source Code:</label>
                    <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-900 px-2.5 py-1.5 text-[11px] text-zinc-300 hover:border-emerald-500/60 hover:text-white">
                      <Upload className="h-3.5 w-3.5 text-emerald-400" />
                      Upload code file
                      <input type="file" accept=".py,.js,.jsx,.ts,.tsx,.cpp,.cc,.c,.java,.rs,.go,.sql,.txt" className="hidden" onChange={handleCodeFileUpload} />
                    </label>
                  </div>
                  {uploadedFileName && <p className="text-[10px] text-zinc-500">Loaded {uploadedFileName} · files are read locally in your browser.</p>}
                  <textarea
                    rows={10}
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full p-3 bg-zinc-950 border border-zinc-700 rounded font-mono text-xs text-zinc-200 focus:outline-none focus:border-emerald-500 leading-relaxed"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-300 font-medium flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-zinc-400" /> Terminal Error / Traceback (Optional):
                  </label>
                  <textarea
                    rows={10}
                    value={errorLog}
                    onChange={(e) => setErrorLog(e.target.value)}
                    placeholder="Paste error traceback or desired performance constraints..."
                    className="w-full p-3 bg-zinc-950 border border-zinc-700 rounded font-mono text-xs text-zinc-400 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  onClick={handleReviewCode}
                  disabled={reviewLoading || !code.trim()}
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold transition cursor-pointer disabled:opacity-60"
                >
                  {reviewLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  <span>{reviewLoading ? "Analyzing & Generating Tests..." : "Run Code Review & Big-O Audit"}</span>
                </button>
              </div>
            </div>

            {reviewResult && (
              <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-xl space-y-3">
                <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                  Review &amp; Refactoring Report
                </h4>
                <MarkdownView content={reviewResult} />
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Interview Bank */}
        {activeTab === "interview" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Problem list */}
            <div className="space-y-2">
              <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider px-1">
                High-Yield Interview Problems
              </div>
              {interviewProblems.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedProblemIdx(idx);
                    setShowHint(false);
                    setShowSolution(false);
                  }}
                  className={`w-full text-left p-3 rounded-xl border transition cursor-pointer ${
                    selectedProblemIdx === idx
                      ? "bg-zinc-900 border-emerald-500/50 text-zinc-100 shadow-sm"
                      : "bg-zinc-950/60 border-zinc-800/80 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
                  }`}
                >
                  <div className="text-xs font-semibold truncate">{p.title}</div>
                  <div className="flex items-center gap-2 mt-1 text-[11px]">
                    <span className="text-amber-400">{p.difficulty}</span>
                    <span>·</span>
                    <span className="text-zinc-500 truncate">{p.tags[0]}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Problem Details */}
            <div className="md:col-span-2 space-y-4">
              <div className="p-6 bg-zinc-900/60 border border-zinc-800 rounded-xl space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                  <h3 className="text-sm font-bold text-zinc-100">{currentProblem.title}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                    {currentProblem.tags.map((t, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-zinc-950 border border-zinc-800 text-[11px]">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="text-xs text-zinc-300 leading-relaxed whitespace-pre-line font-sans">
                  {currentProblem.prompt}
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => setShowHint(!showHint)}
                    className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 rounded text-xs transition cursor-pointer"
                  >
                    {showHint ? "Hide Hint" : "Show Algorithmic Hint"}
                  </button>
                  <button
                    onClick={() => setShowSolution(!showSolution)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-medium transition cursor-pointer"
                  >
                    {showSolution ? "Hide Model Solution" : "View Optimal O(1) Solution"}
                  </button>
                </div>

                {showHint && (
                  <div className="p-3 bg-amber-950/20 border border-amber-800/50 rounded-lg text-xs text-amber-200">
                    <span className="font-semibold">Hint: </span>
                    {currentProblem.hint}
                  </div>
                )}

                {showSolution && (
                  <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-lg space-y-2">
                    <div className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">
                      Optimal Python Implementation
                    </div>
                    <pre className="p-3 bg-zinc-900 rounded font-mono text-xs text-zinc-200 overflow-x-auto">
                      <code>{currentProblem.solution}</code>
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
