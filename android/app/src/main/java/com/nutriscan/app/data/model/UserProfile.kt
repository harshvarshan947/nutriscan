package com.nutriscan.app.data.model

enum class DietaryGoal {
    MAINTAIN,
    FAT_LOSS,
    MUSCLE_GAIN,
    LOW_SODIUM,
    LOW_SUGAR
}

enum class ActivityLevel {
    SEDENTARY,
    LIGHT,
    MODERATE,
    VERY_ACTIVE,
    EXTRA_ACTIVE
}

enum class Gender {
    MALE,
    FEMALE,
    NEUTRAL
}

data class UserProfile(
    val name: String = "User",
    val age: Int = 28,
    val weightKg: Double = 70.0,
    val heightCm: Double = 175.0,
    val gender: Gender = Gender.NEUTRAL,
    val activityLevel: ActivityLevel = ActivityLevel.MODERATE,
    val dietaryGoal: DietaryGoal = DietaryGoal.MAINTAIN,
    val customCalories: Int? = null,
    val audioFeedbackEnabled: Boolean = true,
    val hapticFeedbackEnabled: Boolean = true
)
