package com.nutriscan.app.ui.navigation

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.DateRange
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.QrCodeScanner
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Star
import androidx.compose.ui.graphics.vector.ImageVector

sealed class Screen(val route: String, val title: String, val icon: ImageVector? = null) {
    object Scanner : Screen("scanner", "Scan", Icons.Default.QrCodeScanner)
    object Search : Screen("search", "Search", Icons.Default.Search)
    object Tracking : Screen("tracking", "Tracking", Icons.Default.DateRange)
    object Favorites : Screen("favorites", "Favorites", Icons.Default.Star)
    object Profile : Screen("profile", "Profile", Icons.Default.Person)

    object ProductDetails : Screen("product/{barcode}", "Product Details") {
        fun createRoute(barcode: String) = "product/$barcode"
    }

    companion object {
        val bottomNavItems = listOf(Scanner, Search, Tracking, Favorites, Profile)
    }
}
