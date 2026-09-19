package com.nutriscan.app.data.local

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import androidx.room.TypeConverters
import com.nutriscan.app.data.local.dao.MealLogDao
import com.nutriscan.app.data.local.dao.ProductDao
import com.nutriscan.app.data.model.MealLog
import com.nutriscan.app.data.model.Product

@Database(
    entities = [Product::class, MealLog::class],
    version = 1,
    exportSchema = false
)
@TypeConverters(Converters::class)
abstract class NutriScanDatabase : RoomDatabase() {

    abstract fun productDao(): ProductDao
    abstract fun mealLogDao(): MealLogDao

    companion object {
        @Volatile
        private var INSTANCE: NutriScanDatabase? = null

        fun getInstance(context: Context): NutriScanDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    NutriScanDatabase::class.java,
                    "nutriscan_db"
                )
                    .fallbackToDestructiveMigration()
                    .build()
                INSTANCE = instance
                instance
            }
        }
    }
}
