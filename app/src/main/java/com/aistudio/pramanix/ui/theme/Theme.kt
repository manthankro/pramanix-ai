package com.aistudio.pramanix.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable

private val DarkColorScheme = darkColorScheme(
    primary = PrimaryIndigo,
    onPrimary = TextPrimary,
    primaryContainer = PrimaryIndigoVariant,
    onPrimaryContainer = TextPrimary,
    secondary = AccentCyan,
    onSecondary = BackgroundDark,
    secondaryContainer = SurfaceDarkElevated,
    onSecondaryContainer = AccentCyan,
    tertiary = AccentEmerald,
    background = BackgroundDark,
    onBackground = TextPrimary,
    surface = SurfaceDark,
    onSurface = TextPrimary,
    surfaceVariant = SurfaceDarkSubtle,
    onSurfaceVariant = TextSecondary,
    outline = BorderDark
)

@Composable
fun PramanixTheme(
    darkTheme: Boolean = true, // Default to sleek engineering dark mode
    content: @Composable () -> Unit
) {
    MaterialTheme(
        colorScheme = DarkColorScheme,
        typography = Typography,
        content = content
    )
}
