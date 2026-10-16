# Pramanix - AI Engineering Mentor & Student Project Workspace

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61dafb.svg)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38bdf8.svg)](https://tailwindcss.com/)
[![Recharts](https://img.shields.io/badge/Recharts-2.x-22c55e.svg)](https://recharts.org/)
[![Express](https://img.shields.io/badge/Express-4.x-gray.svg)](https://expressjs.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**Pramanix** is a full-stack engineering mentor, GitHub repository analyzer, viva simulator, and technical capstone project workspace. Designed for engineering students, computer science researchers, and developers, Pramanix bridges the gap between theoretical computer science coursework and production-ready software engineering.

---

## Table of Contents

- [Key Features](#key-features)
  - [1. GitHub Mentor & Repository Hub](#1-github-mentor--repository-hub)
  - [2. Interactive Gantt Timeline & Milestone View](#2-interactive-gantt-timeline--milestone-view)
  - [3. Project Progress Dashboard](#3-project-progress-dashboard)
  - [4. Student Project Builder & Architecture Scaffolding](#4-student-project-builder--architecture-scaffolding)
  - [5. Timer-Based Mock Viva Simulator & Doubt Help](#5-timer-based-mock-viva-simulator--doubt-help)
  - [6. Project Bundle (.ZIP) Exporter](#6-project-bundle-zip-exporter)
  - [7. PDF & Engineering Notes Assistant](#7-pdf--engineering-notes-assistant)
  - [8. Coding Assistant & Complexity Auditor](#8-coding-assistant--complexity-auditor)
  - [9. Research Assistant & Trade-Off Matrix](#9-research-assistant--trade-off-matrix)
  - [10. Career & Technical Resume Prep](#10-career--technical-resume-prep)
- [Architecture & Tech Stack](#architecture--tech-stack)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Development Server](#development-server)
  - [Production Build](#production-build)
- [Configuration & Environment Variables](#configuration--environment-variables)
- [License](#license)

---

## Key Features

### 1. GitHub Mentor & Repository Hub
- **Repository Search & Metadata**: Search public GitHub repositories by keyword, owner, or repo slug (`manthankro/pramanix`).
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
 │                    React 18 Frontend SPA                    │
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
 │  ┌─────────────────────────┬─────────────────────────────┐  │
 │  │  /api/github/repo       │  /api/github/insights       │  │
 │  │  /api/github/search     │  /api/github/zip            │  │
 │  └─────────────────────────┴─────────────────────────────┘  │
 └──────────────────────────────┬──────────────────────────────┘
                                │
                                ▼
 ┌─────────────────────────────────────────────────────────────┐
 │       External Services: GitHub REST API & Gemini API       │
 └─────────────────────────────────────────────────────────────┘
```

- **Frontend**:
  - **Framework**: React 18 with TypeScript
  - **Bundler**: Vite
  - **Styling**: Tailwind CSS
  - **Data Visualization**: Recharts (BarChart, AreaChart, PieChart, ResponsiveContainer)
  - **Icons**: Lucide React
  - **Archive Generation**: JSZip & FileSaver utilities
- **Backend**:
  - **Runtime**: Node.js & tsx
  - **Server**: Express
  - **Integration**: GitHub REST API Proxy with caching and error fallbacks

---

## Project Structure

```
├── server.ts                       # Express backend server with GitHub & API routes
├── index.html                      # HTML5 entry point
├── package.json                    # Project dependencies and npm scripts
├── metadata.json                   # Applet configuration and metadata
├── vite.config.ts                  # Vite build configuration
├── src/
│   ├── main.tsx                    # React client entry point
│   ├── App.tsx                     # Main application layout, state, and routing
│   ├── types/
│   │   └── index.ts                # TypeScript interfaces (WorkspaceProject, ProjectTask, RepoData)
│   ├── services/
│   │   ├── api.ts                  # GitHub and system API client
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

The backend (`server.ts`) exposes proxy routes to fetch GitHub repository data safely:

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/github/repo?repo={owner/name}` | Fetches repository details, stars, forks, files, and README |
| `GET` | `/api/github/search?q={query}` | Searches public GitHub repositories matching the query |
| `GET` | `/api/github/insights?repo={owner/name}` | Returns commit frequency, language breakdown, and contributor statistics |
| `GET` | `/api/github/zip?repo={owner/name}` | Streams or redirects to repository ZIP archive |

---

## Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### Installation

1. Clone or download the repository:
   ```bash
   git clone https://github.com/manthankro/pramanix.git
   cd pramanix
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Development Server

Start the full-stack development server (Express backend + Vite frontend):
```bash
npm run dev
```

The application will be live at:
```
http://localhost:3000
```

### Production Build

1. Build the production client bundle:
   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm start
   ```

---

## Configuration & Environment Variables

Copy `.env.example` to `.env` if you need to configure custom API tokens:

```env
# Optional: GitHub Personal Access Token to avoid unauthenticated rate limits (60 req/hr)
GITHUB_TOKEN=

# Server port (defaults to 3000)
PORT=3000
```

*Note: Pramanix functions out of the box with intelligent fallback data and public GitHub endpoints even if no token is supplied.*

---

## License

This project is licensed under the [MIT License](LICENSE).
