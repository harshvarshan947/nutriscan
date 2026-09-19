package com.nutriscan.app.ui.profile

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Switch
import androidx.compose.material3.SwitchDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.nutriscan.app.data.model.ActivityLevel
import com.nutriscan.app.data.model.DietaryGoal
import com.nutriscan.app.data.model.Gender
import com.nutriscan.app.ui.theme.DarkBackground
import com.nutriscan.app.ui.theme.DarkCard
import com.nutriscan.app.ui.theme.DarkSurface
import com.nutriscan.app.ui.theme.EmeraldPrimary
import com.nutriscan.app.ui.theme.QualityGood
import com.nutriscan.app.ui.theme.QualityModerate
import com.nutriscan.app.ui.theme.TextPrimary
import com.nutriscan.app.ui.theme.TextSecondary

@Composable
fun ProfileScreen(
    viewModel: ProfileViewModel,
    modifier: Modifier = Modifier
) {
    val userProfile by viewModel.userProfile.collectAsState()
    val targets by viewModel.targets.collectAsState()
    val savedSuccess by viewModel.savedSuccess.collectAsState()
    val snackbarHostState = remember { SnackbarHostState() }

    var name by remember(userProfile) { mutableStateOf(userProfile.name) }
    var ageStr by remember(userProfile) { mutableStateOf(userProfile.age.toString()) }
    var weightStr by remember(userProfile) { mutableStateOf(userProfile.weightKg.toString()) }
    var heightStr by remember(userProfile) { mutableStateOf(userProfile.heightCm.toString()) }
    var selectedGender by remember(userProfile) { mutableStateOf(userProfile.gender) }
    var selectedActivity by remember(userProfile) { mutableStateOf(userProfile.activityLevel) }
    var selectedGoal by remember(userProfile) { mutableStateOf(userProfile.dietaryGoal) }
    var audioEnabled by remember(userProfile) { mutableStateOf(userProfile.audioFeedbackEnabled) }
    var hapticEnabled by remember(userProfile) { mutableStateOf(userProfile.hapticFeedbackEnabled) }

    LaunchedEffect(savedSuccess) {
        if (savedSuccess) {
            snackbarHostState.showSnackbar("Profile & targets updated successfully!")
            viewModel.clearSavedSuccess()
        }
    }

    Box(modifier = modifier.fillMaxSize().background(DarkBackground)) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(16.dp)
                .padding(bottom = 80.dp)
        ) {
            Text(
                text = "Personal Profile & TDEE",
                fontSize = 24.sp,
                fontWeight = FontWeight.Bold,
                color = TextPrimary
            )
            Text(
                text = "Calibrate nutrition thresholds and daily energy targets",
                fontSize = 13.sp,
                color = TextSecondary
            )

            Spacer(modifier = Modifier.height(16.dp))

            // Calculated TDEE targets card
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = DarkSurface)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        text = "Calculated Daily Targets",
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold,
                        color = EmeraldPrimary
                    )

                    Spacer(modifier = Modifier.height(10.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Column {
                            Text(
                                text = "${targets.calories} kcal",
                                fontSize = 24.sp,
                                fontWeight = FontWeight.Bold,
                                color = TextPrimary
                            )
                            Text(
                                text = "Daily Calorie Budget",
                                fontSize = 11.sp,
                                color = TextSecondary
                            )
                        }

                        Column(horizontalAlignment = Alignment.End) {
                            Text(
                                text = "${targets.tdee} kcal",
                                fontSize = 16.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = QualityGood
                            )
                            Text(
                                text = "BMR: ${targets.bmr} kcal",
                                fontSize = 11.sp,
                                color = TextSecondary
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(14.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        MacroMiniStat(title = "Protein", value = "${targets.proteinGrams}g")
                        MacroMiniStat(title = "Carbs", value = "${targets.carbsGrams}g")
                        MacroMiniStat(title = "Fat", value = "${targets.fatGrams}g")
                        MacroMiniStat(title = "Fiber", value = "${targets.fiberGrams}g")
                        MacroMiniStat(title = "Max Sodium", value = "${targets.sodiumMg}mg")
                    }
                }
            }

            Spacer(modifier = Modifier.height(20.dp))

            // Biometrics Input Section
            Text(
                text = "Biometrics",
                fontSize = 16.sp,
                fontWeight = FontWeight.Bold,
                color = TextPrimary
            )
            Spacer(modifier = Modifier.height(8.dp))

            OutlinedTextField(
                value = name,
                onValueChange = { name = it },
                label = { Text("Your Name", fontSize = 12.sp) },
                singleLine = true,
                modifier = Modifier.fillMaxWidth()
            )

            Spacer(modifier = Modifier.height(8.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                OutlinedTextField(
                    value = ageStr,
                    onValueChange = { ageStr = it },
                    label = { Text("Age", fontSize = 12.sp) },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                    modifier = Modifier.weight(1f)
                )

                OutlinedTextField(
                    value = weightStr,
                    onValueChange = { weightStr = it },
                    label = { Text("Weight (kg)", fontSize = 12.sp) },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                    modifier = Modifier.weight(1f)
                )

                OutlinedTextField(
                    value = heightStr,
                    onValueChange = { heightStr = it },
                    label = { Text("Height (cm)", fontSize = 12.sp) },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                    modifier = Modifier.weight(1f)
                )
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Gender Selection
            Text(
                text = "Biological Sex",
                fontSize = 14.sp,
                fontWeight = FontWeight.Medium,
                color = TextSecondary
            )
            Spacer(modifier = Modifier.height(6.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Gender.values().forEach { gender ->
                    val isSelected = selectedGender == gender
                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .clip(RoundedCornerShape(8.dp))
                            .background(if (isSelected) EmeraldPrimary else DarkCard)
                            .clickable { selectedGender = gender }
                            .padding(vertical = 10.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = gender.name.lowercase().capitalize(),
                            fontSize = 12.sp,
                            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
                            color = if (isSelected) DarkBackground else TextSecondary
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Activity Level Selection
            Text(
                text = "Physical Activity Level",
                fontSize = 14.sp,
                fontWeight = FontWeight.Medium,
                color = TextSecondary
            )
            Spacer(modifier = Modifier.height(6.dp))
            Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                ActivityLevel.values().forEach { activity ->
                    val isSelected = selectedActivity == activity
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(8.dp))
                            .background(if (isSelected) EmeraldPrimary.copy(alpha = 0.2f) else DarkCard)
                            .clickable { selectedActivity = activity }
                            .padding(12.dp)
                    ) {
                        Text(
                            text = activity.name.replace("_", " ").lowercase().capitalize(),
                            fontSize = 13.sp,
                            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
                            color = if (isSelected) EmeraldPrimary else TextPrimary
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Dietary Goal Selection
            Text(
                text = "Nutritional & Dietary Goal",
                fontSize = 14.sp,
                fontWeight = FontWeight.Medium,
                color = TextSecondary
            )
            Spacer(modifier = Modifier.height(6.dp))
            Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                DietaryGoal.values().forEach { goal ->
                    val isSelected = selectedGoal == goal
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(8.dp))
                            .background(if (isSelected) EmeraldPrimary.copy(alpha = 0.2f) else DarkCard)
                            .clickable { selectedGoal = goal }
                            .padding(12.dp)
                    ) {
                        Text(
                            text = goal.name.replace("_", " ").lowercase().capitalize(),
                            fontSize = 13.sp,
                            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
                            color = if (isSelected) EmeraldPrimary else TextPrimary
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(20.dp))

            // Preferences (Sound & Haptics)
            Text(
                text = "Feedback Preferences",
                fontSize = 16.sp,
                fontWeight = FontWeight.Bold,
                color = TextPrimary
            )
            Spacer(modifier = Modifier.height(8.dp))

            Card(
                shape = RoundedCornerShape(12.dp),
                colors = CardDefaults.cardColors(containerColor = DarkSurface)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(text = "Audio Feedback on Scan", fontSize = 14.sp, color = TextPrimary)
                        Switch(
                            checked = audioEnabled,
                            onCheckedChange = { audioEnabled = it },
                            colors = SwitchDefaults.colors(checkedThumbColor = EmeraldPrimary)
                        )
                    }

                    Spacer(modifier = Modifier.height(8.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(text = "Haptic Vibration on Scan", fontSize = 14.sp, color = TextPrimary)
                        Switch(
                            checked = hapticEnabled,
                            onCheckedChange = { hapticEnabled = it },
                            colors = SwitchDefaults.colors(checkedThumbColor = EmeraldPrimary)
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Save Button
            Button(
                onClick = {
                    viewModel.updateProfile(
                        name = name,
                        age = ageStr.toIntOrNull() ?: 28,
                        weightKg = weightStr.toDoubleOrNull() ?: 70.0,
                        heightCm = heightStr.toDoubleOrNull() ?: 175.0,
                        gender = selectedGender,
                        activityLevel = selectedActivity,
                        dietaryGoal = selectedGoal,
                        audioFeedback = audioEnabled,
                        hapticFeedback = hapticEnabled
                    )
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(50.dp),
                shape = RoundedCornerShape(12.dp),
                colors = ButtonDefaults.buttonColors(containerColor = EmeraldPrimary)
            ) {
                Text(
                    text = "Save Profile & Targets",
                    fontSize = 15.sp,
                    fontWeight = FontWeight.Bold,
                    color = DarkBackground
                )
            }
        }

        SnackbarHost(
            hostState = snackbarHostState,
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .padding(bottom = 70.dp)
        )
    }
}

@Composable
private fun MacroMiniStat(title: String, value: String) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(text = value, fontSize = 13.sp, fontWeight = FontWeight.Bold, color = TextPrimary)
        Text(text = title, fontSize = 10.sp, color = TextSecondary)
    }
}

private fun String.capitalize(): String {
    return replaceFirstChar { if (it.isLowerCase()) it.titlecase() else it.toString() }
}
