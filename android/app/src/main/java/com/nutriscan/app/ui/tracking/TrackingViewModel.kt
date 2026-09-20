package com.nutriscan.app.ui.tracking

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.nutriscan.app.data.model.MealLog
import com.nutriscan.app.data.model.MealType
import com.nutriscan.app.data.model.UserProfile
import com.nutriscan.app.data.repository.TrackingRepository
import com.nutriscan.app.data.repository.UserRepository
import com.nutriscan.app.domain.calculator.DailyNutritionTargets
import com.nutriscan.app.domain.calculator.TdeeCalculator
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.flatMapLatest
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

data class DailyTotals(
    val calories: Int = 0,
    val protein: Double = 0.0,
    val carbs: Double = 0.0,
    val fat: Double = 0.0
)

class TrackingViewModel(
    private val trackingRepository: TrackingRepository,
    private val userRepository: UserRepository
) : ViewModel() {

    private val _selectedDate = MutableStateFlow(trackingRepository.todayDateString)
    val selectedDate: StateFlow<String> = _selectedDate.asStateFlow()

    val userProfile: StateFlow<UserProfile> = userRepository.userProfile

    val dailyTargets: StateFlow<DailyNutritionTargets> = userProfile.map { profile ->
        TdeeCalculator.calculate(profile)
    }.stateIn(
        viewModelScope,
        SharingStarted.WhileSubscribed(5000),
        TdeeCalculator.calculate(userProfile.value)
    )

    @OptIn(kotlinx.coroutines.ExperimentalCoroutinesApi::class)
    val logs: StateFlow<List<MealLog>> = _selectedDate.flatMapLatest { date ->
        trackingRepository.getLogsForDate(date)
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val totals: StateFlow<DailyTotals> = logs.map { list ->
        var cal = 0.0
        var p = 0.0
        var c = 0.0
        var f = 0.0
        for (item in list) {
            cal += item.calories
            p += item.protein
            c += item.carbs
            f += item.fat
        }
        DailyTotals(
            calories = cal.toInt(),
            protein = p,
            carbs = c,
            fat = f
        )
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), DailyTotals())

    fun deleteLog(id: Long) {
        viewModelScope.launch {
            trackingRepository.deleteMealLog(id)
        }
    }

    fun clearAllLogs() {
        viewModelScope.launch {
            trackingRepository.clearAll()
        }
    }
}

class TrackingViewModelFactory(
    private val trackingRepository: TrackingRepository,
    private val userRepository: UserRepository
) : ViewModelProvider.Factory {
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        if (modelClass.isAssignableFrom(TrackingViewModel::class.java)) {
            @Suppress("UNCHECKED_CAST")
            return TrackingViewModel(trackingRepository, userRepository) as T
        }
        throw IllegalArgumentException("Unknown ViewModel class")
    }
}
