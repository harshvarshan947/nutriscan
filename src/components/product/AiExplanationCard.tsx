import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, ShieldAlert, Cpu, CheckCircle } from 'lucide-react';
import { ProductDetails } from '../../types/product';
import { HealthAssessmentResult } from '../../types/assessment';
import { UserProfile } from '../../types/profile';
import { aiService } from '../../services/aiService';

interface AiExplanationCardProps {
  product: ProductDetails;
  assessment: HealthAssessmentResult;
  userProfile?: UserProfile;
}

export const AiExplanationCard: React.FC<AiExplanationCardProps> = ({
  product,
  assessment,
  userProfile,
}) => {
  const [summary, setSummary] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeminiSource, setIsGeminiSource] = useState(false);

  const fetchSummary = async () => {
    setIsGenerating(true);
    try {
      const hasKey = !!userProfile?.geminiApiKey;
      setIsGeminiSource(hasKey && navigator.onLine);

      const text = await aiService.generateSummary({
        product,
        assessment,
        userProfile,
        apiKey: userProfile?.geminiApiKey,
      });
      setSummary(text);
    } catch (e) {
      console.error('Failed to generate summary', e);
      setSummary(aiService.generateDeterministicExplanation(product, assessment, userProfile));
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [product.barcode, assessment.qualityScore]);

  return (
    <div className="w-full bg-gradient-to-br from-emerald-500/5 via-teal-500/5 to-cyan-500/5 dark:from-slate-900 dark:to-slate-850 rounded-3xl p-5 shadow-sm border border-emerald-200/60 dark:border-emerald-900/40 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
              Nutritionist Insights
            </h3>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
              {isGeminiSource ? 'Gemini AI Assistant' : 'NutriScan Evidence Engine'}
            </span>
          </div>
        </div>

        <button
          onClick={fetchSummary}
          disabled={isGenerating}
          className="p-2 rounded-xl text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors active:scale-95 disabled:opacity-50"
          title="Regenerate summary"
          aria-label="Regenerate explanation"
        >
          <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {isGenerating ? (
        <div className="py-6 flex flex-col items-center justify-center gap-2 text-slate-500 dark:text-slate-400">
          <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-medium">Generating plain-language dietary summary...</span>
        </div>
      ) : (
        <div className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
          {summary.split('\n\n').map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
      )}

      {/* Safety Notice */}
      <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800 flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400">
        <ShieldAlert className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
        <span>General nutritional guidance for educational purposes. Not a medical diagnosis.</span>
      </div>
    </div>
  );
};
