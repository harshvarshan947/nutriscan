package com.nutriscan.app.domain.assessment

import com.nutriscan.app.data.model.AdditiveRisk
import com.nutriscan.app.data.model.AssessmentFactor
import com.nutriscan.app.data.model.AssessmentResult
import com.nutriscan.app.data.model.FactorType
import com.nutriscan.app.data.model.NutrientRating
import com.nutriscan.app.data.model.Product
import com.nutriscan.app.data.model.QualityTier
import kotlin.math.max
import kotlin.math.min
import kotlin.math.roundToInt

object QualityScoreEngine {

    // Standard daily reference intakes (general adult 2000 kcal)
    val REFERENCE_DAILY_VALUES = mapOf(
        "calories" to 2000.0,
        "protein" to 50.0,
        "carbohydrates" to 260.0,
        "sugars" to 50.0,
        "addedSugars" to 25.0,
        "fat" to 70.0,
        "saturatedFat" to 20.0,
        "fiber" to 30.0,
        "sodium" to 2000.0,
        "salt" to 5.0
    )

    fun evaluate(product: Product): AssessmentResult {
        val n100 = product.nutrients100g
        val nServ = product.nutrientsServing

        // 1. Evaluate Individual Nutrient Ratings
        val ratings = mutableMapOf<String, NutrientRating>()

        fun addRating(key: String, label: String, val100: Double, valServ: Double?, unit: String, refDaily: Double, level: String, traffic: String, advice: String) {
            val compareVal = valServ ?: val100
            val percentDV = ((compareVal / refDaily) * 100).roundToInt()
            ratings[key] = NutrientRating(
                nutrientKey = key,
                label = label,
                valuePer100g = ((val100 * 10).roundToInt()) / 10.0,
                valuePerServing = valServ?.let { ((it * 10).roundToInt()) / 10.0 },
                unit = unit,
                percentDailyValue = percentDV,
                level = level,
                trafficLight = traffic,
                advice = advice
            )
        }

        // Calories
        val calTraffic = if (n100.calories < 250) "green" else if (n100.calories < 450) "amber" else "red"
        val calLevel = if (n100.calories < 100) "low" else if (n100.calories < 250) "moderate" else if (n100.calories < 450) "high" else "very_high"
        addRating("calories", "Calories", n100.calories, nServ?.calories, "kcal", 2000.0, calLevel, calTraffic, "Calorie density per portion.")

        // Protein
        val protTraffic = if (n100.protein >= 8.0) "green" else "amber"
        val protLevel = if (n100.protein >= 15.0) "very_high" else if (n100.protein >= 8.0) "high" else if (n100.protein >= 2.5) "moderate" else "low"
        addRating("protein", "Protein", n100.protein, nServ?.protein, "g", 50.0, protLevel, protTraffic, "Contributes to satiety and muscle repair.")

        // Carbs
        addRating("carbohydrates", "Carbohydrates", n100.carbohydrates, nServ?.carbohydrates, "g", 260.0, "moderate", "green", "Energy source.")

        // Sugars
        val sugTraffic = if (n100.sugars <= 5.0) "green" else if (n100.sugars <= 15.0) "amber" else "red"
        val sugLevel = if (n100.sugars <= 5.0) "low" else if (n100.sugars <= 15.0) "moderate" else if (n100.sugars <= 22.5) "high" else "very_high"
        addRating("sugars", "Sugars", n100.sugars, nServ?.sugars, "g", 50.0, sugLevel, sugTraffic, "Simple sugars.")

        // Fat
        val fatTraffic = if (n100.fat <= 3.0) "green" else if (n100.fat <= 17.5) "green" else "amber"
        val fatLevel = if (n100.fat <= 3.0) "low" else if (n100.fat <= 17.5) "moderate" else "high"
        addRating("fat", "Total Fat", n100.fat, nServ?.fat, "g", 70.0, fatLevel, fatTraffic, "Total lipids.")

        // Saturated Fat
        val satTraffic = if (n100.saturatedFat <= 1.5) "green" else if (n100.saturatedFat <= 5.0) "amber" else "red"
        val satLevel = if (n100.saturatedFat <= 1.5) "low" else if (n100.saturatedFat <= 3.5) "moderate" else if (n100.saturatedFat <= 7.0) "high" else "very_high"
        addRating("saturatedFat", "Saturated Fat", n100.saturatedFat, nServ?.saturatedFat, "g", 20.0, satLevel, satTraffic, "Saturated fatty acids.")

        // Fiber
        val fibTraffic = if (n100.fiber >= 3.0) "green" else "amber"
        val fibLevel = if (n100.fiber >= 6.0) "very_high" else if (n100.fiber >= 3.0) "high" else "moderate"
        addRating("fiber", "Dietary Fiber", n100.fiber, nServ?.fiber, "g", 30.0, fibLevel, fibTraffic, "Supports digestive wellness.")

        // Sodium
        val sodTraffic = if (n100.sodium <= 120) "green" else if (n100.sodium <= 450) "amber" else "red"
        val sodLevel = if (n100.sodium <= 120) "low" else if (n100.sodium <= 400) "moderate" else if (n100.sodium <= 800) "high" else "very_high"
        addRating("sodium", "Sodium", n100.sodium, nServ?.sodium, "mg", 2000.0, sodLevel, sodTraffic, "Sodium content.")

        // 2. Compute 0–100 Quality Score
        var score = 80 // Baseline starting score
        val positiveFactors = mutableListOf<AssessmentFactor>()
        val cautionFactors = mutableListOf<AssessmentFactor>()

        // FIBER
        if (n100.fiber >= 6.0) {
            score += 12
            positiveFactors.add(
                AssessmentFactor("high-fiber", FactorType.POSITIVE, "High in Dietary Fiber", "Excellent fiber content supporting digestion and healthy fullness.", "${n100.fiber}g / 100g")
            )
        } else if (n100.fiber >= 3.0) {
            score += 6
            positiveFactors.add(
                AssessmentFactor("good-fiber", FactorType.POSITIVE, "Good Source of Fiber", "Contributes positively toward daily fiber targets.", "${n100.fiber}g / 100g")
            )
        } else if (n100.calories > 300 && n100.fiber < 1.0) {
            score -= 6
            cautionFactors.add(
                AssessmentFactor("low-fiber", FactorType.CAUTION, "Low Fiber Relative to Energy", "Provides energy with minimal dietary fiber.", "${n100.fiber}g fiber for ${n100.calories.roundToInt()} kcal")
            )
        }

        // PROTEIN
        if (n100.protein >= 15.0) {
            score += 10
            positiveFactors.add(
                AssessmentFactor("high-protein", FactorType.POSITIVE, "High Protein Density", "Substantial protein density for muscle maintenance and satiety.", "${n100.protein}g / 100g")
            )
        } else if (n100.protein >= 8.0) {
            score += 5
            positiveFactors.add(
                AssessmentFactor("good-protein", FactorType.POSITIVE, "Good Protein Source", "Solid protein contribution per serving.", "${n100.protein}g / 100g")
            )
        }

        // SUGARS
        val isBeverage = product.categories.any {
            val c = it.lowercase()
            c.contains("beverage") || c.contains("drink") || c.contains("soda") || c.contains("juice")
        }
        val sugarServing = nServ?.sugars ?: n100.sugars

        if (n100.sugars <= 2.5 && sugarServing <= 5.0) {
            score += 8
            positiveFactors.add(
                AssessmentFactor("low-sugar", FactorType.POSITIVE, "Low Sugar Formulation", "Minimal impact on rapid blood sugar spikes.", "${n100.sugars}g / 100g")
            )
        } else if (n100.sugars > 22.5 || sugarServing >= 20.0 || (isBeverage && n100.sugars > 8.0)) {
            val penalty = min(28, 14 + if (sugarServing >= 20.0) ((sugarServing - 20) * 0.7).roundToInt() else ((n100.sugars - 8) * 0.8).roundToInt())
            score -= penalty
            cautionFactors.add(
                AssessmentFactor("high-sugar", FactorType.WARNING, "High Sugar Content", "Exceeds recommended healthy sugar guidelines per serving.", "${sugarServing}g sugar / serving")
            )
        } else if (n100.sugars > 10.0 || sugarServing >= 12.0) {
            score -= 8
            cautionFactors.add(
                AssessmentFactor("mod-sugar", FactorType.CAUTION, "Moderate to High Sugar", "Contains noticeable concentration of simple sugars.", "${sugarServing}g / serving")
            )
        }

        // SATURATED FAT
        if (n100.saturatedFat <= 1.5) {
            score += 5
            positiveFactors.add(
                AssessmentFactor("low-sat-fat", FactorType.POSITIVE, "Low Saturated Fat", "Cardiovascular and heart-friendly fat profile.", "${n100.saturatedFat}g / 100g")
            )
        } else if (n100.saturatedFat > 7.0) {
            val penalty = min(22, 10 + ((n100.saturatedFat - 7.0) * 1.2).roundToInt())
            score -= penalty
            cautionFactors.add(
                AssessmentFactor("high-sat-fat", FactorType.WARNING, "High Saturated Fat", "Elevated saturated fatty acid content.", "${n100.saturatedFat}g / 100g")
            )
        } else if (n100.saturatedFat > 4.0) {
            score -= 6
            cautionFactors.add(
                AssessmentFactor("mod-sat-fat", FactorType.CAUTION, "Moderate Saturated Fat", "Consider balancing with healthy unsaturated fats.", "${n100.saturatedFat}g / 100g")
            )
        }

        // SODIUM
        if (n100.sodium <= 120) {
            score += 6
            positiveFactors.add(
                AssessmentFactor("low-sodium", FactorType.POSITIVE, "Low Sodium / Salt", "Excellent for sodium-conscious and cardiovascular nutrition.", "${n100.sodium.roundToInt()}mg sodium / 100g")
            )
        } else if (n100.sodium > 800) {
            val penalty = min(22, 10 + ((n100.sodium - 800) / 100).roundToInt())
            score -= penalty
            cautionFactors.add(
                AssessmentFactor("high-sodium", FactorType.WARNING, "High Sodium Content", "Substantial sodium density per serving.", "${n100.sodium.roundToInt()}mg sodium / 100g")
            )
        } else if (n100.sodium > 450) {
            score -= 6
            cautionFactors.add(
                AssessmentFactor("mod-sodium", FactorType.CAUTION, "Elevated Sodium Level", "Moderately high sodium concentration.", "${n100.sodium.roundToInt()}mg / 100g")
            )
        }

        // NOVA ULTRA-PROCESSING
        var novaInsight: String? = null
        when (product.novaGroup) {
            1 -> {
                score += 8
                novaInsight = "NOVA 1: Unprocessed / Minimally Processed Food"
                positiveFactors.add(
                    AssessmentFactor("nova-1", FactorType.POSITIVE, "Whole / Minimally Processed", "Natural whole food with minimal alteration.", "NOVA 1")
                )
            }
            2 -> {
                score += 2
                novaInsight = "NOVA 2: Processed Culinary Ingredient"
            }
            3 -> {
                novaInsight = "NOVA 3: Processed Food"
            }
            4 -> {
                score -= 10
                novaInsight = "NOVA 4: Ultra-Processed Food Formulation"
                cautionFactors.add(
                    AssessmentFactor("nova-4", FactorType.CAUTION, "Ultra-Processed Formulation", "Manufactured from industrial ingredients, flavorings or emulsifiers.", "NOVA 4")
                )
            }
        }

        // ADDITIVES
        val highRiskAdditives = product.additives.filter {
            it.riskLevel == AdditiveRisk.CAUTION || it.riskLevel == AdditiveRisk.HIGH_RISK
        }
        if (highRiskAdditives.isNotEmpty()) {
            score -= min(8, highRiskAdditives.size * 3)
            val names = highRiskAdditives.joinToString(", ") { it.name }
            cautionFactors.add(
                AssessmentFactor("additives", FactorType.CAUTION, "${highRiskAdditives.size} Additive(s) of Note", "Contains $names", null)
            )
        }

        // Clamp final score between 5 and 100
        val finalScore = max(5, min(100, score))

        val (tier, headline) = when {
            finalScore >= 80 -> QualityTier.EXCELLENT to "Nutrient-dense with favorable balance"
            finalScore >= 65 -> QualityTier.GOOD to "Good nutritional profile with minor cautions"
            finalScore >= 45 -> QualityTier.MODERATE to "Moderate quality; consume in balanced rotation"
            else -> QualityTier.LOW to "Lower nutrient density; enjoy mindfully in moderation"
        }

        return AssessmentResult(
            qualityScore = finalScore,
            qualityTier = tier,
            summaryHeadline = headline,
            positiveFactors = positiveFactors,
            cautionFactors = cautionFactors,
            ratings = ratings,
            novaInsight = novaInsight
        )
    }
}
