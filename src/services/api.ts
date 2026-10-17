import { RepoData } from "../types";

export async function sendChatMessage(
  messages: Array<{ role: string; content: string }>,
  context?: string,
  mode: "general" | "viva" | "doubt" | "research" = "general"
): Promise<string> {
  const res = await fetch("/api/gemini/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, context, mode }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Failed to generate response (${res.status})`);
  }

  const data = await res.json();
  return data.reply || "";
}

export async function analyzeTask(task: string, data: any): Promise<string> {
  const res = await fetch("/api/gemini/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ task, data }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Task analysis failed (${res.status})`);
  }

  const resp = await res.json();
  return resp.result || "";
}

export async function fetchGitHubRepo(repo = "manthankro/pramanix-ai-"): Promise<RepoData> {
  const res = await fetch(`/api/github/repo?repo=${encodeURIComponent(repo)}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `GitHub fetch failed (${res.status})`);
  }
  return res.json();
}

export async function fetchGitHubFile(repo: string, filePath: string, branch = "main"): Promise<string> {
  const res = await fetch(
    `/api/github/file?repo=${encodeURIComponent(repo)}&path=${encodeURIComponent(filePath)}&branch=${encodeURIComponent(branch)}`
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Failed to fetch file content (${res.status})`);
  }
  const data = await res.json();
  return data.content || "";
}

export function getDownloadZipUrl(repo = "manthankro/pramanix-ai-", branch = "main"): string {
  return `/api/github/download-zip?repo=${encodeURIComponent(repo)}&branch=${encodeURIComponent(branch)}`;
}

export interface RepoInsightsData {
  languages: Record<string, number>;
  contributors: Array<{
    login: string;
    contributions: number;
    avatar_url: string;
    html_url: string;
  }>;
  commits: Array<{
    date: string;
    message: string;
    author: string;
  }>;
}

export async function fetchGitHubInsights(repo = "manthankro/pramanix-ai-"): Promise<RepoInsightsData> {
  const res = await fetch(`/api/github/insights?repo=${encodeURIComponent(repo)}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Failed to fetch repo insights (${res.status})`);
  }
  return res.json();
}

export interface SearchedRepoItem {
  id: number;
  fullName: string;
  name: string;
  owner: string;
  avatarUrl?: string;
  description?: string;
  stars: number;
  forks: number;
  language?: string;
  defaultBranch: string;
  htmlUrl: string;
  updatedAt?: string;
}

export interface SearchReposResponse {
  totalCount: number;
  items: SearchedRepoItem[];
}

export async function searchGitHubRepos(query: string): Promise<SearchReposResponse> {
  const res = await fetch(`/api/github/search?q=${encodeURIComponent(query)}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Failed to search GitHub (${res.status})`);
  }
  return res.json();
}
