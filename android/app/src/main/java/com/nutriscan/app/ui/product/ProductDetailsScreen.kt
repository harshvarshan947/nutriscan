package com.nutriscan.app.ui.product

import android.content.Intent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Share
import androidx.compose.material.icons.filled.Star
import androidx.compose.material.icons.filled.StarBorder
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.nutriscan.app.data.model.AdditiveRisk
import com.nutriscan.app.data.model.FoodAdditive
import com.nutriscan.app.ui.components.FactorPill
import com.nutriscan.app.ui.components.NutritionGrid
import com.nutriscan.app.ui.components.ScoreGauge
import com.nutriscan.app.ui.theme.DarkBackground
import com.nutriscan.app.ui.theme.DarkCard
import com.nutriscan.app.ui.theme.DarkSurface
import com.nutriscan.app.ui.theme.EmeraldPrimary
import com.nutriscan.app.ui.theme.Nova1Color
import com.nutriscan.app.ui.theme.Nova2Color
import com.nutriscan.app.ui.theme.Nova3Color
import com.nutriscan.app.ui.theme.Nova4Color
import com.nutriscan.app.ui.theme.QualityExcellent
import com.nutriscan.app.ui.theme.QualityLow
import com.nutriscan.app.ui.theme.QualityModerate
import com.nutriscan.app.ui.theme.TextMuted
import com.nutriscan.app.ui.theme.TextPrimary
import com.nutriscan.app.ui.theme.TextSecondary
import com.nutriscan.app.ui.tracking.LogMealDialog

@OptIn(ExperimentalMaterial3Api::class, ExperimentalLayoutApi::class)
@Composable
fun ProductDetailsScreen(
    viewModel: ProductDetailsViewModel,
    onNavigateBack: () -> Unit,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val uiState by viewModel.uiState.collectAsState()
    val snackbarHostState = remember { SnackbarHostState() }

    LaunchedEffect(uiState.mealLoggedMessage) {
        uiState.mealLoggedMessage?.let {
            snackbarHostState.showSnackbar(it)
            viewModel.clearMessage()
        }
    }

    Scaffold(
        modifier = modifier.fillMaxSize(),
        containerColor = DarkBackground,
        snackbarHost = { SnackbarHost(snackbarHostState) },
        topBar = {
            TopAppBar(
                title = { Text("Product Details", fontSize = 18.sp, fontWeight = FontWeight.SemiBold) },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                            contentDescription = "Back",
                            tint = TextPrimary
                        )
                    }
                },
                actions = {
                    uiState.product?.let { product ->
                        IconButton(onClick = { viewModel.toggleFavorite() }) {
                            Icon(
                                imageVector = if (product.isFavorite) Icons.Default.Star else Icons.Default.StarBorder,
                                contentDescription = "Favorite",
                                tint = if (product.isFavorite) QualityModerate else TextPrimary
                            )
                        }

                        IconButton(onClick = {
                            val shareIntent = Intent(Intent.ACTION_SEND).apply {
                                type = "text/plain"
                                putExtra(
                                    Intent.EXTRA_TEXT,
                                    "Check out ${product.name} on NutriScan! Quality Score: ${product.qualityScore}/100"
                                )
                            }
                            context.startActivity(Intent.createChooser(shareIntent, "Share Food Info"))
                        }) {
                            Icon(
                                imageVector = Icons.Default.Share,
                                contentDescription = "Share",
                                tint = TextPrimary
                            )
                        }
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = DarkSurface,
                    titleContentColor = TextPrimary
                )
            )
        },
        bottomBar = {
            uiState.product?.let {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(DarkSurface)
                        .padding(16.dp)
                ) {
                    Button(
                        onClick = { viewModel.setLogMealDialogVisible(true) },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(50.dp),
                        shape = RoundedCornerShape(12.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = EmeraldPrimary)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Add,
                            contentDescription = null,
                            tint = DarkBackground,
                            modifier = Modifier.padding(end = 8.dp)
                        )
                        Text(
                            text = "Log to Meals",
                            fontSize = 15.sp,
                            fontWeight = FontWeight.Bold,
                            color = DarkBackground
                        )
                    }
                }
            }
        }
    ) { paddingValues ->
        if (uiState.isLoading) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues),
                contentAlignment = Alignment.Center
            ) {
                CircularProgressIndicator(color = EmeraldPrimary)
            }
        } else if (uiState.product == null) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues),
                contentAlignment = Alignment.Center
            ) {
                Text("Product could not be loaded.", color = TextSecondary)
            }
        } else {
            val product = uiState.product!!
            val assessment = uiState.assessment ?: return@Scaffold

            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues)
                    .verticalScroll(rememberScrollState())
                    .padding(16.dp)
            ) {
                // Product Hero Card
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = DarkSurface)
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        if (!product.imageUrl.isNullOrBlank()) {
                            AsyncImage(
                                model = product.imageUrl,
                                contentDescription = product.name,
                                modifier = Modifier
                                    .size(90.dp)
                                    .clip(RoundedCornerShape(12.dp))
                                    .background(DarkCard)
                            )
                            Spacer(modifier = Modifier.width(16.dp))
                        }

                        Column(modifier = Modifier.weight(1f)) {
                            if (product.brand.isNotBlank()) {
                                Text(
                                    text = product.brand.uppercase(),
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = EmeraldPrimary,
                                    letterSpacing = 1.sp
                                )
                                Spacer(modifier = Modifier.height(2.dp))
                            }

                            Text(
                                text = product.name,
                                fontSize = 18.sp,
                                fontWeight = FontWeight.Bold,
                                color = TextPrimary
                            )

                            Spacer(modifier = Modifier.height(4.dp))

                            Text(
                                text = "Barcode: ${product.barcode}",
                                fontSize = 11.sp,
                                color = TextMuted
                            )

                            Spacer(modifier = Modifier.height(8.dp))

                            // Badges: NOVA & Nutri-Score
                            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                product.novaGroup?.let { nova ->
                                    val (novaColor, novaText) = when (nova) {
                                        1 -> Nova1Color to "NOVA 1 (Unprocessed)"
                                        2 -> Nova2Color to "NOVA 2 (Culinary)"
                                        3 -> Nova3Color to "NOVA 3 (Processed)"
                                        else -> Nova4Color to "NOVA 4 (Ultra-Processed)"
                                    }
                                    Text(
                                        text = novaText,
                                        fontSize = 10.sp,
                                        fontWeight = FontWeight.SemiBold,
                                        color = novaColor,
                                        modifier = Modifier
                                            .background(novaColor.copy(alpha = 0.15f), RoundedCornerShape(4.dp))
                                            .padding(horizontal = 6.dp, vertical = 2.dp)
                                    )
                                }

                                product.nutriScore?.let { ns ->
                                    Text(
                                        text = "Nutri-Score ${ns.uppercase()}",
                                        fontSize = 10.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = Color.White,
                                        modifier = Modifier
                                            .background(Color(0xFF2563EB), RoundedCornerShape(4.dp))
                                            .padding(horizontal = 6.dp, vertical = 2.dp)
                                    )
                                }
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Quality Score Card
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = DarkSurface)
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(20.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text(
                            text = "Nutrition Quality Score",
                            fontSize = 14.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = TextSecondary
                        )

                        Spacer(modifier = Modifier.height(14.dp))

                        ScoreGauge(
                            score = assessment.qualityScore,
                            tier = assessment.qualityTier
                        )

                        Spacer(modifier = Modifier.height(14.dp))

                        Text(
                            text = assessment.summaryHeadline,
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Medium,
                            color = TextPrimary
                        )

                        assessment.novaInsight?.let {
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                text = it,
                                fontSize = 11.sp,
                                color = TextMuted
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Nutrition Facts Grid
                NutritionGrid(
                    product = product,
                    assessment = assessment,
                    onEditClicked = { viewModel.setEditDialogVisible(true) }
                )

                Spacer(modifier = Modifier.height(16.dp))

                // Why This Score (Positive & Caution Factors)
                Text(
                    text = "Why This Score",
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold,
                    color = TextPrimary
                )
                Spacer(modifier = Modifier.height(8.dp))

                if (assessment.positiveFactors.isEmpty() && assessment.cautionFactors.isEmpty()) {
                    Text("Standard balanced nutrition with no specific flags.", fontSize = 12.sp, color = TextSecondary)
                }

                assessment.positiveFactors.forEach { factor ->
                    FactorPill(factor = factor)
                    Spacer(modifier = Modifier.height(8.dp))
                }

                assessment.cautionFactors.forEach { factor ->
                    FactorPill(factor = factor)
                    Spacer(modifier = Modifier.height(8.dp))
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Ingredients Section
                if (!product.ingredientsText.isNullOrBlank()) {
                    Text(
                        text = "Ingredients",
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold,
                        color = TextPrimary
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(12.dp),
                        colors = CardDefaults.cardColors(containerColor = DarkSurface)
                    ) {
                        Text(
                            text = product.ingredientsText,
                            fontSize = 12.sp,
                            color = TextSecondary,
                            lineHeight = 18.sp,
                            modifier = Modifier.padding(14.dp)
                        )
                    }
                    Spacer(modifier = Modifier.height(16.dp))
                }

                // Allergens Section
                if (product.allergens.isNotEmpty()) {
                    Text(
                        text = "Allergens",
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold,
                        color = TextPrimary
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    FlowRow(
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        product.allergens.forEach { allergen ->
                            Box(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(6.dp))
                                    .background(QualityModerate.copy(alpha = 0.2f))
                                    .padding(horizontal = 10.dp, vertical = 4.dp)
                            ) {
                                Text(
                                    text = allergen,
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Medium,
                                    color = QualityModerate
                                )
                            }
                        }
                    }
                    Spacer(modifier = Modifier.height(16.dp))
                }

                // Additives Section
                if (product.additives.isNotEmpty()) {
                    Text(
                        text = "Food Additives (${product.additives.size})",
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold,
                        color = TextPrimary
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        product.additives.forEach { additive ->
                            AdditiveItemRow(additive = additive)
                        }
                    }
                    Spacer(modifier = Modifier.height(24.dp))
                }
            }

            // Edit Nutrition Dialog
            if (uiState.showEditDialog) {
                EditNutritionDialog(
                    initialNutrients = product.nutrients100g,
                    onDismiss = { viewModel.setEditDialogVisible(false) },
                    onSave = { updated -> viewModel.updateNutrients(updated) }
                )
            }

            // Log Meal Dialog
            if (uiState.showLogMealDialog) {
                LogMealDialog(
                    product = product,
                    onDismiss = { viewModel.setLogMealDialogVisible(false) },
                    onConfirmLog = { mealType, servings, useServingBasis ->
                        viewModel.logToMeal(mealType, servings, useServingBasis)
                    }
                )
            }
        }
    }
}

@Composable
private fun AdditiveItemRow(additive: FoodAdditive) {
    val (riskColor, riskLabel) = when (additive.riskLevel) {
        AdditiveRisk.SAFE -> QualityExcellent to "Safe"
        AdditiveRisk.CAUTION -> QualityModerate to "Caution"
        AdditiveRisk.HIGH_RISK -> QualityLow to "High Risk"
        AdditiveRisk.UNKNOWN -> TextMuted to "Additive"
    }

    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(10.dp),
        colors = CardDefaults.cardColors(containerColor = DarkSurface)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = additive.name,
                    fontSize = 13.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = TextPrimary
                )
                additive.function?.let {
                    Text(
                        text = it,
                        fontSize = 11.sp,
                        color = TextSecondary
                    )
                }
            }

            Box(
                modifier = Modifier
                    .clip(RoundedCornerShape(4.dp))
                    .background(riskColor.copy(alpha = 0.2f))
                    .padding(horizontal = 8.dp, vertical = 3.dp)
            ) {
                Text(
                    text = riskLabel,
                    fontSize = 10.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = riskColor
                )
            }
        }
    }
}
