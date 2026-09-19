import React, { useState, useEffect } from 'react';
import {
  User,
  Heart,
  Flame,
  Target,
  Sliders,
  Sparkles,
  Volume2,
  Vibrate,
  ShieldCheck,
  Check,
  Key,
} from 'lucide-react';
import { UserProfile, ActivityLevel, DietaryGoal } from '../../types/profile';
import { ReferenceStandardId } from '../../types/assessment';
import { calculateUserTargets } from '../../engine/tdeeCalculator';
import { storageService } from '../../services/storageService';

interface ProfileViewProps {
  userProfile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  userProfile,
  onUpdateProfile,
}) => {
  const [profile, setProfile] = useState<UserProfile>(userProfile);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setProfile(userProfile);
  }, [userProfile]);

  const targets = calculateUserTargets(profile);

  const handleChange = (key: keyof UserProfile, val: any) => {
    const updated = { ...profile, [key]: val, updatedAt: Date.now() };
    setProfile(updated);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await storageService.saveUserProfile(profile);
    onUpdateProfile(profile);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const goals: { id: DietaryGoal; label: string; desc: string }[] = [
    { id: 'healthy_eating', label: 'General Healthy Eating', desc: 'Balanced wholesome nutrition' },
    { id: 'fat_loss', label: 'Fat Loss', desc: 'Moderate calorie deficit & higher protein' },
    { id: 'muscle_gain', label: 'Muscle Gain', desc: 'Caloric surplus with high protein for hypertrophy' },
    { id: 'maintain', label: 'Maintain Weight', desc: 'Energy balance at your calculated TDEE' },
    { id: 'low_sodium', label: 'Low Sodium Focus', desc: 'Heart-conscious sodium limits (<1500mg)' },
    { id: 'low_sugar', label: 'Low Sugar Focus', desc: 'Strict limit on added and simple sugars' },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto space-y-5 pb-24 p-4">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-lg shadow-inner">
            <User className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-bold text-base text-slate-900 dark:text-white">
              Personal Nutrition Profile
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Calibrate daily reference values to your body and goals
            </p>
          </div>
        </div>

        {isSaved && (
          <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-3 py-1.5 rounded-xl animate-in fade-in">
            <Check className="w-4 h-4" /> Saved!
          </span>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        {/* Calculated Energy Needs Box */}
        <div className="bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-cyan-500/10 dark:from-slate-900 dark:to-slate-850 p-5 rounded-3xl border border-emerald-200/80 dark:border-emerald-900/60 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Estimated Daily Nutritional Needs
              </h3>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 rounded-md">
              Mifflin-St Jeor Formula
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
            <div className="p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-2xs">
              <span className="text-[10px] text-slate-400 font-semibold block">Target Calories</span>
              <span className="text-lg font-black text-slate-900 dark:text-white">{targets.targetCalories}</span>
              <span className="text-[10px] text-slate-400 block">kcal / day</span>
            </div>

            <div className="p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-2xs">
              <span className="text-[10px] text-slate-400 font-semibold block">Target Protein</span>
              <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">{targets.targetProtein}g</span>
              <span className="text-[10px] text-slate-400 block">per day</span>
            </div>

            <div className="p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-2xs">
              <span className="text-[10px] text-slate-400 font-semibold block">Target Fiber</span>
              <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">{targets.targetFiber}g</span>
              <span className="text-[10px] text-slate-400 block">per day</span>
            </div>

            <div className="p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-2xs">
              <span className="text-[10px] text-slate-400 font-semibold block">Max Sugars</span>
              <span className="text-lg font-black text-amber-600 dark:text-amber-400">{targets.targetSugars}g</span>
              <span className="text-[10px] text-slate-400 block">per day</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
            * Basal Metabolic Rate (BMR): <span className="font-semibold">{targets.bmr} kcal</span> • Total Daily Energy Expenditure (TDEE): <span className="font-semibold">{targets.tdee} kcal</span>
          </p>
        </div>

        {/* Body Metrics Form */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">
            Body Measurements & Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Age */}
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                Age (years)
              </label>
              <input
                type="number"
                min="10"
                max="120"
                value={profile.age}
                onChange={(e) => handleChange('age', Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Sex */}
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                Biological Sex
              </label>
              <select
                value={profile.sex}
                onChange={(e) => handleChange('sex', e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="prefer_not_to_say">Prefer not to say / Neutral</option>
              </select>
            </div>

            {/* Height */}
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                Height (cm)
              </label>
              <input
                type="number"
                min="100"
                max="250"
                value={profile.heightCm}
                onChange={(e) => handleChange('heightCm', Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Weight */}
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                Weight (kg)
              </label>
              <input
                type="number"
                min="30"
                max="300"
                value={profile.weightKg}
                onChange={(e) => handleChange('weightKg', Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Activity Level */}
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                Physical Activity Level
              </label>
              <select
                value={profile.activityLevel}
                onChange={(e) => handleChange('activityLevel', e.target.value as ActivityLevel)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="sedentary">Sedentary (Little to no exercise / desk job)</option>
                <option value="light">Light Activity (Exercise 1-3 times/week)</option>
                <option value="moderate">Moderate Activity (Exercise 3-5 times/week)</option>
                <option value="very_active">Very Active (Heavy training 6-7 days/week)</option>
                <option value="extra_active">Extra Active (Physical job + athlete training)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Primary Goal */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Dietary Goal
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {goals.map((g) => (
              <div
                key={g.id}
                onClick={() => handleChange('goal', g.id)}
                className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                  profile.goal === g.id
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-slate-900 dark:text-white shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs">{g.label}</span>
                  {profile.goal === g.id && <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">{g.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Gemini AI API Configuration */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                AI Nutrition Explanations (Gemini API)
              </h3>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={profile.useAiSummary}
                onChange={(e) => handleChange('useAiSummary', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            NutriScan comes with a built-in deterministic nutritionist engine that works 100% offline. If you'd like dynamic LLM responses, you can optionally provide your Gemini API key below.
          </p>

          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <Key className="w-3.5 h-3.5 text-slate-400" />
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                Gemini API Key (Optional)
              </label>
            </div>
            <input
              type="password"
              placeholder="AIzaSy..."
              value={profile.geminiApiKey || ''}
              onChange={(e) => handleChange('geminiApiKey', e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Stored locally on your device in secure IndexedDB. Never sent to any third-party server.
            </p>
          </div>
        </div>

        {/* Feedback & Sounds Settings */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-3">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">
            Scanner Preferences
          </h3>

          <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-slate-500" />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Audio Beep Confirmation
              </span>
            </div>
            <input
              type="checkbox"
              checked={profile.soundEnabled}
              onChange={(e) => handleChange('soundEnabled', e.target.checked)}
              className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
            />
          </div>

          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-2">
              <Vibrate className="w-4 h-4 text-slate-500" />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Haptic Vibration Feedback
              </span>
            </div>
            <input
              type="checkbox"
              checked={profile.hapticsEnabled}
              onChange={(e) => handleChange('hapticsEnabled', e.target.checked)}
              className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
            />
          </div>
        </div>

        {/* Disclaimer Footer Note */}
        <div className="p-4 rounded-2xl bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <p className="leading-snug">
            This estimate is for general educational purposes and is not personalized medical advice. Consult a healthcare professional for clinical nutritional regimens.
          </p>
        </div>

        {/* Save Button */}
        <button
          type="submit"
          className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold rounded-2xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 text-sm"
        >
          <Check className="w-4 h-4 stroke-[3]" />
          Save Profile Preferences
        </button>
      </form>
    </div>
  );
};
