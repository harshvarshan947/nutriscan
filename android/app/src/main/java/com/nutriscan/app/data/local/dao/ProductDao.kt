package com.nutriscan.app.data.local.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import com.nutriscan.app.data.model.Product
import kotlinx.coroutines.flow.Flow

@Dao
interface ProductDao {

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertProduct(product: Product)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertProducts(products: List<Product>)

    @Query("SELECT * FROM products WHERE barcode = :barcode LIMIT 1")
    suspend fun getProductByBarcode(barcode: String): Product?

    @Query("SELECT * FROM products WHERE barcode = :barcode LIMIT 1")
    fun getProductFlow(barcode: String): Flow<Product?>

    @Query("SELECT * FROM products ORDER BY lastScannedAt DESC LIMIT :limit")
    fun getRecentScans(limit: Int = 30): Flow<List<Product>>

    @Query("SELECT * FROM products WHERE isFavorite = 1 ORDER BY lastScannedAt DESC")
    fun getFavorites(): Flow<List<Product>>

    @Query("UPDATE products SET isFavorite = :isFavorite WHERE barcode = :barcode")
    suspend fun updateFavoriteStatus(barcode: String, isFavorite: Boolean)

    @Query("SELECT * FROM products WHERE name LIKE '%' || :query || '%' OR brand LIKE '%' || :query || '%' OR barcode LIKE '%' || :query || '%' ORDER BY lastScannedAt DESC")
    fun searchProducts(query: String): Flow<List<Product>>

    @Query("DELETE FROM products WHERE barcode = :barcode")
    suspend fun deleteProduct(barcode: String)

    @Query("DELETE FROM products")
    suspend fun clearAll()
}
