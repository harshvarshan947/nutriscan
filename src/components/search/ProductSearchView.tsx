import React, { useState, useEffect } from 'react';
import {
  Search,
  X,
  Package,
  PlusCircle,
  Sparkles,
  ChevronRight,
  Flame,
  Dumbbell,
} from 'lucide-react';
import { ProductDetails } from '../../types/product';
import { productService } from '../../services/productService';
import { SAMPLE_PRODUCTS } from '../../data/sampleProducts';
import { storageService } from '../../services/storageService';

interface ProductSearchViewProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (barcode: string) => void;
}

const POPULAR_SEARCH_TAGS = [
  'Lays',
  'Oreo',
  'Maggi',
  'Greek Yogurt',
  'Snickers',
  'Nutella',
  'Amul Butter',
  'Quaker Oats',
  'Doritos',
  'Peanut Butter',
  'Dark Chocolate',
  'Coca Cola',
];

export const ProductSearchView: React.FC<ProductSearchViewProps> = ({
  isOpen,
  onClose,
  onSelectProduct,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ProductDetails[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showManualForm, setShowManualForm] = useState(false);

  // Manual Form Fields
  const [manualName, setManualName] = useState('');
  const [manualBrand, setManualBrand] = useState('');
  const [manualBarcode, setManualBarcode] = useState('');
  const [manualCalories, setManualCalories] = useState('');
  const [manualProtein, setManualProtein] = useState('');
  const [manualCarbs, setManualCarbs] = useState('');
  const [manualSugar, setManualSugar] = useState('');
  const [manualFat, setManualFat] = useState('');
  const [manualSatFat, setManualSatFat] = useState('');
  const [manualFiber, setManualFiber] = useState('');
  const [manualSodium, setManualSodium] = useState('');

  // Initial load with samples
  useEffect(() => {
    if (isOpen) {
      setResults(Object.values(SAMPLE_PRODUCTS));
    }
  }, [isOpen]);

  // Fast debounced search with instant local filter + network query
  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setResults(Object.values(SAMPLE_PRODUCTS));
      return;
    }

    // Instant local matches
    const localMatches = Object.values(SAMPLE_PRODUCTS).filter(
      (p) =>
        p.name.toLowerCase().includes(q.toLowerCase()) ||
        p.brand.toLowerCase().includes(q.toLowerCase()) ||
        p.barcode.includes(q)
    );
    if (localMatches.length > 0) {
      setResults(localMatches);
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const found = await productService.searchProducts(q);
        if (found && found.length > 0) {
          setResults(found);
        }
      } catch (e) {
        console.error('Search error', e);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const handleCreateManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualName.trim()) return;

    const generatedCode = manualBarcode.trim() || `manual_${Date.now()}`;
    const product: ProductDetails = {
      barcode: generatedCode,
      name: manualName.trim(),
      brand: manualBrand.trim() || 'Custom Product',
      servingSize: '100 g',
      nutrients100g: {
        calories: Number(manualCalories) || 0,
        protein: Number(manualProtein) || 0,
        carbohydrates: Number(manualCarbs) || 0,
        sugars: Number(manualSugar) || 0,
        fat: Number(manualFat) || 0,
        saturatedFat: Number(manualSatFat) || 0,
        fiber: Number(manualFiber) || 0,
        sodium: Number(manualSodium) || 0,
        salt: Number(((Number(manualSodium) || 0) / 400).toFixed(2)),
      },
      allergens: [],
      additives: [],
      source: 'manual',
      isComplete: true,
      missingFields: [],
      lastUpdated: Date.now(),
    };

    await storageService.cacheProduct(product);
    onSelectProduct(generatedCode);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[88vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              {showManualForm ? 'Add Food Manually' : 'Search Foods Database'}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content View: Search vs Manual Form */}
        {!showManualForm ? (
          <div className="flex flex-col flex-1 min-h-0 pt-4 space-y-3">
            {/* Search Input */}
            <div className="relative shrink-0">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by food name, brand, or barcode..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
                className="w-full pl-10 pr-10 py-2.5 text-xs rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              {isSearching ? (
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              ) : query ? (
                <button
                  onClick={() => setQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : null}
            </div>

            {/* Popular Search Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 shrink-0">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-500" /> Suggestions:
              </span>
              {POPULAR_SEARCH_TAGS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setQuery(tag)}
                  className={`text-[11px] px-2.5 py-1 rounded-full whitespace-nowrap border transition-all ${
                    query.toLowerCase() === tag.toLowerCase()
                      ? 'bg-emerald-600 text-white border-emerald-600 font-bold'
                      : 'bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 font-medium'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>

            {/* Results List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {results.length === 0 && !isSearching ? (
                <div className="text-center py-8 space-y-3">
                  <Package className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    No matching food products found for "{query}".
                  </p>
                  <button
                    onClick={() => {
                      setManualName(query);
                      setShowManualForm(true);
                    }}
                    className="py-2 px-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-semibold text-xs border border-emerald-300 dark:border-emerald-800 inline-flex items-center gap-1.5"
                  >
                    <PlusCircle className="w-4 h-4" />
                    Enter "{query}" Nutrition Manually
                  </button>
                </div>
              ) : (
                results.map((p) => (
                  <div
                    key={p.barcode}
                    onClick={() => {
                      onSelectProduct(p.barcode);
                      onClose();
                    }}
                    className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-750 hover:border-emerald-500 cursor-pointer transition-all active:scale-[0.99]"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-700 p-1 border border-slate-200 dark:border-slate-600 flex items-center justify-center shrink-0">
                        {p.thumbnail || p.image ? (
                          <img src={p.thumbnail || p.image} alt={p.name} className="w-full h-full object-contain" />
                        ) : (
                          <Package className="w-5 h-5 text-slate-400" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block truncate">
                          {p.brand}
                        </span>
                        <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate">
                          {p.name}
                        </h4>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                          <span className="flex items-center gap-0.5 font-semibold text-amber-600 dark:text-amber-400">
                            <Flame className="w-3 h-3" /> {p.nutrients100g.calories} kcal
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-0.5 font-semibold text-indigo-600 dark:text-indigo-400">
                            <Dumbbell className="w-3 h-3" /> {p.nutrients100g.protein}g protein
                          </span>
                          {p.nutrients100g.sugars > 0 && (
                            <>
                              <span>•</span>
                              <span>{p.nutrients100g.sugars}g sugar</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
                  </div>
                ))
              )}
            </div>

            {/* Manual entry footer prompt */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 shrink-0">
              <span>Can't find your product?</span>
              <button
                onClick={() => setShowManualForm(true)}
                className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                Add Manually
              </button>
            </div>
          </div>
        ) : (
          /* Manual Input Form */
          <form onSubmit={handleCreateManual} className="flex-1 overflow-y-auto pt-4 space-y-3.5 pr-1">
            <div className="grid grid-cols-2 gap-2.5">
              <div className="col-span-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Organic Almond Butter"
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Brand Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Nature Choice"
                  value={manualBrand}
                  onChange={(e) => setManualBrand(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Barcode (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Optional code"
                  value={manualBarcode}
                  onChange={(e) => setManualBarcode(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>
            </div>

            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block pt-2 border-t border-slate-100 dark:border-slate-800">
              Nutrients per 100g
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-0.5">
                  Calories (kcal)
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={manualCalories}
                  onChange={(e) => setManualCalories(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-0.5">
                  Protein (g)
                </label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="0"
                  value={manualProtein}
                  onChange={(e) => setManualProtein(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-0.5">
                  Total Sugars (g)
                </label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="0"
                  value={manualSugar}
                  onChange={(e) => setManualSugar(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-0.5">
                  Fiber (g)
                </label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="0"
                  value={manualFiber}
                  onChange={(e) => setManualFiber(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-0.5">
                  Total Fat (g)
                </label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="0"
                  value={manualFat}
                  onChange={(e) => setManualFat(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-0.5">
                  Saturated Fat (g)
                </label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="0"
                  value={manualSatFat}
                  onChange={(e) => setManualSatFat(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-0.5">
                  Sodium (mg)
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={manualSodium}
                  onChange={(e) => setManualSodium(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-3">
              <button
                type="button"
                onClick={() => setShowManualForm(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 transition-colors"
              >
                Back to Search
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 transition-all"
              >
                Save & Analyze
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
