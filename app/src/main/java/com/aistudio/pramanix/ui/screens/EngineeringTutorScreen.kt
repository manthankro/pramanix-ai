package com.aistudio.pramanix.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.aistudio.pramanix.ui.theme.*

@Composable
fun EngineeringTutorScreen(
    modifier: Modifier = Modifier
) {
    val subjects = listOf(
        "Data Structures & Algorithms",
        "Operating Systems",
        "Database Systems (DBMS)",
        "Computer Networks",
        "System Design",
        "Microprocessors & Embedded"
    )

    var selectedSubject by remember { mutableStateOf(subjects[0]) }
    var selectedView by remember { mutableStateOf(0) } // 0: Theory, 1: Flashcards, 2: Quiz

    // Sample Topic Data
    val currentTopicTitle = when (selectedSubject) {
        "Operating Systems" -> "Process Synchronization & Semaphores"
        "Database Systems (DBMS)" -> "ACID Transactions & Two-Phase Locking (2PL)"
        "Computer Networks" -> "TCP 3-Way Handshake & Flow Control (Sliding Window)"
        "System Design" -> "Consistent Hashing & CAP Theorem"
        "Microprocessors & Embedded" -> "Interrupt Service Routines & Direct Memory Access (DMA)"
        else -> "Dynamic Programming & Graph Traversal (DFS/BFS)"
    }

    val currentTheory = when (selectedSubject) {
        "Operating Systems" -> """### 🧠 Operating Systems: Process Synchronization
**Core Problem:** Critical Section Problem arises when multiple concurrent threads or processes access shared memory simultaneously without synchronization, causing race conditions.

**Hardware & Software Solutions:**
- **Peterson's Algorithm:** Software solution for 2 processes using flag and turn variables.
- **Test-And-Set / Compare-And-Swap (CAS):** Atomic CPU instructions ensuring mutual exclusion without spinlock starvation.
- **Counting vs Binary Semaphore:** Binary acts as a Mutex (0 or 1). Counting semaphores allow access to a pool of N identical resources."""
        "Database Systems (DBMS)" -> """### 💾 DBMS: ACID Properties & Concurrency
**ACID Guarantees:**
- **Atomicity:** All operations in a transaction succeed or all roll back (Write-Ahead Logging).
- **Consistency:** Database transitions from one valid state satisfying constraints to another.
- **Isolation:** Concurrent execution of transactions yields the same state as serial execution.
- **Durability:** Committed transactions persist even in catastrophic power loss.

**Strict 2-Phase Locking (Strict 2PL):**
All exclusive locks held by a transaction are released only after the transaction commits or aborts, preventing cascading rollbacks."""
        else -> """### 🚀 Data Structures: Graph Traversal & Big-O
**1. Breadth-First Search (BFS):**
- **Data Structure:** Queue (FIFO).
- **Time Complexity:** O(V + E) where V is vertices, E is edges.
- **Space Complexity:** O(V) for visited array and frontier queue.
- **Key Use Case:** Finding the shortest path in unweighted graphs.

**2. Depth-First Search (DFS):**
- **Data Structure:** Stack (LIFO) or Call Stack recursion.
- **Time Complexity:** O(V + E).
- **Key Use Case:** Cycle detection, topological sorting, and strongly connected components."""
    }

    var quizAnswerSelected by remember { mutableStateOf<Int?>(null) }
    var flashcardFlipped by remember { mutableStateOf(false) }

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .background(BackgroundDark)
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            Text(
                text = "Engineering Core Tutor",
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.Bold,
                color = TextPrimary
            )
            Text(
                text = "Master undergraduate foundational engineering theory, formulas, and examiner interview traps.",
                style = MaterialTheme.typography.bodyMedium,
                color = TextSecondary
            )
        }

        // Subject Selector
        item {
            LazyRow(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                items(subjects) { sub ->
                    val isSelected = sub == selectedSubject
                    Surface(
                        color = if (isSelected) PrimaryIndigo else SurfaceDark,
                        shape = RoundedCornerShape(20.dp),
                        border = androidx.compose.foundation.BorderStroke(1.dp, if (isSelected) PrimaryIndigo else BorderDark),
                        modifier = Modifier
                            .clip(RoundedCornerShape(20.dp))
                            .clickable {
                                selectedSubject = sub
                                quizAnswerSelected = null
                                flashcardFlipped = false
                            }
                    ) {
                        Text(
                            text = sub,
                            color = if (isSelected) Color.White else TextSecondary,
                            fontSize = 12.sp,
                            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                            modifier = Modifier.padding(horizontal = 14.dp, vertical = 8.dp)
                        )
                    }
                }
            }
        }

        // View Mode: Theory, Flashcards, Quiz
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                FilterChip(
                    selected = selectedView == 0,
                    onClick = { selectedView = 0 },
                    label = { Text("Core Concept") },
                    colors = FilterChipDefaults.filterChipColors(
                        selectedContainerColor = SurfaceDarkElevated,
                        selectedLabelColor = AccentCyan
                    )
                )
                FilterChip(
                    selected = selectedView == 1,
                    onClick = { selectedView = 1 },
                    label = { Text("Flashcards") },
                    colors = FilterChipDefaults.filterChipColors(
                        selectedContainerColor = SurfaceDarkElevated,
                        selectedLabelColor = AccentEmerald
                    )
                )
                FilterChip(
                    selected = selectedView == 2,
                    onClick = { selectedView = 2 },
                    label = { Text("Practice Quiz") },
                    colors = FilterChipDefaults.filterChipColors(
                        selectedContainerColor = SurfaceDarkElevated,
                        selectedLabelColor = AccentAmber
                    )
                )
            }
        }

        when (selectedView) {
            0 -> {
                // Theory View
                item {
                    Card(
                        colors = CardDefaults.cardColors(containerColor = SurfaceDark),
                        shape = RoundedCornerShape(12.dp),
                        border = androidx.compose.foundation.BorderStroke(1.dp, BorderDark),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Column(modifier = Modifier.padding(16.dp)) {
                            Text(
                                text = currentTopicTitle,
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.Bold,
                                color = AccentCyan
                            )
                            Spacer(modifier = Modifier.height(10.dp))
                            Text(
                                text = currentTheory,
                                style = MaterialTheme.typography.bodyMedium,
                                color = TextPrimary,
                                lineHeight = 22.sp
                            )
                        }
                    }
                }
            }
            1 -> {
                // Flashcards View
                item {
                    Card(
                        colors = CardDefaults.cardColors(containerColor = if (flashcardFlipped) SurfaceDarkElevated else SurfaceDark),
                        shape = RoundedCornerShape(12.dp),
                        border = androidx.compose.foundation.BorderStroke(1.dp, if (flashcardFlipped) AccentEmerald else BorderDark),
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { flashcardFlipped = !flashcardFlipped }
                    ) {
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(24.dp),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Text(
                                text = if (flashcardFlipped) "ANSWER / EXPLANATION" else "QUESTION (Tap to Flip)",
                                style = MaterialTheme.typography.labelSmall,
                                color = if (flashcardFlipped) AccentEmerald else AccentCyan,
                                fontWeight = FontWeight.Bold
                            )
                            Spacer(modifier = Modifier.height(16.dp))
                            Text(
                                text = if (!flashcardFlipped) {
                                    "What is the key difference between a Mutex and a Counting Semaphore?"
                                } else {
                                    "A Mutex is a locking mechanism with ownership (only the thread that locked can unlock, state 0 or 1). A Counting Semaphore is a signaling mechanism without ownership, managing N concurrent resources."
                                },
                                style = MaterialTheme.typography.bodyLarge,
                                fontWeight = FontWeight.SemiBold,
                                color = TextPrimary,
                                lineHeight = 24.sp
                            )
                        }
                    }
                }
            }
            2 -> {
                // Practice Quiz View
                item {
                    Card(
                        colors = CardDefaults.cardColors(containerColor = SurfaceDark),
                        shape = RoundedCornerShape(12.dp),
                        border = androidx.compose.foundation.BorderStroke(1.dp, BorderDark),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Column(modifier = Modifier.padding(16.dp)) {
                            Text(
                                text = "Question 1 of 1",
                                style = MaterialTheme.typography.labelSmall,
                                color = AccentAmber,
                                fontWeight = FontWeight.Bold
                            )
                            Spacer(modifier = Modifier.height(6.dp))
                            Text(
                                text = "Which scheduling algorithm is provably optimal for minimizing average waiting time in batch operating systems?",
                                style = MaterialTheme.typography.bodyLarge,
                                fontWeight = FontWeight.Bold,
                                color = TextPrimary
                            )

                            val options = listOf(
                                "First-Come, First-Served (FCFS)",
                                "Shortest Job First (SJF) / Shortest Remaining Time First",
                                "Round Robin (RR) with large quantum",
                                "Priority Scheduling without aging"
                            )

                            Spacer(modifier = Modifier.height(12.dp))

                            options.forEachIndexed { idx, opt ->
                                val isChosen = quizAnswerSelected == idx
                                val isCorrect = idx == 1
                                val buttonBg = when {
                                    quizAnswerSelected == null -> SurfaceDarkSubtle
                                    isCorrect -> AccentEmerald.copy(alpha = 0.2f)
                                    isChosen && !isCorrect -> AccentRose.copy(alpha = 0.2f)
                                    else -> SurfaceDarkSubtle
                                }

                                Surface(
                                    color = buttonBg,
                                    shape = RoundedCornerShape(8.dp),
                                    border = androidx.compose.foundation.BorderStroke(
                                        1.dp,
                                        if (isChosen) (if (isCorrect) AccentEmerald else AccentRose) else BorderDark
                                    ),
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(vertical = 4.dp)
                                        .clickable { quizAnswerSelected = idx }
                                ) {
                                    Text(
                                        text = "${('A' + idx)}. $opt",
                                        style = MaterialTheme.typography.bodyMedium,
                                        color = TextPrimary,
                                        modifier = Modifier.padding(12.dp)
                                    )
                                }
                            }

                            if (quizAnswerSelected != null) {
                                Spacer(modifier = Modifier.height(12.dp))
                                Text(
                                    text = if (quizAnswerSelected == 1) {
                                        "✅ Correct! SJF minimizes average waiting time because scheduling shorter jobs ahead reduces the cumulative delay for subsequent jobs."
                                    } else {
                                        "❌ Incorrect. The correct answer is B (SJF). While it can cause starvation without aging, it is mathematically optimal for minimal average waiting time."
                                    },
                                    style = MaterialTheme.typography.bodyMedium,
                                    color = if (quizAnswerSelected == 1) AccentEmerald else AccentRose,
                                    fontWeight = FontWeight.SemiBold
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}
