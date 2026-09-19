import React, { useState, useEffect } from 'react';
import {
  HelpCircle,
  Search,
  Keyboard,
  PlusCircle,
  ArrowLeft,
  Sparkles,
  Package,
  Loader2,
  ChevronRight,
  Flame,
  Dumbbell,
} from 'lucide-react';
import { SAMPLE_PRODUCTS } from '../../data/sampleProducts';
import { ProductDetails } from '../../types/product';
import { productService } from '../../services/productService';

interface ProductNotFoundViewProps {
  barcode: string;
  onRetry: () => void;
  onOpenSearch: () => void;
  onOpenManualEntry: () => void;
  onSelectProduct: (barcode: string) => void;
  onBack: () => void;
}

export const ProductNotFoundView: React.FC<ProductNotFoundViewProps> = ({
  barcode,
  onRetry,
  onOpenSearch,
  onOpenManualEntry,
  onSelectProduct,
  onBack,
}) => {
  const [inlineQuery, setInlineQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ProductDetails[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const q = inlineQuery.trim();
    if (!q) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const found = await productService.searchProducts(q);
        setSearchResults(found.slice(0, 5));
      } catch (err) {
        // ignore
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [inlineQuery]);

  return (
    <div className="w-full max-w-md mx-auto p-4 space-y-5 text-center py-6">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 self-start"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Scanner
      </button>

      {/* Main Alert Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto shadow-inner">
          <HelpCircle className="w-8 h-8" />
        </div>

        <div className="space-y-1.5">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Product Not Found in Database
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
            Barcode <span className="font-mono font-bold text-slate-800 dark:text-slate-200">#{barcode}</span> is not yet indexed in the Open Food Facts global database.
          </p>
        </div>

        {/* Quick Instant Search Box */}
        <div className="text-left space-y-2 pt-1">
          <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
            Search by food or brand name:
          </label>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={inlineQuery}
              onChange={(e) => setInlineQuery(e.target.value)}
              placeholder="e.g. Lays, Maggi, Amul Butter, Bread..."
              className="w-full pl-9 pr-8 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            {isSearching && (
              <Loader2 className="w-4 h-4 text-emerald-600 animate-spin absolute right-3 top-1/2 -translate-y-1/2" />
            )}
          </div>

          {/* Quick Search Results Dropdown */}
          {searchResults.length > 0 && (
            <div className="rounded-2xl border border-emerald-500/40 bg-white dark:bg-slate-850 p-1.5 shadow-lg space-y-1 mt-1">
              <span className="text-[10px] font-bold text-slate-400 px-2 py-0.5 block">
                Found {searchResults.length} matching products:
              </span>
              {searchResults.map((p) => (
                <div
                  key={p.barcode}
                  onClick={() => onSelectProduct(p.barcode)}
                  className="flex items-center justify-between p-2 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-950/40 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-750 flex items-center justify-center shrink-0 overflow-hidden">
                      {p.thumbnail || p.image ? (
                        <img src={p.thumbnail || p.image} alt={p.name} className="w-full h-full object-contain" />
                      ) : (
                        <Package className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase truncate block">
                        {p.brand}
                      </span>
                      <h4 className="font-bold text-[11px] text-slate-900 dark:text-white truncate">
                        {p.name}
                      </h4>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 text-[10px] text-slate-500">
                    <span className="font-semibold text-amber-600 dark:text-amber-400">
                      {p.nutrients100g.calories} kcal
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={onOpenManualEntry}
            className="w-full py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            Enter Nutrition Information Manually
          </button>

          <button
            onClick={onOpenSearch}
            className="w-full py-2.5 px-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100 font-semibold text-xs flex items-center justify-center gap-2 transition-all"
          >
            <Search className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Open Full Database Search
          </button>

          <button
            onClick={onRetry}
            className="w-full py-2.5 px-4 rounded-2xl bg-slate-100 dark:bg-slate-850 text-slate-600 dark:text-slate-300 font-semibold text-xs flex items-center justify-center gap-2 transition-all"
          >
            <Keyboard className="w-4 h-4" />
            Scan or Enter Another Barcode
          </button>
        </div>
      </div>

      {/* Suggested Popular Products */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 shadow-sm border border-slate-200 dark:border-slate-800 text-left space-y-2.5">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
            Or try one of these verified foods:
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {Object.entries(SAMPLE_PRODUCTS).slice(0, 4).map(([code, p]) => (
            <div
              key={code}
              onClick={() => onSelectProduct(code)}
              className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 hover:border-emerald-500/60 cursor-pointer transition-all flex items-center gap-2"
            >
              <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-700 p-0.5 border border-slate-200 dark:border-slate-600 flex items-center justify-center shrink-0">
                {p.thumbnail || p.image ? (
                  <img src={p.thumbnail || p.image} alt={p.name} className="w-full h-full object-contain" />
                ) : (
                  <Package className="w-4 h-4 text-slate-400" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase truncate block">
                  {p.brand}
                </span>
                <span className="text-[11px] font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">
                  {p.name}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
