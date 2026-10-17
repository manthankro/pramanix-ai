import express, { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { Readable } from "stream";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Production is enabled by NODE_ENV=production OR the --prod flag (used by `npm start`,
// which keeps the start script cross-platform).
const IS_PROD = process.env.NODE_ENV === "production" || process.argv.includes("--prod");

// Behind Render/Railway/Netlify proxies, trust the first proxy so req.ip is the real client.
app.set("trust proxy", 1);
app.use(express.json({ limit: "25mb" }));

/* -------------------------------------------------------------------------- */
/*  Config                                                                    */
/* -------------------------------------------------------------------------- */

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.8-flash";
const GROQ_MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-120b";
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_REPO = process.env.DEFAULT_REPO || "manthankro/pramanix-ai-";
const AI_RATE_LIMIT_PER_MIN = parseInt(process.env.RATE_LIMIT_PER_MIN || "60", 10);

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

const DEFAULT_SYSTEM =
  "You are Pramanix, an elite AI engineering mentor, student project architect, and technical educator. You provide rigorous, accurate, step-by-step guidance across Computer Science, Electronics, Electrical, Mechanical, and Civil Engineering.";

/* -------------------------------------------------------------------------- */
/*  Small utilities                                                           */
/* -------------------------------------------------------------------------- */

// Simple in-memory fixed-window rate limiter (no extra dependency).
// Note: everyone on the same college Wi-Fi may share one public IP, so keep the limit generous.
function rateLimit(opts: { windowMs: number; max: number }) {
  const hits = new Map<string, { count: number; reset: number }>();
  setInterval(() => {
    const now = Date.now();
    for (const [key, value] of hits) {
      if (value.reset < now) hits.delete(key);
    }
  }, opts.windowMs).unref();

  return (req: Request, res: Response, next: NextFunction) => {
    const key = req.ip || "unknown";
    const now = Date.now();
    const entry = hits.get(key);
    if (!entry || entry.reset < now) {
      hits.set(key, { count: 1, reset: now + opts.windowMs });
      return next();
    }
    if (entry.count >= opts.max) {
      res.setHeader("Retry-After", String(Math.ceil((entry.reset - now) / 1000)));
      return res.status(429).json({ error: "Too many requests. Please wait a moment and try again." });
    }
    entry.count++;
    next();
  };
}

// Accepts "owner/repo" or a GitHub URL (including /tree/branch suffixes) and validates it.
function parseRepo(raw: string): { owner: string; repo: string } | null {
  const cleaned = (raw || "")
    .trim()
    .replace(/^https?:\/\/github\.com\//, "")
    .replace(/\.git$/, "");
  const [owner, repo] = cleaned.split("/");
  if (!owner || !repo) return null;
  if (!/^[A-Za-z0-9](?:[A-Za-z0-9-]{0,38})$/.test(owner)) return null;
  if (!/^[A-Za-z0-9._-]{1,100}$/.test(repo)) return null;
  return { owner, repo };
}

function isSafeBranch(branch: string): boolean {
  return /^[A-Za-z0-9._\/-]{1,100}$/.test(branch) && !branch.includes("..");
}

function isSafePath(p: string): boolean {
  return p.length > 0 && p.length < 500 && !p.split("/").includes("..");
}

function ghHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    "User-Agent": "Pramanix-AI-Mentor",
    Accept: "application/vnd.github.v3+json",
  };
  // Authenticated requests get 5,000 req/hr instead of 60 req/hr.
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  return headers;
}

function githubErrorMessage(status: number, remaining: string | null): string {
  if (status === 404) return "Repository not found. Check the owner/name and make sure it is public.";
  if (status === 403 || status === 429) {
    if (remaining === "0" || status === 429) {
      return "GitHub API rate limit reached. Add a GITHUB_TOKEN environment variable or try again in a few minutes.";
    }
    return "GitHub denied access to this repository.";
  }
  return `GitHub API error (${status}).`;
}

// Models sometimes wrap JSON in prose or code fences; keep only the outermost JSON object.
function extractJson(text: string): string {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  return start >= 0 && end > start ? text.slice(start, end + 1) : text;
}

/* -------------------------------------------------------------------------- */
/*  LLM layer: Groq (fast) primary -> Gemini fallback                         */
/* -------------------------------------------------------------------------- */

async function callGemini(prompt: string, systemInstruction?: string, temperature = 0.7) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured in the environment.");
  }
  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: prompt,
    config: {
      systemInstruction: systemInstruction || DEFAULT_SYSTEM,
      temperature,
    },
  });
  return response.text || "";
}

async function callGroq(prompt: string, systemInstruction: string, temperature: number) {
  const r = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      temperature,
      messages: [
        { role: "system", content: systemInstruction },
        { role: "user", content: prompt },
      ],
    }),
    signal: AbortSignal.timeout(45_000),
  });
  if (!r.ok) {
    throw new Error(`Groq ${r.status}: ${(await r.text()).slice(0, 300)}`);
  }
  const data: any = await r.json();
  return data.choices?.[0]?.message?.content || "";
}

// Single entry point used by every route.
async function callLLM(prompt: string, systemInstruction?: string, temperature = 0.7) {
  const system = systemInstruction || DEFAULT_SYSTEM;
  const hasGroq = !!process.env.GROQ_API_KEY;
  const hasGemini = !!process.env.GEMINI_API_KEY;

  if (!hasGroq && !hasGemini) {
    throw new Error("No AI provider configured. Set GROQ_API_KEY and/or GEMINI_API_KEY.");
  }

  if (hasGroq) {
    try {
      return await callGroq(prompt, system, temperature);
    } catch (err: any) {
      console.warn(`[LLM] Groq failed (${err.message}).${hasGemini ? " Falling back to Gemini." : ""}`);
      if (!hasGemini) throw err;
    }
  }
  return callGemini(prompt, system, temperature);
}

/* -------------------------------------------------------------------------- */
/*  Health                                                                    */
/* -------------------------------------------------------------------------- */

app.get("/healthz", (_req, res) => {
  res.type("text/plain").send("ok");
});

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    uptimeSeconds: Math.round(process.uptime()),
    llm: {
      primary: process.env.GROQ_API_KEY ? `groq:${GROQ_MODEL}` : process.env.GEMINI_API_KEY ? `gemini:${GEMINI_MODEL}` : "none",
      fallback: process.env.GROQ_API_KEY && process.env.GEMINI_API_KEY ? `gemini:${GEMINI_MODEL}` : "none",
    },
    github: { tokenConfigured: !!process.env.GITHUB_TOKEN },
  });
});

/* -------------------------------------------------------------------------- */
/*  AI routes (paths kept as /api/gemini/* so the frontend needs no changes)  */
/* -------------------------------------------------------------------------- */

app.use("/api/gemini", rateLimit({ windowMs: 60_000, max: AI_RATE_LIMIT_PER_MIN }));

// 1. General AI Assistant / Chat Route
app.post("/api/gemini/chat", async (req, res) => {
  try {
    const { messages, context, mode } = req.body;
    let systemInstruction =
      "You are Pramanix, an authoritative engineering mentor and technical companion. Provide structured, precise, clear, and step-by-step responses. Format code blocks with language identifiers. Avoid fluffy intros.";

    if (mode === "viva") {
      systemInstruction =
        "You are an external engineering viva-voce examiner conducting an oral exam. Ask 1-2 probing technical questions at a time. Evaluate the student's previous answer with strict academic scrutiny: highlight what was correct, what was missing, and assign a score out of 10 for that answer.";
    } else if (mode === "doubt") {
      systemInstruction =
        "You are a patient and rigorous engineering professor. When solving doubts, explain the underlying physical or mathematical principles first, then provide a structured step-by-step worked derivation or solution, followed by edge cases and key exam takeaways.";
    } else if (mode === "research") {
      systemInstruction =
        "You are a senior technical research analyst. Provide grounded technical comparisons with explicit citations. Distinguish strictly between [VERIFIED INDUSTRY SPECIFICATIONS / FACTS] and [ARCHITECTURAL RECOMMENDATIONS / TRADEOFFS].";
    }

    let formattedPrompt = "";
    if (context) {
      formattedPrompt += `[CURRENT WORKSPACE / REPO CONTEXT]:\n${String(context).slice(0, 20000)}\n\n`;
    }

    if (Array.isArray(messages) && messages.length > 0) {
      // Keep only the most recent turns so long chats stay inside token limits.
      const historyStr = messages
        .slice(-20)
        .map(
          (m: { role: string; content: string }) =>
            `${m.role === "user" ? "Student" : "Pramanix"}: ${String(m.content ?? "").slice(0, 8000)}`
        )
        .join("\n\n");
      formattedPrompt += `Conversation History:\n${historyStr}\n\nPramanix:`;
    } else {
      formattedPrompt += (req.body.prompt as string) || "Hello Pramanix, introduce your capabilities.";
    }

    const reply = await callLLM(formattedPrompt, systemInstruction);
    res.json({ reply });
  } catch (error: any) {
    console.error("Chat API error:", error);
    res.status(500).json({ error: error.message || "Failed to generate AI response" });
  }
});

// 2. Specialized Task Analyzer (Project Builder, Viva Generator, Code Review, etc.)
app.post("/api/gemini/analyze", async (req, res) => {
  try {
    const task = req.body?.task as string;
    const data = req.body?.data || {};

    let prompt = "";
    let systemInstruction = "You are Pramanix, the AI engineering mentor.";

    const requireField = (value: unknown, label: string) => {
      if (typeof value !== "string" || !value.trim()) {
        const err: any = new Error(`Missing required field: ${label}`);
        err.status = 400;
        throw err;
      }
    };

    switch (task) {
      case "project_builder":
        requireField(data.idea, "idea");
        systemInstruction =
          "You are a chief technical architect and university project evaluator. Create a complete, production-grade Software Requirements & Execution plan.";
        prompt = `Generate a full project specification for a student project with the following details:
Idea/Title: ${data.idea}
Domain: ${data.domain || "Computer Science / Full-Stack"}
Target Level: ${data.level || "Final Year Capstone / Major Project"}
Key Constraints: ${data.constraints || "Modern open-source tools, scalable"}

Please format your response into clear Markdown sections:
1. Executive Summary & Problem Statement
2. Software Requirements Specification (SRS) - Functional & Non-Functional Requirements
3. Recommended Modern Tech Stack (with justifications for Frontend, Backend, Database, DevOps)
4. System Architecture & Component Data Flow
5. 8-Week Milestone Roadmap (Week-by-week sprint deliverables)
6. Recommended Repository File Structure (exact directory tree)
7. Testing & Quality Assurance Strategy (Unit, Integration, Performance)
8. Viva & Demonstration Defense Plan (5 anticipated tough questions from examiners with model answers)`;
        break;

      case "github_diagnose":
        systemInstruction =
          "You are a lead open-source maintainer and software architect analyzing a GitHub project.";
        prompt = `Analyze the following GitHub repository metadata and file tree:
Repo: ${data.repoName}
Default Branch: ${data.defaultBranch}
Files list:\n${(data.files || []).slice(0, 100).join("\n")}
README snippet:\n${(data.readme || "").slice(0, 3000)}

Provide:
1. High-Level Architecture Overview & Purpose
2. Core Entry Points & Component Relationships
3. Step-by-Step Installation & Run Guide (based on the exact build tools detected, e.g. pyproject.toml, Dockerfile, package.json)
4. Code Quality & Architecture Audit (Strengths, Bottlenecks, Modernization recommendations)
5. 3 Actionable Improvements with suggested code/config modifications referencing specific files.`;
        break;

      case "code_review":
        requireField(data.code, "code");
        systemInstruction =
          "You are a principal engineer conducting a thorough code review and algorithm audit.";
        prompt = `Review the following code snippet:
Language: ${data.language || "auto-detect"}
Goal/Description: ${data.description || "General optimization and bug check"}
Code:
\`\`\`${data.language || ""}
${String(data.code).slice(0, 12000)}
\`\`\`

Provide:
1. Bugs, Race Conditions, and Edge-case vulnerabilities
2. Time & Space Complexity analysis (Big-O notation)
3. Refactored, Clean, Idiomatic Code Solution
4. Unit Test Cases (including boundary and edge cases)`;
        break;

      case "viva_questions":
        requireField(data.topic, "topic");
        systemInstruction =
          "You are a strict external university examiner preparing viva questions for engineering students.";
        prompt = `Generate 5 deep viva-voce questions and grading rubrics for:
Topic/Project: ${data.topic}
Branch/Specialization: ${data.branch || "Computer Science"}

For each question:
- Question text
- Why examiners ask this
- Key concepts the student MUST mention
- Sample 10/10 model answer
- Common mistakes students make`;
        break;

      case "notes_quiz_flashcards":
        requireField(data.content, "content");
        systemInstruction =
          "You are an engineering educator. Generate structured study aids (revision summary, 5 flashcards, and 4 multiple-choice questions) in JSON format.";
        prompt = `Analyze the following engineering lecture notes/study material:
---
${String(data.content).slice(0, 6000)}
---

Respond ONLY with valid JSON with this exact structure:
{
  "summary": "Concise key takeaways and high-yield engineering formulas/rules",
  "flashcards": [
    { "front": "Question or Concept prompt", "back": "Precise explanation with technical keywords" }
  ],
  "quizzes": [
    {
      "question": "Question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0,
      "explanation": "Why this option is correct and why other options are incorrect"
    }
  ]
}`;
        break;

      case "resume_audit":
        requireField(data.resumeText, "resumeText");
        systemInstruction =
          "You are an engineering hiring manager and ATS resume specialist at top tech companies.";
        prompt = `Analyze this engineering student's resume/profile:
Target Role: ${data.targetRole || "Software Engineer / System Engineer"}
Resume Text / Projects:
${String(data.resumeText).slice(0, 12000)}

Provide:
1. ATS Score Estimate (0-100) and Readability breakdown
2. Action Verb & Impact Metric Analysis (XYZ Formula: Accomplished [X], measured by [Y], by doing [Z])
3. Missing Critical Skills & Recommended Keywords for the target role
4. Project Bullet Point Rewrites (Before vs. After with quantifiable impact)
5. Top 3 Next Steps to boost interview callback rate`;
        break;

      case "compare_tech":
        requireField(data.techA, "techA");
        requireField(data.techB, "techB");
        systemInstruction =
          "You are a technical research fellow. Provide a balanced, citation-backed technical comparison.";
        prompt = `Compare the following technologies/architectures:
Option A: ${data.techA}
Option B: ${data.techB}
Domain: ${data.domain || "Software Architecture / Engineering"}

Provide:
1. Fundamental Architectural Differences
2. Performance & Resource Benchmarks (Latency, Memory, Throughput)
3. Industry Standards & Empirical Facts
4. Ideal Use Cases for ${data.techA} vs ${data.techB}
5. Final Decision Matrix table (Developer Experience, Scalability, Ecosystem, Maturity)`;
        break;

      default:
        prompt = data.prompt || "Explain engineering principles.";
    }

    let result = await callLLM(prompt, systemInstruction);
    if (task === "notes_quiz_flashcards") {
      result = extractJson(result);
    }
    res.json({ result });
  } catch (error: any) {
    console.error("Analyze API error:", error);
    res.status(error.status || 500).json({ error: error.message || "Failed to analyze request" });
  }
});

/* -------------------------------------------------------------------------- */
/*  GitHub proxy routes                                                       */
/* -------------------------------------------------------------------------- */

// 3. GitHub Public Repository API Proxy
app.get("/api/github/repo", async (req, res) => {
  try {
    const parsed = parseRepo((req.query.repo as string) || DEFAULT_REPO);
    if (!parsed) {
      return res.status(400).json({ error: "Invalid repository format. Use 'owner/repo' or a GitHub URL." });
    }
    const { owner, repo } = parsed;
    const headers = ghHeaders();

    // 1. Fetch metadata
    const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });
    if (!repoRes.ok) {
      return res.status(repoRes.status).json({
        error: githubErrorMessage(repoRes.status, repoRes.headers.get("x-ratelimit-remaining")),
        owner,
        repo,
      });
    }
    const repoData: any = await repoRes.json();
    const defaultBranch = repoData.default_branch || "main";

    // 2. Fetch README and Git tree in parallel (both optional)
    const [readmeContent, files] = await Promise.all([
      (async () => {
        try {
          const readmeRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/readme`, { headers });
          if (readmeRes.ok) {
            const readmeData: any = await readmeRes.json();
            if (readmeData.content) {
              return Buffer.from(readmeData.content, "base64").toString("utf-8");
            }
          }
        } catch (e) {
          console.warn("Failed to fetch README:", e);
        }
        return "";
      })(),
      (async () => {
        try {
          const treeRes = await fetch(
            `https://api.github.com/repos/${owner}/${repo}/git/trees/${encodeURIComponent(defaultBranch)}?recursive=1`,
            { headers }
          );
          if (treeRes.ok) {
            const treeData: any = await treeRes.json();
            if (Array.isArray(treeData.tree)) {
              return treeData.tree.map((item: any) => ({
                path: item.path,
                type: item.type === "tree" ? "dir" : "file",
                size: item.size,
              })) as Array<{ path: string; type: string; size?: number }>;
            }
          }
        } catch (e) {
          console.warn("Failed to fetch Git tree:", e);
        }
        return [] as Array<{ path: string; type: string; size?: number }>;
      })(),
    ]);

    // Direct download links
    const zipUrl = `https://codeload.github.com/${owner}/${repo}/zip/refs/heads/${defaultBranch}`;
    const archiveUrl = `https://github.com/${owner}/${repo}/archive/refs/heads/${defaultBranch}.zip`;

    res.json({
      name: repoData.name,
      fullName: repoData.full_name,
      description: repoData.description,
      stars: repoData.stargazers_count,
      forks: repoData.forks_count,
      openIssues: repoData.open_issues_count,
      language: repoData.language,
      defaultBranch,
      htmlUrl: repoData.html_url,
      zipUrl,
      archiveUrl,
      readme: readmeContent,
      files,
      owner: {
        login: repoData.owner?.login,
        avatarUrl: repoData.owner?.avatar_url,
      },
    });
  } catch (error: any) {
    console.error("GitHub API Proxy error:", error);
    res.status(500).json({ error: error.message || "Failed to query GitHub repository" });
  }
});

// 4. GitHub File Content Fetcher
app.get("/api/github/file", async (req, res) => {
  try {
    const parsed = parseRepo((req.query.repo as string) || DEFAULT_REPO);
    const filePath = (req.query.path as string) || "README.md";
    const branch = (req.query.branch as string) || "main";

    if (!parsed) return res.status(400).json({ error: "Invalid repository identifier." });
    if (!isSafeBranch(branch)) return res.status(400).json({ error: "Invalid branch name." });
    if (!isSafePath(filePath)) return res.status(400).json({ error: "Invalid file path." });

    const encodedPath = filePath.split("/").map(encodeURIComponent).join("/");
    const rawUrl = `https://raw.githubusercontent.com/${parsed.owner}/${parsed.repo}/${branch}/${encodedPath}`;
    const fileRes = await fetch(rawUrl, {
      headers: { "User-Agent": "Pramanix-AI-Mentor" },
    });

    if (!fileRes.ok) {
      return res.status(fileRes.status).json({ error: `File not found: ${filePath}` });
    }

    const content = await fileRes.text();
    res.json({ path: filePath, content });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to read file content" });
  }
});

// 5. GitHub Direct ZIP proxy download (streamed, not buffered in memory)
app.get("/api/github/download-zip", async (req, res) => {
  try {
    const parsed = parseRepo((req.query.repo as string) || DEFAULT_REPO);
    const branch = (req.query.branch as string) || "main";
    if (!parsed) return res.status(400).send("Invalid repository identifier.");
    if (!isSafeBranch(branch)) return res.status(400).send("Invalid branch name.");

    const { owner, repo } = parsed;
    const zipUrl = `https://codeload.github.com/${owner}/${repo}/zip/refs/heads/${branch}`;
    const zipRes = await fetch(zipUrl, {
      headers: { "User-Agent": "Pramanix-AI-Mentor" },
    });

    if (!zipRes.ok || !zipRes.body) {
      // Fallback redirect
      return res.redirect(`https://github.com/${owner}/${repo}/archive/refs/heads/${branch}.zip`);
    }

    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", `attachment; filename="${repo}-${branch.replace(/\//g, "-")}.zip"`);

    const stream = Readable.fromWeb(zipRes.body as any);
    stream.on("error", (err) => {
      console.error("ZIP stream error:", err);
      res.destroy(err);
    });
    stream.pipe(res);
  } catch (error: any) {
    console.error("ZIP download error:", error);
    if (!res.headersSent) res.status(500).send("Failed to download ZIP archive: " + error.message);
  }
});

// 6. GitHub Repository Insights (Languages, Commits, Contributors)
app.get("/api/github/insights", async (req, res) => {
  try {
    const parsed = parseRepo((req.query.repo as string) || DEFAULT_REPO);
    if (!parsed) {
      return res.status(400).json({ error: "Invalid repository identifier." });
    }
    const { owner, repo } = parsed;
    const headers = ghHeaders();

    // Fetch languages, contributors and commits in parallel; each is optional.
    const [languages, contributors, commits] = await Promise.all([
      (async () => {
        try {
          const r = await fetch(`https://api.github.com/repos/${owner}/${repo}/languages`, { headers });
          if (r.ok) return (await r.json()) as Record<string, number>;
        } catch (e) {
          console.warn("Failed to fetch languages:", e);
        }
        return {} as Record<string, number>;
      })(),
      (async () => {
        try {
          const r = await fetch(`https://api.github.com/repos/${owner}/${repo}/contributors?per_page=10`, { headers });
          if (r.ok) return (await r.json()) as Array<{ login: string; contributions: number; avatar_url: string; html_url: string }>;
        } catch (e) {
          console.warn("Failed to fetch contributors:", e);
        }
        return [] as Array<{ login: string; contributions: number; avatar_url: string; html_url: string }>;
      })(),
      (async () => {
        try {
          const r = await fetch(`https://api.github.com/repos/${owner}/${repo}/commits?per_page=50`, { headers });
          if (r.ok) {
            const rawCommits: any = await r.json();
            if (Array.isArray(rawCommits)) {
              return rawCommits.map((c: any) => ({
                date: c.commit?.author?.date || c.commit?.committer?.date || "",
                message: c.commit?.message?.split("\n")[0] || "",
                author: c.commit?.author?.name || c.author?.login || "Contributor",
              })) as Array<{ date: string; message: string; author: string }>;
            }
          }
        } catch (e) {
          console.warn("Failed to fetch commits:", e);
        }
        return [] as Array<{ date: string; message: string; author: string }>;
      })(),
    ]);

    res.json({ languages, contributors, commits });
  } catch (error: any) {
    console.error("GitHub Insights error:", error);
    res.status(500).json({ error: error.message || "Failed to load insights" });
  }
});

// 7. GitHub Repository Search API (by repo name or owner)
app.get("/api/github/search", async (req, res) => {
  try {
    const query = ((req.query.q as string) || "").trim().slice(0, 200);
    if (!query) {
      return res.json({ totalCount: 0, items: [] });
    }

    const searchUrl = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&per_page=12`;
    const searchRes = await fetch(searchUrl, { headers: ghHeaders() });

    if (!searchRes.ok) {
      return res.status(searchRes.status).json({
        error: githubErrorMessage(searchRes.status, searchRes.headers.get("x-ratelimit-remaining")),
      });
    }

    const searchData: any = await searchRes.json();
    const items = (searchData.items || []).map((repo: any) => ({
      id: repo.id,
      fullName: repo.full_name,
      name: repo.name,
      owner: repo.owner?.login,
      avatarUrl: repo.owner?.avatar_url,
      description: repo.description,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      language: repo.language,
      defaultBranch: repo.default_branch || "main",
      htmlUrl: repo.html_url,
      updatedAt: repo.updated_at,
    }));

    res.json({
      totalCount: searchData.total_count || 0,
      items,
    });
  } catch (error: any) {
    console.error("GitHub search error:", error);
    res.status(500).json({ error: error.message || "Failed to search GitHub" });
  }
});

// Unknown API routes return JSON 404 instead of the SPA's index.html.
app.use("/api", (_req, res) => {
  res.status(404).json({ error: "Not found" });
});

/* -------------------------------------------------------------------------- */
/*  Frontend: Vite middleware in dev, static dist/ in production              */
/* -------------------------------------------------------------------------- */

async function startServer() {
  if (!IS_PROD) {
    // Imported lazily so production never loads Vite.
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, "dist");
    if (!fs.existsSync(path.join(distPath, "index.html"))) {
      throw new Error("dist/index.html not found. Run `npm run build` before starting in production.");
    }
    app.use(express.static(distPath, { maxAge: "1h" }));
    app.get("*", (_req, res) => {
      res.sendFile(path.resolve(distPath, "index.html"));
    });
  }

  // Global error handler (bad JSON, oversized payloads, etc.)
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    if (status >= 500) console.error("Unhandled error:", err);
    res.status(status).json({ error: status === 413 ? "Request is too large." : err.message || "Internal server error" });
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Pramanix Server] running on http://0.0.0.0:${PORT} (env: ${IS_PROD ? "production" : "development"})`);
    console.log(
      `[Pramanix Server] LLM primary: ${
        process.env.GROQ_API_KEY ? `groq:${GROQ_MODEL}` : process.env.GEMINI_API_KEY ? `gemini:${GEMINI_MODEL}` : "NONE CONFIGURED"
      }`
    );
  });
}

// Export the Express app for Netlify Functions. Only start a long-running listener
// when this file is the process entry point (npm run dev / npm start).
export { app };

const isDirectRun = process.argv[1] && path.resolve(process.argv[1]) === __filename;
if (isDirectRun) {
  process.on("unhandledRejection", (reason) => {
    console.error("Unhandled promise rejection:", reason);
  });

  startServer().catch((err) => {
    console.error("Fatal server error:", err);
    process.exit(1);
  });
}
