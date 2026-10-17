package com.aistudio.pramanix.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.aistudio.pramanix.ui.theme.*

@Composable
fun PdfNotesAssistantScreen(
    modifier: Modifier = Modifier
) {
    var notesContent by remember {
        mutableStateOf(
            """Unit 4: Distributed Consensus & Fault Tolerance
Paxos and Raft consensus protocols ensure state machine replication across unreliable networks. Raft simplifies Paxos into leader election, log replication, and safety. A term represents a logical epoch. Split votes are mitigated by randomized election timeouts (150ms-300ms). Byzantine fault tolerance (BFT) addresses malicious nodes, requiring 3f+1 nodes to tolerate f faulty nodes."""
        )
    }

    var resultText by remember { mutableStateOf<String?>(null) }
    var isGenerating by remember { mutableStateOf(false) }

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .background(BackgroundDark)
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            Text(
                text = "PDF & Lecture Notes Assistant",
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.Bold,
                color = TextPrimary
            )
            Text(
                text = "Condense academic lecture notes, generate exam cheat sheets, and extract probable semester exam questions.",
                style = MaterialTheme.typography.bodyMedium,
                color = TextSecondary
            )
        }

        item {
            Card(
                colors = CardDefaults.cardColors(containerColor = SurfaceDark),
                shape = RoundedCornerShape(12.dp),
                border = androidx.compose.foundation.BorderStroke(1.dp, BorderDark),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(14.dp)) {
                    Text(
                        text = "Lecture Notes or Syllabus Excerpt",
                        style = MaterialTheme.typography.labelSmall,
                        color = AccentCyan,
                        fontWeight = FontWeight.Bold
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    OutlinedTextField(
                        value = notesContent,
                        onValueChange = { notesContent = it },
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = PrimaryIndigo,
                            unfocusedBorderColor = BorderDark,
                            focusedTextColor = TextPrimary,
                            unfocusedTextColor = TextPrimary
                        ),
                        minLines = 5,
                        modifier = Modifier
                            .fillMaxWidth()
                            .testTag("pdf_notes_input")
                    )

                    Spacer(modifier = Modifier.height(12.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Button(
                            onClick = {
                                isGenerating = true
                                resultText = """### 📑 Exam Cheat Sheet & Key Formulas
1. **Core Mechanism:** Raft splits consensus into Leader Election, Log Replication, and Safety Invariants.
2. **Formula / Sizing Rule:**
   - Crash Fault Tolerance (CFT): N >= 2f + 1 nodes to survive f crash failures.
   - Byzantine Fault Tolerance (BFT): N >= 3f + 1 nodes to survive f malicious Byzantine nodes.
3. **Randomized Election Timeout:** 150ms - 300ms prevents split-vote deadlock by staggering candidate heartbeats."""
                                isGenerating = false
                            },
                            colors = ButtonDefaults.buttonColors(containerColor = PrimaryIndigo),
                            shape = RoundedCornerShape(6.dp),
                            modifier = Modifier.weight(1f)
                        ) {
                            Text("Cheat Sheet", fontSize = 12.sp)
                        }

                        Button(
                            onClick = {
                                isGenerating = true
                                resultText = """### 🎓 Top 5 Viva & Exam Questions from Notes
1. **Q:** Why does Raft use randomized election timeouts instead of fixed intervals?
   - **Ideal Answer:** Randomized timeouts desynchronize election bids across candidates, avoiding split-vote ties.
2. **Q:** What is the minimum cluster size to tolerate 2 node crashes under Raft?
   - **Ideal Answer:** 2(2) + 1 = 5 nodes required for quorum (majority of 3).
3. **Q:** How does Raft guarantee that committed logs are never overwritten?
   - **Ideal Answer:** Through the Leader Completeness property: a candidate must have all committed entries to win an election."""
                                isGenerating = false
                            },
                            colors = ButtonDefaults.buttonColors(containerColor = AccentEmerald),
                            shape = RoundedCornerShape(6.dp),
                            modifier = Modifier.weight(1f)
                        ) {
                            Text("Top Viva Qs", color = Color.Black, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }
        }

        resultText?.let { res ->
            item {
                Card(
                    colors = CardDefaults.cardColors(containerColor = SurfaceDarkElevated),
                    shape = RoundedCornerShape(12.dp),
                    border = androidx.compose.foundation.BorderStroke(1.dp, AccentCyan),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text(
                            text = "Generated Notes Summary",
                            style = MaterialTheme.typography.titleSmall,
                            fontWeight = FontWeight.Bold,
                            color = AccentCyan
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = res,
                            style = MaterialTheme.typography.bodyMedium,
                            color = TextPrimary,
                            lineHeight = 22.sp
                        )
                    }
                }
            }
        }
    }
}
