import React, { useState, useEffect } from 'react';
import { ChevronLeft, ArrowLeftRight, PlusCircle, Star, Edit3 } from 'lucide-react';
import { ProductDetails } from '../../types/product';
import { UserProfile } from '../../types/profile';
import { ReferenceStandardId } from '../../types/assessment';
import { calculateHealthAssessment } from '../../engine/nutritionAssessment';
import { REFERENCE_STANDARDS } from '../../engine/nutritionThresholds';
import { buildPersonalizedReferenceProfile } from '../../engine/tdeeCalculator';
import { storageService } from '../../services/storageService';
import { ProductHero } from './ProductHero';
import { QualityScoreCard } from './QualityScoreCard';
import { NutritionGrid } from './NutritionGrid';
import { WhyRatingSection } from './WhyRatingSection';
import { IngredientSection } from './IngredientSection';
import { AiExplanationCard } from './AiExplanationCard';
import { LogMealModal } from '../tracking/LogMealModal';
import { ProductCompareView } from '../compare/ProductCompareView';
import { EditProductNutritionModal } from './EditProductNutritionModal';

interface ProductDetailsPageProps {
  product: ProductDetails;
  userProfile: UserProfile;
  onBack: () => void;
  onSelectProduct: (barcode: string) => void;
  onFavoritesUpdated?: () => void;
}

export const ProductDetailsPage: React.FC<ProductDetailsPageProps> = ({
  product,
  userProfile,
  onBack,
  onSelectProduct,
  onFavoritesUpdated,
}) => {
  const [currentProduct, setCurrentProduct] = useState<ProductDetails>(product);
  const [selectedStandard, setSelectedStandard] = useState<ReferenceStandardId>(
    userProfile.referenceStandard || 'general_adult'
  );
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [comparedProductB, setComparedProductB] = useState<ProductDetails | undefined>();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [availableForCompare, setAvailableForCompare] = useState<ProductDetails[]>([]);

  // Update currentProduct if product prop changes
  useEffect(() => {
    setCurrentProduct(product);
  }, [product]);

  // Build the effective reference profile based on user's standard choice
  const activeRefProfile =
    selectedStandard === 'personalized'
      ? buildPersonalizedReferenceProfile(userProfile)
      : REFERENCE_STANDARDS[selectedStandard] || REFERENCE_STANDARDS.general_adult;

  // Run transparent rule-based health assessment engine
  const assessment = calculateHealthAssessment(currentProduct, activeRefProfile);

  // Check favorite status and save to scan history on mount
  useEffect(() => {
    const initProductData = async () => {
      // 1. Check favorite status
      const fav = await storageService.isFavorite(currentProduct.barcode);
      setIsFavorite(fav);

      // 2. Add to scan history
      await storageService.addToHistory({
        barcode: currentProduct.barcode,
        name: currentProduct.name,
        brand: currentProduct.brand,
        image: currentProduct.thumbnail || currentProduct.image,
        qualityScore: assessment.qualityScore,
        qualityTier: assessment.qualityTier,
        scannedAt: Date.now(),
      });

      // 3. Load other products for comparison
      const history = await storageService.getRecentHistory(20);
      const items: ProductDetails[] = [];
      for (const h of history) {
        const p = await storageService.getCachedProduct(h.barcode);
        if (p) items.push(p);
      }
      setAvailableForCompare(items);
    };

    initProductData();
  }, [currentProduct.barcode]);

  const handleToggleFavorite = async () => {
    const newStatus = await storageService.toggleFavorite(
      currentProduct,
      assessment.qualityScore,
      assessment.qualityTier
    );
    setIsFavorite(newStatus);
    onFavoritesUpdated?.();
  };

  const handleShare = () => {
    const shareUrl = `${window.location.origin}${window.location.pathname}?barcode=${encodeURIComponent(currentProduct.barcode)}`;
    if (navigator.share) {
      navigator.share({
        title: `${currentProduct.name} - Nutrition Score ${assessment.qualityScore}/100`,
        text: `Check out the nutrition analysis for ${currentProduct.name} on NutriScan! Quality Score: ${assessment.qualityScore}/100 (${assessment.qualityTier}).`,
        url: shareUrl,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert('Product link copied to clipboard!');
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4 pb-28 p-4">
      {/* Navigation Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 py-2 px-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-2xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-95"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="flex items-center gap-1.5 py-2 px-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-2xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-95"
            title="Edit nutrition numbers"
          >
            <Edit3 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            Edit
          </button>

          <button
            onClick={() => setIsCompareOpen(true)}
            className="flex items-center gap-1.5 py-2 px-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-2xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-95"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            Compare
          </button>
        </div>
      </div>

      {/* 1. Hero Summary Card */}
      <ProductHero
        product={currentProduct}
        assessment={assessment}
        isFavorite={isFavorite}
        onToggleFavorite={handleToggleFavorite}
        onOpenLogMeal={() => setIsLogModalOpen(true)}
        onOpenCompare={() => setIsCompareOpen(true)}
        onShare={handleShare}
      />

      {/* 2. Rule-Based Quality Score Card */}
      <QualityScoreCard
        assessment={assessment}
        selectedStandard={selectedStandard}
        onSelectStandard={setSelectedStandard}
      />

      {/* 3. Nutrition Value Cards Grid */}
      <NutritionGrid
        product={currentProduct}
        assessment={assessment}
        onEditNutrition={() => setIsEditModalOpen(true)}
      />

      {/* 4. Explainable Score Rationale (Why this rating?) */}
      <WhyRatingSection assessment={assessment} />

      {/* 5. AI Nutritionist Educational Summary */}
      <AiExplanationCard
        product={currentProduct}
        assessment={assessment}
        userProfile={userProfile}
      />

      {/* 6. Ingredients & Additives Breakdown */}
      <IngredientSection product={currentProduct} />

      {/* Sticky Bottom Action Tray */}
      <div className="fixed bottom-16 left-0 right-0 p-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 z-30">
        <div className="max-w-md mx-auto flex gap-2">
          <button
            onClick={() => setIsLogModalOpen(true)}
            className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold rounded-2xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 text-xs"
          >
            <PlusCircle className="w-4 h-4" />
            Log to Today's Meals
          </button>

          <button
            onClick={handleToggleFavorite}
            className={`p-3 rounded-2xl border transition-all active:scale-95 ${
              isFavorite
                ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 text-amber-500 shadow-sm'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
            }`}
            title="Favorite"
            aria-label="Toggle favorite"
          >
            <Star className={`w-4 h-4 ${isFavorite ? 'fill-amber-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Edit Nutrition Modal */}
      <EditProductNutritionModal
        product={currentProduct}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSaved={(updated) => {
          setCurrentProduct(updated);
        }}
      />

      {/* Log Meal Modal */}
      <LogMealModal
        product={currentProduct}
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        onLogged={() => {}}
      />

      {/* Product Compare Modal */}
      {isCompareOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm overflow-y-auto p-4 flex items-center justify-center animate-in fade-in">
          <div className="w-full max-w-2xl my-auto">
            <ProductCompareView
              productA={currentProduct}
              productB={comparedProductB}
              availableProducts={availableForCompare}
              onSelectProductB={(p) => setComparedProductB(p)}
              onClose={() => setIsCompareOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
