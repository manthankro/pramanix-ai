<div align="center">
  <img src="public/pramanix-logo.jpeg" alt="Pramanix logo" width="320" />
  <h1>Pramanix AI</h1>
  <p><strong>AI Engineering Mentor & Student Project Workspace</strong></p>

  [![TypeScript](https://img.shields.io/badge/TypeScript-blue.svg)](https://www.typescriptlang.org/)
  [![React](https://img.shields.io/badge/React-19-61dafb.svg)](https://reactjs.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38bdf8.svg)](https://tailwindcss.com/)
  [![Recharts](https://img.shields.io/badge/Recharts-charts-22c55e.svg)](https://recharts.org/)
  [![Express](https://img.shields.io/badge/Express-4.x-gray.svg)](https://expressjs.com/)
  [![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
</div>

<br />

**Pramanix AI** is a comprehensive engineering mentor, GitHub repository analyzer, viva simulator, and technical capstone project workspace. Designed for engineering students, computer science researchers, and developers, Pramanix bridges the gap between theoretical computer science coursework and production-ready software engineering.

AI responses are served by **Groq** (ultra-low-latency inference) with an automatic **Gemini** fallback, so the app keeps working even when one provider is rate limited.

---

## Table of Contents

- [Key Features](#key-features)
- [Architecture & Tech Stack](#architecture--tech-stack)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [Getting Started](#getting-started)
- [Configuration & Environment Variables](#configuration--environment-variables)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [License](#license)

---

## Key Features

### 1. GitHub Mentor & Repository Hub
- **Repository Search & Metadata**: Search public GitHub repositories by keyword, owner, or repo slug (`manthankro/pramanix-ai-`).
- **Deep Architecture Inspection**: Auto-inspects repository file trees, READMEs, Docker configurations, and dependency manifests (`pyproject.toml`, `package.json`, `requirements.txt`).
- **Visual Repository Insights (Recharts)**:
  - **Commit Frequency & Activity**: Weekly commit velocity and sprint cadence.
  - **Language Distribution**: Donut and bar charts breakdown of codebase languages.
  - **Contributor Activity**: Pull request velocity, code reviews, and issue triage metrics.
- **1-Click Repository Download**: Download full repository archives directly as `.zip` files.

### 2. Interactive Gantt Timeline & Milestone View
- **Gantt Chart Visualization**: Horizontal bar timeline visualizing task schedules, start dates, and delivery deadlines across an 8-week semester sprint.
- **Milestone Grouping**:
  - `M1: Architecture & SRS` (Blue)
  - `M2: Core Subsystems` (Emerald)
  - `M3: Integration & Tests` (Purple)
  - `M4: Viva & Final Defense` (Amber)
- **Interactive Controls**:
  - Date pickers for milestone start and due dates.
  - Interactive progress sliders (0% to 100%) syncing directly with task completion states.
  - Real-time deadline monitoring and overdue risk flags.
  - Add and edit scheduled deliverables with milestone tagging.

### 3. Project Progress Dashboard
- **Recharts Task Breakdown**: Bar chart categorization by status (`Todo`, `In Progress`, `Review`, `Done`).
- **Risk & Priority Donut**: Real-time breakdown of `High`, `Medium`, and `Low` priority tasks to prevent last-minute capstone blockers.
- **Sprint Trajectory Area Chart**: Dual-layer area chart comparing planned target deliverables against completed milestone velocity.
- **KPI Metrics**: Overall completion percentage, active sprint tasks, critical blockers count, and authored project artifacts.

### 4. Student Project Builder & Architecture Scaffolding
- **Automated SRS Generation**: Generates IEEE-style Software Requirements Specifications with functional and non-functional requirements.
- **Module Breakdown & Data Flow**: Clear architectural blocks, API endpoint contracts, and database schema recommendations.
- **Tech Stack Recommendations**: Tailored technology stacks for distributed systems, web applications, computer vision, and IoT.

### 5. Timer-Based Mock Viva Simulator & Doubt Help
- **Configurable Viva Simulator**: Select domain (e.g., AI/ML, Distributed Systems, Cloud Computing, Cybersecurity) and question count (3 to 10 questions).
- **Timed Oral Defense**: Countdown timer per question to simulate realistic university and external examiner viva pressure.
- **Examiner Feedback & Rubrics**: Immediate scoring, strengths analysis, areas for improvement, and model answers.
- **Step-by-Step Doubt Resolution**: Clear mathematical derivations, algorithmic proofs, and conceptual engineering explanations.

### 6. Project Bundle (.ZIP) Exporter
- **Client-Side JSZip Generation**: Compiles the active project workspace into a portable offline archive.
- **Included in Bundle**:
  - All project source code files (`main.py`, `Dockerfile`, `.env.example`, etc.).
  - `manifest.json` containing complete project metadata, dependencies, and author info.
  - `TASKS.md` milestone checklist formatted with status and deadlines.
  - `RESEARCH_NOTES.md` containing architectural documentation and design decisions.
  - `SETUP_GUIDE.md` with step-by-step local execution instructions.

### 7. PDF & Engineering Notes Assistant
- **Curated Technical Notes**: Instant generation of structured chapter notes and study guides.
- **Interactive Flashcards**: Flip-card spaced repetition decks for rapid technical review.
- **Scored Multiple-Choice Quizzes**: Immediate scoring with explanations for competitive exam (GATE, GRE) and university revision.

### 8. Coding Assistant & Complexity Auditor
- **Big-O Analysis**: Time and space complexity breakdown for arbitrary algorithms.
- **AST Debugger**: Root cause analysis for syntax errors, logical bugs, and race conditions.
- **Unit Test Generator**: Generates comprehensive unit and edge-case test suites (pytest, Jest, JUnit).
- **DSA Practice Bank**: LeetCode and competitive programming problem explanations.

### 9. Research Assistant & Trade-Off Matrix
- **Side-by-Side Architectural Comparisons**: Structured matrices comparing technologies (e.g., REST vs. gRPC, PostgreSQL vs. MongoDB, Docker vs. Podman).
- **Fact-vs-Recommendation Auditing**: Distinguishes empirically verified facts from contextual engineering recommendations.

### 10. Career & Technical Resume Prep
- **Google XYZ Resume Bullet Rewriter**: Transforms basic bullet points into high-impact `Accomplished [X] as measured by [Y] by doing [Z]` statements.
- **GitHub Portfolio Audit**: Review criteria for student repositories to catch recruiter and engineering manager attention.
- **Mock Technical Interviews**: Behavioral and systems design interview simulations.

---

## Architecture & Tech Stack

```
 ┌─────────────────────────────────────────────────────────────┐
 │                    React 19 Frontend SPA                    │
 │  ┌──────────────────────────────────────────────────────┐   │
 │  │ Tailwind CSS  •  Lucide Icons  •  Recharts  •  JSZip │   │
 │  └──────────────────────────────────────────────────────┘   │
 │      │                     │                     │          │
 │  Gantt Timeline    Progress Dashboard    Viva Simulator     │
 └──────┬─────────────────────┬─────────────────────┬──────────┘
        │                     │                     │
        ▼                     ▼                     ▼
 ┌─────────────────────────────────────────────────────────────┐
 │                Express Backend (`server.ts`)                │
 │  rate limiting • input validation • health checks           │
 │  ┌─────────────────────────┬─────────────────────────────┐  │
 │  │  /api/gemini/*  (AI)    │  /api/github/*  (proxy)     │  │
 │  └────────────┬────────────┴──────────────┬──────────────┘  │
 └───────────────┼───────────────────────────┼─────────────────┘
                 ▼                           ▼
      ┌─────────────────────┐       ┌──────────────────┐
      │ Groq (primary, fast)│       │  GitHub REST API │
      │   └─ fallback ─▶    │       └──────────────────┘
      │ Google Gemini       │
      └─────────────────────┘
```

- **Frontend**: React 19 + TypeScript, Vite, Tailwind CSS, Recharts, Lucide React, JSZip.
- **Backend**: Node.js (tsx) + Express. In production the same server serves the built frontend, so the whole app is a **single deployable service** with no CORS setup.
- **AI**: Groq chat completions (OpenAI-compatible) as the primary provider, Google Gemini as automatic fallback.

---

## Project Structure

```
├── server.ts                       # Express backend: AI routes, GitHub proxy, static hosting
├── index.html                      # HTML5 entry point
├── package.json                    # Dependencies and npm scripts
├── render.yaml                     # Render blueprint (one-click deploy)
├── .env.example                    # Environment variable template
├── metadata.json                   # Applet configuration and metadata
├── vite.config.ts                  # Vite build configuration
├── src/
│   ├── main.tsx                    # React client entry point
│   ├── App.tsx                     # Main application layout, state, and routing
│   ├── types/
│   │   └── index.ts                # TypeScript interfaces (WorkspaceProject, ProjectTask, RepoData)
│   ├── services/
│   │   ├── api.ts                  # GitHub and AI API client
│   │   └── zipExport.ts            # Client-side JSZip project packager
│   └── components/
│       ├── Header.tsx              # Application header with 1-click ZIP download
│       ├── Sidebar.tsx             # Module navigation sidebar
│       └── modules/
│           ├── GithubMentor.tsx            # GitHub repository explorer & insights hub
│           ├── RepoInsights.tsx            # Recharts commit, language, and contributor graphs
│           ├── ProjectWorkspace.tsx        # Project manager, file editor, notes & tabs
│           ├── ProjectGanttTimeline.tsx    # Interactive Gantt timeline & milestone view
│           ├── ProjectProgressDashboard.tsx# Recharts task completion & milestone trajectory
│           ├── ProjectBuilder.tsx          # SRS, architecture, and tech stack generator
│           ├── DoubtVivaHelp.tsx           # Academic doubt solving & viva launcher
│           ├── MockVivaSession.tsx         # Timer-based technical viva simulator
│           ├── PdfNotesAssistant.tsx       # Study notes, flashcards, and MCQ quiz engine
│           ├── CodingAssistant.tsx         # Big-O auditor, debugger, and test generator
│           ├── ResearchAssistant.tsx       # Tech trade-off comparisons & research matrices
│           ├── CareerPrep.tsx              # Google XYZ resume builder & portfolio review
│           └── GeneralChat.tsx             # General engineering assistant chat interface
```

---

## API Endpoints

### Health

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/healthz` | Plain `ok`, used by hosting health checks and uptime pings |
| `GET` | `/api/health` | JSON status: active AI provider/fallback and whether a GitHub token is set (no secrets) |

### AI

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/gemini/chat` | Chat with the mentor. Body: `{ messages, context?, mode? }` where `mode` is `general`, `viva`, `doubt` or `research` |
| `POST` | `/api/gemini/analyze` | Specialised tasks. Body: `{ task, data }` for `project_builder`, `github_diagnose`, `code_review`, `viva_questions`, `notes_quiz_flashcards`, `resume_audit`, `compare_tech` |

The `/api/gemini/*` paths keep their original names for compatibility; requests are answered by Groq first, then Gemini.

### GitHub proxy

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/github/repo?repo={owner/name}` | Repository details, stars, forks, files, and README |
| `GET` | `/api/github/search?q={query}` | Searches public GitHub repositories |
| `GET` | `/api/github/insights?repo={owner/name}` | Commit frequency, language breakdown, and contributor statistics |
| `GET` | `/api/github/file?repo={owner/name}&path={path}&branch={branch}` | Raw file content |
| `GET` | `/api/github/download-zip?repo={owner/name}&branch={branch}` | Streams the repository ZIP archive |

---

## Getting Started

### Prerequisites
- **Node.js**: v20 or higher
- **npm**: v9 or higher

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/manthankro/pramanix-ai-.git
   cd pramanix-ai-
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create your environment file and add your keys:
   ```bash
   cp .env.example .env
   ```

### Development Server

Start the full-stack development server (Express backend + Vite frontend with hot reload):
```bash
npm run dev
```

The application will be live at `http://localhost:3000`.

### Production Build (local)

```bash
npm run build
npm start
```

`npm start` runs the server in production mode and serves the built `dist/` folder.

---

## Configuration & Environment Variables

Copy `.env.example` to `.env`:

| Variable | Required | Description |
|---|---|---|
| `GROQ_API_KEY` | One of Groq/Gemini | Groq API key. Used first for fast responses. |
| `GROQ_MODEL` | No | Groq model ID (default `openai/gpt-oss-120b`). Verify at the Groq models page. |
| `GEMINI_API_KEY` | One of Groq/Gemini | Gemini API key. Fallback when Groq fails or is rate limited. |
| `GEMINI_MODEL` | No | Gemini model ID (default `gemini-3.8-flash`). |
| `GITHUB_TOKEN` | Recommended | Raises GitHub API limit from 60 to 5,000 requests/hour. No scopes needed. |
| `PORT` | No | Server port (default `3000`). |
| `NODE_ENV` | No | Set to `production` on your host. |
| `RATE_LIMIT_PER_MIN` | No | AI requests per minute per client IP (default `60`). |
| `DEFAULT_REPO` | No | Default repo in the GitHub Mentor module. |

---

## Deployment

The app deploys as **one web service**: Express serves both the API and the built frontend.

### Render (recommended, free tier)

1. Push this repo to GitHub.
2. In Render: **New > Blueprint**, select the repo. `render.yaml` configures everything.
3. When prompted, set `GROQ_API_KEY`, `GEMINI_API_KEY`, and `GITHUB_TOKEN`.
4. Open the generated `onrender.com` URL.

Manual setup (without the blueprint):
- **Build command**: `npm install --include=dev && npm run build`
- **Start command**: `npm start`
- **Health check path**: `/healthz`
- **Environment**: `NODE_ENV=production`, plus the keys above.

> **Free-tier cold starts:** Render free services sleep after inactivity and take roughly a minute to wake. Open the URL (or point a free uptime pinger at `/healthz`) a few minutes before a live demo.

### Railway / any Node host
Use the same build and start commands and the same environment variables.

---

## Troubleshooting

- **AI features return an error**: open `/api/health`. If `llm.primary` is `none`, no API key is set on the host. If it shows a model, check that the model ID is valid for your account.
- **"GitHub API rate limit reached"**: set `GITHUB_TOKEN`.
- **429 "Too many requests"**: raise `RATE_LIMIT_PER_MIN`, or wait a minute. Groq's free tier also has its own per-organisation limits, in which case requests automatically fall back to Gemini.
- **Build fails on the host with missing Vite/Tailwind**: make sure the build command uses `npm install --include=dev`.

---

## License

This project is licensed under the [MIT License](LICENSE).
