import React from 'react';
import { ShieldCheck, X, AlertTriangle, HeartPulse, BookOpen } from 'lucide-react';

interface DisclaimerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DisclaimerModal: React.FC<DisclaimerModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Medical & Safety Disclaimer
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Educational Nutrition Guidance
            </p>
          </div>
        </div>

        <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-900/60 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-900 dark:text-amber-200 font-medium">
              NutriScan is an informational educational tool. It is not a certified medical device and does not provide medical diagnoses, treatment advice, or clinical prescriptions.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-2.5">
              <HeartPulse className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-1" />
              <div>
                <span className="font-semibold text-slate-900 dark:text-slate-100 block">Personal Health Decisions</span>
                Nutritional needs vary significantly based on individual metabolic health, age, physical activity, genetic factors, allergies, and medical conditions.
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-1" />
              <div>
                <span className="font-semibold text-slate-900 dark:text-slate-100 block">Standard Reference Guidelines</span>
                Scores and nutrient assessments are calculated against standardized dietary reference values (e.g. FDA Daily Values, UK Traffic Light Guidelines, WHO). These are population baselines, not individualized medical prescriptions.
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-1" />
              <div>
                <span className="font-semibold text-slate-900 dark:text-slate-100 block">Consult Qualified Professionals</span>
                Always consult a certified physician, registered dietitian, or qualified healthcare professional before making substantial changes to your diet or if you have specific clinical concerns.
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={onClose}
            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-semibold rounded-2xl shadow-md shadow-emerald-600/20 transition-all text-sm"
          >
            I Understand & Agree
          </button>
        </div>
      </div>
    </div>
  );
};
