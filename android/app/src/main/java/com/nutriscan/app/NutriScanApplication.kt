package com.nutriscan.app

import android.app.Application
import com.nutriscan.app.data.local.NutriScanDatabase
import com.nutriscan.app.data.repository.ProductRepository
import com.nutriscan.app.data.repository.TrackingRepository
import com.nutriscan.app.data.repository.UserRepository

class NutriScanApplication : Application() {

    lateinit var database: NutriScanDatabase
        private set

    lateinit var productRepository: ProductRepository
        private set

    lateinit var trackingRepository: TrackingRepository
        private set

    lateinit var userRepository: UserRepository
        private set

    override fun onCreate() {
        super.onCreate()
        instance = this

        database = NutriScanDatabase.getInstance(this)
        productRepository = ProductRepository(database.productDao())
        trackingRepository = TrackingRepository(database.mealLogDao())
        userRepository = UserRepository(this)
    }

    companion object {
        lateinit var instance: NutriScanApplication
            private set
    }
}
