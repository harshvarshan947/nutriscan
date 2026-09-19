import React from 'react';
import { Award, SlidersHorizontal, Info } from 'lucide-react';
import { HealthAssessmentResult, ReferenceStandardId } from '../../types/assessment';
import { REFERENCE_STANDARDS } from '../../engine/nutritionThresholds';

interface QualityScoreCardProps {
  assessment: HealthAssessmentResult;
  selectedStandard: ReferenceStandardId;
  onSelectStandard: (standard: ReferenceStandardId) => void;
}

export const QualityScoreCard: React.FC<QualityScoreCardProps> = ({
  assessment,
  selectedStandard,
  onSelectStandard,
}) => {
  const { qualityScore, qualityTier, summaryHeadline, referenceProfile } = assessment;

  // Determine badge colors based on qualityTier
  const getTierTheme = (tier: string) => {
    switch (tier) {
      case 'Excellent':
        return {
          stroke: '#059669', // Emerald
          bg: 'from-emerald-500/10 to-teal-500/10',
          text: 'text-emerald-700 dark:text-emerald-400',
          badgeBg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
        };
      case 'Good':
        return {
          stroke: '#10b981', // Lime / Emerald
          bg: 'from-teal-500/10 to-emerald-500/10',
          text: 'text-teal-700 dark:text-teal-400',
          badgeBg: 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 border-teal-200 dark:border-teal-800',
        };
      case 'Moderate':
        return {
          stroke: '#f59e0b', // Amber
          bg: 'from-amber-500/10 to-orange-500/10',
          text: 'text-amber-700 dark:text-amber-400',
          badgeBg: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-200 dark:border-amber-800',
        };
      case 'Low':
      default:
        return {
          stroke: '#f43f5e', // Rose
          bg: 'from-rose-500/10 to-red-500/10',
          text: 'text-rose-700 dark:text-rose-400',
          badgeBg: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-200 dark:border-rose-800',
        };
    }
  };

  const theme = getTierTheme(qualityTier);
  const strokeDashoffset = 283 - (283 * qualityScore) / 100;

  return (
    <div className={`w-full rounded-3xl p-5 shadow-sm border border-slate-200 dark:border-slate-800 bg-gradient-to-br ${theme.bg} bg-white dark:bg-slate-900 transition-all`}>
      {/* Header with Reference selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">
            Nutrition Quality Estimate
          </h3>
        </div>

        {/* Reference Standard Dropdown */}
        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={selectedStandard}
            onChange={(e) => onSelectStandard(e.target.value as ReferenceStandardId)}
            className="text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer shadow-2xs"
          >
            <option value="general_adult">General Adult (2,000 kcal)</option>
            <option value="fda_dv">US FDA Daily Values (DV)</option>
            <option value="uk_traffic_light">UK Traffic Light (FSA)</option>
            <option value="who_guidelines">WHO Healthy Guidelines</option>
            <option value="personalized">My Personalized Profile</option>
          </select>
        </div>
      </div>

      {/* Main Score Centerpiece */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-2">
        {/* Animated Radial SVG Gauge */}
        <div className="relative w-32 h-32 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              className="text-slate-100 dark:text-slate-800"
              strokeWidth="9"
              stroke="currentColor"
              fill="transparent"
            />
            {/* Progress track */}
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke={theme.stroke}
              strokeWidth="9"
              strokeDasharray="283"
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-1000 ease-out"
            />
          </svg>

          {/* Number display inside ring */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {qualityScore}
            </span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              / 100
            </span>
          </div>
        </div>

        {/* Assessment Tier & Explanation Headline */}
        <div className="text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border mb-1.5 shadow-2xs">
            <span className={`w-2 h-2 rounded-full`} style={{ backgroundColor: theme.stroke }} />
            {qualityTier} Quality
          </div>

          <p className="text-base font-bold text-slate-900 dark:text-white mb-1">
            {summaryHeadline}
          </p>

          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
            Evaluated against <span className="font-medium text-slate-700 dark:text-slate-300">{referenceProfile.name}</span> guidelines.
          </p>
        </div>
      </div>
    </div>
  );
};
