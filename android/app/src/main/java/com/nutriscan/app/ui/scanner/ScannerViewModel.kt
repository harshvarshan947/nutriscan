package com.nutriscan.app.ui.scanner

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.nutriscan.app.data.model.Product
import com.nutriscan.app.data.repository.ProductRepository
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

sealed interface ScannerUiState {
    object Idle : ScannerUiState
    data class Loading(val barcode: String) : ScannerUiState
    data class Success(val product: Product) : ScannerUiState
    data class NotFound(val barcode: String) : ScannerUiState
    data class Error(val message: String) : ScannerUiState
}

class ScannerViewModel(
    private val productRepository: ProductRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow<ScannerUiState>(ScannerUiState.Idle)
    val uiState: StateFlow<ScannerUiState> = _uiState.asStateFlow()

    private val _isFlashlightOn = MutableStateFlow(false)
    val isFlashlightOn: StateFlow<Boolean> = _isFlashlightOn.asStateFlow()

    private val _showManualDialog = MutableStateFlow(false)
    val showManualDialog: StateFlow<Boolean> = _showManualDialog.asStateFlow()

    val recentScans: StateFlow<List<Product>> = productRepository.getRecentScans()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    private val _navigationEvent = MutableSharedFlow<String>()
    val navigationEvent: SharedFlow<String> = _navigationEvent.asSharedFlow()

    fun toggleFlashlight() {
        _isFlashlightOn.value = !_isFlashlightOn.value
    }

    fun setManualDialogVisible(visible: Boolean) {
        _showManualDialog.value = visible
    }

    fun onBarcodeScanned(barcode: String) {
        if (_uiState.value is ScannerUiState.Loading) return

        viewModelScope.launch {
            _uiState.value = ScannerUiState.Loading(barcode)
            val result = productRepository.getProduct(barcode)
            result.onSuccess { product ->
                _uiState.value = ScannerUiState.Success(product)
                _navigationEvent.emit(product.barcode)
            }.onFailure {
                _uiState.value = ScannerUiState.NotFound(barcode)
            }
        }
    }

    fun resetState() {
        _uiState.value = ScannerUiState.Idle
    }
}

class ScannerViewModelFactory(
    private val repository: ProductRepository
) : ViewModelProvider.Factory {
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        if (modelClass.isAssignableFrom(ScannerViewModel::class.java)) {
            @Suppress("UNCHECKED_CAST")
            return ScannerViewModel(repository) as T
        }
        throw IllegalArgumentException("Unknown ViewModel class")
    }
}
