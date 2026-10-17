package com.aistudio.pramanix.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.aistudio.pramanix.data.model.ModuleId
import com.aistudio.pramanix.ui.theme.*

fun getModuleIcon(module: ModuleId): ImageVector {
    return when (module) {
        ModuleId.GITHUB -> Icons.Default.Source
        ModuleId.BUILDER -> Icons.Default.Build
        ModuleId.WORKSPACE -> Icons.Default.Dashboard
        ModuleId.TUTOR -> Icons.Default.School
        ModuleId.VIVA -> Icons.Default.RecordVoiceOver
        ModuleId.CODING -> Icons.Default.Code
        ModuleId.NOTES -> Icons.Default.Description
        ModuleId.RESEARCH -> Icons.Default.Article
        ModuleId.CAREER -> Icons.Default.Work
        ModuleId.CHAT -> Icons.Default.Chat
    }
}

@Composable
fun PramanixDrawerContent(
    currentModule: ModuleId,
    onSelectModule: (ModuleId) -> Unit,
    activeProjectName: String?,
    modifier: Modifier = Modifier
) {
    ModalDrawerSheet(
        drawerContainerColor = BackgroundDark,
        drawerContentColor = TextPrimary,
        modifier = modifier.widthIn(max = 320.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp)
        ) {
            // Header
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(bottom = 16.dp)
            ) {
                Box(
                    modifier = Modifier
                        .size(38.dp)
                        .clip(RoundedCornerShape(8.dp))
                        .background(PrimaryIndigo),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "PX",
                        fontWeight = FontWeight.Black,
                        color = Color.White,
                        fontSize = 16.sp
                    )
                }
                Spacer(modifier = Modifier.width(12.dp))
                Column {
                    Text(
                        text = "Pramanix",
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.Bold,
                        color = TextPrimary
                    )
                    Text(
                        text = "AI Engineering Mentor",
                        style = MaterialTheme.typography.bodyMedium,
                        color = AccentCyan,
                        fontSize = 12.sp
                    )
                }
            }

            HorizontalDivider(color = BorderDark, thickness = 1.dp)

            Spacer(modifier = Modifier.height(12.dp))

            // Connected repo badge
            Surface(
                color = SurfaceDark,
                shape = RoundedCornerShape(8.dp),
                border = androidx.compose.foundation.BorderStroke(1.dp, BorderDark),
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier.padding(10.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        imageVector = Icons.Default.Link,
                        contentDescription = "Repo link",
                        tint = AccentCyan,
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Column {
                        Text(
                            text = "Connected Repository",
                            style = MaterialTheme.typography.labelSmall,
                            color = TextMuted
                        )
                        Text(
                            text = "manthankro/pramanix-ai-",
                            style = MaterialTheme.typography.bodyMedium,
                            fontWeight = FontWeight.SemiBold,
                            color = TextPrimary,
                            fontSize = 12.sp
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            Text(
                text = "MODULES & WORKSPACES",
                style = MaterialTheme.typography.labelSmall,
                color = TextMuted,
                fontWeight = FontWeight.Bold,
                modifier = Modifier.padding(start = 4.dp, bottom = 8.dp)
            )

            // Module Navigation Items
            LazyColumn(
                verticalArrangement = Arrangement.spacedBy(4.dp),
                modifier = Modifier.weight(1f)
            ) {
                items(ModuleId.values()) { module ->
                    val isSelected = module == currentModule
                    Surface(
                        color = if (isSelected) SurfaceDarkElevated else Color.Transparent,
                        shape = RoundedCornerShape(8.dp),
                        border = if (isSelected) androidx.compose.foundation.BorderStroke(1.dp, PrimaryIndigo) else null,
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(8.dp))
                            .clickable { onSelectModule(module) }
                            .testTag("nav_${module.name.lowercase()}")
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier.padding(horizontal = 12.dp, vertical = 10.dp)
                        ) {
                            Icon(
                                imageVector = getModuleIcon(module),
                                contentDescription = module.displayName,
                                tint = if (isSelected) AccentCyan else TextSecondary,
                                modifier = Modifier.size(20.dp)
                            )
                            Spacer(modifier = Modifier.width(12.dp))
                            Column(modifier = Modifier.weight(1f)) {
                                Text(
                                    text = module.displayName,
                                    style = MaterialTheme.typography.bodyLarge,
                                    fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                                    color = if (isSelected) TextPrimary else TextSecondary,
                                    fontSize = 14.sp
                                )
                                Text(
                                    text = module.category,
                                    style = MaterialTheme.typography.labelSmall,
                                    color = TextMuted,
                                    fontSize = 10.sp
                                )
                            }
                            if (isSelected) {
                                Box(
                                    modifier = Modifier
                                        .size(6.dp)
                                        .clip(RoundedCornerShape(3.dp))
                                        .background(AccentCyan)
                                )
                            }
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(8.dp))
            HorizontalDivider(color = BorderDark, thickness = 1.dp)
            Spacer(modifier = Modifier.height(8.dp))

            Text(
                text = "Pramanix v1.0.0 • Python + Kotlin Jetpack Compose",
                style = MaterialTheme.typography.labelSmall,
                color = TextMuted,
                fontSize = 10.sp
            )
        }
    }
}
