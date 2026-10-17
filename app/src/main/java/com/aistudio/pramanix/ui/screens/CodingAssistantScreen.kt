package com.aistudio.pramanix.ui.screens

import androidx.compose.foundation.background
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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.aistudio.pramanix.ui.theme.*

@Composable
fun CodingAssistantScreen(
    analysisResult: String?,
    isAnalyzing: Boolean,
    onAnalyzeCode: (String, String) -> Unit,
    modifier: Modifier = Modifier
) {
    var codeSnippet by remember {
        mutableStateOf(
            """def find_two_sum(numbers, target):
    seen = {}
    for i, num in enumerate(numbers):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []"""
        )
    }

    val tasks = listOf(
        Pair("complexity", "Big-O Complexity"),
        Pair("bugs", "Find Vulnerabilities & Bugs"),
        Pair("refactor", "Refactor & Optimize"),
        Pair("tests", "Generate Unit Tests")
    )

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .background(BackgroundDark)
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            Text(
                text = "Coding & Algorithmic Assistant",
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.Bold,
                color = TextPrimary
            )
            Text(
                text = "Audit runtime complexity, identify subtle race conditions and memory leaks, and generate comprehensive unit test suites.",
                style = MaterialTheme.typography.bodyMedium,
                color = TextSecondary
            )
        }

        // Code Editor Box
        item {
            Card(
                colors = CardDefaults.cardColors(containerColor = SurfaceDark),
                shape = RoundedCornerShape(12.dp),
                border = androidx.compose.foundation.BorderStroke(1.dp, BorderDark),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(14.dp)) {
                    Text(
                        text = "Source Code Input",
                        style = MaterialTheme.typography.labelSmall,
                        color = AccentCyan,
                        fontWeight = FontWeight.Bold
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    OutlinedTextField(
                        value = codeSnippet,
                        onValueChange = { codeSnippet = it },
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = PrimaryIndigo,
                            unfocusedBorderColor = BorderDark,
                            focusedTextColor = TextPrimary,
                            unfocusedTextColor = TextPrimary
                        ),
                        textStyle = androidx.compose.ui.text.TextStyle(
                            fontFamily = FontFamily.Monospace,
                            fontSize = 12.sp,
                            lineHeight = 16.sp
                        ),
                        minLines = 8,
                        modifier = Modifier
                            .fillMaxWidth()
                            .testTag("code_analysis_input")
                    )

                    Spacer(modifier = Modifier.height(12.dp))

                    Text(
                        text = "Select Analysis Action:",
                        style = MaterialTheme.typography.labelSmall,
                        color = TextMuted
                    )

                    Spacer(modifier = Modifier.height(8.dp))

                    LazyRow(
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        items(tasks) { (taskId, label) ->
                            Button(
                                onClick = { onAnalyzeCode(codeSnippet, taskId) },
                                colors = ButtonDefaults.buttonColors(containerColor = SurfaceDarkSubtle),
                                shape = RoundedCornerShape(8.dp),
                                enabled = !isAnalyzing
                            ) {
                                Text(text = label, color = AccentCyan, fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
                            }
                        }
                    }
                }
            }
        }

        // Analysis Output
        if (isAnalyzing) {
            item {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(24.dp),
                    contentAlignment = Alignment.Center
                ) {
                    CircularProgressIndicator(color = AccentCyan)
                }
            }
        } else if (analysisResult != null) {
            item {
                Card(
                    colors = CardDefaults.cardColors(containerColor = SurfaceDarkElevated),
                    shape = RoundedCornerShape(12.dp),
                    border = androidx.compose.foundation.BorderStroke(1.dp, AccentCyan),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Icon(Icons.Default.Terminal, contentDescription = null, tint = AccentEmerald)
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = "Pramanix Algorithmic Audit Output",
                                style = MaterialTheme.typography.titleSmall,
                                fontWeight = FontWeight.Bold,
                                color = AccentEmerald
                            )
                        }
                        Spacer(modifier = Modifier.height(10.dp))
                        Text(
                            text = analysisResult,
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
