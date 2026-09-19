import Dexie, { Table } from 'dexie';
import { ProductDetails } from '../types/product';
import { FavoriteProduct, MealLogEntry, ScannedHistoryItem } from '../types/tracking';
import { UserProfile } from '../types/profile';

export class NutriScanDatabase extends Dexie {
  products!: Table<ProductDetails, string>;
  history!: Table<ScannedHistoryItem, number>;
  favorites!: Table<FavoriteProduct, string>;
  mealLogs!: Table<MealLogEntry, string>;
  userProfile!: Table<UserProfile, string>;

  constructor() {
    super('NutriScanDB');
    this.version(1).stores({
      products: 'barcode, name, brand, lastUpdated',
      history: '++id, barcode, scannedAt',
      favorites: 'barcode, name, addedAt',
      mealLogs: 'id, date, mealType, timestamp, barcode',
      userProfile: 'id',
    });
  }
}

export const db = new NutriScanDatabase();

export const DEFAULT_USER_PROFILE: UserProfile = {
  id: 'current_user',
  name: 'User',
  age: 30,
  sex: 'prefer_not_to_say',
  heightCm: 172,
  weightKg: 70,
  activityLevel: 'moderate',
  goal: 'healthy_eating',
  referenceStandard: 'general_adult',
  useAiSummary: true,
  soundEnabled: true,
  hapticsEnabled: true,
  darkMode: false,
  updatedAt: Date.now(),
};

// Storage helper methods
export const storageService = {
  // Products Cache
  async getCachedProduct(barcode: string): Promise<ProductDetails | undefined> {
    if (typeof indexedDB === 'undefined') return undefined;
    try {
      return await db.products.get(barcode);
    } catch (e) {
      return undefined;
    }
  },

  async cacheProduct(product: ProductDetails): Promise<void> {
    if (typeof indexedDB === 'undefined') return;
    try {
      await db.products.put(product);
    } catch (e) {
      // Ignore cache failure
    }
  },

  // Scan History
  async addToHistory(item: Omit<ScannedHistoryItem, 'id'>): Promise<void> {
    try {
      // Remove any existing entry for this barcode to keep it unique & freshest at the top
      await db.history.where('barcode').equals(item.barcode).delete();
      await db.history.add({
        ...item,
        scannedAt: Date.now(),
      });
    } catch (e) {
      console.error('Error adding to history', e);
    }
  },

  async getRecentHistory(limit = 50): Promise<ScannedHistoryItem[]> {
    try {
      return await db.history.orderBy('scannedAt').reverse().limit(limit).toArray();
    } catch (e) {
      console.error('Error fetching history', e);
      return [];
    }
  },

  async deleteHistoryItem(barcode: string): Promise<void> {
    try {
      await db.history.where('barcode').equals(barcode).delete();
    } catch (e) {
      console.error('Error deleting history item', e);
    }
  },

  async clearAllHistory(): Promise<void> {
    try {
      await db.history.clear();
    } catch (e) {
      console.error('Error clearing history', e);
    }
  },

  // Favorites
  async isFavorite(barcode: string): Promise<boolean> {
    try {
      const fav = await db.favorites.get(barcode);
      return !!fav;
    } catch (e) {
      return false;
    }
  },

  async toggleFavorite(product: ProductDetails, qualityScore: number, qualityTier: 'Excellent' | 'Good' | 'Moderate' | 'Low'): Promise<boolean> {
    try {
      const existing = await db.favorites.get(product.barcode);
      if (existing) {
        await db.favorites.delete(product.barcode);
        return false;
      } else {
        await db.favorites.put({
          barcode: product.barcode,
          name: product.name,
          brand: product.brand,
          image: product.image,
          qualityScore,
          qualityTier,
          addedAt: Date.now(),
        });
        return true;
      }
    } catch (e) {
      console.error('Error toggling favorite', e);
      return false;
    }
  },

  async getFavorites(): Promise<FavoriteProduct[]> {
    try {
      return await db.favorites.orderBy('addedAt').reverse().toArray();
    } catch (e) {
      console.error('Error fetching favorites', e);
      return [];
    }
  },

  async removeFavorite(barcode: string): Promise<void> {
    try {
      await db.favorites.delete(barcode);
    } catch (e) {
      console.error('Error removing favorite', e);
    }
  },

  // Meal Logs
  async logMeal(entry: MealLogEntry): Promise<void> {
    try {
      await db.mealLogs.put(entry);
    } catch (e) {
      console.error('Error logging meal', e);
    }
  },

  async getMealsForDate(dateStr: string): Promise<MealLogEntry[]> {
    try {
      return await db.mealLogs.where('date').equals(dateStr).sortBy('timestamp');
    } catch (e) {
      console.error('Error getting meals for date', e);
      return [];
    }
  },

  async deleteMealLog(id: string): Promise<void> {
    try {
      await db.mealLogs.delete(id);
    } catch (e) {
      console.error('Error deleting meal log', e);
    }
  },

  // User Profile
  async getUserProfile(): Promise<UserProfile> {
    try {
      const profile = await db.userProfile.get('current_user');
      if (profile) return profile;
      await db.userProfile.put(DEFAULT_USER_PROFILE);
      return DEFAULT_USER_PROFILE;
    } catch (e) {
      return DEFAULT_USER_PROFILE;
    }
  },

  async saveUserProfile(profile: UserProfile): Promise<void> {
    try {
      await db.userProfile.put({ ...profile, updatedAt: Date.now() });
    } catch (e) {
      console.error('Error saving user profile', e);
    }
  },
};
