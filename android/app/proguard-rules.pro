# Proguard rules for NutriScan

# Keep Room database and DAO classes
-keep class * extends androidx.room.RoomDatabase
-keep class * extends androidx.room.Dao
-dontwarn androidx.room.paging.**

# Keep Gson models and DTOs
-keepclassmembers class com.nutriscan.app.data.remote.dto.** { <fields>; }
-keepclassmembers class com.nutriscan.app.data.model.** { <fields>; }

# Retrofit
-dontnote retrofit2.Platform
-dontwarn retrofit2.Platform$Java8
-keepattributes Signature, InnerClasses, EnclosingMethod
-keepattributes RuntimeVisibleAnnotations, RuntimeVisibleParameterAnnotations

# ML Kit Barcode
-keep class com.google.mlkit.vision.barcode.** { *; }
-dontwarn com.google.mlkit.vision.barcode.**
