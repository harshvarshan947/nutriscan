package com.nutriscan.app.data.model

import androidx.room.Entity
import androidx.room.PrimaryKey

enum class MealType {
    BREAKFAST,
    LUNCH,
    DINNER,
    SNACK
}

@Entity(tableName = "meal_logs")
data class MealLog(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val barcode: String,
    val productName: String,
    val brand: String = "",
    val mealType: MealType = MealType.SNACK,
    val servings: Double = 1.0,
    val calories: Double = 0.0,
    val protein: Double = 0.0,
    val carbs: Double = 0.0,
    val fat: Double = 0.0,
    val loggedDate: String, // "YYYY-MM-DD"
    val timestamp: Long = System.currentTimeMillis()
)
