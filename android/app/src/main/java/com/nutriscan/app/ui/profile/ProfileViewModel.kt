package com.nutriscan.app.ui.profile

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.nutriscan.app.data.model.ActivityLevel
import com.nutriscan.app.data.model.DietaryGoal
import com.nutriscan.app.data.model.Gender
import com.nutriscan.app.data.model.UserProfile
import com.nutriscan.app.data.repository.UserRepository
import com.nutriscan.app.domain.calculator.DailyNutritionTargets
import com.nutriscan.app.domain.calculator.TdeeCalculator
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.stateIn

class ProfileViewModel(
    private val userRepository: UserRepository
) : ViewModel() {

    val userProfile: StateFlow<UserProfile> = userRepository.userProfile

    val targets: StateFlow<DailyNutritionTargets> = userProfile.map { profile ->
        TdeeCalculator.calculate(profile)
    }.stateIn(
        viewModelScope,
        SharingStarted.WhileSubscribed(5000),
        TdeeCalculator.calculate(userProfile.value)
    )

    private val _savedSuccess = MutableStateFlow(false)
    val savedSuccess: StateFlow<Boolean> = _savedSuccess.asStateFlow()

    fun updateProfile(
        name: String,
        age: Int,
        weightKg: Double,
        heightCm: Double,
        gender: Gender,
        activityLevel: ActivityLevel,
        dietaryGoal: DietaryGoal,
        audioFeedback: Boolean,
        hapticFeedback: Boolean
    ) {
        val updated = UserProfile(
            name = name,
            age = age,
            weightKg = weightKg,
            heightCm = heightCm,
            gender = gender,
            activityLevel = activityLevel,
            dietaryGoal = dietaryGoal,
            audioFeedbackEnabled = audioFeedback,
            hapticFeedbackEnabled = hapticFeedback
        )
        userRepository.saveProfile(updated)
        _savedSuccess.value = true
    }

    fun clearSavedSuccess() {
        _savedSuccess.value = false
    }
}

class ProfileViewModelFactory(
    private val userRepository: UserRepository
) : ViewModelProvider.Factory {
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        if (modelClass.isAssignableFrom(ProfileViewModel::class.java)) {
            @Suppress("UNCHECKED_CAST")
            return ProfileViewModel(userRepository) as T
        }
        throw IllegalArgumentException("Unknown ViewModel class")
    }
}
