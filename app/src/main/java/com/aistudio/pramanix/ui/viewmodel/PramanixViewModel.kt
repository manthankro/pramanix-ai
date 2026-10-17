package com.aistudio.pramanix.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.aistudio.pramanix.data.model.*
import com.aistudio.pramanix.data.repository.PramanixRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import java.util.UUID

class PramanixViewModel(
    private val repository: PramanixRepository = PramanixRepository()
) : ViewModel() {

    private val _currentModule = MutableStateFlow(ModuleId.GITHUB)
    val currentModule: StateFlow<ModuleId> = _currentModule.asStateFlow()

    val projects = repository.projects
    val activeProjectId = repository.activeProjectId

    private val _activeProject = MutableStateFlow<WorkspaceProject?>(null)
    val activeProject: StateFlow<WorkspaceProject?> = _activeProject.asStateFlow()

    private val _repoData = MutableStateFlow(repository.defaultRepoData)
    val repoData: StateFlow<RepoData> = _repoData.asStateFlow()

    private val _isAnalyzing = MutableStateFlow(false)
    val isAnalyzing: StateFlow<Boolean> = _isAnalyzing.asStateFlow()

    // Chat
    private val _chatMessages = MutableStateFlow<List<ChatMessage>>(
        listOf(
            ChatMessage(
                id = "init-1",
                role = "assistant",
                content = "👋 Welcome to **Pramanix**! I am your AI Engineering Mentor and Project Companion. How can I help you today? You can analyze GitHub repos, build project SRS, practice for external viva defense, debug algorithms, or plan milestone tasks.",
                tags = listOf("Pramanix Engine", "System Ready")
            )
        )
    )
    val chatMessages: StateFlow<List<ChatMessage>> = _chatMessages.asStateFlow()

    // Viva Questions & Rubric
    private val _vivaQuestions = MutableStateFlow<List<VivaQuestion>>(
        listOf(
            VivaQuestion(
                question = "Why did you choose this architecture over a monolithic design, and what are its trade-offs?",
                examinerTone = "Senior External Examiner",
                idealAnswer = "A modular microservice architecture isolates failures and allows decoupled horizontal scaling. The primary trade-off is network latency between service boundaries and higher distributed tracing complexity."
            ),
            VivaQuestion(
                question = "What is the Big-O time and space complexity of your core processing queue?",
                examinerTone = "Algorithms Specialist",
                idealAnswer = "Enqueue and dequeue operations are O(1) amortized using an async circular ring buffer or Redis queue, with O(N) space proportional to max inflight items."
            ),
            VivaQuestion(
                question = "How does your system guarantee data consistency during abrupt network disconnection?",
                examinerTone = "Database Systems Chair",
                idealAnswer = "We employ idempotency keys, write-ahead transaction logs, and optimistic concurrency control with retry backoff."
            )
        )
    )
    val vivaQuestions: StateFlow<List<VivaQuestion>> = _vivaQuestions.asStateFlow()

    // Code Analysis
    private val _codeAnalysisResult = MutableStateFlow<String?>(null)
    val codeAnalysisResult: StateFlow<String?> = _codeAnalysisResult.asStateFlow()

    // Research result
    private val _researchResult = MutableStateFlow<String?>(null)
    val researchResult: StateFlow<String?> = _researchResult.asStateFlow()

    // Career result
    private val _careerResult = MutableStateFlow<String?>(null)
    val careerResult: StateFlow<String?> = _careerResult.asStateFlow()

    init {
        viewModelScope.launch {
            repository.projects.collect { list ->
                val activeId = repository.activeProjectId.value
                _activeProject.value = list.find { it.id == activeId } ?: list.firstOrNull()
            }
        }
        viewModelScope.launch {
            repository.activeProjectId.collect { activeId ->
                val list = repository.projects.value
                _activeProject.value = list.find { it.id == activeId } ?: list.firstOrNull()
            }
        }
    }

    fun selectModule(module: ModuleId) {
        _currentModule.value = module
    }

    fun selectProject(id: String) {
        repository.selectProject(id)
    }

    fun createProject(name: String, domain: String, description: String, notes: String) {
        val newProj = WorkspaceProject(
            id = "proj-" + UUID.randomUUID().toString().take(6),
            name = name,
            domain = domain,
            description = description,
            connectedRepo = "manthankro/pramanix-ai-",
            tasks = listOf(
                ProjectTask(
                    id = "t-" + UUID.randomUUID().toString().take(5),
                    title = "Review SRS & System Requirements",
                    status = "done",
                    priority = "high",
                    milestone = "M1: Architecture",
                    progress = 100
                ),
                ProjectTask(
                    id = "t-" + UUID.randomUUID().toString().take(5),
                    title = "Initialize Git repository & environment boilerplate",
                    status = "in_progress",
                    priority = "high",
                    milestone = "M2: Subsystems",
                    progress = 40
                ),
                ProjectTask(
                    id = "t-" + UUID.randomUUID().toString().take(5),
                    title = "Implement core algorithm & performance benchmarks",
                    status = "todo",
                    priority = "high",
                    milestone = "M3: Validation",
                    progress = 0
                )
            ),
            files = listOf(
                ProjectFile(
                    name = "src/main.py",
                    content = "# $name\nprint('Initializing $name engine...')\n",
                    language = "python"
                ),
                ProjectFile(
                    name = "docs/SRS.md",
                    content = notes,
                    language = "markdown"
                )
            ),
            notes = notes,
            createdAt = System.currentTimeMillis(),
            updatedAt = System.currentTimeMillis()
        )
        repository.addProject(newProj)
        _currentModule.value = ModuleId.WORKSPACE
    }

    fun deleteProject(id: String) {
        repository.deleteProject(id)
    }

    fun addTask(title: String, priority: String, dueDate: String, milestone: String) {
        repository.addTaskToActiveProject(title, priority, dueDate, milestone)
    }

    fun toggleTaskStatus(taskId: String) {
        repository.toggleTaskStatus(taskId)
    }

    fun updateTaskProgress(taskId: String, progress: Int) {
        repository.updateTaskProgress(taskId, progress)
    }

    fun deleteTask(taskId: String) {
        repository.deleteTask(taskId)
    }

    fun saveFile(name: String, content: String, language: String) {
        repository.saveFileToActiveProject(name, content, language)
    }

    fun saveNotes(notes: String) {
        repository.saveNotesToActiveProject(notes)
    }

    fun sendChatMessage(text: String) {
        if (text.isBlank()) return
        val userMsg = ChatMessage(
            id = UUID.randomUUID().toString(),
            role = "user",
            content = text,
            timestamp = System.currentTimeMillis()
        )
        _chatMessages.value = _chatMessages.value + userMsg

        // AI Mentor generation
        viewModelScope.launch {
            _isAnalyzing.value = true
            kotlinx.coroutines.delay(600) // Realistic responsive response
            val replyText = generateMentorReply(text)
            val assistantMsg = ChatMessage(
                id = UUID.randomUUID().toString(),
                role = "assistant",
                content = replyText,
                timestamp = System.currentTimeMillis(),
                tags = listOf("Pramanix AI", "Engineering Mentor")
            )
            _chatMessages.value = _chatMessages.value + assistantMsg
            _isAnalyzing.value = false
        }
    }

    fun submitVivaAnswer(index: Int, studentAnswer: String) {
        val currentList = _vivaQuestions.value.toMutableList()
        if (index in currentList.indices) {
            val q = currentList[index]
            val score = evaluateAnswerScore(q.question, studentAnswer)
            val feedback = evaluateAnswerFeedback(score, studentAnswer)
            currentList[index] = q.copy(
                studentAnswer = studentAnswer,
                score = score,
                feedback = feedback
            )
            _vivaQuestions.value = currentList
        }
    }

    fun analyzeCode(code: String, task: String) {
        viewModelScope.launch {
            _isAnalyzing.value = true
            kotlinx.coroutines.delay(700)
            _codeAnalysisResult.value = when (task) {
                "complexity" -> """### ⏱️ Algorithmic Complexity Report
- **Time Complexity:** O(N log N) - Divide & Conquer partitioning with log depth.
- **Space Complexity:** O(N) auxiliary stack memory for recursive frame evaluation.
- **Critical Hotspot:** Loop boundary conditions and unbuffered stream allocations.
- **Optimization Strategy:** Replace recursive stack frames with an iterative bottom-up approach or sliding window to reduce space complexity to O(1)."""
                "bugs" -> """### 🐞 Code Vulnerability & Bug Scan
1. **Unchecked Null Reference:** Input collections can be empty or null if network payload is malformed.
2. **Resource Leak:** Ensure streams or socket connections are enclosed in try-with-resources or context managers.
3. **Concurrency Race Condition:** Unsynchronized state mutation detected in shared global map."""
                "refactor" -> """### 🛠️ Refactored & Idiomatic Architecture
```python
# Cleaned, decoupled implementation
def process_data_stream(payload: list[dict]) -> dict:
    if not payload:
        return {"status": "empty", "count": 0}
    
    # Vectorized / memoized processing
    summary = {item["id"]: item.get("score", 0) for item in payload}
    return {"status": "ok", "items": summary, "count": len(summary)}
```
*Benefits:* 3.2x lower memory overhead and strict defensive argument validation."""
                else -> """### Unit Test Suite Generated
```python
import unittest

class TestEngineCore(unittest.TestCase):
    def test_nominal_execution(self):
        result = process_data_stream([{"id": "a", "score": 95}])
        self.assertEqual(result["count"], 1)

    def test_edge_case_empty(self):
        result = process_data_stream([])
        self.assertEqual(result["status"], "empty")

if __name__ == '__main__':
    unittest.main()
```"""
            }
            _isAnalyzing.value = false
        }
    }

    fun generateResearch(topic: String, style: String) {
        viewModelScope.launch {
            _isAnalyzing.value = true
            kotlinx.coroutines.delay(800)
            _researchResult.value = """### 📄 Research Synthesis: $topic
**Domain:** $topic
**Format:** $style Standard

#### 1. Abstract & Problem Statement
Contemporary systems face bottlenecks in throughput and real-time distributed synchronization. This research evaluates an edge-native, decoupled micro-architecture combining asynchronous streaming with low-latency client state caching.

#### 2. Key Methodological Comparisons
| Methodology | Throughput (req/s) | Latency (ms) | Fault Tolerance |
|-------------|---------------------|--------------|-----------------|
| Synchronous REST | 1,200 | 45ms | Medium (Cascading fails) |
| Async Message Broker | 8,500 | 12ms | High (Backpressure buffer) |
| **Pramanix Edge Architecture** | **14,200** | **4ms** | **High (Idempotent replay)** |

#### 3. Standard Citation ($style)
`K. Manthan, et al., "Autonomous Engineering Mentor Architecture and Capstone Defense Systems," IEEE Trans. Software Engineering, vol. 48, no. 4, pp. 1120-1134, 2026.`"""
            _isAnalyzing.value = false
        }
    }

    fun generateCareerPrep(role: String, projectExperience: String) {
        viewModelScope.launch {
            _isAnalyzing.value = true
            kotlinx.coroutines.delay(700)
            _careerResult.value = """### 💼 Technical Interview & Career Blueprint
**Target Profile:** $role
**Project Grounding:** $projectExperience

#### 🎯 Top 3 Resume Impact Bullets
- *Architected and deployed a distributed engineering workspace utilizing asynchronous task queues, reducing system latency by 65%.*
- *Designed end-to-end oral defense rubric with automated Big-O complexity evaluation and containerized multi-stage Docker builds.*
- *Implemented real-time GitHub repository static code inspector processing dependency trees and unit tests.*

#### 💡 System Design Question for Interview
**"Design a Distributed Rate Limiter for High-Frequency API Requests"**
- *Answer Outline:* Token Bucket / Leaky Bucket algorithm backed by Redis clusters with local in-memory sliding windows.
- *Trade-off to highlight:* Strict global accuracy vs. microsecond latency tradeoffs."""
            _isAnalyzing.value = false
        }
    }

    private fun generateMentorReply(query: String): String {
        val q = query.lowercase()
        return when {
            "viva" in q || "defense" in q ->
                "### 🎓 Viva Defense Strategy\nWhen the external examiner asks about your design:\n1. Start with the **Problem Statement**.\n2. Justify why simpler alternatives were insufficient.\n3. Mention the **Time & Space Complexity** immediately.\n4. Conclude with **failure recovery and unit test coverage**."
            "docker" in q || "container" in q ->
                "### 🐳 Docker Multi-Stage Build Tip\nUse multi-stage builds to avoid shipping compilers and pip caches in production images:\n```dockerfile\nFROM python:3.11-slim as builder\nRUN pip install --no-cache-dir ...\nFROM python:3.11-slim\nCOPY --from=builder /usr/local/lib/python3.11 /usr/local/lib/python3.11\n```"
            "big o" in q || "complexity" in q ->
                "### ⏱️ Complexity Breakdown\nFor typical search and graph workloads in capstones:\n- Binary Search: O(log N)\n- Hash Map Lookup: O(1) average, O(N) worst-case collision\n- Topological Sort / Dependency Graph: O(V + E)\n- Dijkstra Shortest Path: O((V + E) log V)"
            else ->
                "### 🚀 Engineering Recommendation\nRegarding *\"$query\"*:\nIn university engineering projects, examiners prioritize **clean architecture, edge-case mitigation, and defensive coding** over sheer feature count. Ensure your SRS document explicitly maps functional requirements to your test cases."
        }
    }

    private fun evaluateAnswerScore(question: String, studentAnswer: String): Int {
        val len = studentAnswer.trim().length
        val lower = studentAnswer.lowercase()
        var score = 5
        if (len > 30) score += 2
        if (len > 80) score += 1
        if (lower.contains("trade-off") || lower.contains("complexity") || lower.contains("latency") || lower.contains("memory") || lower.contains("scale")) {
            score += 2
        }
        return score.coerceIn(1, 10)
    }

    private fun evaluateAnswerFeedback(score: Int, studentAnswer: String): String {
        return when {
            score >= 9 -> "🌟 **Outstanding Answer!** You clearly explained architectural trade-offs, scalability, and technical constraints that impress external university examiners."
            score >= 7 -> "✅ **Solid Defense.** Good technical grasp. To reach top marks, explicitly mention metrics (e.g., latency in ms, Big-O bounds, or failure rollback steps)."
            score >= 5 -> "⚠️ **Acceptable but Basic.** You answered the core question, but external examiners will probe further. Add specific implementation details and explain why you avoided alternatives."
            else -> "❌ **Needs Elaboration.** Provide a technical breakdown including data structures, algorithmic complexity, and system constraints."
        }
    }
}
