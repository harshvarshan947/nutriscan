package com.nutriscan.app.data.local.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import com.nutriscan.app.data.model.MealLog
import kotlinx.coroutines.flow.Flow

@Dao
interface MealLogDao {

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertMealLog(log: MealLog): Long

    @Query("DELETE FROM meal_logs WHERE id = :id")
    suspend fun deleteMealLog(id: Long)

    @Query("SELECT * FROM meal_logs WHERE loggedDate = :date ORDER BY timestamp ASC")
    fun getLogsForDate(date: String): Flow<List<MealLog>>

    @Query("SELECT * FROM meal_logs WHERE loggedDate = :date ORDER BY timestamp ASC")
    suspend fun getLogsForDateSync(date: String): List<MealLog>

    @Query("SELECT * FROM meal_logs WHERE loggedDate BETWEEN :startDate AND :endDate ORDER BY timestamp ASC")
    fun getLogsBetweenDates(startDate: String, endDate: String): Flow<List<MealLog>>

    @Query("DELETE FROM meal_logs")
    suspend fun clearAllLogs()
}
