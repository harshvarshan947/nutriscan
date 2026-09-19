package com.nutriscan.app.domain.calculator

import com.nutriscan.app.data.model.ActivityLevel
import com.nutriscan.app.data.model.DietaryGoal
import com.nutriscan.app.data.model.Gender
import com.nutriscan.app.data.model.UserProfile
import kotlin.math.max
import kotlin.math.roundToInt

data class DailyNutritionTargets(
    val bmr: Int,
    val tdee: Int,
    val calories: Int,
    val proteinGrams: Int,
    val carbsGrams: Int,
    val fatGrams: Int,
    val sugarMaxGrams: Int,
    val fiberGrams: Int,
    val sodiumMg: Int
)

object TdeeCalculator {

    fun calculate(profile: UserProfile): DailyNutritionTargets {
        // 1. Mifflin-St Jeor BMR
        var bmr = 10.0 * profile.weightKg + 6.25 * profile.heightCm - 5.0 * profile.age
        when (profile.gender) {
            Gender.MALE -> bmr += 5.0
            Gender.FEMALE -> bmr -= 161.0
            Gender.NEUTRAL -> bmr -= 78.0
        }

        // 2. Activity Multiplier
        val multiplier = when (profile.activityLevel) {
            ActivityLevel.SEDENTARY -> 1.2
            ActivityLevel.LIGHT -> 1.375
            ActivityLevel.MODERATE -> 1.55
            ActivityLevel.VERY_ACTIVE -> 1.725
            ActivityLevel.EXTRA_ACTIVE -> 1.9
        }

        val tdee = (bmr * multiplier).roundToInt()

        // 3. Goal Calorie Adjustment
        var targetCalories = profile.customCalories ?: tdee
        var proteinRatio = 0.20
        var fatRatio = 0.28
        var carbRatio = 0.52
        var maxSugar = 50
        var targetSodium = 2000

        if (profile.customCalories == null) {
            when (profile.dietaryGoal) {
                DietaryGoal.FAT_LOSS -> {
                    targetCalories = max(1200, tdee - 450)
                    proteinRatio = 0.28
                    fatRatio = 0.27
                    carbRatio = 0.45
                    maxSugar = 35
                }
                DietaryGoal.MUSCLE_GAIN -> {
                    targetCalories = tdee + 350
                    proteinRatio = 0.25
                    fatRatio = 0.25
                    carbRatio = 0.50
                }
                DietaryGoal.LOW_SODIUM -> {
                    targetCalories = tdee
                    targetSodium = 1500
                }
                DietaryGoal.LOW_SUGAR -> {
                    targetCalories = tdee
                    maxSugar = 25
                }
                DietaryGoal.MAINTAIN -> {
                    targetCalories = tdee
                }
            }
        }

        // Gram targets
        val targetProtein = ((targetCalories * proteinRatio) / 4.0).roundToInt()
        val targetFat = ((targetCalories * fatRatio) / 9.0).roundToInt()
        val targetCarbs = ((targetCalories * carbRatio) / 4.0).roundToInt()
        val targetFiber = max(25, ((targetCalories / 1000.0) * 14.0).roundToInt())

        return DailyNutritionTargets(
            bmr = bmr.roundToInt(),
            tdee = tdee,
            calories = targetCalories,
            proteinGrams = targetProtein,
            carbsGrams = targetCarbs,
            fatGrams = targetFat,
            sugarMaxGrams = maxSugar,
            fiberGrams = targetFiber,
            sodiumMg = targetSodium
        )
    }
}
