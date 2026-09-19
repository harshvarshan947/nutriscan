package com.nutriscan.app.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.nutriscan.app.ui.theme.DarkCard
import com.nutriscan.app.ui.theme.EmeraldPrimary
import com.nutriscan.app.ui.theme.QualityGood
import com.nutriscan.app.ui.theme.QualityModerate
import com.nutriscan.app.ui.theme.TextPrimary
import com.nutriscan.app.ui.theme.TextSecondary
import kotlin.math.max

@Composable
fun MacroProgressBar(
    caloriesConsumed: Int,
    calorieTarget: Int,
    proteinConsumed: Double,
    proteinTarget: Int,
    carbsConsumed: Double,
    carbsTarget: Int,
    fatConsumed: Double,
    fatTarget: Int,
    modifier: Modifier = Modifier
) {
    val remainingCalories = max(0, calorieTarget - caloriesConsumed)
    val calProgress = if (calorieTarget > 0) (caloriesConsumed.toFloat() / calorieTarget).coerceIn(0f, 1f) else 0f

    Card(
        modifier = modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = DarkCard)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            // Calories summary header
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = "Daily Calories",
                        fontSize = 13.sp,
                        color = TextSecondary,
                        fontWeight = FontWeight.Medium
                    )
                    Row(verticalAlignment = Alignment.Bottom) {
                        Text(
                            text = "$caloriesConsumed",
                            fontSize = 26.sp,
                            fontWeight = FontWeight.Bold,
                            color = TextPrimary
                        )
                        Text(
                            text = " / $calorieTarget kcal",
                            fontSize = 14.sp,
                            color = TextSecondary,
                            modifier = Modifier.padding(bottom = 3.dp, start = 4.dp)
                        )
                    }
                }

                Column(horizontalAlignment = Alignment.End) {
                    Text(
                        text = "$remainingCalories",
                        fontSize = 20.sp,
                        fontWeight = FontWeight.Bold,
                        color = EmeraldPrimary
                    )
                    Text(
                        text = "kcal remaining",
                        fontSize = 11.sp,
                        color = TextSecondary
                    )
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            LinearProgressIndicator(
                progress = { calProgress },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(8.dp)
                    .clip(RoundedCornerShape(4.dp)),
                color = EmeraldPrimary,
                trackColor = Color.DarkGray
            )

            Spacer(modifier = Modifier.height(16.dp))

            // Macro Bars (Protein, Carbs, Fat)
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                MacroMiniCard(
                    title = "Protein",
                    consumed = proteinConsumed.toInt(),
                    target = proteinTarget,
                    color = EmeraldPrimary,
                    modifier = Modifier.weight(1f)
                )
                MacroMiniCard(
                    title = "Carbs",
                    consumed = carbsConsumed.toInt(),
                    target = carbsTarget,
                    color = QualityModerate,
                    modifier = Modifier.weight(1f)
                )
                MacroMiniCard(
                    title = "Fat",
                    consumed = fatConsumed.toInt(),
                    target = fatTarget,
                    color = Color(0xFFF43F5E),
                    modifier = Modifier.weight(1f)
                )
            }
        }
    }
}

@Composable
private fun MacroMiniCard(
    title: String,
    consumed: Int,
    target: Int,
    color: Color,
    modifier: Modifier = Modifier
) {
    val progress = if (target > 0) (consumed.toFloat() / target).coerceIn(0f, 1f) else 0f

    Column(modifier = modifier) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(4.dp)
        ) {
            Box(
                modifier = Modifier
                    .size(6.dp)
                    .clip(CircleShape)
                    .background(color)
            )
            Text(
                text = title,
                fontSize = 11.sp,
                color = TextSecondary,
                fontWeight = FontWeight.Medium
            )
        }

        Spacer(modifier = Modifier.height(4.dp))

        Text(
            text = "${consumed}g / ${target}g",
            fontSize = 12.sp,
            fontWeight = FontWeight.SemiBold,
            color = TextPrimary
        )

        Spacer(modifier = Modifier.height(4.dp))

        LinearProgressIndicator(
            progress = { progress },
            modifier = Modifier
                .fillMaxWidth()
                .height(4.dp)
                .clip(RoundedCornerShape(2.dp)),
            color = color,
            trackColor = Color.DarkGray
        )
    }
}
