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
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.PriorityHigh
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.nutriscan.app.data.model.AssessmentFactor
import com.nutriscan.app.data.model.FactorType
import com.nutriscan.app.ui.theme.DarkCard
import com.nutriscan.app.ui.theme.QualityExcellent
import com.nutriscan.app.ui.theme.QualityLow
import com.nutriscan.app.ui.theme.QualityModerate
import com.nutriscan.app.ui.theme.TextPrimary
import com.nutriscan.app.ui.theme.TextSecondary

@Composable
fun FactorPill(
    factor: AssessmentFactor,
    modifier: Modifier = Modifier
) {
    val (bgColor, iconVector, iconTint) = when (factor.type) {
        FactorType.POSITIVE -> Triple(QualityExcellent.copy(alpha = 0.15f), Icons.Default.Check, QualityExcellent)
        FactorType.CAUTION -> Triple(QualityModerate.copy(alpha = 0.15f), Icons.Default.PriorityHigh, QualityModerate)
        FactorType.WARNING -> Triple(QualityLow.copy(alpha = 0.15f), Icons.Default.Warning, QualityLow)
    }

    Card(
        modifier = modifier.fillMaxWidth(),
        shape = RoundedCornerShape(10.dp),
        colors = CardDefaults.cardColors(containerColor = DarkCard)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp),
            verticalAlignment = Alignment.Top
        ) {
            Box(
                modifier = Modifier
                    .size(28.dp)
                    .clip(CircleShape)
                    .background(bgColor),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = iconVector,
                    contentDescription = null,
                    tint = iconTint,
                    modifier = Modifier.size(16.dp)
                )
            }

            Column(
                modifier = Modifier
                    .weight(1f)
                    .padding(start = 12.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = factor.title,
                        fontSize = 13.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = TextPrimary
                    )

                    factor.metric?.let {
                        Text(
                            text = it,
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Medium,
                            color = iconTint
                        )
                    }
                }

                Spacer(modifier = Modifier.height(2.dp))

                Text(
                    text = factor.description,
                    fontSize = 12.sp,
                    color = TextSecondary,
                    lineHeight = 16.sp
                )
            }
        }
    }
}
