package com.nutriscan.app.domain.normalizer

import com.nutriscan.app.data.model.AdditiveRisk
import com.nutriscan.app.data.model.FoodAdditive
import com.nutriscan.app.data.model.Nutrients
import com.nutriscan.app.data.model.Product
import com.nutriscan.app.data.remote.dto.OffProduct
import kotlin.math.roundToInt

object NutrientNormalizer {

    private val ADDITIVE_KNOWLEDGE_BASE = mapOf(
        "e330" to FoodAdditive("e330", "Citric acid", AdditiveRisk.SAFE, "Acidity regulator"),
        "e300" to FoodAdditive("e300", "Ascorbic acid (Vitamin C)", AdditiveRisk.SAFE, "Antioxidant"),
        "e322" to FoodAdditive("e322", "Lecithins", AdditiveRisk.SAFE, "Emulsifier"),
        "e412" to FoodAdditive("e412", "Guar gum", AdditiveRisk.SAFE, "Thickener"),
        "e415" to FoodAdditive("e415", "Xanthan gum", AdditiveRisk.SAFE, "Stabilizer"),
        "e440" to FoodAdditive("e440", "Pectins", AdditiveRisk.SAFE, "Gelling agent"),
        "e500" to FoodAdditive("e500", "Sodium carbonates", AdditiveRisk.SAFE, "Raising agent"),
        "e150d" to FoodAdditive("e150d", "Sulphite ammonia caramel", AdditiveRisk.CAUTION, "Color"),
        "e621" to FoodAdditive("e621", "Monosodium glutamate (MSG)", AdditiveRisk.CAUTION, "Flavor enhancer"),
        "e950" to FoodAdditive("e950", "Acesulfame K", AdditiveRisk.CAUTION, "Artificial sweetener"),
        "e951" to FoodAdditive("e951", "Aspartame", AdditiveRisk.CAUTION, "Artificial sweetener"),
        "e955" to FoodAdditive("e955", "Sucralose", AdditiveRisk.SAFE, "Non-caloric sweetener"),
        "e250" to FoodAdditive("e250", "Sodium nitrite", AdditiveRisk.HIGH_RISK, "Preservative in cured meats"),
        "e102" to FoodAdditive("e102", "Tartrazine", AdditiveRisk.CAUTION, "Azo dye color"),
        "e110" to FoodAdditive("e110", "Sunset Yellow FCF", AdditiveRisk.CAUTION, "Azo dye color"),
        "e129" to FoodAdditive("e129", "Allura Red AC", AdditiveRisk.CAUTION, "Azo dye color")
    )

    fun normalize(rawBarcode: String, offProduct: OffProduct): Product {
        val rawName = offProduct.productNameEn
            ?: offProduct.productName
            ?: offProduct.genericNameEn
            ?: offProduct.genericName
            ?: "Packaged Product"
        val name = rawName.trim().replace("\\s+".toRegex(), " ")

        val rawBrand = offProduct.brands
            ?: offProduct.brandOwner
            ?: offProduct.brandsTags?.firstOrNull()
            ?: "Brand"
        val brand = rawBrand.split(",").firstOrNull()?.trim() ?: "Brand"

        val nutriments = offProduct.nutriments ?: emptyMap()
        val nameLower = "$name $brand".lowercase()

        // Helper to extract double from nutriments map
        fun getVal(keys: List<String>): Double? {
            for (k in keys) {
                val v = nutriments[k] ?: continue
                when (v) {
                    is Number -> return v.toDouble()
                    is String -> v.toDoubleOrNull()?.let { return it }
                }
            }
            return null
        }

        // Parse serving size & grams
        var servingGrams = offProduct.servingQuantity
        var servingSizeStr = offProduct.servingSize ?: (servingGrams?.let { "${it.roundToInt()} g" } ?: "100 g")

        if ((servingGrams == null || servingGrams <= 0.0) && offProduct.servingSize != null) {
            val s = offProduct.servingSize
            val gMatch = "([0-9]+(?:\\.[0-9]+)?)\\s*(?:g|ml|gram|gr)".toRegex(RegexOption.IGNORE_CASE).find(s)
            val flOzMatch = "([0-9]+(?:\\.[0-9]+)?)\\s*fl\\s*oz".toRegex(RegexOption.IGNORE_CASE).find(s)
            val ozMatch = "([0-9]+(?:\\.[0-9]+)?)\\s*oz".toRegex(RegexOption.IGNORE_CASE).find(s)

            if (gMatch != null) {
                servingGrams = gMatch.groupValues[1].toDoubleOrNull()
            } else if (flOzMatch != null) {
                flOzMatch.groupValues[1].toDoubleOrNull()?.let { servingGrams = (it * 29.57).roundToInt().toDouble() }
            } else if (ozMatch != null) {
                ozMatch.groupValues[1].toDoubleOrNull()?.let { servingGrams = (it * 28.35).roundToInt().toDouble() }
            }
        }

        // 1. Calories / Energy (kcal) per 100g
        var cal100 = getVal(listOf("energy-kcal_100g", "energy-kcal_value", "energy-kcal", "energy-kcal_prepared_100g"))
        if (cal100 == null) {
            val kjVal = getVal(listOf("energy_100g", "energy-kj_100g", "energy_kj"))
            if (kjVal != null && kjVal > 0) {
                cal100 = (kjVal / 4.184).roundToInt().toDouble()
            }
        }
        if (cal100 == null && servingGrams != null && servingGrams > 0) {
            val servKcal = getVal(listOf("energy-kcal_serving"))
            if (servKcal != null && servKcal > 0) {
                cal100 = ((servKcal / servingGrams) * 100).roundToInt().toDouble()
            }
        }

        // 2. Proteins
        var protein100 = getVal(listOf("proteins_100g", "proteins_value", "proteins", "proteins_prepared_100g"))
        if (protein100 == null && servingGrams != null && servingGrams > 0) {
            getVal(listOf("proteins_serving"))?.let { protein100 = (it / servingGrams) * 100 }
        }

        // 3. Carbohydrates
        var carbs100 = getVal(listOf("carbohydrates_100g", "carbohydrates_value", "carbohydrates", "carbohydrates_prepared_100g"))
        if (carbs100 == null && servingGrams != null && servingGrams > 0) {
            getVal(listOf("carbohydrates_serving"))?.let { carbs100 = (it / servingGrams) * 100 }
        }

        // 4. Sugars
        var sugars100 = getVal(listOf("sugars_100g", "sugars_value", "sugars", "sugars_prepared_100g"))
        if (sugars100 == null && servingGrams != null && servingGrams > 0) {
            getVal(listOf("sugars_serving"))?.let { sugars100 = (it / servingGrams) * 100 }
        }

        // 5. Added Sugars
        val addedSugars100 = getVal(listOf("added-sugars_100g", "added-sugars_value", "added-sugars"))

        // 6. Fat
        var fat100 = getVal(listOf("fat_100g", "fat_value", "fat", "fat_prepared_100g"))
        if (fat100 == null && servingGrams != null && servingGrams > 0) {
            getVal(listOf("fat_serving"))?.let { fat100 = (it / servingGrams) * 100 }
        }

        // 7. Saturated Fat
        var satFat100 = getVal(listOf("saturated-fat_100g", "saturated-fat_value", "saturated-fat", "saturated-fat_prepared_100g"))
        if (satFat100 == null && servingGrams != null && servingGrams > 0) {
            getVal(listOf("saturated-fat_serving"))?.let { satFat100 = (it / servingGrams) * 100 }
        }

        // 8. Fiber
        var fiber100 = getVal(listOf("fiber_100g", "fiber_value", "fiber", "dietary-fiber_100g", "fiber_prepared_100g"))
        if (fiber100 == null && servingGrams != null && servingGrams > 0) {
            getVal(listOf("fiber_serving"))?.let { fiber100 = (it / servingGrams) * 100 }
        }

        // 9. Sodium & Salt
        var sodium100: Double? = null
        var salt100: Double? = null
        val rawSodium = getVal(listOf("sodium_100g", "sodium_value", "sodium"))
        val rawSalt = getVal(listOf("salt_100g", "salt_value", "salt"))

        if (rawSodium != null) {
            sodium100 = if (rawSodium < 50.0) (rawSodium * 1000.0).roundToInt().toDouble() else rawSodium
        }
        if (rawSalt != null) {
            salt100 = ((rawSalt * 100).roundToInt() / 100.0)
            if (sodium100 == null) {
                sodium100 = ((salt100 / 2.5) * 1000.0).roundToInt().toDouble()
            }
        } else if (sodium100 != null) {
            salt100 = (((sodium100 / 1000.0) * 2.5 * 100).roundToInt() / 100.0)
        }

        // Atwater Sanity Check
        val p = protein100 ?: 0.0
        val c = carbs100 ?: 0.0
        val f = fat100 ?: 0.0

        if (cal100 == null || cal100 > 900.0 || (cal100 == 0.0 && (p > 0 || c > 0 || f > 0))) {
            if (p > 0 || c > 0 || f > 0) {
                cal100 = (p * 4.0 + c * 4.0 + f * 9.0).roundToInt().toDouble()
            } else if (cal100 != null && cal100 > 900.0) {
                cal100 = (cal100 / 4.184).roundToInt().toDouble()
            }
        }

        val nutrients100 = Nutrients(
            calories = ((cal100 ?: 0.0) * 10).roundToInt() / 10.0,
            protein = ((protein100 ?: 0.0) * 10).roundToInt() / 10.0,
            carbohydrates = ((carbs100 ?: 0.0) * 10).roundToInt() / 10.0,
            sugars = ((sugars100 ?: 0.0) * 10).roundToInt() / 10.0,
            addedSugars = addedSugars100?.let { ((it * 10).roundToInt() / 10.0) },
            fat = ((fat100 ?: 0.0) * 10).roundToInt() / 10.0,
            saturatedFat = ((satFat100 ?: 0.0) * 10).roundToInt() / 10.0,
            fiber = ((fiber100 ?: 0.0) * 10).roundToInt() / 10.0,
            sodium = sodium100 ?: 0.0,
            salt = salt100 ?: 0.0
        )

        // Sanitize portion sizes for multi-packs
        if (servingGrams != null && servingGrams > 150.0) {
            when {
                nameLower.contains("biscuit") || nameLower.contains("cookie") || nameLower.contains("chip") ||
                        nameLower.contains("crisp") || nameLower.contains("chocolate") || nameLower.contains("candy") -> {
                    servingGrams = 30.0
                    servingSizeStr = "30 g (approx. 1 portion)"
                }
                nameLower.contains("bread") || nameLower.contains("toast") || nameLower.contains("loaf") -> {
                    servingGrams = 40.0
                    servingSizeStr = "40 g (1 slice)"
                }
                nameLower.contains("soda") || nameLower.contains("cola") || nameLower.contains("juice") ||
                        nameLower.contains("drink") || nameLower.contains("beverage") -> {
                    servingGrams = 250.0
                    servingSizeStr = "250 ml (1 glass)"
                }
                nameLower.contains("butter") || nameLower.contains("oil") || nameLower.contains("spread") -> {
                    servingGrams = 15.0
                    servingSizeStr = "15 g (1 tbsp)"
                }
            }
        }

        // Calculate Per Serving Nutrients
        var nutrientsServing: Nutrients? = null
        if (servingGrams != null && servingGrams > 0.0) {
            val ratio = servingGrams / 100.0

            val rawServCal = getVal(listOf("energy-kcal_serving"))
            val rawServProt = getVal(listOf("proteins_serving"))
            val rawServCarb = getVal(listOf("carbohydrates_serving"))
            val rawServSug = getVal(listOf("sugars_serving"))
            val rawServFat = getVal(listOf("fat_serving"))
            val rawServSatFat = getVal(listOf("saturated-fat_serving"))
            val rawServFib = getVal(listOf("fiber_serving"))
            val rawServSod = getVal(listOf("sodium_serving"))

            val useRaw = rawServCal != null && rawServCal > 0 && rawServCal < 1000

            nutrientsServing = Nutrients(
                calories = if (useRaw) rawServCal!! else ((nutrients100.calories * ratio) * 10).roundToInt() / 10.0,
                protein = if (useRaw && rawServProt != null) rawServProt else ((nutrients100.protein * ratio) * 10).roundToInt() / 10.0,
                carbohydrates = if (useRaw && rawServCarb != null) rawServCarb else ((nutrients100.carbohydrates * ratio) * 10).roundToInt() / 10.0,
                sugars = if (useRaw && rawServSug != null) rawServSug else ((nutrients100.sugars * ratio) * 10).roundToInt() / 10.0,
                addedSugars = nutrients100.addedSugars?.let { ((it * ratio) * 10).roundToInt() / 10.0 },
                fat = if (useRaw && rawServFat != null) rawServFat else ((nutrients100.fat * ratio) * 10).roundToInt() / 10.0,
                saturatedFat = if (useRaw && rawServSatFat != null) rawServSatFat else ((nutrients100.saturatedFat * ratio) * 10).roundToInt() / 10.0,
                fiber = if (useRaw && rawServFib != null) rawServFib else ((nutrients100.fiber * ratio) * 10).roundToInt() / 10.0,
                sodium = if (useRaw && rawServSod != null) (if (rawServSod < 50) rawServSod * 1000 else rawServSod) else ((nutrients100.sodium * ratio) * 10).roundToInt() / 10.0,
                salt = ((nutrients100.salt * ratio) * 100).roundToInt() / 100.0
            )
        }

        // Additives lookup
        val additives = offProduct.additivesTags?.mapNotNull { tag ->
            val code = tag.removePrefix("en:").lowercase().trim()
            ADDITIVE_KNOWLEDGE_BASE[code] ?: FoodAdditive(id = code, name = code.uppercase(), riskLevel = AdditiveRisk.UNKNOWN)
        } ?: emptyList()

        // Allergens tags
        val allergens = offProduct.allergensTags?.map { it.removePrefix("en:").replace("-", " ").capitalize() } ?: emptyList()

        val image = offProduct.imageUrl ?: offProduct.imageFrontUrl ?: offProduct.imageFrontSmallUrl

        return Product(
            barcode = rawBarcode,
            name = name,
            brand = brand,
            imageUrl = image,
            servingSize = servingSizeStr,
            servingQuantityGrams = servingGrams,
            nutrients100g = nutrients100,
            nutrientsServing = nutrientsServing,
            ingredientsText = offProduct.ingredientsTextEn ?: offProduct.ingredientsText,
            allergens = allergens,
            additives = additives,
            novaGroup = offProduct.novaGroup,
            nutriScore = offProduct.nutritionGrades?.lowercase(),
            categories = offProduct.categoriesTags?.map { it.removePrefix("en:") } ?: emptyList(),
            lastScannedAt = System.currentTimeMillis()
        )
    }

    private fun String.capitalize(): String {
        return replaceFirstChar { if (it.isLowerCase()) it.titlecase() else it.toString() }
    }
}
