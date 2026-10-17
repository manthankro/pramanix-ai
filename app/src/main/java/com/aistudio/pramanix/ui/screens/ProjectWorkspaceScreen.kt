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
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.aistudio.pramanix.data.model.ProjectFile
import com.aistudio.pramanix.data.model.ProjectTask
import com.aistudio.pramanix.data.model.WorkspaceProject
import com.aistudio.pramanix.ui.theme.*

@Composable
fun ProjectWorkspaceScreen(
    projects: List<WorkspaceProject>,
    activeProject: WorkspaceProject?,
    onSelectProject: (String) -> Unit,
    onAddTask: (String, String, String, String) -> Unit,
    onToggleTaskStatus: (String) -> Unit,
    onUpdateTaskProgress: (String, Int) -> Unit,
    onDeleteTask: (String) -> Unit,
    onSaveFile: (String, String, String) -> Unit,
    onSaveNotes: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    if (activeProject == null) {
        Box(modifier = modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            Text("No active project. Please create or select a project.", color = TextSecondary)
        }
        return
    }

    var selectedTab by remember { mutableStateOf(0) } // 0: Tasks, 1: Gantt, 2: Files, 3: Notes
    val tabs = listOf("Tasks", "Gantt Timeline", "Files & Code", "Notes & SRS")

    var showAddTaskDialog by remember { mutableStateOf(false) }
    var newTaskTitle by remember { mutableStateOf("") }
    var newTaskPriority by remember { mutableStateOf("high") }
    var newTaskMilestone by remember { mutableStateOf("M2: Subsystems") }
    var newTaskDueDate by remember { mutableStateOf("2026-11-15") }

    // Selected file in files tab
    var activeFileName by remember(activeProject.id) {
        mutableStateOf(activeProject.files.firstOrNull()?.name ?: "main.py")
    }
    val currentFile = activeProject.files.find { it.name == activeFileName } ?: activeProject.files.firstOrNull()
    var fileContentEdit by remember(currentFile?.name, activeProject.id) {
        mutableStateOf(currentFile?.content ?: "")
    }

    // Notes edit
    var notesContentEdit by remember(activeProject.id) {
        mutableStateOf(activeProject.notes)
    }

    // Stats
    val totalTasks = activeProject.tasks.size
    val doneTasks = activeProject.tasks.count { it.status == "done" }
    val progressPct = if (totalTasks > 0) (doneTasks * 100) / totalTasks else 0

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(BackgroundDark)
            .padding(16.dp)
    ) {
        // Project Switcher Row
        LazyRow(
            horizontalArrangement = Arrangement.spacedBy(8.dp),
            modifier = Modifier
                .fillMaxWidth()
                .padding(bottom = 12.dp)
        ) {
            items(projects) { p ->
                val isSelected = p.id == activeProject.id
                Surface(
                    color = if (isSelected) PrimaryIndigo else SurfaceDark,
                    shape = RoundedCornerShape(20.dp),
                    border = androidx.compose.foundation.BorderStroke(1.dp, if (isSelected) PrimaryIndigo else BorderDark),
                    modifier = Modifier
                        .clip(RoundedCornerShape(20.dp))
                        .clickable { onSelectProject(p.id) }
                ) {
                    Text(
                        text = p.name,
                        color = if (isSelected) Color.White else TextSecondary,
                        fontSize = 12.sp,
                        fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                        modifier = Modifier.padding(horizontal = 14.dp, vertical = 8.dp)
                    )
                }
            }
        }

        // Active Project Info & Progress Header Card
        Card(
            colors = CardDefaults.cardColors(containerColor = SurfaceDark),
            shape = RoundedCornerShape(12.dp),
            border = androidx.compose.foundation.BorderStroke(1.dp, BorderDark),
            modifier = Modifier
                .fillMaxWidth()
                .padding(bottom = 12.dp)
        ) {
            Column(modifier = Modifier.padding(14.dp)) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = activeProject.name,
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold,
                            color = TextPrimary
                        )
                        Text(
                            text = "${activeProject.domain} • Repo: ${activeProject.connectedRepo}",
                            style = MaterialTheme.typography.labelSmall,
                            color = AccentCyan
                        )
                    }
                    Text(
                        text = "$progressPct%",
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.Black,
                        color = if (progressPct >= 75) AccentEmerald else AccentAmber
                    )
                }

                Spacer(modifier = Modifier.height(8.dp))

                LinearProgressIndicator(
                    progress = { progressPct / 100f },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(6.dp)
                        .clip(RoundedCornerShape(3.dp)),
                    color = AccentEmerald,
                    trackColor = SurfaceDarkSubtle
                )

                Spacer(modifier = Modifier.height(6.dp))

                Text(
                    text = "$doneTasks of $totalTasks tasks completed",
                    style = MaterialTheme.typography.labelSmall,
                    color = TextMuted
                )
            }
        }

        // Workspace Tabs
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
                            fontSize = 12.sp
                        )
                    },
                    modifier = Modifier.testTag("ws_tab_$index")
                )
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        // Tab Bodies
        when (selectedTab) {
            0 -> {
                // Tasks Tab
                Column(modifier = Modifier.weight(1f)) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(bottom = 8.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "Tasks & Milestones (${activeProject.tasks.size})",
                            style = MaterialTheme.typography.titleSmall,
                            color = TextSecondary
                        )
                        Button(
                            onClick = { showAddTaskDialog = true },
                            colors = ButtonDefaults.buttonColors(containerColor = PrimaryIndigo),
                            contentPadding = PaddingValues(horizontal = 10.dp, vertical = 4.dp),
                            shape = RoundedCornerShape(6.dp),
                            modifier = Modifier.testTag("add_task_btn")
                        ) {
                            Icon(Icons.Default.Add, contentDescription = null, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(4.dp))
                            Text("Add Task", fontSize = 12.sp)
                        }
                    }

                    LazyColumn(
                        verticalArrangement = Arrangement.spacedBy(8.dp),
                        modifier = Modifier.fillMaxSize()
                    ) {
                        items(activeProject.tasks) { task ->
                            val isDone = task.status == "done"
                            val priorityColor = when (task.priority) {
                                "high" -> AccentRose
                                "medium" -> AccentAmber
                                else -> AccentCyan
                            }

                            Card(
                                colors = CardDefaults.cardColors(containerColor = SurfaceDark),
                                shape = RoundedCornerShape(10.dp),
                                border = androidx.compose.foundation.BorderStroke(1.dp, BorderDark),
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                Column(modifier = Modifier.padding(12.dp)) {
                                    Row(
                                        verticalAlignment = Alignment.CenterVertically,
                                        modifier = Modifier.fillMaxWidth()
                                    ) {
                                        Checkbox(
                                            checked = isDone,
                                            onCheckedChange = { onToggleTaskStatus(task.id) },
                                            colors = CheckboxDefaults.colors(
                                                checkedColor = AccentEmerald,
                                                uncheckedColor = TextMuted
                                            )
                                        )
                                        Spacer(modifier = Modifier.width(4.dp))
                                        Column(modifier = Modifier.weight(1f)) {
                                            Text(
                                                text = task.title,
                                                style = MaterialTheme.typography.bodyLarge,
                                                fontWeight = FontWeight.SemiBold,
                                                color = if (isDone) TextMuted else TextPrimary,
                                                textDecoration = if (isDone) androidx.compose.ui.text.style.TextDecoration.LineThrough else null
                                            )
                                            task.milestone?.let { m ->
                                                Text(text = m, style = MaterialTheme.typography.labelSmall, color = PrimaryIndigo)
                                            }
                                        }
                                        Surface(
                                            color = priorityColor.copy(alpha = 0.15f),
                                            shape = RoundedCornerShape(4.dp)
                                        ) {
                                            Text(
                                                text = task.priority.uppercase(),
                                                color = priorityColor,
                                                fontSize = 10.sp,
                                                fontWeight = FontWeight.Bold,
                                                modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                            )
                                        }
                                        IconButton(
                                            onClick = { onDeleteTask(task.id) },
                                            modifier = Modifier.size(28.dp)
                                        ) {
                                            Icon(Icons.Default.Delete, contentDescription = "Delete", tint = TextMuted, modifier = Modifier.size(16.dp))
                                        }
                                    }

                                    task.dueDate?.let { due ->
                                        Row(
                                            modifier = Modifier.fillMaxWidth().padding(start = 48.dp, top = 2.dp),
                                            horizontalArrangement = Arrangement.SpaceBetween
                                        ) {
                                            Text(text = "Due: $due", style = MaterialTheme.typography.labelSmall, color = TextMuted)
                                            Text(text = "Progress: ${task.progress}%", style = MaterialTheme.typography.labelSmall, color = AccentCyan)
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            1 -> {
                // Gantt Timeline Tab
                LazyColumn(
                    verticalArrangement = Arrangement.spacedBy(12.dp),
                    modifier = Modifier.weight(1f)
                ) {
                    item {
                        Text(
                            text = "Milestone Delivery Roadmap",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold,
                            color = TextPrimary
                        )
                        Text(
                            text = "Track capstone progress across M1 (Architecture), M2 (Core Subsystems), M3 (Tests), and M4 (Viva Defense).",
                            style = MaterialTheme.typography.bodyMedium,
                            color = TextSecondary
                        )
                    }

                    val milestones = listOf(
                        Triple("M1: Architecture & SRS", 100, "Sep 01 - Sep 14 (Completed)"),
                        Triple("M2: Core Subsystems", 65, "Sep 15 - Oct 05 (In Progress)"),
                        Triple("M3: Integration & Tests", 25, "Oct 06 - Oct 20 (Upcoming)"),
                        Triple("M4: Viva & Final Defense", 0, "Oct 21 - Nov 05 (Scheduled)")
                    )

                    items(milestones) { (name, progress, dates) ->
                        Card(
                            colors = CardDefaults.cardColors(containerColor = SurfaceDark),
                            shape = RoundedCornerShape(10.dp),
                            border = androidx.compose.foundation.BorderStroke(1.dp, BorderDark),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Column(modifier = Modifier.padding(14.dp)) {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Text(
                                        text = name,
                                        style = MaterialTheme.typography.titleSmall,
                                        fontWeight = FontWeight.Bold,
                                        color = AccentCyan
                                    )
                                    Text(
                                        text = "$progress%",
                                        style = MaterialTheme.typography.labelSmall,
                                        fontWeight = FontWeight.Bold,
                                        color = if (progress == 100) AccentEmerald else AccentAmber
                                    )
                                }
                                Text(
                                    text = dates,
                                    style = MaterialTheme.typography.labelSmall,
                                    color = TextMuted,
                                    modifier = Modifier.padding(vertical = 4.dp)
                                )
                                LinearProgressIndicator(
                                    progress = { progress / 100f },
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .height(8.dp)
                                        .clip(RoundedCornerShape(4.dp)),
                                    color = if (progress == 100) AccentEmerald else PrimaryIndigo,
                                    trackColor = SurfaceDarkSubtle
                                )
                            }
                        }
                    }
                }
            }
            2 -> {
                // Files & Code Tab
                Column(modifier = Modifier.weight(1f)) {
                    // File selector chips
                    LazyRow(
                        horizontalArrangement = Arrangement.spacedBy(6.dp),
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(bottom = 8.dp)
                    ) {
                        items(activeProject.files) { file ->
                            val isSelected = file.name == activeFileName
                            Surface(
                                color = if (isSelected) SurfaceDarkElevated else SurfaceDark,
                                shape = RoundedCornerShape(6.dp),
                                border = androidx.compose.foundation.BorderStroke(1.dp, if (isSelected) AccentCyan else BorderDark),
                                modifier = Modifier
                                    .clip(RoundedCornerShape(6.dp))
                                    .clickable {
                                        activeFileName = file.name
                                        fileContentEdit = file.content
                                    }
                            ) {
                                Text(
                                    text = file.name,
                                    color = if (isSelected) AccentCyan else TextSecondary,
                                    fontSize = 12.sp,
                                    fontFamily = FontFamily.Monospace,
                                    modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp)
                                )
                            }
                        }
                    }

                    // Code Editor box
                    Card(
                        colors = CardDefaults.cardColors(containerColor = SurfaceDark),
                        shape = RoundedCornerShape(10.dp),
                        border = androidx.compose.foundation.BorderStroke(1.dp, BorderDark),
                        modifier = Modifier.weight(1f)
                    ) {
                        Column(modifier = Modifier.padding(12.dp)) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(
                                    text = "$activeFileName (${currentFile?.language ?: "text"})",
                                    style = MaterialTheme.typography.labelSmall,
                                    color = TextMuted,
                                    fontFamily = FontFamily.Monospace
                                )
                                Button(
                                    onClick = {
                                        currentFile?.let {
                                            onSaveFile(it.name, fileContentEdit, it.language)
                                        }
                                    },
                                    colors = ButtonDefaults.buttonColors(containerColor = AccentEmerald),
                                    contentPadding = PaddingValues(horizontal = 10.dp, vertical = 4.dp),
                                    shape = RoundedCornerShape(6.dp)
                                ) {
                                    Icon(Icons.Default.Save, contentDescription = null, modifier = Modifier.size(14.dp))
                                    Spacer(modifier = Modifier.width(4.dp))
                                    Text("Save File", color = Color.Black, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                                }
                            }

                            Spacer(modifier = Modifier.height(8.dp))

                            OutlinedTextField(
                                value = fileContentEdit,
                                onValueChange = { fileContentEdit = it },
                                colors = OutlinedTextFieldDefaults.colors(
                                    focusedBorderColor = BorderDark,
                                    unfocusedBorderColor = BorderDark,
                                    focusedTextColor = TextPrimary,
                                    unfocusedTextColor = TextPrimary
                                ),
                                textStyle = androidx.compose.ui.text.TextStyle(
                                    fontFamily = FontFamily.Monospace,
                                    fontSize = 12.sp,
                                    lineHeight = 16.sp
                                ),
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .weight(1f)
                                    .testTag("code_editor_input")
                            )
                        }
                    }
                }
            }
            3 -> {
                // Notes & SRS Tab
                Column(modifier = Modifier.weight(1f)) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(bottom = 8.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "Engineering Notes & SRS Scratchpad",
                            style = MaterialTheme.typography.titleSmall,
                            color = TextSecondary
                        )
                        Button(
                            onClick = { onSaveNotes(notesContentEdit) },
                            colors = ButtonDefaults.buttonColors(containerColor = PrimaryIndigo),
                            contentPadding = PaddingValues(horizontal = 10.dp, vertical = 4.dp),
                            shape = RoundedCornerShape(6.dp)
                        ) {
                            Icon(Icons.Default.Check, contentDescription = null, modifier = Modifier.size(14.dp))
                            Spacer(modifier = Modifier.width(4.dp))
                            Text("Save Notes", fontSize = 11.sp)
                        }
                    }

                    OutlinedTextField(
                        value = notesContentEdit,
                        onValueChange = { notesContentEdit = it },
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = PrimaryIndigo,
                            unfocusedBorderColor = BorderDark,
                            focusedTextColor = TextPrimary,
                            unfocusedTextColor = TextPrimary
                        ),
                        textStyle = androidx.compose.ui.text.TextStyle(
                            fontSize = 13.sp,
                            lineHeight = 20.sp
                        ),
                        modifier = Modifier
                            .fillMaxWidth()
                            .weight(1f)
                            .testTag("notes_editor_input")
                    )
                }
            }
        }
    }

    // Add Task Dialog
    if (showAddTaskDialog) {
        AlertDialog(
            onDismissRequest = { showAddTaskDialog = false },
            title = { Text("Add Milestone Task") },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedTextField(
                        value = newTaskTitle,
                        onValueChange = { newTaskTitle = it },
                        label = { Text("Task Title") },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth()
                    )
                    OutlinedTextField(
                        value = newTaskMilestone,
                        onValueChange = { newTaskMilestone = it },
                        label = { Text("Milestone Tag (e.g. M2: Subsystems)") },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth()
                    )
                    OutlinedTextField(
                        value = newTaskDueDate,
                        onValueChange = { newTaskDueDate = it },
                        label = { Text("Due Date (YYYY-MM-DD)") },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth()
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        if (newTaskTitle.isNotBlank()) {
                            onAddTask(newTaskTitle, newTaskPriority, newTaskDueDate, newTaskMilestone)
                            newTaskTitle = ""
                            showAddTaskDialog = false
                        }
                    }
                ) {
                    Text("Add")
                }
            },
            dismissButton = {
                TextButton(onClick = { showAddTaskDialog = false }) {
                    Text("Cancel")
                }
            }
        )
    }
}
