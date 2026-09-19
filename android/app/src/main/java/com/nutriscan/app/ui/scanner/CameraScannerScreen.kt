package com.nutriscan.app.ui.scanner

import android.Manifest
import android.content.pm.PackageManager
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CameraAlt
import androidx.compose.material.icons.filled.FlashOn
import androidx.compose.material.icons.filled.FlashOff
import androidx.compose.material.icons.filled.Keyboard
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
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
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.content.ContextCompat
import coil.compose.AsyncImage
import com.nutriscan.app.data.model.Product
import com.nutriscan.app.ui.components.BarcodeScannerView
import com.nutriscan.app.ui.theme.DarkBackground
import com.nutriscan.app.ui.theme.DarkCard
import com.nutriscan.app.ui.theme.EmeraldPrimary
import com.nutriscan.app.ui.theme.QualityGood
import com.nutriscan.app.ui.theme.TextPrimary
import com.nutriscan.app.ui.theme.TextSecondary
import kotlinx.coroutines.flow.collectLatest

@Composable
fun CameraScannerScreen(
    viewModel: ScannerViewModel,
    onNavigateToProduct: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    var hasCameraPermission by remember {
        mutableStateOf(
            ContextCompat.checkSelfPermission(
                context,
                Manifest.permission.CAMERA
            ) == PackageManager.PERMISSION_GRANTED
        )
    }

    val permissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestPermission()
    ) { isGranted ->
        hasCameraPermission = isGranted
    }

    LaunchedEffect(Unit) {
        if (!hasCameraPermission) {
            permissionLauncher.launch(Manifest.permission.CAMERA)
        }
    }

    val uiState by viewModel.uiState.collectAsState()
    val isFlashlightOn by viewModel.isFlashlightOn.collectAsState()
    val showManualDialog by viewModel.showManualDialog.collectAsState()
    val recentScans by viewModel.recentScans.collectAsState()

    LaunchedEffect(Unit) {
        viewModel.navigationEvent.collectLatest { barcode ->
            onNavigateToProduct(barcode)
        }
    }

    Box(modifier = modifier.fillMaxSize().background(DarkBackground)) {
        if (hasCameraPermission) {
            // Live Camera View
            BarcodeScannerView(
                onBarcodeDetected = { barcode ->
                    viewModel.onBarcodeScanned(barcode)
                },
                isFlashlightOn = isFlashlightOn
            )

            // Reticle Target Box Overlay
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(bottom = 120.dp),
                contentAlignment = Alignment.Center
            ) {
                val infiniteTransition = rememberInfiniteTransition(label = "laser")
                val laserProgress by infiniteTransition.animateFloat(
                    initialValue = 0f,
                    targetValue = 1f,
                    animationSpec = infiniteRepeatable(
                        animation = tween(1500, easing = FastOutSlowInEasing),
                        repeatMode = RepeatMode.Reverse
                    ),
                    label = "laser_y"
                )

                Box(
                    modifier = Modifier
                        .size(280.dp, 200.dp)
                        .border(2.dp, EmeraldPrimary.copy(alpha = 0.8f), RoundedCornerShape(16.dp))
                ) {
                    // Scanning laser line
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(2.dp)
                            .padding(horizontal = 8.dp)
                            .align(Alignment.TopCenter)
                            .padding(top = (laserProgress * 190).dp)
                            .background(EmeraldPrimary)
                    )
                }

                Text(
                    text = "Center food barcode inside box",
                    fontSize = 13.sp,
                    color = Color.White.copy(alpha = 0.85f),
                    modifier = Modifier
                        .align(Alignment.Center)
                        .padding(top = 240.dp)
                        .background(Color.Black.copy(alpha = 0.5f), RoundedCornerShape(8.dp))
                        .padding(horizontal = 12.dp, vertical = 6.dp)
                )
            }
        } else {
            // Camera Permission Needed View
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(32.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Center
            ) {
                Icon(
                    imageVector = Icons.Default.CameraAlt,
                    contentDescription = null,
                    tint = EmeraldPrimary,
                    modifier = Modifier.size(64.dp)
                )
                Spacer(modifier = Modifier.height(16.dp))
                Text(
                    text = "Camera Permission Required",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = TextPrimary
                )
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = "NutriScan needs camera access to scan product barcodes instantly.",
                    fontSize = 13.sp,
                    color = TextSecondary,
                    textAlign = androidx.compose.ui.text.style.TextAlign.Center
                )
                Spacer(modifier = Modifier.height(20.dp))
                Button(
                    onClick = { permissionLauncher.launch(Manifest.permission.CAMERA) },
                    colors = ButtonDefaults.buttonColors(containerColor = EmeraldPrimary)
                ) {
                    Text("Grant Camera Access", color = DarkBackground)
                }
            }
        }

        // Top Control Bar (Flashlight, Manual Barcode Entry)
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(top = 16.dp, start = 16.dp, end = 16.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "NutriScan",
                fontSize = 20.sp,
                fontWeight = FontWeight.Bold,
                color = TextPrimary
            )

            Row {
                IconButton(
                    onClick = { viewModel.toggleFlashlight() },
                    modifier = Modifier
                        .size(40.dp)
                        .clip(CircleShape)
                        .background(Color.Black.copy(alpha = 0.5f))
                ) {
                    Icon(
                        imageVector = if (isFlashlightOn) Icons.Default.FlashOn else Icons.Default.FlashOff,
                        contentDescription = "Torch",
                        tint = if (isFlashlightOn) EmeraldPrimary else Color.White
                    )
                }

                Spacer(modifier = Modifier.width(8.dp))

                IconButton(
                    onClick = { viewModel.setManualDialogVisible(true) },
                    modifier = Modifier
                        .size(40.dp)
                        .clip(CircleShape)
                        .background(Color.Black.copy(alpha = 0.5f))
                ) {
                    Icon(
                        imageVector = Icons.Default.Keyboard,
                        contentDescription = "Manual Entry",
                        tint = Color.White
                    )
                }
            }
        }

        // Bottom Bar: Recent Scans Carousel
        if (recentScans.isNotEmpty()) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .align(Alignment.BottomCenter)
                    .background(Color.Black.copy(alpha = 0.6f))
                    .padding(vertical = 12.dp)
            ) {
                Text(
                    text = "Recently Scanned",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = TextSecondary,
                    modifier = Modifier.padding(horizontal = 16.dp, vertical = 4.dp)
                )

                LazyRow(
                    contentPadding = PaddingValues(horizontal = 16.dp),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    items(recentScans) { product ->
                        RecentScanItem(product = product) {
                            onNavigateToProduct(product.barcode)
                        }
                    }
                }
            }
        }

        // Loading Overlay
        if (uiState is ScannerUiState.Loading) {
            val barcode = (uiState as ScannerUiState.Loading).barcode
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(Color.Black.copy(alpha = 0.7f)),
                contentAlignment = Alignment.Center
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    CircularProgressIndicator(color = EmeraldPrimary)
                    Spacer(modifier = Modifier.height(16.dp))
                    Text(
                        text = "Analyzing $barcode...",
                        fontSize = 14.sp,
                        color = TextPrimary
                    )
                }
            }
        }

        // Not Found Alert Dialog
        if (uiState is ScannerUiState.NotFound) {
            val barcode = (uiState as ScannerUiState.NotFound).barcode
            AlertDialog(
                onDismissRequest = { viewModel.resetState() },
                title = { Text("Product Not Found") },
                text = {
                    Text("Barcode $barcode was not found in Open Food Facts. You can search by product name instead.")
                },
                confirmButton = {
                    Button(
                        onClick = { viewModel.resetState() },
                        colors = ButtonDefaults.buttonColors(containerColor = EmeraldPrimary)
                    ) {
                        Text("Try Again", color = DarkBackground)
                    }
                }
            )
        }

        // Manual Barcode Input Dialog
        if (showManualDialog) {
            var inputBarcode by remember { mutableStateOf("") }
            AlertDialog(
                onDismissRequest = { viewModel.setManualDialogVisible(false) },
                title = { Text("Enter Barcode Manually") },
                text = {
                    Column {
                        Text(
                            text = "Enter standard 8, 12, or 13-digit food barcode:",
                            fontSize = 12.sp,
                            color = TextSecondary
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        OutlinedTextField(
                            value = inputBarcode,
                            onValueChange = { inputBarcode = it },
                            singleLine = true,
                            keyboardOptions = KeyboardOptions(
                                keyboardType = KeyboardType.Number,
                                imeAction = ImeAction.Done
                            ),
                            keyboardActions = KeyboardActions(
                                onDone = {
                                    if (inputBarcode.isNotBlank()) {
                                        viewModel.setManualDialogVisible(false)
                                        viewModel.onBarcodeScanned(inputBarcode.trim())
                                    }
                                }
                            ),
                            placeholder = { Text("e.g. 3017620422003") }
                        )
                    }
                },
                confirmButton = {
                    Button(
                        onClick = {
                            if (inputBarcode.isNotBlank()) {
                                viewModel.setManualDialogVisible(false)
                                viewModel.onBarcodeScanned(inputBarcode.trim())
                            }
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = EmeraldPrimary)
                    ) {
                        Text("Lookup", color = DarkBackground)
                    }
                },
                dismissButton = {
                    TextButton(onClick = { viewModel.setManualDialogVisible(false) }) {
                        Text("Cancel")
                    }
                }
            )
        }
    }
}

@Composable
private fun RecentScanItem(
    product: Product,
    onClick: () -> Unit
) {
    Row(
        modifier = Modifier
            .clip(RoundedCornerShape(8.dp))
            .background(DarkCard)
            .clickable(onClick = onClick)
            .padding(horizontal = 10.dp, vertical = 6.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        if (!product.imageUrl.isNullOrBlank()) {
            AsyncImage(
                model = product.imageUrl,
                contentDescription = null,
                modifier = Modifier
                    .size(32.dp)
                    .clip(RoundedCornerShape(4.dp))
            )
            Spacer(modifier = Modifier.width(8.dp))
        }

        Column {
            Text(
                text = product.name,
                fontSize = 12.sp,
                fontWeight = FontWeight.Medium,
                color = TextPrimary,
                maxLines = 1
            )
            Text(
                text = "${product.nutrients100g.calories.toInt()} kcal",
                fontSize = 10.sp,
                color = QualityGood
            )
        }
    }
}
