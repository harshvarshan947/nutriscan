import React, { useState } from 'react';
import { ArrowLeftRight, Check, X, ShieldAlert, Sparkles, Package } from 'lucide-react';
import { ProductDetails } from '../../types/product';
import { calculateHealthAssessment } from '../../engine/nutritionAssessment';
import { formatNumber } from '../../utils/formatters';

interface ProductCompareViewProps {
  productA: ProductDetails;
  productB?: ProductDetails;
  availableProducts: ProductDetails[];
  onSelectProductB: (product: ProductDetails) => void;
  onClose: () => void;
}

export const ProductCompareView: React.FC<ProductCompareViewProps> = ({
  productA,
  productB,
  availableProducts,
  onSelectProductB,
  onClose,
}) => {
  const [selectedBBarcode, setSelectedBBarcode] = useState<string>(
    productB?.barcode || (availableProducts.find((p) => p.barcode !== productA.barcode)?.barcode || '')
  );

  const activeProductB = productB || availableProducts.find((p) => p.barcode === selectedBBarcode);

  const assessmentA = calculateHealthAssessment(productA);
  const assessmentB = activeProductB ? calculateHealthAssessment(activeProductB) : null;

  const compareNutrient = (valA: number, valB: number, higherIsBetter: boolean) => {
    if (valA === valB) return { winner: 'tie', diff: 0 };
    if (higherIsBetter) {
      return valA > valB ? { winner: 'A', diff: Number((valA - valB).toFixed(1)) } : { winner: 'B', diff: Number((valB - valA).toFixed(1)) };
    } else {
      return valA < valB ? { winner: 'A', diff: Number((valB - valA).toFixed(1)) } : { winner: 'B', diff: Number((valA - valB).toFixed(1)) };
    }
  };

  const nA = productA.nutrients100g;
  const nB = activeProductB?.nutrients100g;

  // Compute summary comparison narrative
  const generateComparisonVerdict = () => {
    if (!activeProductB || !assessmentB || !nB) return null;

    const reasons: string[] = [];
    if (nA.protein > nB.protein + 3) reasons.push(`${productA.name} has more protein (${nA.protein}g vs ${nB.protein}g)`);
    if (nB.protein > nA.protein + 3) reasons.push(`${activeProductB.name} has more protein (${nB.protein}g vs ${nA.protein}g)`);

    if (nA.fiber > nB.fiber + 2) reasons.push(`${productA.name} provides more dietary fiber (${nA.fiber}g vs ${nB.fiber}g)`);
    if (nB.fiber > nA.fiber + 2) reasons.push(`${activeProductB.name} provides more dietary fiber (${nB.fiber}g vs ${nA.fiber}g)`);

    if (nA.sugars < nB.sugars - 5) reasons.push(`${productA.name} contains significantly less sugar (${nA.sugars}g vs ${nB.sugars}g)`);
    if (nB.sugars < nA.sugars - 5) reasons.push(`${activeProductB.name} contains significantly less sugar (${nB.sugars}g vs ${nA.sugars}g)`);

    if (nA.saturatedFat < nB.saturatedFat - 2) reasons.push(`${productA.name} has lower saturated fat`);
    if (nB.saturatedFat < nA.saturatedFat - 2) reasons.push(`${activeProductB.name} has lower saturated fat`);

    if (nA.sodium < nB.sodium - 200) reasons.push(`${productA.name} has lower sodium`);
    if (nB.sodium < nA.sodium - 200) reasons.push(`${activeProductB.name} has lower sodium`);

    let winnerText = '';
    if (assessmentA.qualityScore > assessmentB.qualityScore + 5) {
      winnerText = `${productA.name} has the more favorable overall nutritional quality score (${assessmentA.qualityScore}/100 vs ${assessmentB.qualityScore}/100).`;
    } else if (assessmentB.qualityScore > assessmentA.qualityScore + 5) {
      winnerText = `${activeProductB.name} has the more favorable overall nutritional quality score (${assessmentB.qualityScore}/100 vs ${assessmentA.qualityScore}/100).`;
    } else {
      winnerText = `Both products have comparable overall nutrition quality scores (${assessmentA.qualityScore}/100 vs ${assessmentB.qualityScore}/100).`;
    }

    return { winnerText, reasons };
  };

  const verdict = generateComparisonVerdict();

  const rows = [
    { label: 'Quality Score', valA: assessmentA.qualityScore, valB: assessmentB?.qualityScore ?? 0, unit: '/ 100', higher: true },
    { label: 'Calories', valA: nA.calories, valB: nB?.calories ?? 0, unit: 'kcal', higher: false },
    { label: 'Protein', valA: nA.protein, valB: nB?.protein ?? 0, unit: 'g', higher: true },
    { label: 'Total Sugars', valA: nA.sugars, valB: nB?.sugars ?? 0, unit: 'g', higher: false },
    { label: 'Dietary Fiber', valA: nA.fiber, valB: nB?.fiber ?? 0, unit: 'g', higher: true },
    { label: 'Saturated Fat', valA: nA.saturatedFat, valB: nB?.saturatedFat ?? 0, unit: 'g', higher: false },
    { label: 'Total Fat', valA: nA.fat, valB: nB?.fat ?? 0, unit: 'g', higher: false },
    { label: 'Sodium', valA: nA.sodium, valB: nB?.sodium ?? 0, unit: 'mg', higher: false },
    { label: 'Salt', valA: nA.salt, valB: nB?.salt ?? 0, unit: 'g', higher: false },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto space-y-5 pb-24 p-4">
      {/* Header */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <ArrowLeftRight className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <h2 className="font-bold text-base text-slate-900 dark:text-white">
            Product Comparison
          </h2>
        </div>
        <button
          onClick={onClose}
          className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Select second product dropdown */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800">
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
          Compare with another food in your history / database:
        </label>
        <select
          value={activeProductB?.barcode || selectedBBarcode || ''}
          onChange={(e) => {
            const val = e.target.value;
            setSelectedBBarcode(val);
            const found = availableProducts.find((p) => p.barcode === val);
            if (found) onSelectProductB(found);
          }}
          className="w-full text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          {availableProducts
            .filter((p) => p.barcode !== productA.barcode)
            .map((p) => (
              <option key={p.barcode} value={p.barcode}>
                {p.brand} - {p.name}
              </option>
            ))}
        </select>
      </div>

      {/* Products Side by Side Header */}
      <div className="grid grid-cols-2 gap-3">
        {/* Product A */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl shadow-sm border-2 border-emerald-500/40 text-center flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-800 p-1.5 border border-slate-100 dark:border-slate-700 mb-2 flex items-center justify-center">
            {productA.image ? (
              <img src={productA.image} alt={productA.name} className="w-full h-full object-contain" />
            ) : (
              <Package className="w-8 h-8 text-slate-400" />
            )}
          </div>
          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">
            {productA.brand}
          </span>
          <h4 className="font-bold text-xs text-slate-900 dark:text-white line-clamp-2 mt-0.5">
            {productA.name}
          </h4>
          <span className="mt-2 text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            Score: {assessmentA.qualityScore}/100
          </span>
        </div>

        {/* Product B */}
        {activeProductB && assessmentB ? (
          <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl shadow-sm border-2 border-teal-500/40 text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-800 p-1.5 border border-slate-100 dark:border-slate-700 mb-2 flex items-center justify-center">
              {activeProductB.image ? (
                <img src={activeProductB.image} alt={activeProductB.name} className="w-full h-full object-contain" />
              ) : (
                <Package className="w-8 h-8 text-slate-400" />
              )}
            </div>
            <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400 uppercase">
              {activeProductB.brand}
            </span>
            <h4 className="font-bold text-xs text-slate-900 dark:text-white line-clamp-2 mt-0.5">
              {activeProductB.name}
            </h4>
            <span className="mt-2 text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300">
              Score: {assessmentB.qualityScore}/100
            </span>
          </div>
        ) : (
          <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center text-center text-slate-400">
            <Package className="w-8 h-8 mb-2" />
            <p className="text-xs">Select a second product to compare</p>
          </div>
        )}
      </div>

      {/* Comparison Table */}
      {activeProductB && nB && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-center">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
              Nutrient Comparison (per 100g)
            </span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {rows.map((r, idx) => {
              const res = compareNutrient(r.valA, r.valB, r.higher);

              return (
                <div key={idx} className="grid grid-cols-3 p-3 items-center text-center hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                  {/* Product A value */}
                  <div className={`font-bold ${res.winner === 'A' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300'}`}>
                    {formatNumber(r.valA)} {r.unit}
                    {res.winner === 'A' && <span className="ml-1 text-[10px] font-semibold">✓</span>}
                  </div>

                  {/* Label */}
                  <div className="font-semibold text-slate-500 dark:text-slate-400">
                    {r.label}
                  </div>

                  {/* Product B value */}
                  <div className={`font-bold ${res.winner === 'B' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300'}`}>
                    {formatNumber(r.valB)} {r.unit}
                    {res.winner === 'B' && <span className="ml-1 text-[10px] font-semibold">✓</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Verdict & Explanations */}
      {verdict && (
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-slate-900 dark:to-slate-850 p-5 rounded-3xl border border-emerald-200/80 dark:border-emerald-900/60 space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">
              Comparative Analysis
            </h4>
          </div>

          <p className="text-xs font-bold text-slate-900 dark:text-white">
            {verdict.winnerText}
          </p>

          {verdict.reasons.length > 0 && (
            <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 list-disc list-inside">
              {verdict.reasons.map((reason, i) => (
                <li key={i}>{reason}.</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};
