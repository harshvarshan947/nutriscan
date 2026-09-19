package com.nutriscan.app.data.repository

import com.nutriscan.app.data.local.dao.MealLogDao
import com.nutriscan.app.data.model.MealLog
import com.nutriscan.app.data.model.MealType
import com.nutriscan.app.data.model.Product
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.withContext
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import kotlin.math.roundToInt

class TrackingRepository(
    private val mealLogDao: MealLogDao
) {

    val todayDateString: String
        get() = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(Date())

    fun getLogsForDate(date: String = todayDateString): Flow<List<MealLog>> {
        return mealLogDao.getLogsForDate(date)
    }

    suspend fun logMeal(
        product: Product,
        mealType: MealType,
        servings: Double = 1.0,
        useServingBasis: Boolean = true,
        date: String = todayDateString
    ): Long = withContext(Dispatchers.IO) {
        val nutrients = if (useServingBasis && product.nutrientsServing != null) {
            product.nutrientsServing
        } else {
            product.nutrients100g
        }

        val mealLog = MealLog(
            barcode = product.barcode,
            productName = product.name,
            brand = product.brand,
            mealType = mealType,
            servings = servings,
            calories = ((nutrients.calories * servings) * 10).roundToInt() / 10.0,
            protein = ((nutrients.protein * servings) * 10).roundToInt() / 10.0,
            carbs = ((nutrients.carbohydrates * servings) * 10).roundToInt() / 10.0,
            fat = ((nutrients.fat * servings) * 10).roundToInt() / 10.0,
            loggedDate = date,
            timestamp = System.currentTimeMillis()
        )

        mealLogDao.insertMealLog(mealLog)
    }

    suspend fun deleteMealLog(id: Long) = withContext(Dispatchers.IO) {
        mealLogDao.deleteMealLog(id)
    }

    suspend fun clearAll() = withContext(Dispatchers.IO) {
        mealLogDao.clearAllLogs()
    }
}
