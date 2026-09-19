import React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Zap,
  Heart,
  HelpCircle,
  Layers,
} from 'lucide-react';
import { HealthAssessmentResult } from '../../types/assessment';

interface WhyRatingSectionProps {
  assessment: HealthAssessmentResult;
}

export const WhyRatingSection: React.FC<WhyRatingSectionProps> = ({ assessment }) => {
  const { positiveFactors, cautionFactors, novaInsight } = assessment;

  const renderIcon = (iconName: string, type: 'positive' | 'caution' | 'warning') => {
    if (type === 'positive') {
      return <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />;
    }
    if (type === 'warning') {
      return <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />;
    }
    return <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />;
  };

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
      <div className="flex items-center gap-2 mb-4">
        <HelpCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
        <h3 className="font-bold text-base text-slate-900 dark:text-white">
          Why this rating?
        </h3>
      </div>

      <div className="space-y-4">
        {/* Positive Factors */}
        {positiveFactors.length > 0 && (
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block">
              Positive Nutritional Aspects ({positiveFactors.length})
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {positiveFactors.map((f) => (
                <div
                  key={f.id}
                  className="flex items-start gap-2.5 p-3 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/60 text-xs"
                >
                  {renderIcon(f.icon, f.type)}
                  <div>
                    <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                      {f.title}
                      {f.metric && (
                        <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/60 px-1.5 py-0.2 rounded-md">
                          {f.metric}
                        </span>
                      )}
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 text-[11px] mt-0.5 leading-snug">
                      {f.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Caution Factors */}
        {cautionFactors.length > 0 && (
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider block">
              Points to Balance ({cautionFactors.length})
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {cautionFactors.map((f) => (
                <div
                  key={f.id}
                  className={`flex items-start gap-2.5 p-3 rounded-2xl border text-xs ${
                    f.type === 'warning'
                      ? 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-200/60 dark:border-rose-900/60'
                      : 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-200/60 dark:border-amber-900/60'
                  }`}
                >
                  {renderIcon(f.icon, f.type)}
                  <div>
                    <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                      {f.title}
                      {f.metric && (
                        <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded-md ${
                          f.type === 'warning'
                            ? 'text-rose-700 dark:text-rose-300 bg-rose-100 dark:bg-rose-900/60'
                            : 'text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/60'
                        }`}>
                          {f.metric}
                        </span>
                      )}
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 text-[11px] mt-0.5 leading-snug">
                      {f.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* NOVA Food Processing Classification */}
        {novaInsight && (
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2 mb-1">
              <Layers className="w-4 h-4 text-slate-600 dark:text-slate-300" />
              <span className="font-bold text-xs text-slate-900 dark:text-white">
                {novaInsight.title}
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {novaInsight.explanation}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
