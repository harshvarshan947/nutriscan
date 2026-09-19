package com.nutriscan.app.ui.search

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.nutriscan.app.data.model.Product
import com.nutriscan.app.data.repository.ProductRepository
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

sealed interface SearchUiState {
    object Idle : SearchUiState
    object Loading : SearchUiState
    data class Success(val products: List<Product>) : SearchUiState
    object Empty : SearchUiState
    data class Error(val message: String) : SearchUiState
}

class SearchViewModel(
    private val productRepository: ProductRepository
) : ViewModel() {

    private val _query = MutableStateFlow("")
    val query: StateFlow<String> = _query.asStateFlow()

    private val _uiState = MutableStateFlow<SearchUiState>(SearchUiState.Idle)
    val uiState: StateFlow<SearchUiState> = _uiState.asStateFlow()

    private var searchJob: Job? = null

    val suggestedSearches = listOf("Oreo", "Lays", "Maggi", "Almonds", "Oat Milk", "Greek Yogurt", "Banana")

    fun onQueryChanged(newQuery: String) {
        _query.value = newQuery
        searchJob?.cancel()

        if (newQuery.isBlank()) {
            _uiState.value = SearchUiState.Idle
            return
        }

        searchJob = viewModelScope.launch {
            delay(350) // Debounce
            performSearch(newQuery.trim())
        }
    }

    fun selectSuggested(term: String) {
        _query.value = term
        searchJob?.cancel()
        viewModelScope.launch {
            performSearch(term)
        }
    }

    private suspend fun performSearch(q: String) {
        _uiState.value = SearchUiState.Loading
        val result = productRepository.searchProducts(q)
        result.onSuccess { list ->
            if (list.isEmpty()) {
                _uiState.value = SearchUiState.Empty
            } else {
                _uiState.value = SearchUiState.Success(list)
            }
        }.onFailure { err ->
            _uiState.value = SearchUiState.Error(err.message ?: "Failed to search")
        }
    }
}

class SearchViewModelFactory(
    private val repository: ProductRepository
) : ViewModelProvider.Factory {
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        if (modelClass.isAssignableFrom(SearchViewModel::class.java)) {
            @Suppress("UNCHECKED_CAST")
            return SearchViewModel(repository) as T
        }
        throw IllegalArgumentException("Unknown ViewModel class")
    }
}
