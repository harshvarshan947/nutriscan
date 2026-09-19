# NutriScan Android - 100% Native Kotlin & Jetpack Compose

This folder contains the complete, standalone native Android application for **NutriScan**, built entirely with modern Android best practices:
- **Language**: Kotlin 2.1.0
- **UI Framework**: 100% Jetpack Compose (Material 3 Dark Theme)
- **Architecture**: Clean Architecture + MVVM + Repository Pattern
- **Barcode Scanning**: CameraX 1.4.1 + Google ML Kit Barcode Scanning 17.3.0
- **Local Persistence & Offline Cache**: Room Database 2.6.1 + SQLite
- **Networking**: Retrofit 2.11.0 + OkHttp 4.12.0 with multi-mirror failover (`world.openfoodfacts.net` & `world.openfoodfacts.org`)
- **Image Loading**: Coil Compose 2.7.0
- **Target SDK**: Android 15 (API 35), Min SDK: Android 7.0 (API 24)

---

## Features Mirroring the Web App

1. **Live Camera Barcode Scanner**:
   - Ultra-fast real-time camera viewfinder with animated reticle and laser indicator.
   - Powered by CameraX and Google ML Kit on-device neural model.
   - Haptic vibration and sound feedback on successful scan.
   - Torch/Flashlight toggle.
   - Manual barcode input dialog with standard 8, 12, and 13-digit validator.
   - Quick "Recently Scanned" carousel at the bottom of the scanner.

2. **Transparent Nutrition Quality Scoring (0–100)**:
   - Evaluates positive nutrients (Dietary Fiber, Protein, Healthy Fats).
   - Penalizes excess Free Sugars, Saturated Fat, and Sodium using standard reference guidelines.
   - Evaluates NOVA ultra-processing groups (1 to 4) and flags industrial formulations.
   - Highlights food additives with risk classification (Safe, Caution, High Risk).
   - Animated radial score gauge with color-coded quality tiers (Excellent, Good, Moderate, Low).

3. **Nutrition Facts & Dynamic Serving Toggle**:
   - Seamlessly switch between **Per 100g / 100ml** and **Per Serving**.
   - Portion size sanitizer prevents family-pack calorie distortions.
   - **Edit Values**: Easily adjust or correct calories, macros, or sodium to instantly recalculate the score.

4. **Product Search**:
   - Instant search with 350ms debounce against Open Food Facts.
   - Quick filter chips for popular items (*Oreo, Lays, Maggi, Greek Yogurt, Banana*).
   - Rich result cards displaying calorie density and quality rating badge.

5. **Daily Intake & Macro Tracking**:
   - Mifflin-St Jeor TDEE & BMR energy calculator.
   - Dynamic calorie budget bar with remaining calories count.
   - Macronutrient distribution tracking (Protein, Carbs, Fat).
   - Log meals by category (Breakfast, Lunch, Dinner, Snack) with serving multiplier.
   - Swipe or tap to delete logged items.

6. **Favorites & Offline Cache**:
   - Star any food to save to your local offline library.
   - All scanned and searched products are cached in Room SQLite for instant offline access.

---

## How to Open and Run in Android Studio

1. **Open Android Studio**.
2. Click **File -> Open...** (or select "Open" from the welcome window).
3. Select the folder:  
   `C:\antigravity project\food_test\android`
4. Android Studio will automatically recognize the Gradle project, sync dependencies, and index the source files.
5. Connect an Android phone via USB (with Developer Options and USB Debugging enabled) or start an Android Virtual Device (Emulator).
6. Click the green **Run ▶** button (or press `Shift + F10`) to install and launch NutriScan on your device.

---

## Project Structure

```
android/
├── app/
│   ├── build.gradle.kts          # App dependencies (Compose, CameraX, ML Kit, Room, Retrofit)
│   ├── proguard-rules.pro
│   └── src/main/
│       ├── AndroidManifest.xml   # Camera, Internet, Vibrate permissions
│       ├── java/com/nutriscan/app/
│       │   ├── NutriScanApplication.kt
│       │   ├── data/
│       │   │   ├── model/        # Product, Nutrients, FoodAdditive, MealLog, UserProfile
│       │   │   ├── local/        # NutriScanDatabase, Room TypeConverters, ProductDao, MealLogDao
│       │   │   ├── remote/       # OpenFoodFactsApi, ApiClient (multi-mirror failover), DTOs
│       │   │   └── repository/   # ProductRepository, TrackingRepository, UserRepository
│       │   ├── domain/
│       │   │   ├── assessment/   # QualityScoreEngine (0-100 score, factors, ratings)
│       │   │   ├── normalizer/   # NutrientNormalizer (Atwater checks, portion sanitizing)
│       │   │   └── calculator/   # TdeeCalculator (Mifflin-St Jeor)
│       │   └── ui/
│       │       ├── MainActivity.kt
│       │       ├── theme/        # Emerald brand colors, Typography, Material3 Theme
│       │       ├── navigation/   # Screen routes, BottomNavBar
│       │       ├── components/   # ScoreGauge, NutrientCard, NutritionGrid, FactorPill, MacroProgressBar, BarcodeScannerView
│       │       ├── scanner/      # CameraScannerScreen, ScannerViewModel
│       │       ├── product/      # ProductDetailsScreen, ProductDetailsViewModel, EditNutritionDialog
│       │       ├── search/       # ProductSearchScreen, SearchViewModel
│       │       ├── tracking/     # DailyIntakeScreen, TrackingViewModel, LogMealDialog
│       │       ├── favorites/    # FavoritesScreen, FavoritesViewModel
│       │       └── profile/      # ProfileScreen, ProfileViewModel
│       └── res/
│           ├── values/           # strings.xml, colors.xml, themes.xml
│           └── xml/              # data_extraction_rules.xml, backup_rules.xml
├── build.gradle.kts              # Project Gradle configuration
├── settings.gradle.kts           # Module definitions
└── gradlew.bat                   # Gradle wrapper script for Windows
```
