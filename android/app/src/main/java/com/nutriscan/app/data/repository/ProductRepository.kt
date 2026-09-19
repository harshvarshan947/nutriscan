package com.nutriscan.app.data.repository

import com.nutriscan.app.data.local.dao.ProductDao
import com.nutriscan.app.data.model.Nutrients
import com.nutriscan.app.data.model.Product
import com.nutriscan.app.data.remote.ApiClient
import com.nutriscan.app.domain.assessment.QualityScoreEngine
import com.nutriscan.app.domain.normalizer.NutrientNormalizer
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.withContext

class ProductRepository(
    private val productDao: ProductDao
) {

    fun getRecentScans(): Flow<List<Product>> = productDao.getRecentScans()

    fun getFavorites(): Flow<List<Product>> = productDao.getFavorites()

    fun getProductFlow(barcode: String): Flow<Product?> = productDao.getProductFlow(barcode)

    suspend fun toggleFavorite(barcode: String, currentStatus: Boolean) = withContext(Dispatchers.IO) {
        productDao.updateFavoriteStatus(barcode, !currentStatus)
    }

    /**
     * Look up a product by barcode with local cache first, variant expansion, and multi-mirror fallback
     */
    suspend fun getProduct(rawBarcode: String): Result<Product> = withContext(Dispatchers.IO) {
        val cleanBarcode = rawBarcode.trim()
        if (cleanBarcode.isEmpty()) {
            return@withContext Result.failure(IllegalArgumentException("Barcode is empty"))
        }

        val variants = generateBarcodeVariants(cleanBarcode)

        // 1. Check local Room database for any variant
        for (variant in variants) {
            val local = productDao.getProductByBarcode(variant)
            if (local != null) {
                // Update last scanned timestamp
                val updated = local.copy(lastScannedAt = System.currentTimeMillis())
                productDao.insertProduct(updated)
                return@withContext Result.success(updated)
            }
        }

        // 2. Query remote Open Food Facts API (Primary mirror)
        for (variant in variants) {
            val remoteProduct = fetchFromRemote(variant)
            if (remoteProduct != null) {
                // Calculate quality score and store in DB
                val assessment = QualityScoreEngine.evaluate(remoteProduct)
                val finalProduct = remoteProduct.copy(
                    qualityScore = assessment.qualityScore,
                    lastScannedAt = System.currentTimeMillis()
                )
                productDao.insertProduct(finalProduct)
                return@withContext Result.success(finalProduct)
            }
        }

        Result.failure(NoSuchElementException("Product not found for barcode: $cleanBarcode"))
    }

    private suspend fun fetchFromRemote(barcode: String): Product? {
        // Try primary API
        try {
            val response = ApiClient.primaryApi.getProduct(barcode)
            if (response.isSuccessful && response.body()?.status == 1 && response.body()?.product != null) {
                val offProduct = response.body()!!.product!!
                if (!offProduct.productName.isNullOrBlank() || !offProduct.productNameEn.isNullOrBlank()) {
                    return NutrientNormalizer.normalize(barcode, offProduct)
                }
            }
        } catch (e: Exception) {
            // Mirror failed or timed out, try fallback
        }

        // Try fallback mirror
        try {
            val fallbackResponse = ApiClient.fallbackApi.getProduct(barcode)
            if (fallbackResponse.isSuccessful && fallbackResponse.body()?.status == 1 && fallbackResponse.body()?.product != null) {
                val offProduct = fallbackResponse.body()!!.product!!
                if (!offProduct.productName.isNullOrBlank() || !offProduct.productNameEn.isNullOrBlank()) {
                    return NutrientNormalizer.normalize(barcode, offProduct)
                }
            }
        } catch (e: Exception) {
            // Both mirrors failed
        }

        return null
    }

    /**
     * Search products by keyword
     */
    suspend fun searchProducts(query: String): Result<List<Product>> = withContext(Dispatchers.IO) {
        val q = query.trim()
        if (q.isEmpty()) return@withContext Result.success(emptyList())

        try {
            // Try primary mirror search
            val response = try {
                ApiClient.primaryApi.searchProducts(q)
            } catch (e: Exception) {
                ApiClient.fallbackApi.searchProducts(q)
            }

            if (response.isSuccessful && response.body() != null) {
                val offProducts = response.body()!!.products
                val normalizedList = offProducts.mapNotNull { off ->
                    val code = off.code ?: return@mapNotNull null
                    if (off.productName.isNullOrBlank() && off.productNameEn.isNullOrBlank()) return@mapNotNull null
                    val prod = NutrientNormalizer.normalize(code, off)
                    val assessment = QualityScoreEngine.evaluate(prod)
                    prod.copy(qualityScore = assessment.qualityScore)
                }

                // Cache search results in Room
                if (normalizedList.isNotEmpty()) {
                    productDao.insertProducts(normalizedList)
                }

                return@withContext Result.success(normalizedList)
            }
        } catch (e: Exception) {
            // Network error
        }

        Result.failure(Exception("Could not perform product search"))
    }

    /**
     * Update nutrient values when user edits a product
     */
    suspend fun updateProductNutrients(
        barcode: String,
        nutrients100g: Nutrients,
        nutrientsServing: Nutrients?
    ) = withContext(Dispatchers.IO) {
        val existing = productDao.getProductByBarcode(barcode) ?: return@withContext
        val updated = existing.copy(
            nutrients100g = nutrients100g,
            nutrientsServing = nutrientsServing
        )
        val assessment = QualityScoreEngine.evaluate(updated)
        val finalProduct = updated.copy(qualityScore = assessment.qualityScore)
        productDao.insertProduct(finalProduct)
    }

    private fun generateBarcodeVariants(barcode: String): List<String> {
        val variants = linkedSetOf<String>()
        variants.add(barcode)

        if (barcode.length == 12) {
            variants.add("0$barcode")
            variants.add("00$barcode")
        }
        if (barcode.length == 13 && barcode.startsWith("0")) {
            variants.add(barcode.substring(1))
        }
        val stripped = barcode.trimStart('0')
        if (stripped.isNotEmpty() && stripped != barcode) {
            variants.add(stripped)
        }
        if (barcode.length < 13) {
            variants.add(barcode.padStart(13, '0'))
        }
        if (barcode.length < 14) {
            variants.add(barcode.padStart(14, '0'))
        }

        return variants.toList()
    }
}
