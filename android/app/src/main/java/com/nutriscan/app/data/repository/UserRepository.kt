package com.nutriscan.app.data.repository

import android.content.Context
import android.content.SharedPreferences
import com.nutriscan.app.data.model.ActivityLevel
import com.nutriscan.app.data.model.DietaryGoal
import com.nutriscan.app.data.model.Gender
import com.nutriscan.app.data.model.UserProfile
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

class UserRepository(context: Context) {

    private val prefs: SharedPreferences = context.getSharedPreferences("nutriscan_user_prefs", Context.MODE_PRIVATE)

    private val _userProfile = MutableStateFlow(loadProfile())
    val userProfile: StateFlow<UserProfile> = _userProfile.asStateFlow()

    private fun loadProfile(): UserProfile {
        val name = prefs.getString("name", "Health Explorer") ?: "Health Explorer"
        val age = prefs.getInt("age", 28)
        val weight = prefs.getFloat("weightKg", 70.0f).toDouble()
        val height = prefs.getFloat("heightCm", 175.0f).toDouble()
        val genderStr = prefs.getString("gender", Gender.NEUTRAL.name) ?: Gender.NEUTRAL.name
        val activityStr = prefs.getString("activityLevel", ActivityLevel.MODERATE.name) ?: ActivityLevel.MODERATE.name
        val goalStr = prefs.getString("dietaryGoal", DietaryGoal.MAINTAIN.name) ?: DietaryGoal.MAINTAIN.name
        val customCal = if (prefs.contains("customCalories")) prefs.getInt("customCalories", 2000) else null
        val audio = prefs.getBoolean("audioFeedback", true)
        val haptic = prefs.getBoolean("hapticFeedback", true)

        val gender = runCatching { Gender.valueOf(genderStr) }.getOrDefault(Gender.NEUTRAL)
        val activity = runCatching { ActivityLevel.valueOf(activityStr) }.getOrDefault(ActivityLevel.MODERATE)
        val goal = runCatching { DietaryGoal.valueOf(goalStr) }.getOrDefault(DietaryGoal.MAINTAIN)

        return UserProfile(
            name = name,
            age = age,
            weightKg = weight,
            heightCm = height,
            gender = gender,
            activityLevel = activity,
            dietaryGoal = goal,
            customCalories = customCal,
            audioFeedbackEnabled = audio,
            hapticFeedbackEnabled = haptic
        )
    }

    fun saveProfile(profile: UserProfile) {
        prefs.edit()
            .putString("name", profile.name)
            .putInt("age", profile.age)
            .putFloat("weightKg", profile.weightKg.toFloat())
            .putFloat("heightCm", profile.heightCm.toFloat())
            .putString("gender", profile.gender.name)
            .putString("activityLevel", profile.activityLevel.name)
            .putString("dietaryGoal", profile.dietaryGoal.name)
            .apply {
                if (profile.customCalories != null) {
                    putInt("customCalories", profile.customCalories)
                } else {
                    remove("customCalories")
                }
            }
            .putBoolean("audioFeedback", profile.audioFeedbackEnabled)
            .putBoolean("hapticFeedback", profile.hapticFeedbackEnabled)
            .apply()

        _userProfile.value = profile
    }
}
