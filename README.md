# Pramanix - AI Engineering Mentor & Project Workspace (Android)

**Pramanix** is a university-grade engineering mentor, GitHub repository analyzer, student capstone project builder, and oral viva defense companion for Android built with Kotlin and Jetpack Compose.

---

## 🌟 Core Modules & Capabilities

1. **GitHub Repository Intelligence (`GithubMentor`)**
   - Connect and inspect repositories (default: `manthankro/pramanix-ai-`).
   - Deep architectural inspection: dependencies, entry point flow, containerization, and static AST verification.
   - 1-Click repository archive / ZIP downloader.
   - File tree explorer with live code inspection.
   - Codebase-grounded external examiner oral viva questions.

2. **Capstone Project Builder (`ProjectBuilder`)**
   - Step-by-step engineering wizard across 6 domains (Distributed Systems, IoT, Cloud & DevOps, Robotics, Cybersecurity, Edge AI).
   - Automated Software Requirements Specification (SRS) generation.
   - Milestone breakdown (M1: Architecture, M2: Subsystems, M3: Integration, M4: Viva Defense).
   - 1-Click deployment directly into the active Project Workspace.

3. **Project Workspace & Management (`ProjectWorkspace`)**
   - **Tasks & Milestones:** Interactive status toggles (`todo`, `in_progress`, `done`), priority indicators, milestone tagging, and completion tracking.
   - **Gantt Delivery Roadmap:** Milestone timelines and delivery schedules.
   - **Code & File Management:** In-app syntax code viewer & editor (`main.py`, `Dockerfile`, `SRS.md`, `README.md`).
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

## 🛠️ Android Architecture & Technology Stack

- **Target OS / SDK:** Android 14+ (minSdk 26, targetSdk 36, compileSdk 36)
- **UI Framework:** Jetpack Compose with Material Design 3 (M3)
- **Design Pattern:** MVVM (Model-View-ViewModel) with unidirectional data flow and Kotlin Coroutines / StateFlow
- **Theme:** High-tech dark mode engineering palette (`PrimaryIndigo`, `AccentCyan`, `AccentEmerald`)
- **Package:** `com.aistudio.pramanix`
- **Application ID:** `com.aistudio.pramanix.workspace`
- **Build System:** Gradle Kotlin DSL (`build.gradle.kts`, `libs.versions.toml`)
