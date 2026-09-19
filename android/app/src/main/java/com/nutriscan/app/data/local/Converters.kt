package com.nutriscan.app.data.local

import androidx.room.TypeConverter
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import com.nutriscan.app.data.model.FoodAdditive
import com.nutriscan.app.data.model.MealType
import com.nutriscan.app.data.model.Nutrients

class Converters {
    private val gson = Gson()

    @TypeConverter
    fun fromNutrients(nutrients: Nutrients?): String? {
        return nutrients?.let { gson.toJson(it) }
    }

    @TypeConverter
    fun toNutrients(json: String?): Nutrients? {
        return json?.let { gson.fromJson(it, Nutrients::class.java) }
    }

    @TypeConverter
    fun fromStringList(list: List<String>?): String? {
        return list?.let { gson.toJson(it) }
    }

    @TypeConverter
    fun toStringList(json: String?): List<String> {
        if (json.isNullOrEmpty()) return emptyList()
        val type = object : TypeToken<List<String>>() {}.type
        return gson.fromJson(json, type) ?: emptyList()
    }

    @TypeConverter
    fun fromAdditiveList(list: List<FoodAdditive>?): String? {
        return list?.let { gson.toJson(it) }
    }

    @TypeConverter
    fun toAdditiveList(json: String?): List<FoodAdditive> {
        if (json.isNullOrEmpty()) return emptyList()
        val type = object : TypeToken<List<FoodAdditive>>() {}.type
        return gson.fromJson(json, type) ?: emptyList()
    }

    @TypeConverter
    fun fromMealType(type: MealType): String {
        return type.name
    }

    @TypeConverter
    fun toMealType(name: String): MealType {
        return runCatching { MealType.valueOf(name) }.getOrDefault(MealType.SNACK)
    }
}
