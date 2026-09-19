package com.nutriscan.app.data.model

import com.google.gson.annotations.SerializedName

data class Nutrients(
    @SerializedName("calories")
    val calories: Double = 0.0,

    @SerializedName("protein")
    val protein: Double = 0.0,

    @SerializedName("carbohydrates")
    val carbohydrates: Double = 0.0,

    @SerializedName("sugars")
    val sugars: Double = 0.0,

    @SerializedName("addedSugars")
    val addedSugars: Double? = null,

    @SerializedName("fat")
    val fat: Double = 0.0,

    @SerializedName("saturatedFat")
    val saturatedFat: Double = 0.0,

    @SerializedName("fiber")
    val fiber: Double = 0.0,

    @SerializedName("sodium")
    val sodium: Double = 0.0, // in mg

    @SerializedName("salt")
    val salt: Double = 0.0 // in grams
)
