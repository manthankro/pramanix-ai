package com.aistudio.pramanix.data.repository

import com.aistudio.pramanix.data.model.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import java.util.UUID

class PramanixRepository {

    private val initialTasks = listOf(
        ProjectTask(
            id = "t-1",
            title = "Analyze manthankro/pramanix-ai- dependencies & pyproject.toml",
            description = "Audit dependencies, verify async worker queues, check licensing.",
            status = "done",
            priority = "high",
            milestone = "M1: Architecture & SRS",
            progress = 100,
            startDate = "2026-09-01",
            dueDate = "2026-09-14"
        ),
        ProjectTask(
            id = "t-2",
            title = "Dockerize service with multi-stage build container",
            description = "Minimize container footprint and isolate microservice layers.",
            status = "in_progress",
            priority = "high",
            milestone = "M2: Core Subsystems",
            progress = 65,
            startDate = "2026-09-15",
            dueDate = "2026-10-05"
        ),
        ProjectTask(
            id = "t-3",
            title = "Write integration tests and Big-O benchmark validation",
            description = "Verify throughput, latency bounds, and memory safety.",
            status = "todo",
            priority = "medium",
            milestone = "M3: Integration & Tests",
            progress = 25,
            startDate = "2026-10-06",
            dueDate = "2026-10-20"
        ),
        ProjectTask(
            id = "t-4",
            title = "Prepare oral viva defense & external examiner rubrics",
            description = "Rehearse core algorithmic questions and failure mitigation answers.",
            status = "todo",
            priority = "high",
            milestone = "M4: Viva & Final Defense",
            progress = 0,
            startDate = "2026-10-21",
            dueDate = "2026-11-05"
        )
    )

    private val initialFiles = listOf(
        ProjectFile(
            name = "main.py",
            content = """\"\"\"
Pramanix Core Entry Point
Connected to https://github.com/manthankro/pramanix-ai-
\"\"\"
import sys
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("pramanix.core")

def main():
    logger.info("[Pramanix Engine] Initializing engineering workspace...")
    logger.info("Connected to repository: manthankro/pramanix-ai-")
    print("Pramanix AI Engine Running successfully.")

if __name__ == "__main__":
    main()
""",
            language = "python"
        ),
        ProjectFile(
            name = "Dockerfile",
            content = """FROM python:3.11-slim as builder
WORKDIR /app
COPY pyproject.toml .
RUN pip install --no-cache-dir --upgrade pip

FROM python:3.11-slim
WORKDIR /app
COPY --from=builder /root/.cache /root/.cache
COPY . .
ENV PYTHONUNBUFFERED=1
CMD ["python", "main.py"]
""",
            language = "dockerfile"
        ),
        ProjectFile(
            name = "README.md",
            content = """# Pramanix System Workspace

Connected to https://github.com/manthankro/pramanix-ai-.
Student engineering project workspace, viva defense preparation, and architecture engine.
""",
            language = "markdown"
        ),
        ProjectFile(
            name = "docs/SRS.md",
            content = """# Software Requirements Specification (SRS)
## 1. Introduction
Pramanix is an autonomous engineering assistant designed for university students defending capstones.

## 2. System Architecture
- Frontend: Jetpack Compose / React UI
- Core Engine: Python microservice & async task queue
- Database / Cache: Fast schema validation & in-memory models
- Security: Role-based permissions, zero-trust rules

## 3. Performance Criteria
- Sub-500ms response time on code complexity analysis.
- Offline-first cache resilience for viva practice.
""",
            language = "markdown"
        )
    )

    private val defaultProject = WorkspaceProject(
        id = "proj-pramanix-core",
        name = "Pramanix System Architecture",
        domain = "Distributed Python & AI Systems",
        description = "Core microservice and repository architecture for Pramanix platform.",
        connectedRepo = "manthankro/pramanix-ai-",
        tasks = initialTasks,
        files = initialFiles,
        notes = """## Pramanix Architecture Notes
- Connected repository: manthankro/pramanix-ai-
- Default branch: main
- Tech stack: Python 3.11, Docker, Fast Jetpack Compose UI
- Objective: Comprehensive student project engineering mentor & viva defense companion.
- Next action: Finalize external examiner mock presentation.""",
        createdAt = System.currentTimeMillis() - 86400000L,
        updatedAt = System.currentTimeMillis()
    )

    private val _projects = MutableStateFlow(listOf(defaultProject))
    val projects: StateFlow<List<WorkspaceProject>> = _projects.asStateFlow()

    private val _activeProjectId = MutableStateFlow(defaultProject.id)
    val activeProjectId: StateFlow<String> = _activeProjectId.asStateFlow()

    // Default Repo Data
    val defaultRepoData = RepoData(
        name = "pramanix-ai-",
        fullName = "manthankro/pramanix-ai-",
        description = "Comprehensive AI Engineering Mentor, student project builder, and viva defense companion.",
        stars = 42,
        forks = 11,
        openIssues = 2,
        language = "Python / Kotlin",
        defaultBranch = "main",
        htmlUrl = "https://github.com/manthankro/pramanix-ai-",
        zipUrl = "https://github.com/manthankro/pramanix-ai-/archive/refs/heads/main.zip",
        archiveUrl = "https://api.github.com/repos/manthankro/pramanix-ai-/{archive_format}{/ref}",
        readme = """# Pramanix AI
Your all-in-one university engineering mentor.
- 🎓 Deep subject tutoring (DSA, OS, CN, DBMS, System Design)
- 🚀 Project Builder with automated SRS and Architecture diagram blueprints
- 💡 Viva Simulator with ruthless external examiner questions
- ⚡ Real-time code debugger and Big-O complexity analyzer
""",
        files = listOf(
            RepoFile("src/main.py", "file", 1024),
            RepoFile("Dockerfile", "file", 420),
            RepoFile("pyproject.toml", "file", 680),
            RepoFile("docs/SRS.md", "file", 2048),
            RepoFile("tests/test_core.py", "file", 850)
        )
    )

    fun selectProject(id: String) {
        _activeProjectId.value = id
    }

    fun addProject(project: WorkspaceProject) {
        _projects.value = listOf(project) + _projects.value
        _activeProjectId.value = project.id
    }

    fun updateProject(updated: WorkspaceProject) {
        _projects.value = _projects.value.map { if (it.id == updated.id) updated else it }
    }

    fun deleteProject(id: String) {
        if (_projects.value.size <= 1) return
        val filtered = _projects.value.filter { it.id != id }
        _projects.value = filtered
        if (_activeProjectId.value == id) {
            _activeProjectId.value = filtered.first().id
        }
    }

    fun addTaskToActiveProject(title: String, priority: String, dueDate: String, milestone: String) {
        val current = _projects.value.find { it.id == _activeProjectId.value } ?: return
        val newTask = ProjectTask(
            id = "t-" + UUID.randomUUID().toString().take(6),
            title = title,
            status = "todo",
            priority = priority,
            milestone = milestone,
            dueDate = dueDate,
            progress = 0
        )
        val updated = current.copy(
            tasks = current.tasks + newTask,
            updatedAt = System.currentTimeMillis()
        )
        updateProject(updated)
    }

    fun toggleTaskStatus(taskId: String) {
        val current = _projects.value.find { it.id == _activeProjectId.value } ?: return
        val updatedTasks = current.tasks.map { task ->
            if (task.id == taskId) {
                val nextStatus = when (task.status) {
                    "todo" -> "in_progress"
                    "in_progress" -> "done"
                    "done" -> "todo"
                    else -> "todo"
                }
                val nextProgress = when (nextStatus) {
                    "done" -> 100
                    "in_progress" -> 50
                    else -> 0
                }
                task.copy(status = nextStatus, progress = nextProgress)
            } else task
        }
        updateProject(current.copy(tasks = updatedTasks, updatedAt = System.currentTimeMillis()))
    }

    fun updateTaskProgress(taskId: String, progress: Int) {
        val current = _projects.value.find { it.id == _activeProjectId.value } ?: return
        val updatedTasks = current.tasks.map { task ->
            if (task.id == taskId) {
                val newStatus = if (progress >= 100) "done" else if (progress > 0) "in_progress" else "todo"
                task.copy(progress = progress, status = newStatus)
            } else task
        }
        updateProject(current.copy(tasks = updatedTasks, updatedAt = System.currentTimeMillis()))
    }

    fun deleteTask(taskId: String) {
        val current = _projects.value.find { it.id == _activeProjectId.value } ?: return
        val updatedTasks = current.tasks.filter { it.id != taskId }
        updateProject(current.copy(tasks = updatedTasks, updatedAt = System.currentTimeMillis()))
    }

    fun saveFileToActiveProject(name: String, content: String, language: String) {
        val current = _projects.value.find { it.id == _activeProjectId.value } ?: return
        val exists = current.files.any { it.name == name }
        val updatedFiles = if (exists) {
            current.files.map { if (it.name == name) it.copy(content = content, language = language) else it }
        } else {
            current.files + ProjectFile(name = name, content = content, language = language)
        }
        updateProject(current.copy(files = updatedFiles, updatedAt = System.currentTimeMillis()))
    }

    fun saveNotesToActiveProject(notes: String) {
        val current = _projects.value.find { it.id == _activeProjectId.value } ?: return
        updateProject(current.copy(notes = notes, updatedAt = System.currentTimeMillis()))
    }
}
