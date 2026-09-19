package com.nutriscan.app.data.model

enum class QualityTier {
    EXCELLENT,
    GOOD,
    MODERATE,
    LOW
}

enum class FactorType {
    POSITIVE,
    CAUTION,
    WARNING
}

data class AssessmentFactor(
    val id: String,
    val type: FactorType,
    val title: String,
    val description: String,
    val metric: String? = null
)

data class NutrientRating(
    val nutrientKey: String,
    val label: String,
    val valuePer100g: Double,
    val valuePerServing: Double?,
    val unit: String,
    val percentDailyValue: Int,
    val level: String, // "low", "moderate", "high", "very_high"
    val trafficLight: String, // "green", "amber", "red"
    val advice: String
)

data class AssessmentResult(
    val qualityScore: Int, // 5 to 100
    val qualityTier: QualityTier,
    val summaryHeadline: String,
    val positiveFactors: List<AssessmentFactor>,
    val cautionFactors: List<AssessmentFactor>,
    val ratings: Map<String, NutrientRating>,
    val novaInsight: String? = null,
    val generatedAt: Long = System.currentTimeMillis()
)
