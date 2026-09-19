package com.nutriscan.app.data.model

import androidx.room.Entity
import androidx.room.PrimaryKey
import com.google.gson.annotations.SerializedName

@Entity(tableName = "products")
data class Product(
    @PrimaryKey
    @SerializedName("barcode")
    val barcode: String,

    @SerializedName("name")
    val name: String,

    @SerializedName("brand")
    val brand: String = "",

    @SerializedName("imageUrl")
    val imageUrl: String? = null,

    @SerializedName("servingSize")
    val servingSize: String = "100 g",

    @SerializedName("servingQuantityGrams")
    val servingQuantityGrams: Double? = null,

    @SerializedName("nutrients100g")
    val nutrients100g: Nutrients = Nutrients(),

    @SerializedName("nutrientsServing")
    val nutrientsServing: Nutrients? = null,

    @SerializedName("ingredientsText")
    val ingredientsText: String? = null,

    @SerializedName("ingredientsList")
    val ingredientsList: List<String> = emptyList(),

    @SerializedName("allergens")
    val allergens: List<String> = emptyList(),

    @SerializedName("additives")
    val additives: List<FoodAdditive> = emptyList(),

    @SerializedName("novaGroup")
    val novaGroup: Int? = null, // 1 to 4

    @SerializedName("nutriScore")
    val nutriScore: String? = null, // "a", "b", "c", "d", "e"

    @SerializedName("categories")
    val categories: List<String> = emptyList(),

    @SerializedName("isComplete")
    val isComplete: Boolean = true,

    @SerializedName("isFavorite")
    val isFavorite: Boolean = false,

    @SerializedName("lastScannedAt")
    val lastScannedAt: Long = System.currentTimeMillis(),

    @SerializedName("qualityScore")
    val qualityScore: Int = 80
)
