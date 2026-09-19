package com.nutriscan.app.ui

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.nutriscan.app.NutriScanApplication
import com.nutriscan.app.ui.favorites.FavoritesScreen
import com.nutriscan.app.ui.favorites.FavoritesViewModel
import com.nutriscan.app.ui.favorites.FavoritesViewModelFactory
import com.nutriscan.app.ui.navigation.NutriScanBottomBar
import com.nutriscan.app.ui.navigation.Screen
import com.nutriscan.app.ui.product.ProductDetailsScreen
import com.nutriscan.app.ui.product.ProductDetailsViewModel
import com.nutriscan.app.ui.product.ProductDetailsViewModelFactory
import com.nutriscan.app.ui.profile.ProfileScreen
import com.nutriscan.app.ui.profile.ProfileViewModel
import com.nutriscan.app.ui.profile.ProfileViewModelFactory
import com.nutriscan.app.ui.scanner.CameraScannerScreen
import com.nutriscan.app.ui.scanner.ScannerViewModel
import com.nutriscan.app.ui.scanner.ScannerViewModelFactory
import com.nutriscan.app.ui.search.ProductSearchScreen
import com.nutriscan.app.ui.search.SearchViewModel
import com.nutriscan.app.ui.search.SearchViewModelFactory
import com.nutriscan.app.ui.theme.DarkBackground
import com.nutriscan.app.ui.theme.NutriScanTheme
import com.nutriscan.app.ui.tracking.DailyIntakeScreen
import com.nutriscan.app.ui.tracking.TrackingViewModel
import com.nutriscan.app.ui.tracking.TrackingViewModelFactory

class MainActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        val app = application as NutriScanApplication
        val productRepo = app.productRepository
        val trackingRepo = app.trackingRepository
        val userRepo = app.userRepository

        setContent {
            NutriScanTheme {
                val navController = rememberNavController()
                val navBackStackEntry by navController.currentBackStackEntryAsState()
                val currentRoute = navBackStackEntry?.destination?.route

                val isProductDetails = currentRoute?.startsWith("product/") == true

                Scaffold(
                    modifier = Modifier.fillMaxSize(),
                    containerColor = DarkBackground,
                    bottomBar = {
                        if (!isProductDetails) {
                            NutriScanBottomBar(navController = navController)
                        }
                    }
                ) { innerPadding ->
                    NavHost(
                        navController = navController,
                        startDestination = Screen.Scanner.route,
                        modifier = Modifier.padding(innerPadding)
                    ) {
                        // 1. Camera Barcode Scanner
                        composable(Screen.Scanner.route) {
                            val viewModel: ScannerViewModel = viewModel(
                                factory = ScannerViewModelFactory(productRepo)
                            )
                            CameraScannerScreen(
                                viewModel = viewModel,
                                onNavigateToProduct = { barcode ->
                                    navController.navigate(Screen.ProductDetails.createRoute(barcode))
                                }
                            )
                        }

                        // 2. Product Search
                        composable(Screen.Search.route) {
                            val viewModel: SearchViewModel = viewModel(
                                factory = SearchViewModelFactory(productRepo)
                            )
                            ProductSearchScreen(
                                viewModel = viewModel,
                                onNavigateToProduct = { barcode ->
                                    navController.navigate(Screen.ProductDetails.createRoute(barcode))
                                }
                            )
                        }

                        // 3. Daily Intake Tracking
                        composable(Screen.Tracking.route) {
                            val viewModel: TrackingViewModel = viewModel(
                                factory = TrackingViewModelFactory(trackingRepo, userRepo)
                            )
                            DailyIntakeScreen(
                                viewModel = viewModel,
                                onNavigateToScan = {
                                    navController.navigate(Screen.Scanner.route)
                                },
                                onNavigateToProduct = { barcode ->
                                    navController.navigate(Screen.ProductDetails.createRoute(barcode))
                                }
                            )
                        }

                        // 4. Saved Favorites
                        composable(Screen.Favorites.route) {
                            val viewModel: FavoritesViewModel = viewModel(
                                factory = FavoritesViewModelFactory(productRepo)
                            )
                            FavoritesScreen(
                                viewModel = viewModel,
                                onNavigateToProduct = { barcode ->
                                    navController.navigate(Screen.ProductDetails.createRoute(barcode))
                                },
                                onNavigateToScan = {
                                    navController.navigate(Screen.Scanner.route)
                                }
                            )
                        }

                        // 5. User Profile & TDEE
                        composable(Screen.Profile.route) {
                            val viewModel: ProfileViewModel = viewModel(
                                factory = ProfileViewModelFactory(userRepo)
                            )
                            ProfileScreen(viewModel = viewModel)
                        }

                        // 6. Product Details
                        composable(
                            route = Screen.ProductDetails.route,
                            arguments = listOf(navArgument("barcode") { type = NavType.StringType })
                        ) { backStackEntry ->
                            val barcode = backStackEntry.arguments?.getString("barcode") ?: ""
                            val viewModel: ProductDetailsViewModel = viewModel(
                                factory = ProductDetailsViewModelFactory(barcode, productRepo, trackingRepo)
                            )
                            ProductDetailsScreen(
                                viewModel = viewModel,
                                onNavigateBack = { navController.popBackStack() }
                            )
                        }
                    }
                }
            }
        }
    }
}
