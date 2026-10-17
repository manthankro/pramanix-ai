import React, { useState } from "react";
import {
  Github,
  Download,
  FolderGit2,
  FileCode,
  Folder,
  PlayCircle,
  AlertTriangle,
  Sparkles,
  ExternalLink,
  RefreshCw,
  Search,
  CheckCircle2,
  Terminal,
  BarChart3,
  Star,
  GitFork,
  X,
} from "lucide-react";
import { RepoData, RepoFile } from "../../types";
import {
  fetchGitHubRepo,
  fetchGitHubFile,
  analyzeTask,
  getDownloadZipUrl,
  fetchGitHubInsights,
  RepoInsightsData,
  searchGitHubRepos,
  SearchedRepoItem,
} from "../../services/api";
import { MarkdownView } from "../common/MarkdownView";
import { RepoInsights } from "./RepoInsights";

interface GithubMentorProps {
  onConnectRepoToWorkspace?: (repoName: string) => void;
}

export const GithubMentor: React.FC<GithubMentorProps> = ({ onConnectRepoToWorkspace }) => {
  const [repoInput, setRepoInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [repoData, setRepoData] = useState<RepoData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Search by name or owner state
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchedRepoItem[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  // Repository Insights state
  const [insightsData, setInsightsData] = useState<RepoInsightsData | null>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);

  // Active tab
  const [activeTab, setActiveTab] = useState<"overview" | "insights" | "files" | "install" | "diagnose">("overview");

  // File browser state
  const [selectedFile, setSelectedFile] = useState<string | null>("README.md");
  const [fileContent, setFileContent] = useState<string>("");
  const [loadingFile, setLoadingFile] = useState(false);

  // AI Analysis state
  const [analyzing, setAnalyzing] = useState(false);
  const [auditReport, setAuditReport] = useState<string>("");

  // Error diagnostic state
  const [errorLogInput, setErrorLogInput] = useState("");
  const [diagnosticResult, setDiagnosticResult] = useState<string>("");
  const [diagnosing, setDiagnosing] = useState(false);

  const loadInsights = async (target: string) => {
    setLoadingInsights(true);
    try {
      const data = await fetchGitHubInsights(target);
      setInsightsData(data);
    } catch (err: any) {
      console.warn("Insights load warning:", err);
    } finally {
      setLoadingInsights(false);
    }
  };

  const loadRepo = async (target: string) => {
    setLoading(true);
    setError(null);
    try {
      // Trigger insights fetch simultaneously
      loadInsights(target);

      const data = await fetchGitHubRepo(target);
      setRepoData(data);
      if (data.readme) {
        setSelectedFile("README.md");
        setFileContent(data.readme);
      } else if (data.files.length > 0) {
        const firstFile = data.files.find((f) => f.type === "file");
        if (firstFile) {
          loadFile(firstFile.path, data.fullName, data.defaultBranch);
        }
      }
      // Auto run initial audit if not present
      runArchitectureAudit(data);
    } catch (err: any) {
      setError(err.message || "Failed to load GitHub repository");
    } finally {
      setLoading(false);
    }
  };

  const loadFile = async (filePath: string, repoName: string, branch: string) => {
    setSelectedFile(filePath);
    setLoadingFile(true);
    try {
      const content = await fetchGitHubFile(repoName, filePath, branch);
      setFileContent(content);
    } catch (err: any) {
      setFileContent(`// Error loading file: ${err.message}`);
    } finally {
      setLoadingFile(false);
    }
  };

  const runArchitectureAudit = async (data: RepoData) => {
    setAnalyzing(true);
    try {
      const report = await analyzeTask("github_diagnose", {
        repoName: data.fullName,
        defaultBranch: data.defaultBranch,
        files: data.files.map((f) => f.path),
        readme: data.readme,
      });
      setAuditReport(report);
    } catch (err: any) {
      const message = String(err?.message || "Unknown error");
      setAuditReport(
        message.toLowerCase().includes("no ai provider configured")
          ? "AI summary is not connected yet. In Netlify, add GROQ_API_KEY under Site configuration → Environment variables, make sure its scope includes Functions, then redeploy the site."
          : `Could not create the student guide: ${message}`
      );
    } finally {
      setAnalyzing(false);
    }
  };

  const handleDownloadZip = () => {
    if (!repoData) return;
    const downloadUrl = getDownloadZipUrl(repoData.fullName, repoData.defaultBranch);
    window.location.href = downloadUrl;
  };

  const handleDiagnoseError = async () => {
    if (!errorLogInput.trim() || !repoData) return;
    setDiagnosing(true);
    try {
      const result = await analyzeTask("github_diagnose", {
        repoName: repoData.fullName,
        defaultBranch: repoData.defaultBranch,
        files: repoData.files.map((f) => f.path),
        readme: `[STUDENT ERROR / BUG REPORT FOR ${repoData.fullName}]:\n${errorLogInput}\n\nRepository README:\n${repoData.readme.slice(0, 1500)}`,
      });
      setDiagnosticResult(result);
    } catch (err: any) {
      setDiagnosticResult(`Diagnostic failed: ${err.message}`);
    } finally {
      setDiagnosing(false);
    }
  };

  const handleSearchChange = (query: string) => {
    setRepoInput(query);
    if (!query.trim()) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    setShowDropdown(true);
    if (debounceTimer) clearTimeout(debounceTimer);

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const resp = await searchGitHubRepos(query);
        setSearchResults(resp.items || []);
      } catch (err) {
        console.warn("Search query failed:", err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    setDebounceTimer(timer);
  };

  const handleSearchSubmit = async (searchQuery = repoInput) => {
    const query = searchQuery.trim();
    setError(null);
    if (!query || loading) return;
    if (query.includes("/") || query.includes("github.com/")) {
      setShowDropdown(false);
      loadRepo(query);
      return;
    }
    setShowDropdown(true);
    setIsSearching(true);
    try {
      const response = await searchGitHubRepos(query);
      setSearchResults(response.items || []);
    } catch (err: any) {
      setError(err.message || "GitHub topic search failed");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectRepo = (fullName: string) => {
    setRepoInput(fullName);
    setShowDropdown(false);
    setActiveTab("overview");
    loadRepo(fullName);
  };

  return (
    <div className="h-full flex flex-col bg-zinc-950 text-zinc-200 overflow-hidden">
      <div className="px-6 pt-5 pb-3 shrink-0">
        <h2 className="text-lg font-semibold text-white">Find a GitHub project to learn from</h2>
        <p className="mt-1 text-sm text-zinc-400">Search a topic, choose a public repo, and get a beginner-friendly guide to what it does and how to explore it.</p>
      </div>
      {/* Search and control bar */}
      <div className="p-4 bg-zinc-900/60 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2 flex-1 max-w-2xl relative">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              value={repoInput}
              onChange={(e) => handleSearchChange(e.target.value)}
              onFocus={() => {
                if (repoInput.trim() && searchResults.length > 0) {
                  setShowDropdown(true);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setShowDropdown(false);
                  handleSearchSubmit();
                } else if (e.key === "Escape") {
                  setShowDropdown(false);
                }
              }}
              placeholder="Search by topic (e.g. machine learning, study planner) or enter owner/repository..."
              className="w-full pl-9 pr-8 py-1.5 bg-zinc-950 border border-zinc-700/80 rounded text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 font-mono"
            />
            {repoInput && (
              <button
                onClick={() => {
                  setRepoInput("");
                  setSearchResults([]);
                  setShowDropdown(false);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            onClick={() => {
              setShowDropdown(false);
              handleSearchSubmit();
            }}
            disabled={loading || !repoInput.trim()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-medium transition cursor-pointer disabled:opacity-60 shrink-0"
          >
            {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <FolderGit2 className="w-3.5 h-3.5" />}
            <span>{repoInput.includes("/") || repoInput.includes("github.com/") ? "Open student guide" : "Search GitHub"}</span>
          </button>

          {/* Autocomplete Search Dropdown */}
          {showDropdown && (
            <div className="absolute left-0 right-0 top-full mt-1.5 bg-zinc-900 border border-zinc-700/80 rounded-xl shadow-2xl z-50 overflow-hidden max-h-96 flex flex-col">
              <div className="p-2.5 bg-zinc-950 border-b border-zinc-800 text-[11px] font-semibold text-zinc-400 flex items-center justify-between">
                <span>
                  {isSearching ? "Searching GitHub public repositories..." : `Found ${searchResults.length} matching repositories`}
                </span>
                <button
                  onClick={() => setShowDropdown(false)}
                  className="text-zinc-500 hover:text-zinc-300 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="overflow-y-auto divide-y divide-zinc-800/80 max-h-80">
                {isSearching ? (
                  <div className="p-6 flex items-center justify-center gap-2 text-zinc-400 text-xs">
                    <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                    <span>Querying GitHub API...</span>
                  </div>
                ) : searchResults.length > 0 ? (
                  searchResults.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleSelectRepo(item.fullName)}
                      className="p-3 hover:bg-zinc-800/80 transition cursor-pointer flex items-start justify-between gap-3 group"
                    >
                      <div className="flex items-start gap-2.5 min-w-0">
                        <img
                          src={item.avatarUrl || "https://github.com/github.png"}
                          alt={item.owner}
                          className="w-6 h-6 rounded-full border border-zinc-700 mt-0.5 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="font-mono text-xs font-semibold text-zinc-100 group-hover:text-emerald-400 transition truncate">
                            {item.fullName}
                          </div>
                          {item.description && (
                            <p className="text-[11px] text-zinc-400 line-clamp-1 mt-0.5">{item.description}</p>
                          )}
                          <div className="flex items-center gap-3 text-[10px] text-zinc-500 mt-1 font-mono">
                            {item.language && (
                              <span className="text-zinc-300 font-medium">{item.language}</span>
                            )}
                            <span className="flex items-center gap-0.5 text-amber-400">
                              <Star className="w-3 h-3 fill-current" /> {item.stars}
                            </span>
                            <span className="flex items-center gap-0.5">
                              <GitFork className="w-3 h-3" /> {item.forks}
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectRepo(item.fullName);
                        }}
                        className="px-2.5 py-1 bg-zinc-800 group-hover:bg-emerald-600 text-zinc-200 group-hover:text-white rounded text-[11px] font-medium transition shrink-0"
                      >
                        Open guide
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-xs text-zinc-400">
                    No repositories found. Press Enter to analyze <code>{repoInput}</code> directly.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {repoData && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadZip}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-emerald-400 rounded text-xs font-medium transition cursor-pointer shadow-sm active:scale-95"
              title="Download full project repository as .zip"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download ZIP ({repoData.name}.zip)</span>
            </button>
            <a
              href={repoData.htmlUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 px-2.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800 rounded text-xs transition"
            >
              <Github className="w-3.5 h-3.5" />
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}
      </div>

      {!repoData && !loading && !error && (
        <div className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto mt-8 max-w-3xl rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8">
            <div className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Start exploring</div>
            <h3 className="mt-2 text-xl font-semibold text-white">Learn from real student projects</h3>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-400">
              Search for a topic such as “AI chatbot”, “weather app”, or “plant disease detection”. Pick a repository from the results to read its student guide, setup notes, and file map.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {["machine learning", "student management system", "portfolio website"].map((topic) => (
                <button
                  key={topic}
                  onClick={() => { setRepoInput(topic); void handleSearchSubmit(topic); }}
                  className="rounded-full border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-xs text-zinc-300 hover:border-emerald-500/60 hover:text-white"
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="p-3 mx-4 mt-3 bg-red-950/40 border border-red-800/80 rounded text-xs text-red-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => loadRepo("manthankro/pramanix-ai-")}
            className="text-[11px] underline hover:text-white cursor-pointer"
          >
            Reset to default (manthankro/pramanix-ai-)
          </button>
        </div>
      )}

      {repoData && (
        <>
          {/* Metadata banner */}
          <div className="px-6 py-3 border-b border-zinc-800/80 bg-zinc-900/30 flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-zinc-300">
                <Github className="w-4 h-4" />
              </div>
              <div>
                <div className="font-semibold text-zinc-100 flex items-center gap-2">
                  <span>{repoData.fullName}</span>
                  <span className="text-[10px] text-zinc-400 bg-zinc-800 px-1.5 py-0.2 rounded font-mono">
                    {repoData.defaultBranch}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-zinc-400 mt-0.5">
                  <span>Language: {repoData.language || "Python"}</span>
                  <span>·</span>
                  <span>{repoData.files.length} indexed files</span>
                  <span>·</span>
                  <span>Public Open Source</span>
                </div>
              </div>
            </div>

            {/* Sub-navigation tabs */}
            <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800">
              <button
                onClick={() => setActiveTab("overview")}
                className={`px-3 py-1 rounded text-xs transition cursor-pointer font-medium ${
                  activeTab === "overview" ? "bg-zinc-800 text-zinc-100" : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Student Guide
              </button>
              <button
                onClick={() => setActiveTab("insights")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs transition cursor-pointer font-medium ${
                  activeTab === "insights" ? "bg-zinc-800 text-emerald-400 font-semibold" : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Repo Insights</span>
              </button>
              <button
                onClick={() => setActiveTab("files")}
                className={`px-3 py-1 rounded text-xs transition cursor-pointer font-medium ${
                  activeTab === "files" ? "bg-zinc-800 text-zinc-100" : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                File Explorer ({repoData.files.length})
              </button>
              <button
                onClick={() => setActiveTab("install")}
                className={`px-3 py-1 rounded text-xs transition cursor-pointer font-medium ${
                  activeTab === "install" ? "bg-zinc-800 text-zinc-100" : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Run & Setup Guide
              </button>
              <button
                onClick={() => setActiveTab("diagnose")}
                className={`px-3 py-1 rounded text-xs transition cursor-pointer font-medium ${
                  activeTab === "diagnose" ? "bg-zinc-800 text-zinc-100" : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Diagnose Error
              </button>
            </div>
          </div>

          {/* Tab Content Areas */}
          <div className="flex-1 overflow-hidden">
            {activeTab === "overview" && (
              <div className="h-full overflow-y-auto p-6 max-w-5xl mx-auto space-y-6">
                {/* Quick actions row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-lg">
                    <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
                      <Download className="w-4 h-4" /> Download Archive
                    </div>
                    <p className="text-xs text-zinc-400 mb-3">
                      Export full code snapshot of {repoData.fullName} as a ready-to-run ZIP.
                    </p>
                    <button
                      onClick={handleDownloadZip}
                      className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-medium transition cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" /> Download ZIP
                    </button>
                  </div>

                  <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-lg">
                    <div className="flex items-center gap-2 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-1">
                      <Terminal className="w-4 h-4" /> Clone Command
                    </div>
                    <p className="text-xs text-zinc-400 mb-2 font-mono bg-zinc-950 p-1.5 rounded border border-zinc-800 select-all truncate">
                      git clone {repoData.htmlUrl}.git
                    </p>
                    <p className="text-[11px] text-zinc-400">Target branch: {repoData.defaultBranch}</p>
                  </div>

                  <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-lg">
                    <div className="flex items-center gap-2 text-teal-400 text-xs font-semibold uppercase tracking-wider mb-1">
                      <BarChart3 className="w-4 h-4" /> Recharts Analytics
                    </div>
                    <p className="text-xs text-zinc-400 mb-3">
                      Visual commit frequency, language ratio &amp; maintainer activity.
                    </p>
                    <button
                      onClick={() => setActiveTab("insights")}
                      className="w-full py-1.5 bg-zinc-800 hover:bg-zinc-700 text-emerald-400 border border-zinc-700 rounded text-xs font-medium transition cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <BarChart3 className="w-3.5 h-3.5" /> View Visual Charts
                    </button>
                  </div>

                  <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-lg">
                    <div className="flex items-center gap-2 text-purple-400 text-xs font-semibold uppercase tracking-wider mb-1">
                      <Sparkles className="w-4 h-4" /> Re-audit Codebase
                    </div>
                    <p className="text-xs text-zinc-400 mb-3">
                      Refresh AI evaluation of entry points, patterns, and security.
                    </p>
                    <button
                      onClick={() => runArchitectureAudit(repoData)}
                      disabled={analyzing}
                      className="w-full py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded text-xs font-medium transition cursor-pointer border border-zinc-700 flex items-center justify-center gap-1.5 disabled:opacity-60"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${analyzing ? "animate-spin" : ""}`} />
                      <span>{analyzing ? "Auditing..." : "Re-run Audit"}</span>
                    </button>
                  </div>
                </div>

                {/* Audit markdown */}
                <div className="p-6 bg-zinc-900/40 border border-zinc-800 rounded-xl">
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-4">
                    <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                      Student-friendly guide to {repoData.fullName}
                    </h3>
                    <span className="text-[11px] text-zinc-500 font-mono">Grounded on file tree & README</span>
                  </div>

                  {analyzing ? (
                    <div className="py-12 flex flex-col items-center justify-center text-zinc-400 gap-3">
                      <RefreshCw className="w-6 h-6 animate-spin text-emerald-400" />
                      <p className="text-xs">Analyzing repository hierarchy, dependencies, and entry points...</p>
                    </div>
                  ) : auditReport ? (
                    <MarkdownView content={auditReport} />
                  ) : (
                    <p className="text-xs text-zinc-500">No audit generated yet. Click &apos;Re-run Architecture Audit&apos;.</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === "insights" && (
              <RepoInsights
                insights={insightsData}
                loading={loadingInsights}
                repoName={repoData.fullName}
              />
            )}

            {activeTab === "files" && (
              <div className="h-full flex divide-x divide-zinc-800">
                {/* File Tree Left Pane */}
                <div className="w-72 bg-zinc-950 flex flex-col h-full overflow-hidden shrink-0">
                  <div className="p-2.5 border-b border-zinc-800 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center justify-between">
                    <span>Repository Tree</span>
                    <span className="font-mono text-zinc-500">{repoData.files.length} items</span>
                  </div>
                  <div className="flex-1 overflow-y-auto p-1.5 space-y-0.5 text-xs font-mono">
                    {repoData.files.map((file) => {
                      const isSelected = selectedFile === file.path;
                      return (
                        <button
                          key={file.path}
                          onClick={() => {
                            if (file.type === "file") {
                              loadFile(file.path, repoData.fullName, repoData.defaultBranch);
                            }
                          }}
                          className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-left transition cursor-pointer truncate ${
                            isSelected
                              ? "bg-zinc-800 text-emerald-400 font-semibold"
                              : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
                          }`}
                        >
                          {file.type === "dir" ? (
                            <Folder className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                          ) : (
                            <FileCode className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                          )}
                          <span className="truncate">{file.path}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* File Content Right Pane */}
                <div className="flex-1 flex flex-col h-full overflow-hidden bg-zinc-950">
                  <div className="p-3 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 font-mono text-zinc-300">
                      <FileCode className="w-4 h-4 text-emerald-400" />
                      <span>{selectedFile || "Select a file"}</span>
                    </div>
                    {selectedFile && (
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(fileContent);
                        }}
                        className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-[11px] transition cursor-pointer"
                      >
                        Copy File Content
                      </button>
                    )}
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 font-mono text-xs text-zinc-300 leading-relaxed bg-zinc-950/70">
                    {loadingFile ? (
                      <div className="py-12 flex items-center justify-center gap-2 text-zinc-500">
                        <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                        <span>Fetching {selectedFile} from GitHub...</span>
                      </div>
                    ) : (
                      <pre className="whitespace-pre-wrap select-text">{fileContent}</pre>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "install" && (
              <div className="h-full overflow-y-auto p-6 max-w-4xl mx-auto space-y-6">
                <div className="p-6 bg-zinc-900/60 border border-zinc-800 rounded-xl space-y-4">
                  <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Installation & Local Setup Guide for {repoData.name}
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Based on the detected files (e.g. <code>pyproject.toml</code>, <code>Dockerfile</code>,{" "}
                    <code>docker-compose.yml</code>), here are the recommended reproduction steps:
                  </p>

                  <div className="space-y-4 text-xs font-mono">
                    <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-lg">
                      <div className="text-zinc-400 mb-2 font-sans font-semibold text-[11px] uppercase tracking-wider">
                        1. Clone or Extract ZIP
                      </div>
                      <div className="bg-zinc-900 p-2.5 rounded text-zinc-200 select-all">
                        git clone {repoData.htmlUrl}.git
                        <br />
                        cd {repoData.name}
                      </div>
                    </div>

                    <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-lg">
                      <div className="text-zinc-400 mb-2 font-sans font-semibold text-[11px] uppercase tracking-wider">
                        2. Environment Setup (Python / Poetry / Pip)
                      </div>
                      <div className="bg-zinc-900 p-2.5 rounded text-zinc-200 select-all">
                        # Create virtual environment
                        <br />
                        python3 -m venv venv
                        <br />
                        source venv/bin/activate # Windows: venv\Scripts\activate
                        <br />
                        <br />
                        # Install dependencies
                        <br />
                        pip install --upgrade pip
                        <br />
                        pip install -e . # or poetry install
                      </div>
                    </div>

                    <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-lg">
                      <div className="text-zinc-400 mb-2 font-sans font-semibold text-[11px] uppercase tracking-wider">
                        3. Docker / Container Execution (Optional)
                      </div>
                      <div className="bg-zinc-900 p-2.5 rounded text-zinc-200 select-all">
                        docker compose up --build
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "diagnose" && (
              <div className="h-full overflow-y-auto p-6 max-w-4xl mx-auto space-y-5">
                <div className="p-5 bg-zinc-900/60 border border-zinc-800 rounded-xl space-y-3">
                  <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    Diagnose Runtime Error or Bug in {repoData.name}
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Paste your terminal stack trace, error logs, or unexpected test failure. Pramanix will correlate
                    it with the actual repository files and provide the exact fix.
                  </p>

                  <textarea
                    rows={5}
                    value={errorLogInput}
                    onChange={(e) => setErrorLogInput(e.target.value)}
                    placeholder="Paste error trace here (e.g. Traceback (most recent call last)... ModuleNotFoundError: No module named 'pramanix')"
                    className="w-full p-3 bg-zinc-950 border border-zinc-700 rounded text-xs font-mono text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                  />

                  <button
                    onClick={handleDiagnoseError}
                    disabled={diagnosing || !errorLogInput.trim()}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-medium transition cursor-pointer flex items-center gap-2 disabled:opacity-50"
                  >
                    {diagnosing ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5" />
                    )}
                    <span>{diagnosing ? "Analyzing Error Trace..." : "Diagnose Error with File References"}</span>
                  </button>
                </div>

                {diagnosticResult && (
                  <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-xl">
                    <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-3">
                      Diagnosis & Fix Recommendations
                    </h4>
                    <MarkdownView content={diagnosticResult} />
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
