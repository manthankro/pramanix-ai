import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: "25mb" }));

// Initialize Google Gen AI
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// Helper for Gemini text generation with error handling
async function callGemini(prompt: string, systemInstruction?: string, temperature = 0.7) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured in the environment.");
  }
  const response = await ai.models.generateContent({
    model: "gemini-3.8-flash",
    contents: prompt,
    config: {
      systemInstruction:
        systemInstruction ||
        "You are Pramanix, an elite AI engineering mentor, student project architect, and technical educator. You provide rigorous, accurate, step-by-step guidance across Computer Science, Electronics, Electrical, Mechanical, and Civil Engineering.",
      temperature,
    },
  });
  return response.text || "";
}

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
      formattedPrompt += `[CURRENT WORKSPACE / REPO CONTEXT]:\n${context}\n\n`;
    }

    if (Array.isArray(messages) && messages.length > 0) {
      const historyStr = messages
        .map((m: { role: string; content: string }) => `${m.role === "user" ? "Student" : "Pramanix"}: ${m.content}`)
        .join("\n\n");
      formattedPrompt += `Conversation History:\n${historyStr}\n\nPramanix:`;
    } else {
      formattedPrompt += (req.body.prompt as string) || "Hello Pramanix, introduce your capabilities.";
    }

    const reply = await callGemini(formattedPrompt, systemInstruction);
    res.json({ reply });
  } catch (error: any) {
    console.error("Chat API error:", error);
    res.status(500).json({ error: error.message || "Failed to generate AI response" });
  }
});

// 2. Specialized Task Analyzer (Project Builder, Viva Generator, Code Review, etc.)
app.post("/api/gemini/analyze", async (req, res) => {
  try {
    const { task, data } = req.body;

    let prompt = "";
    let systemInstruction = "You are Pramanix, the AI engineering mentor.";

    switch (task) {
      case "project_builder":
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
        systemInstruction =
          "You are a principal engineer conducting a thorough code review and algorithm audit.";
        prompt = `Review the following code snippet:
Language: ${data.language || "auto-detect"}
Goal/Description: ${data.description || "General optimization and bug check"}
Code:
\`\`\`${data.language || ""}
${data.code}
\`\`\`

Provide:
1. Bugs, Race Conditions, and Edge-case vulnerabilities
2. Time & Space Complexity analysis (Big-O notation)
3. Refactored, Clean, Idiomatic Code Solution
4. Unit Test Cases (including boundary and edge cases)`;
        break;

      case "viva_questions":
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
        systemInstruction =
          "You are an engineering educator. Generate structured study aids (revision summary, 5 flashcards, and 4 multiple-choice questions) in JSON format.";
        prompt = `Analyze the following engineering lecture notes/study material:
---
${data.content.slice(0, 6000)}
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
        systemInstruction =
          "You are an engineering hiring manager and ATS resume specialist at top tech companies.";
        prompt = `Analyze this engineering student's resume/profile:
Target Role: ${data.targetRole || "Software Engineer / System Engineer"}
Resume Text / Projects:
${data.resumeText}

Provide:
1. ATS Score Estimate (0-100) and Readability breakdown
2. Action Verb & Impact Metric Analysis (XYZ Formula: Accomplished [X], measured by [Y], by doing [Z])
3. Missing Critical Skills & Recommended Keywords for the target role
4. Project Bullet Point Rewrites (Before vs. After with quantifiable impact)
5. Top 3 Next Steps to boost interview callback rate`;
        break;

      case "compare_tech":
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

    const result = await callGemini(prompt, systemInstruction);
    res.json({ result });
  } catch (error: any) {
    console.error("Analyze API error:", error);
    res.status(500).json({ error: error.message || "Failed to analyze request" });
  }
});

// 3. GitHub Public Repository API Proxy
app.get("/api/github/repo", async (req, res) => {
  try {
    const rawRepo = (req.query.repo as string) || "manthankro/pramanix";
    const cleanedRepo = rawRepo
      .replace(/^https?:\/\/github\.com\//, "")
      .replace(/\.git$/, "")
      .trim();

    const [owner, repo] = cleanedRepo.split("/");
    if (!owner || !repo) {
      return res.status(400).json({ error: "Invalid repository format. Use 'owner/repo' or GitHub URL." });
    }

    const headers: Record<string, string> = {
      "User-Agent": "Pramanix-AI-Mentor",
      Accept: "application/vnd.github.v3+json",
    };

    // 1. Fetch metadata
    const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });
    if (!repoRes.ok) {
      const errText = await repoRes.text();
      return res.status(repoRes.status).json({
        error: `GitHub API error (${repoRes.status}): ${errText}`,
        owner,
        repo,
      });
    }
    const repoData = await repoRes.json();
    const defaultBranch = repoData.default_branch || "main";

    // 2. Fetch README (optional)
    let readmeContent = "";
    try {
      const readmeRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/readme`, { headers });
      if (readmeRes.ok) {
        const readmeData = await readmeRes.json();
        if (readmeData.content) {
          readmeContent = Buffer.from(readmeData.content, "base64").toString("utf-8");
        }
      }
    } catch (e) {
      console.warn("Failed to fetch README:", e);
    }

    // 3. Fetch Git tree
    let files: Array<{ path: string; type: string; size?: number }> = [];
    try {
      const treeRes = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/git/trees/${defaultBranch}?recursive=1`,
        { headers }
      );
      if (treeRes.ok) {
        const treeData = await treeRes.json();
        if (Array.isArray(treeData.tree)) {
          files = treeData.tree.map((item: any) => ({
            path: item.path,
            type: item.type === "tree" ? "dir" : "file",
            size: item.size,
          }));
        }
      }
    } catch (e) {
      console.warn("Failed to fetch Git tree:", e);
    }

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
    const rawRepo = (req.query.repo as string) || "manthankro/pramanix";
    const filePath = (req.query.path as string) || "README.md";
    const branch = (req.query.branch as string) || "main";

    const cleanedRepo = rawRepo
      .replace(/^https?:\/\/github\.com\//, "")
      .replace(/\.git$/, "")
      .trim();

    const rawUrl = `https://raw.githubusercontent.com/${cleanedRepo}/${branch}/${filePath}`;
    const fileRes = await fetch(rawUrl, {
      headers: { "User-Agent": "Pramanix-AI-Mentor" },
    });

    if (!fileRes.ok) {
      return res.status(fileRes.status).json({ error: `File not found at ${rawUrl}` });
    }

    const content = await fileRes.text();
    res.json({ path: filePath, content });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to read file content" });
  }
});

// 5. GitHub Direct ZIP proxy download
app.get("/api/github/download-zip", async (req, res) => {
  try {
    const rawRepo = (req.query.repo as string) || "manthankro/pramanix";
    const branch = (req.query.branch as string) || "main";

    const cleanedRepo = rawRepo
      .replace(/^https?:\/\/github\.com\//, "")
      .replace(/\.git$/, "")
      .trim();

    const [owner, repo] = cleanedRepo.split("/");
    if (!owner || !repo) {
      return res.status(400).send("Invalid repository identifier.");
    }

    const zipUrl = `https://codeload.github.com/${owner}/${repo}/zip/refs/heads/${branch}`;
    const zipRes = await fetch(zipUrl, {
      headers: { "User-Agent": "Pramanix-AI-Mentor" },
    });

    if (!zipRes.ok) {
      // Fallback redirect
      return res.redirect(`https://github.com/${owner}/${repo}/archive/refs/heads/${branch}.zip`);
    }

    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", `attachment; filename="${repo}-${branch}.zip"`);

    const arrayBuffer = await zipRes.arrayBuffer();
    res.send(Buffer.from(arrayBuffer));
  } catch (error: any) {
    console.error("ZIP download error:", error);
    res.status(500).send("Failed to download ZIP archive: " + error.message);
  }
});

// 6. GitHub Repository Insights (Languages, Commits, Contributors)
app.get("/api/github/insights", async (req, res) => {
  try {
    const rawRepo = (req.query.repo as string) || "manthankro/pramanix";
    const cleanedRepo = rawRepo
      .replace(/^https?:\/\/github\.com\//, "")
      .replace(/\.git$/, "")
      .trim();

    const [owner, repo] = cleanedRepo.split("/");
    if (!owner || !repo) {
      return res.status(400).json({ error: "Invalid repository identifier." });
    }

    const headers: Record<string, string> = {
      "User-Agent": "Pramanix-AI-Mentor",
      Accept: "application/vnd.github.v3+json",
    };

    // 1. Languages
    let languages: Record<string, number> = {};
    try {
      const langRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/languages`, { headers });
      if (langRes.ok) {
        languages = await langRes.json();
      }
    } catch (e) {
      console.warn("Failed to fetch languages:", e);
    }

    // 2. Contributors
    let contributors: Array<{ login: string; contributions: number; avatar_url: string; html_url: string }> = [];
    try {
      const contribRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contributors?per_page=10`, { headers });
      if (contribRes.ok) {
        contributors = await contribRes.json();
      }
    } catch (e) {
      console.warn("Failed to fetch contributors:", e);
    }

    // 3. Commits
    let commits: Array<{ date: string; message: string; author: string }> = [];
    try {
      const commitsRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/commits?per_page=50`, { headers });
      if (commitsRes.ok) {
        const rawCommits = await commitsRes.json();
        if (Array.isArray(rawCommits)) {
          commits = rawCommits.map((c: any) => ({
            date: c.commit?.author?.date || c.commit?.committer?.date || "",
            message: c.commit?.message?.split("\n")[0] || "",
            author: c.commit?.author?.name || c.author?.login || "Contributor",
          }));
        }
      }
    } catch (e) {
      console.warn("Failed to fetch commits:", e);
    }

    res.json({
      languages,
      contributors,
      commits,
    });
  } catch (error: any) {
    console.error("GitHub Insights error:", error);
    res.status(500).json({ error: error.message || "Failed to load insights" });
  }
});

// 7. GitHub Repository Search API (by repo name or owner)
app.get("/api/github/search", async (req, res) => {
  try {
    const query = ((req.query.q as string) || "").trim();
    if (!query) {
      return res.json({ totalCount: 0, items: [] });
    }

    const headers: Record<string, string> = {
      "User-Agent": "Pramanix-AI-Mentor",
      Accept: "application/vnd.github.v3+json",
    };

    const searchUrl = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&per_page=12`;
    const searchRes = await fetch(searchUrl, { headers });

    if (!searchRes.ok) {
      const errText = await searchRes.text();
      return res.status(searchRes.status).json({ error: `GitHub search failed: ${errText}` });
    }

    const searchData = await searchRes.json();
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

// Initialize Vite in dev mode or serve static files in prod
async function startServer() {
  const isProd = process.env.NODE_ENV === "production";

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.resolve(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Pramanix Server] running on http://0.0.0.0:${PORT} (env: ${process.env.NODE_ENV || "development"})`);
  });
}

startServer().catch((err) => {
  console.error("Fatal server error:", err);
  process.exit(1);
});
