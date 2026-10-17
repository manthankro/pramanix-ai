<div align="center">
  <img src="public/pramanix-logo.jpeg" alt="Pramanix Logo" width="180" style="border-radius: 16px;" />
  <h1>Pramanix — Engineering Mentor & Capstone Studio</h1>
  <p><b>Comprehensive engineering mentor, GitHub repository analyzer, student project architect, and oral viva defense companion.</b></p>
  <p>Available as a <b>High-Performance Web Platform</b> and a <b>Native Android Application</b>.</p>
  <p>Created by <b>Manthan</b> (<a href="https://github.com/manthankro">@manthankro</a>) • Connected to <a href="https://github.com/manthankro/pramanix-ai-">manthankro/pramanix-ai-</a></p>
</div>

---

## ⚡ High-Speed Engine
Powered by ultra-low-latency **Groq LPUs** (`openai/gpt-oss-120b`, ~180ms response time) delivering instant oral viva drill evaluation, algorithmic complexity audits, and real-time capstone architecture generation.

---

## 🏛️ Unified Architecture: Web + Android

This repository is organized to provide production-ready builds for both platforms:

```
├── src/                         # 🌐 Web Platform (React 19, TypeScript, Tailwind CSS, Motion)
│   ├── components/              # Premium Glassmorphic UI modules & layouts
│   ├── services/                # Unified API client & ZIP packager
│   └── types/                   # Shared engineering domain types
├── server.ts                    # ⚡ High-speed Node.js + Express backend with Groq LPUs
├── app/                         # 📱 Native Android App (Kotlin + Jetpack Compose)
│   ├── build.gradle.kts         # Android module build configuration
│   └── src/main/                # Compose UI, MVVM ViewModels, and Data Layer
├── build.gradle.kts             # Root Gradle build script
├── settings.gradle.kts          # Gradle multi-project setup
├── gradle/libs.versions.toml    # Version catalog for Android dependencies
└── package.json                 # Web runtime & deployment scripts
```

---

## 🌟 Core Modules & Capabilities

1. **GitHub Repository Intelligence (`GithubMentor`)**
   - Connect and inspect repositories (default: `manthankro/pramanix-ai-`).
   - Deep architectural inspection: AST analysis, dependencies, containerization, and security verification.
   - 1-Click repository archive / ZIP downloader.
   - Interactive file tree explorer with live code viewer.
   - Codebase-grounded external examiner oral viva questions.

2. **Capstone Project Builder (`ProjectBuilder`)**
   - Step-by-step engineering wizard across 6 domains (Distributed Systems, IoT, Cloud & DevOps, Robotics, Cybersecurity, Edge AI).
   - Automated Software Requirements Specification (SRS) generation with functional requirements.
   - 8-Week milestone roadmaps (M1: Architecture, M2: Subsystems, M3: Integration, M4: Viva Defense).
   - 1-Click deployment directly into the active Project Workspace.

3. **Project Workspace & Management (`ProjectWorkspace`)**
   - **Kanban Roadmap:** Interactive status progression (`todo` ➔ `in_progress` ➔ `done`), priority indicators, milestone tagging, and completion tracking.
   - **Gantt Delivery Roadmap:** Visual milestone schedules and delivery deadlines.
   - **Code & File Management:** In-app syntax code viewer & editor (`main.py`, `Dockerfile`, `SRS.md`, `README.md`) with in-app saving.
   - **Engineering Notes & SRS Scratchpad:** Persistent architectural notes and design documentation.

4. **Engineering Core Tutor (`EngineeringTutor`)**
   - Deep theory summaries across DSA, Operating Systems, DBMS, Computer Networks, and System Design.
   - Revision flashcards with tap-to-flip answers.
   - Practice concept quizzes with instant grading and examiner feedback.

5. **Doubt Solver & Oral Viva Simulator (`DoubtVivaHelp`)**
   - Instant doubt resolver for complex engineering questions (e.g. 2PC, Paxos vs Raft, Semaphores, ACID).
   - Mock Viva Defense Simulator: Answer oral defense questions under an external examiner rubric with 1-10 scoring and exemplar answers.

6. **Algorithmic & Coding Assistant (`CodingAssistant`)**
   - Big-O time and space complexity audits.
   - Vulnerability, race condition, and memory leak scanner.
   - Clean architecture refactoring.
   - Automated unit test generator.

7. **PDF & Lecture Notes Assistant (`PdfNotesAssistant`)**
   - Exam cheat sheet generator with core laws and formulas.
   - Top viva and semester exam question extractor.

8. **Academic Research Assistant (`ResearchAssistant`)**
   - Literature review synthesizer.
   - Methodological benchmark comparisons.
   - IEEE, APA, ACM citation generator.

9. **Career & Placement Prep (`CareerPrep`)**
   - Tailored technical interview questions by role (Backend, Full-Stack, AI, Embedded, DevOps).
   - Capstone project resume bullet point optimizer with quantifiable metrics.

10. **General AI Companion (`GeneralChat`)**
    - Conversational AI companion for real-time engineering guidance.

---

## 🚀 Running the Platforms

### 🌐 1. Web Platform
```bash
# Start development server
npm run dev

# Build for production
npm run build
```
Listening on `http://0.0.0.0:3000`.

### 📱 2. Android Native Application
Open the repository in Android Studio or compile via Gradle:
```bash
gradle :app:assembleDebug
```
Output APK generated at `app/build/outputs/apk/debug/app-debug.apk`.
- **Target OS / SDK:** Android 14+ (minSdk 26, targetSdk 36, compileSdk 36)
- **UI Framework:** Jetpack Compose with Material Design 3 (M3)
- **Package:** `com.aistudio.pramanix`
- **Application ID:** `com.aistudio.pramanix.workspace`
