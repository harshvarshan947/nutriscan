import React, { useState, useEffect } from 'react';
import { Clock, Search, Trash2, ChevronRight, Package, Sparkles } from 'lucide-react';
import { ScannedHistoryItem } from '../../types/tracking';
import { storageService } from '../../services/storageService';
import { formatDate, formatTime } from '../../utils/formatters';

interface HistoryViewProps {
  onSelectProduct: (barcode: string) => void;
  onOpenScanner: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  onSelectProduct,
  onOpenScanner,
}) => {
  const [history, setHistory] = useState<ScannedHistoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const loadHistory = async () => {
    setIsLoading(true);
    try {
      const items = await storageService.getRecentHistory(100);
      setHistory(items);
    } catch (e) {
      console.error('Error loading history', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleDeleteItem = async (barcode: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await storageService.deleteHistoryItem(barcode);
    loadHistory();
  };

  const handleClearAll = async () => {
    if (window.confirm('Are you sure you want to clear your entire scan history?')) {
      await storageService.clearAllHistory();
      loadHistory();
    }
  };

  const filtered = history.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.barcode.includes(searchQuery)
  );

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
          <Clock className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <h2 className="font-bold text-base text-slate-900 dark:text-white">
            Scan History
          </h2>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            {history.length}
          </span>
        </div>

        {history.length > 0 && (
          <button
            onClick={handleClearAll}
            className="text-xs font-semibold text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 flex items-center gap-1 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear All
          </button>
        )}
      </div>

      {/* Search Filter */}
      {history.length > 0 && (
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Filter recent scans..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      )}

      {/* History Items List */}
      {filtered.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 text-center border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
            <Clock className="w-7 h-7" />
          </div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">
            {searchQuery ? 'No matching scans found' : 'No Scanned Products Yet'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
            {searchQuery
              ? 'Try searching with a different brand or product name.'
              : 'Scan barcodes with your camera to quickly build your personal food analysis history.'}
          </p>
          {!searchQuery && (
            <button
              onClick={onOpenScanner}
              className="mt-2 py-2.5 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-md shadow-emerald-600/20 transition-all inline-flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" />
              Scan a Product
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((item) => (
            <div
              key={item.barcode}
              onClick={() => onSelectProduct(item.barcode)}
              className="flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs hover:shadow-sm hover:border-emerald-500/50 cursor-pointer transition-all active:scale-[0.99]"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-800 p-1 border border-slate-100 dark:border-slate-700 flex items-center justify-center shrink-0">
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
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    {formatDate(item.scannedAt)} at {formatTime(item.scannedAt)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 ml-2">
                <span className={`text-xs font-bold px-2 py-1 rounded-xl ${getScoreBadge(item.qualityScore)}`}>
                  {item.qualityScore}/100
                </span>

                <button
                  onClick={(e) => handleDeleteItem(item.barcode, e)}
                  className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg transition-colors"
                  title="Remove from history"
                  aria-label="Remove item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
