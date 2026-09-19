package com.nutriscan.app.data.model

import com.google.gson.annotations.SerializedName

enum class AdditiveRisk {
    SAFE,
    CAUTION,
    HIGH_RISK,
    UNKNOWN
}

data class FoodAdditive(
    @SerializedName("id")
    val id: String,

    @SerializedName("name")
    val name: String,

    @SerializedName("riskLevel")
    val riskLevel: AdditiveRisk = AdditiveRisk.UNKNOWN,

    @SerializedName("function")
    val function: String? = null,

    @SerializedName("description")
    val description: String? = null
)
