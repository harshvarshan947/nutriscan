package com.nutriscan.app.ui.product

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.nutriscan.app.data.model.AssessmentResult
import com.nutriscan.app.data.model.MealType
import com.nutriscan.app.data.model.Nutrients
import com.nutriscan.app.data.model.Product
import com.nutriscan.app.data.repository.ProductRepository
import com.nutriscan.app.data.repository.TrackingRepository
import com.nutriscan.app.domain.assessment.QualityScoreEngine
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.launch

data class ProductDetailsUiState(
    val isLoading: Boolean = true,
    val product: Product? = null,
    val assessment: AssessmentResult? = null,
    val showEditDialog: Boolean = false,
    val showLogMealDialog: Boolean = false,
    val mealLoggedMessage: String? = null
)

class ProductDetailsViewModel(
    private val barcode: String,
    private val productRepository: ProductRepository,
    private val trackingRepository: TrackingRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(ProductDetailsUiState())
    val uiState: StateFlow<ProductDetailsUiState> = _uiState.asStateFlow()

    init {
        loadProduct()
    }

    private fun loadProduct() {
        viewModelScope.launch {
            productRepository.getProductFlow(barcode).collectLatest { product ->
                if (product != null) {
                    val assessment = QualityScoreEngine.evaluate(product)
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        product = product,
                        assessment = assessment
                    )
                } else {
                    // Try fetching from repository
                    val result = productRepository.getProduct(barcode)
                    result.onSuccess { p ->
                        val assessment = QualityScoreEngine.evaluate(p)
                        _uiState.value = _uiState.value.copy(
                            isLoading = false,
                            product = p,
                            assessment = assessment
                        )
                    }.onFailure {
                        _uiState.value = _uiState.value.copy(isLoading = false)
                    }
                }
            }
        }
    }

    fun toggleFavorite() {
        val product = _uiState.value.product ?: return
        viewModelScope.launch {
            productRepository.toggleFavorite(product.barcode, product.isFavorite)
        }
    }

    fun setEditDialogVisible(visible: Boolean) {
        _uiState.value = _uiState.value.copy(showEditDialog = visible)
    }

    fun setLogMealDialogVisible(visible: Boolean) {
        _uiState.value = _uiState.value.copy(showLogMealDialog = visible)
    }

    fun updateNutrients(new100g: Nutrients) {
        val product = _uiState.value.product ?: return
        viewModelScope.launch {
            // Proportional calculation for serving if present
            var newServing: Nutrients? = null
            if (product.servingQuantityGrams != null && product.servingQuantityGrams > 0) {
                val ratio = product.servingQuantityGrams / 100.0
                newServing = Nutrients(
                    calories = new100g.calories * ratio,
                    protein = new100g.protein * ratio,
                    carbohydrates = new100g.carbohydrates * ratio,
                    sugars = new100g.sugars * ratio,
                    addedSugars = new100g.addedSugars?.times(ratio),
                    fat = new100g.fat * ratio,
                    saturatedFat = new100g.saturatedFat * ratio,
                    fiber = new100g.fiber * ratio,
                    sodium = new100g.sodium * ratio,
                    salt = new100g.salt * ratio
                )
            }
            productRepository.updateProductNutrients(product.barcode, new100g, newServing)
            setEditDialogVisible(false)
        }
    }

    fun logToMeal(mealType: MealType, servings: Double, useServingBasis: Boolean) {
        val product = _uiState.value.product ?: return
        viewModelScope.launch {
            trackingRepository.logMeal(product, mealType, servings, useServingBasis)
            setLogMealDialogVisible(false)
            _uiState.value = _uiState.value.copy(mealLoggedMessage = "Added to ${mealType.name.lowercase().capitalize()}!")
        }
    }

    fun clearMessage() {
        _uiState.value = _uiState.value.copy(mealLoggedMessage = null)
    }

    private fun String.capitalize(): String {
        return replaceFirstChar { if (it.isLowerCase()) it.titlecase() else it.toString() }
    }
}

class ProductDetailsViewModelFactory(
    private val barcode: String,
    private val productRepository: ProductRepository,
    private val trackingRepository: TrackingRepository
) : ViewModelProvider.Factory {
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        if (modelClass.isAssignableFrom(ProductDetailsViewModel::class.java)) {
            @Suppress("UNCHECKED_CAST")
            return ProductDetailsViewModel(barcode, productRepository, trackingRepository) as T
        }
        throw IllegalArgumentException("Unknown ViewModel class")
    }
}
