package com.aistudio.pramanix.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
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
import com.aistudio.pramanix.data.model.VivaQuestion
import com.aistudio.pramanix.ui.theme.*

@Composable
fun DoubtVivaHelpScreen(
    vivaQuestions: List<VivaQuestion>,
    onSubmitVivaAnswer: (Int, String) -> Unit,
    modifier: Modifier = Modifier
) {
    var doubtText by remember { mutableStateOf("") }
    var doubtAnswer by remember { mutableStateOf<String?>(null) }
    var studentAnswerInputs by remember { mutableStateOf(vivaQuestions.map { it.studentAnswer ?: "" }) }
    var expandedIdealAnswers by remember { mutableStateOf(setOf<Int>()) }

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .background(BackgroundDark)
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            Text(
                text = "Doubt Clearing & Oral Viva Simulator",
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.Bold,
                color = TextPrimary
            )
            Text(
                text = "Simulate intense external examiner questioning for capstone defense and clear urgent theoretical doubts.",
                style = MaterialTheme.typography.bodyMedium,
                color = TextSecondary
            )
        }

        // Quick Doubt Resolver Card
        item {
            Card(
                colors = CardDefaults.cardColors(containerColor = SurfaceDark),
                shape = RoundedCornerShape(12.dp),
                border = androidx.compose.foundation.BorderStroke(1.dp, BorderDark),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        text = "⚡ Instant Engineering Doubt Solver",
                        style = MaterialTheme.typography.titleSmall,
                        fontWeight = FontWeight.Bold,
                        color = AccentCyan
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    OutlinedTextField(
                        value = doubtText,
                        onValueChange = { doubtText = it },
                        placeholder = { Text("Ask any doubt (e.g., 'Explain Two-Phase Commit in distributed DBMS')") },
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = PrimaryIndigo,
                            unfocusedBorderColor = BorderDark,
                            focusedTextColor = TextPrimary,
                            unfocusedTextColor = TextPrimary
                        ),
                        modifier = Modifier
                            .fillMaxWidth()
                            .testTag("doubt_input")
                    )
                    Spacer(modifier = Modifier.height(10.dp))
                    Button(
                        onClick = {
                            if (doubtText.isNotBlank()) {
                                doubtAnswer = """### Resolution for: "$doubtText"
1. **Core Concept:** In distributed databases, Two-Phase Commit (2PL) guarantees that either all participating nodes commit the transaction or none do, ensuring global atomicity.
2. **Phase 1 (Prepare):** The coordinator sends `PREPARE` messages. Participants write redo/undo logs and vote `AGREE` or `ABORT`.
3. **Phase 2 (Commit):** If all participants voted `AGREE`, coordinator broadcasts `GLOBAL_COMMIT`. If even one voted `ABORT`, coordinator broadcasts `GLOBAL_ABORT`.
4. **Failure Mode Warning:** It is a blocking protocol—if the coordinator crashes before broadcasting, participants remain blocked holding locks."""
                            }
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = PrimaryIndigo),
                        shape = RoundedCornerShape(8.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Icon(Icons.Default.Bolt, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("Solve My Doubt", fontWeight = FontWeight.SemiBold)
                    }

                    doubtAnswer?.let { ans ->
                        Spacer(modifier = Modifier.height(12.dp))
                        Surface(
                            color = SurfaceDarkElevated,
                            shape = RoundedCornerShape(8.dp),
                            border = androidx.compose.foundation.BorderStroke(1.dp, AccentCyan),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text(
                                text = ans,
                                style = MaterialTheme.typography.bodyMedium,
                                color = TextPrimary,
                                modifier = Modifier.padding(12.dp),
                                lineHeight = 20.sp
                            )
                        }
                    }
                }
            }
        }

        item {
            Text(
                text = "🎓 External Examiner Oral Defense Rubric",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                color = AccentAmber
            )
        }

        // Viva Questions List
        itemsIndexed(vivaQuestions) { index, q ->
            var currentStudentAns by remember(index) { mutableStateOf(q.studentAnswer ?: "") }

            Card(
                colors = CardDefaults.cardColors(containerColor = SurfaceDark),
                shape = RoundedCornerShape(12.dp),
                border = androidx.compose.foundation.BorderStroke(1.dp, if (q.score != null) AccentEmerald else BorderDark),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Surface(
                            color = AccentAmber.copy(alpha = 0.15f),
                            shape = RoundedCornerShape(4.dp)
                        ) {
                            Text(
                                text = "EXAMINER QUESTION #${index + 1}",
                                color = AccentAmber,
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Bold,
                                modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                            )
                        }
                        q.score?.let { s ->
                            Surface(
                                color = if (s >= 7) AccentEmerald.copy(alpha = 0.2f) else AccentAmber.copy(alpha = 0.2f),
                                shape = RoundedCornerShape(4.dp)
                            ) {
                                Text(
                                    text = "Score: $s/10",
                                    color = if (s >= 7) AccentEmerald else AccentAmber,
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold,
                                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 2.dp)
                                )
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(8.dp))

                    Text(
                        text = q.question,
                        style = MaterialTheme.typography.titleSmall,
                        fontWeight = FontWeight.Bold,
                        color = TextPrimary,
                        lineHeight = 22.sp
                    )

                    Spacer(modifier = Modifier.height(10.dp))

                    OutlinedTextField(
                        value = currentStudentAns,
                        onValueChange = { currentStudentAns = it },
                        placeholder = { Text("Speak or type your oral defense answer here...") },
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = PrimaryIndigo,
                            unfocusedBorderColor = BorderDark,
                            focusedTextColor = TextPrimary,
                            unfocusedTextColor = TextPrimary
                        ),
                        minLines = 2,
                        modifier = Modifier.fillMaxWidth()
                    )

                    Spacer(modifier = Modifier.height(8.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Button(
                            onClick = {
                                if (currentStudentAns.isNotBlank()) {
                                    onSubmitVivaAnswer(index, currentStudentAns)
                                }
                            },
                            colors = ButtonDefaults.buttonColors(containerColor = PrimaryIndigo),
                            shape = RoundedCornerShape(6.dp),
                            modifier = Modifier.weight(1f)
                        ) {
                            Icon(Icons.Default.RecordVoiceOver, contentDescription = null, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("Submit Defense", fontSize = 12.sp)
                        }

                        q.idealAnswer?.let {
                            val isExpanded = expandedIdealAnswers.contains(index)
                            OutlinedButton(
                                onClick = {
                                    expandedIdealAnswers = if (isExpanded) {
                                        expandedIdealAnswers - index
                                    } else {
                                        expandedIdealAnswers + index
                                    }
                                },
                                shape = RoundedCornerShape(6.dp)
                            ) {
                                Text(if (isExpanded) "Hide Ideal" else "Ideal Answer", fontSize = 12.sp)
                            }
                        }
                    }

                    // Examiner Feedback Card
                    q.feedback?.let { fb ->
                        Spacer(modifier = Modifier.height(10.dp))
                        Surface(
                            color = SurfaceDarkElevated,
                            shape = RoundedCornerShape(6.dp),
                            border = androidx.compose.foundation.BorderStroke(1.dp, BorderDark),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Column(modifier = Modifier.padding(10.dp)) {
                                Text(
                                    text = "Examiner Rubric Feedback:",
                                    style = MaterialTheme.typography.labelSmall,
                                    color = TextMuted,
                                    fontWeight = FontWeight.Bold
                                )
                                Spacer(modifier = Modifier.height(4.dp))
                                Text(
                                    text = fb,
                                    style = MaterialTheme.typography.bodyMedium,
                                    color = TextPrimary
                                )
                            }
                        }
                    }

                    if (expandedIdealAnswers.contains(index)) {
                        Spacer(modifier = Modifier.height(8.dp))
                        Surface(
                            color = AccentCyan.copy(alpha = 0.1f),
                            shape = RoundedCornerShape(6.dp),
                            border = androidx.compose.foundation.BorderStroke(1.dp, AccentCyan),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Column(modifier = Modifier.padding(10.dp)) {
                                Text(
                                    text = "Exemplar Answer Model:",
                                    style = MaterialTheme.typography.labelSmall,
                                    color = AccentCyan,
                                    fontWeight = FontWeight.Bold
                                )
                                Spacer(modifier = Modifier.height(4.dp))
                                Text(
                                    text = q.idealAnswer ?: "",
                                    style = MaterialTheme.typography.bodyMedium,
                                    color = TextPrimary
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}
