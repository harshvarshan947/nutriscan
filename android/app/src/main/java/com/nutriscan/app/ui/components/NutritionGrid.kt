package com.nutriscan.app.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material3.Icon
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.nutriscan.app.data.model.AssessmentResult
import com.nutriscan.app.data.model.Product
import com.nutriscan.app.ui.theme.DarkCard
import com.nutriscan.app.ui.theme.DarkSurface
import com.nutriscan.app.ui.theme.EmeraldPrimary
import com.nutriscan.app.ui.theme.TextPrimary
import com.nutriscan.app.ui.theme.TextSecondary

@Composable
fun NutritionGrid(
    product: Product,
    assessment: AssessmentResult,
    onEditClicked: () -> Unit,
    modifier: Modifier = Modifier
) {
    var isServingMode by remember { mutableStateOf(product.nutrientsServing != null) }

    val currentNutrients = if (isServingMode && product.nutrientsServing != null) {
        product.nutrientsServing
    } else {
        product.nutrients100g
    }

    Column(modifier = modifier.fillMaxWidth()) {
        // Toggle header
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Segmented control toggle
            Row(
                modifier = Modifier
                    .clip(RoundedCornerShape(8.dp))
                    .background(DarkSurface)
                    .padding(4.dp)
            ) {
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(6.dp))
                        .background(if (!isServingMode) EmeraldPrimary else Color.Transparent)
                        .clickable { isServingMode = false }
                        .padding(horizontal = 12.dp, vertical = 6.dp)
                ) {
                    Text(
                        text = "Per 100g",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Medium,
                        color = if (!isServingMode) DarkSurface else TextSecondary
                    )
                }

                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(6.dp))
                        .background(if (isServingMode) EmeraldPrimary else Color.Transparent)
                        .clickable { if (product.nutrientsServing != null) isServingMode = true }
                        .padding(horizontal = 12.dp, vertical = 6.dp)
                ) {
                    Text(
                        text = "Per Serving",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Medium,
                        color = if (isServingMode) DarkSurface else TextSecondary
                    )
                }
            }

            // Edit button
            OutlinedButton(
                onClick = onEditClicked,
                shape = RoundedCornerShape(8.dp)
            ) {
                Icon(
                    imageVector = Icons.Default.Edit,
                    contentDescription = "Edit values",
                    tint = EmeraldPrimary,
                    modifier = Modifier.padding(end = 4.dp)
                )
                Text(
                    text = "Edit",
                    fontSize = 12.sp,
                    color = EmeraldPrimary
                )
            }
        }

        Spacer(modifier = Modifier.height(6.dp))

        if (isServingMode) {
            Text(
                text = "Serving size: ${product.servingSize}",
                fontSize = 11.sp,
                color = TextSecondary
            )
            Spacer(modifier = Modifier.height(10.dp))
        } else {
            Spacer(modifier = Modifier.height(8.dp))
        }

        // Grid of nutrient cards (4 rows x 2 columns)
        val items = listOf(
            Triple("Calories", currentNutrients.calories.toInt().toString(), "kcal"),
            Triple("Protein", currentNutrients.protein.toString(), "g"),
            Triple("Carbs", currentNutrients.carbohydrates.toString(), "g"),
            Triple("Sugars", currentNutrients.sugars.toString(), "g"),
            Triple("Total Fat", currentNutrients.fat.toString(), "g"),
            Triple("Sat. Fat", currentNutrients.saturatedFat.toString(), "g"),
            Triple("Dietary Fiber", currentNutrients.fiber.toString(), "g"),
            Triple("Sodium", currentNutrients.sodium.toInt().toString(), "mg")
        )

        val keyMap = mapOf(
            "Calories" to "calories",
            "Protein" to "protein",
            "Carbs" to "carbohydrates",
            "Sugars" to "sugars",
            "Total Fat" to "fat",
            "Sat. Fat" to "saturatedFat",
            "Dietary Fiber" to "fiber",
            "Sodium" to "sodium"
        )

        for (i in items.indices step 2) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                val item1 = items[i]
                val rating1 = assessment.ratings[keyMap[item1.first]]
                NutrientCard(
                    label = item1.first,
                    valueStr = item1.second,
                    unit = item1.third,
                    percentDv = rating1?.percentDailyValue ?: 0,
                    trafficLight = rating1?.trafficLight ?: "green",
                    modifier = Modifier.weight(1f)
                )

                if (i + 1 < items.size) {
                    val item2 = items[i + 1]
                    val rating2 = assessment.ratings[keyMap[item2.first]]
                    NutrientCard(
                        label = item2.first,
                        valueStr = item2.second,
                        unit = item2.third,
                        percentDv = rating2?.percentDailyValue ?: 0,
                        trafficLight = rating2?.trafficLight ?: "green",
                        modifier = Modifier.weight(1f)
                    )
                }
            }
            Spacer(modifier = Modifier.height(8.dp))
        }
    }
}
