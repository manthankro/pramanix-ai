package com.aistudio.pramanix.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.aistudio.pramanix.data.model.ModuleId
import com.aistudio.pramanix.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PramanixHeader(
    currentModule: ModuleId,
    activeProjectName: String?,
    onOpenNav: () -> Unit,
    onDownloadZip: () -> Unit,
    modifier: Modifier = Modifier
) {
    TopAppBar(
        title = {
            Column {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .size(24.dp)
                            .clip(RoundedCornerShape(6.dp))
                            .background(PrimaryIndigo),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = "P",
                            fontWeight = FontWeight.Bold,
                            color = Color.White,
                            fontSize = 14.sp
                        )
                    }
                    Text(
                        text = currentModule.displayName,
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        color = TextPrimary
                    )
                }
                if (!activeProjectName.isNullOrBlank()) {
                    Text(
                        text = "Project: $activeProjectName",
                        style = MaterialTheme.typography.bodyMedium,
                        color = AccentCyan,
                        fontSize = 11.sp
                    )
                }
            }
        },
        navigationIcon = {
            IconButton(
                onClick = onOpenNav,
                modifier = Modifier.testTag("nav_menu_button")
            ) {
                Icon(
                    imageVector = Icons.Default.Menu,
                    contentDescription = "Open Navigation Menu",
                    tint = TextPrimary
                )
            }
        },
        actions = {
            // 1-Click ZIP Download button
            FilledTonalButton(
                onClick = onDownloadZip,
                colors = ButtonDefaults.filledTonalButtonColors(
                    containerColor = SurfaceDarkSubtle,
                    contentColor = AccentEmerald
                ),
                contentPadding = PaddingValues(horizontal = 10.dp, vertical = 6.dp),
                shape = RoundedCornerShape(8.dp),
                modifier = Modifier
                    .padding(end = 8.dp)
                    .testTag("download_zip_button")
            ) {
                Icon(
                    imageVector = Icons.Default.Download,
                    contentDescription = "Download Project ZIP",
                    modifier = Modifier.size(16.dp)
                )
                Spacer(modifier = Modifier.width(4.dp))
                Text("ZIP", fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
            }
        },
        colors = TopAppBarDefaults.topAppBarColors(
            containerColor = SurfaceDark,
            titleContentColor = TextPrimary
        ),
        modifier = modifier
    )
}
