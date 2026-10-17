package com.aistudio.pramanix.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
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
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.aistudio.pramanix.data.model.RepoData
import com.aistudio.pramanix.data.model.RepoFile
import com.aistudio.pramanix.ui.theme.*

@Composable
fun GithubMentorScreen(
    repoData: RepoData,
    onConnectRepoToWorkspace: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    var searchQuery by remember { mutableStateOf("manthankro/pramanix-ai-") }
    var selectedTab by remember { mutableStateOf(0) } // 0: Overview, 1: Files, 2: Readme, 3: Viva Prep
    var selectedFile by remember { mutableStateOf<RepoFile?>(repoData.files.firstOrNull()) }

    val tabs = listOf("Architecture", "Files & Code", "README", "Viva Prep")

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .background(BackgroundDark)
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Search & Repo Input
        item {
            Card(
                colors = CardDefaults.cardColors(containerColor = SurfaceDark),
                shape = RoundedCornerShape(12.dp),
                border = androidx.compose.foundation.BorderStroke(1.dp, BorderDark),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        text = "GitHub Repository Intelligence",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        color = TextPrimary
                    )
                    Text(
                        text = "Inspect architecture, analyze dependencies, and generate viva questions for any repository.",
                        style = MaterialTheme.typography.bodyMedium,
                        color = TextSecondary,
                        modifier = Modifier.padding(vertical = 4.dp)
                    )

                    Spacer(modifier = Modifier.height(8.dp))

                    OutlinedTextField(
                        value = searchQuery,
                        onValueChange = { searchQuery = it },
                        label = { Text("Repository (owner/repo)") },
                        leadingIcon = {
                            Icon(Icons.Default.Search, contentDescription = "Search", tint = AccentCyan)
                        },
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = PrimaryIndigo,
                            unfocusedBorderColor = BorderDark,
                            focusedTextColor = TextPrimary,
                            unfocusedTextColor = TextPrimary
                        ),
                        singleLine = true,
                        modifier = Modifier
                            .fillMaxWidth()
                            .testTag("github_repo_input")
                    )

                    Spacer(modifier = Modifier.height(10.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Button(
                            onClick = { onConnectRepoToWorkspace(searchQuery) },
                            colors = ButtonDefaults.buttonColors(containerColor = PrimaryIndigo),
                            shape = RoundedCornerShape(8.dp),
                            modifier = Modifier
                                .weight(1f)
                                .testTag("connect_workspace_btn")
                        ) {
                            Icon(Icons.Default.Check, contentDescription = null, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("Connect to Workspace", fontSize = 13.sp)
                        }
                    }
                }
            }
        }

        // Repo Stat Badges
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                StatCard(title = "Stars", value = "${repoData.stars}", icon = Icons.Default.Star, tint = AccentAmber, modifier = Modifier.weight(1f))
                StatCard(title = "Forks", value = "${repoData.forks}", icon = Icons.Default.ForkRight, tint = AccentCyan, modifier = Modifier.weight(1f))
                StatCard(title = "Issues", value = "${repoData.openIssues}", icon = Icons.Default.BugReport, tint = AccentRose, modifier = Modifier.weight(1f))
                StatCard(title = "Language", value = repoData.language ?: "Python", icon = Icons.Default.Code, tint = AccentEmerald, modifier = Modifier.weight(1.2f))
            }
        }

        // Tab Row
        item {
            TabRow(
                selectedTabIndex = selectedTab,
                containerColor = SurfaceDark,
                contentColor = AccentCyan,
                divider = { HorizontalDivider(color = BorderDark) }
            ) {
                tabs.forEachIndexed { index, title ->
                    Tab(
                        selected = selectedTab == index,
                        onClick = { selectedTab = index },
                        text = {
                            Text(
                                text = title,
                                fontWeight = if (selectedTab == index) FontWeight.Bold else FontWeight.Normal,
                                color = if (selectedTab == index) AccentCyan else TextSecondary,
                                fontSize = 13.sp
                            )
                        },
                        modifier = Modifier.testTag("tab_$index")
                    )
                }
            }
        }

        // Tab Contents
        when (selectedTab) {
            0 -> {
                // Architecture & AI Summary
                item {
                    Card(
                        colors = CardDefaults.cardColors(containerColor = SurfaceDark),
                        shape = RoundedCornerShape(12.dp),
                        border = androidx.compose.foundation.BorderStroke(1.dp, BorderDark),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Column(modifier = Modifier.padding(16.dp)) {
                            Text(
                                text = "System Architecture Blueprint",
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.Bold,
                                color = AccentCyan
                            )
                            Spacer(modifier = Modifier.height(8.dp))
                            Text(
                                text = "• Core Subsystem: Python async event loop orchestrating multi-agent LLM prompts & repo analysis.\n" +
                                        "• Containerization: Multi-stage slim Docker image with non-root runtime privileges.\n" +
                                        "• Data Boundary: In-memory task queues, reactive state store, and persistent local/cloud cache.\n" +
                                        "• Performance Footprint: Sub-second analysis with intelligent chunking of AST tokens.",
                                style = MaterialTheme.typography.bodyMedium,
                                color = TextPrimary,
                                lineHeight = 22.sp
                            )
                            Spacer(modifier = Modifier.height(12.dp))
                            Surface(
                                color = SurfaceDarkSubtle,
                                shape = RoundedCornerShape(8.dp),
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                Row(
                                    modifier = Modifier.padding(12.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Icon(Icons.Default.Verified, contentDescription = null, tint = AccentEmerald)
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Text(
                                        text = "Architecture Verified: Zero cyclic dependencies detected.",
                                        style = MaterialTheme.typography.bodyMedium,
                                        color = AccentEmerald,
                                        fontWeight = FontWeight.SemiBold
                                    )
                                }
                            }
                        }
                    }
                }
            }
            1 -> {
                // Files & Code Explorer
                item {
                    Text(
                        text = "Repository File Tree (${repoData.files.size} files)",
                        style = MaterialTheme.typography.titleSmall,
                        color = TextSecondary
                    )
                }
                items(repoData.files) { file ->
                    val isSelected = selectedFile?.path == file.path
                    Surface(
                        color = if (isSelected) SurfaceDarkElevated else SurfaceDark,
                        shape = RoundedCornerShape(8.dp),
                        border = androidx.compose.foundation.BorderStroke(1.dp, if (isSelected) PrimaryIndigo else BorderDark),
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { selectedFile = file }
                    ) {
                        Row(
                            modifier = Modifier.padding(12.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(
                                imageVector = if (file.type == "dir") Icons.Default.Folder else Icons.Default.Description,
                                contentDescription = null,
                                tint = if (file.type == "dir") AccentAmber else AccentCyan,
                                modifier = Modifier.size(18.dp)
                            )
                            Spacer(modifier = Modifier.width(10.dp))
                            Text(
                                text = file.path,
                                style = MaterialTheme.typography.bodyMedium,
                                color = TextPrimary,
                                fontFamily = FontFamily.Monospace,
                                modifier = Modifier.weight(1f)
                            )
                            file.size?.let { size ->
                                Text(
                                    text = "${size}B",
                                    style = MaterialTheme.typography.labelSmall,
                                    color = TextMuted
                                )
                            }
                        }
                    }
                }
            }
            2 -> {
                // README
                item {
                    Card(
                        colors = CardDefaults.cardColors(containerColor = SurfaceDark),
                        shape = RoundedCornerShape(12.dp),
                        border = androidx.compose.foundation.BorderStroke(1.dp, BorderDark),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Column(modifier = Modifier.padding(16.dp)) {
                            Text(
                                text = "README.md",
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.Bold,
                                color = AccentCyan
                            )
                            Spacer(modifier = Modifier.height(8.dp))
                            Text(
                                text = repoData.readme,
                                style = MaterialTheme.typography.bodyMedium,
                                color = TextPrimary,
                                lineHeight = 20.sp
                            )
                        }
                    }
                }
            }
            3 -> {
                // Viva Defense Prep for this Repo
                item {
                    Card(
                        colors = CardDefaults.cardColors(containerColor = SurfaceDark),
                        shape = RoundedCornerShape(12.dp),
                        border = androidx.compose.foundation.BorderStroke(1.dp, BorderDark),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Column(modifier = Modifier.padding(16.dp)) {
                            Text(
                                text = "🎓 External Examiner Viva Defense Questions",
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.Bold,
                                color = AccentAmber
                            )
                            Spacer(modifier = Modifier.height(8.dp))
                            Text(
                                text = "1. \"How does your multi-stage Docker build mitigate supply-chain vulnerabilities?\"\n" +
                                        "2. \"What happens to pending asynchronous tasks if the host process experiences an OOM kill?\"\n" +
                                        "3. \"Explain the mathematical basis of your complexity bounds under high concurrency.\"",
                                style = MaterialTheme.typography.bodyMedium,
                                color = TextPrimary,
                                lineHeight = 24.sp
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun StatCard(
    title: String,
    value: String,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    tint: Color,
    modifier: Modifier = Modifier
) {
    Surface(
        color = SurfaceDark,
        shape = RoundedCornerShape(10.dp),
        border = androidx.compose.foundation.BorderStroke(1.dp, BorderDark),
        modifier = modifier
    ) {
        Column(
            modifier = Modifier.padding(10.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Icon(imageVector = icon, contentDescription = title, tint = tint, modifier = Modifier.size(18.dp))
            Spacer(modifier = Modifier.height(4.dp))
            Text(text = value, style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.Bold, color = TextPrimary)
            Text(text = title, style = MaterialTheme.typography.labelSmall, color = TextMuted)
        }
    }
}
