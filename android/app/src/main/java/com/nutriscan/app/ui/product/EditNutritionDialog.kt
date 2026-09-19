package com.nutriscan.app.ui.product

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.nutriscan.app.data.model.Nutrients
import com.nutriscan.app.ui.theme.DarkBackground
import com.nutriscan.app.ui.theme.EmeraldPrimary
import com.nutriscan.app.ui.theme.TextSecondary

@Composable
fun EditNutritionDialog(
    initialNutrients: Nutrients,
    onDismiss: () -> Unit,
    onSave: (Nutrients) -> Unit
) {
    var calStr by remember { mutableStateOf(initialNutrients.calories.toInt().toString()) }
    var protStr by remember { mutableStateOf(initialNutrients.protein.toString()) }
    var carbStr by remember { mutableStateOf(initialNutrients.carbohydrates.toString()) }
    var sugStr by remember { mutableStateOf(initialNutrients.sugars.toString()) }
    var fatStr by remember { mutableStateOf(initialNutrients.fat.toString()) }
    var satFatStr by remember { mutableStateOf(initialNutrients.saturatedFat.toString()) }
    var fibStr by remember { mutableStateOf(initialNutrients.fiber.toString()) }
    var sodStr by remember { mutableStateOf(initialNutrients.sodium.toInt().toString()) }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Edit Nutrition Values (per 100g)") },
        text = {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .verticalScroll(rememberScrollState())
            ) {
                Text(
                    text = "Correct any OCR or database errors. The health score will recalculate automatically.",
                    fontSize = 12.sp,
                    color = TextSecondary
                )
                Spacer(modifier = Modifier.height(12.dp))

                NutrientInputField(label = "Calories (kcal)", value = calStr, onValueChange = { calStr = it })
                NutrientInputField(label = "Protein (g)", value = protStr, onValueChange = { protStr = it })
                NutrientInputField(label = "Carbohydrates (g)", value = carbStr, onValueChange = { carbStr = it })
                NutrientInputField(label = "Sugars (g)", value = sugStr, onValueChange = { sugStr = it })
                NutrientInputField(label = "Total Fat (g)", value = fatStr, onValueChange = { fatStr = it })
                NutrientInputField(label = "Saturated Fat (g)", value = satFatStr, onValueChange = { satFatStr = it })
                NutrientInputField(label = "Dietary Fiber (g)", value = fibStr, onValueChange = { fibStr = it })
                NutrientInputField(label = "Sodium (mg)", value = sodStr, onValueChange = { sodStr = it })
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    val updated = initialNutrients.copy(
                        calories = calStr.toDoubleOrNull() ?: initialNutrients.calories,
                        protein = protStr.toDoubleOrNull() ?: initialNutrients.protein,
                        carbohydrates = carbStr.toDoubleOrNull() ?: initialNutrients.carbohydrates,
                        sugars = sugStr.toDoubleOrNull() ?: initialNutrients.sugars,
                        fat = fatStr.toDoubleOrNull() ?: initialNutrients.fat,
                        saturatedFat = satFatStr.toDoubleOrNull() ?: initialNutrients.saturatedFat,
                        fiber = fibStr.toDoubleOrNull() ?: initialNutrients.fiber,
                        sodium = sodStr.toDoubleOrNull() ?: initialNutrients.sodium
                    )
                    onSave(updated)
                },
                colors = ButtonDefaults.buttonColors(containerColor = EmeraldPrimary)
            ) {
                Text("Save Changes", color = DarkBackground)
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancel")
            }
        }
    )
}

@Composable
private fun NutrientInputField(
    label: String,
    value: String,
    onValueChange: (String) -> Unit
) {
    OutlinedTextField(
        value = value,
        onValueChange = onValueChange,
        label = { Text(label, fontSize = 12.sp) },
        singleLine = true,
        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp)
    )
}
