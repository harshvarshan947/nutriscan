import React, { useState, useEffect } from 'react';
import { Star, Package, Trash2, ChevronRight, Sparkles } from 'lucide-react';
import { FavoriteProduct } from '../../types/tracking';
import { storageService } from '../../services/storageService';

interface FavoritesViewProps {
  onSelectProduct: (barcode: string) => void;
  onOpenScanner: () => void;
  onFavoritesUpdated?: () => void;
}

export const FavoritesView: React.FC<FavoritesViewProps> = ({
  onSelectProduct,
  onOpenScanner,
  onFavoritesUpdated,
}) => {
  const [favorites, setFavorites] = useState<FavoriteProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadFavorites = async () => {
    setIsLoading(true);
    try {
      const items = await storageService.getFavorites();
      setFavorites(items);
    } catch (e) {
      console.error('Error loading favorites', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFavorites();
  }, []);

  const handleRemoveFavorite = async (barcode: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await storageService.removeFavorite(barcode);
    loadFavorites();
    onFavoritesUpdated?.();
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300';
    if (score >= 65) return 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300';
    if (score >= 45) return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300';
    return 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300';
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4 pb-24 p-4">
      {/* Header */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Star className="w-5 h-5 text-amber-500 fill-amber-400" />
          <h2 className="font-bold text-base text-slate-900 dark:text-white">
            My Favorites
          </h2>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            {favorites.length}
          </span>
        </div>
      </div>

      {/* Favorites List */}
      {favorites.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 text-center border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-500 flex items-center justify-center mx-auto">
            <Star className="w-7 h-7" />
          </div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">
            No Favorite Foods Saved Yet
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
            Tap the star icon on any product page to save foods you consume frequently for quick access.
          </p>
          <button
            onClick={onOpenScanner}
            className="mt-2 py-2.5 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-md shadow-emerald-600/20 transition-all inline-flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4" />
            Scan Products to Save
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {favorites.map((item) => (
            <div
              key={item.barcode}
              onClick={() => onSelectProduct(item.barcode)}
              className="flex items-center justify-between p-3.5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs hover:shadow-sm hover:border-emerald-500/50 cursor-pointer transition-all active:scale-[0.99]"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 p-1 border border-slate-100 dark:border-slate-700 flex items-center justify-center shrink-0">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                  ) : (
                    <Package className="w-6 h-6 text-slate-400" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
                    {item.brand}
                  </span>
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate">
                    {item.name}
                  </h4>
                  <span className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-md ${getScoreBadge(item.qualityScore)}`}>
                    Score: {item.qualityScore}/100
                  </span>
                </div>
              </div>

              <button
                onClick={(e) => handleRemoveFavorite(item.barcode, e)}
                className="p-2 text-slate-400 hover:text-rose-500 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors shrink-0 ml-2"
                title="Remove favorite"
                aria-label="Remove favorite"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
