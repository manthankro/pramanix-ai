package com.aistudio.pramanix.data.model

import kotlinx.serialization.Serializable

enum class ModuleId(val displayName: String, val category: String) {
    GITHUB("GitHub Mentor", "Repo Intelligence"),
    BUILDER("Project Builder", "Architecture & SRS"),
    WORKSPACE("Project Workspace", "Roadmap & Code"),
    TUTOR("Engineering Tutor", "Core Theory"),
    VIVA("Doubt & Viva Help", "Defense Simulator"),
    CODING("Coding Assistant", "Complexity & Bugs"),
    NOTES("PDF & Notes", "Cheat Sheets"),
    RESEARCH("Research Assistant", "Papers & Citations"),
    CAREER("Career & Interview", "Placement Prep"),
    CHAT("AI General Chat", "Mentor Companion")
}

@Serializable
data class RepoFile(
    val path: String,
    val type: String, // "file" or "dir"
    val size: Long? = null
)

@Serializable
data class RepoData(
    val name: String,
    val fullName: String,
    val description: String?,
    val stars: Int,
    val forks: Int,
    val openIssues: Int,
    val language: String?,
    val defaultBranch: String = "main",
    val htmlUrl: String,
    val zipUrl: String,
    val archiveUrl: String,
    val readme: String,
    val files: List<RepoFile> = emptyList(),
    val ownerLogin: String = "manthankro"
)

@Serializable
data class ChatMessage(
    val id: String,
    val role: String, // "user" or "assistant"
    val content: String,
    val timestamp: Long = System.currentTimeMillis(),
    val tags: List<String> = emptyList()
)

@Serializable
data class ProjectTask(
    val id: String,
    val title: String,
    val description: String? = null,
    val status: String, // "todo", "in_progress", "review", "done"
    val priority: String, // "low", "medium", "high"
    val startDate: String? = null,
    val dueDate: String? = null,
    val progress: Int = 0,
    val milestone: String? = null
)

@Serializable
data class ProjectFile(
    val name: String,
    val content: String,
    val language: String
)

@Serializable
data class WorkspaceProject(
    val id: String,
    val name: String,
    val domain: String,
    val description: String,
    val connectedRepo: String = "manthankro/pramanix-ai-",
    val tasks: List<ProjectTask> = emptyList(),
    val files: List<ProjectFile> = emptyList(),
    val notes: String = "",
    val createdAt: Long = System.currentTimeMillis(),
    val updatedAt: Long = System.currentTimeMillis()
)

@Serializable
data class Flashcard(
    val front: String,
    val back: String
)

@Serializable
data class QuizQuestion(
    val question: String,
    val options: List<String>,
    val correctIndex: Int,
    val explanation: String
)

@Serializable
data class VivaQuestion(
    val question: String,
    val examinerTone: String = "Rigorous Examiner",
    val studentAnswer: String? = null,
    val feedback: String? = null,
    val score: Int? = null, // 0 to 10
    val idealAnswer: String? = null
)

data class SubjectTopic(
    val subject: String,
    val topicName: String,
    val summary: String,
    val formulas: List<String> = emptyList(),
    val practicalUse: String = "",
    val quiz: List<QuizQuestion> = emptyList(),
    val flashcards: List<Flashcard> = emptyList()
)
