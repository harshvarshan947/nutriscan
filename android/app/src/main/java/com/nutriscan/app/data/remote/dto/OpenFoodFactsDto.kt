package com.nutriscan.app.data.remote.dto

import com.google.gson.annotations.SerializedName

data class OffProductResponse(
    @SerializedName("status")
    val status: Int? = null,

    @SerializedName("status_verbose")
    val statusVerbose: String? = null,

    @SerializedName("code")
    val code: String? = null,

    @SerializedName("product")
    val product: OffProduct? = null
)

data class OffSearchResponse(
    @SerializedName("count")
    val count: Int = 0,

    @SerializedName("page")
    val page: Int = 1,

    @SerializedName("page_size")
    val pageSize: Int = 20,

    @SerializedName("products")
    val products: List<OffProduct> = emptyList()
)

data class OffProduct(
    @SerializedName("code")
    val code: String? = null,

    @SerializedName("product_name")
    val productName: String? = null,

    @SerializedName("product_name_en")
    val productNameEn: String? = null,

    @SerializedName("generic_name")
    val genericName: String? = null,

    @SerializedName("generic_name_en")
    val genericNameEn: String? = null,

    @SerializedName("brands")
    val brands: String? = null,

    @SerializedName("brand_owner")
    val brandOwner: String? = null,

    @SerializedName("brands_tags")
    val brandsTags: List<String>? = null,

    @SerializedName("image_url")
    val imageUrl: String? = null,

    @SerializedName("image_front_url")
    val imageFrontUrl: String? = null,

    @SerializedName("image_front_small_url")
    val imageFrontSmallUrl: String? = null,

    @SerializedName("serving_size")
    val servingSize: String? = null,

    @SerializedName("serving_quantity")
    val servingQuantity: Double? = null,

    @SerializedName("ingredients_text")
    val ingredientsText: String? = null,

    @SerializedName("ingredients_text_en")
    val ingredientsTextEn: String? = null,

    @SerializedName("allergens_tags")
    val allergensTags: List<String>? = null,

    @SerializedName("additives_tags")
    val additivesTags: List<String>? = null,

    @SerializedName("nova_group")
    val novaGroup: Int? = null,

    @SerializedName("nutrition_grades")
    val nutritionGrades: String? = null,

    @SerializedName("categories_tags")
    val categoriesTags: List<String>? = null,

    @SerializedName("nutriments")
    val nutriments: Map<String, Any?>? = null
)
