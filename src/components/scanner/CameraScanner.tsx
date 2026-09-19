import React, { useState } from 'react';
import {
  Camera,
  RefreshCw,
  Zap,
  ZapOff,
  Image as ImageIcon,
  Keyboard,
  Sparkles,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { useBarcodeScanner } from '../../hooks/useBarcodeScanner';
import { SAMPLE_PRODUCTS } from '../../data/sampleProducts';

interface CameraScannerProps {
  onBarcodeDetected: (barcode: string) => void;
  isLoading: boolean;
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  onOpenManualSearch: () => void;
}

export const CameraScanner: React.FC<CameraScannerProps> = ({
  onBarcodeDetected,
  isLoading,
  soundEnabled,
  hapticsEnabled,
  onOpenManualSearch,
}) => {
  const [manualCode, setManualCode] = useState('');
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const {
    videoRef,
    hasPermission,
    errorMessage,
    torchAvailable,
    torchOn,
    isProcessing,
    retryCamera,
    switchCamera,
    toggleTorch,
    scanImageFile,
  } = useBarcodeScanner({
    onScan: onBarcodeDetected,
    enabled: true,
    soundEnabled,
    hapticsEnabled,
  });

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      onBarcodeDetected(manualCode.trim());
      setIsManualModalOpen(false);
      setManualCode('');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    const success = await scanImageFile(file);
    if (!success) {
      setUploadError('No barcode detected in the uploaded photo. Please try a clearer picture or enter the code manually.');
    }
    // reset input
    e.target.value = '';
  };

  return (
    <div className="relative w-full min-h-[calc(100vh-8rem)] flex flex-col items-center justify-between p-4 pb-20">
      {/* Top Banner / Controls */}
      <div className="w-full max-w-md flex items-center justify-between mb-3 z-10">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Scanner Active
          </span>
        </div>

        <div className="flex items-center gap-2">
          {torchAvailable && (
            <button
              onClick={toggleTorch}
              className={`p-2.5 rounded-full backdrop-blur-md border transition-all ${
                torchOn
                  ? 'bg-amber-400 text-slate-900 border-amber-300 shadow-md shadow-amber-400/30'
                  : 'bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
              }`}
              title="Toggle Flashlight"
              aria-label="Flashlight"
            >
              {torchOn ? <Zap className="w-4 h-4" /> : <ZapOff className="w-4 h-4" />}
            </button>
          )}

          <button
            onClick={switchCamera}
            className="p-2.5 rounded-full bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 backdrop-blur-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-all active:scale-95"
            title="Switch Camera (Front/Back)"
            aria-label="Switch Camera"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Viewfinder Frame */}
      <div className="relative w-full max-w-md aspect-[4/5] sm:aspect-square rounded-3xl overflow-hidden shadow-2xl bg-black border-2 border-slate-700/50 flex items-center justify-center">
        {/* Live Camera Video Feed */}
        <video
          ref={videoRef}
          playsInline
          muted
          autoPlay
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Darkened Vignette Overlay */}
        <div className="absolute inset-0 bg-black/25 pointer-events-none" />

        {/* Viewfinder Reticle */}
        <div className="relative w-64 h-44 sm:w-72 sm:h-48 border-2 border-emerald-400/80 rounded-2xl shadow-2xl pointer-events-none flex flex-col justify-between p-2">
          {/* Animated Laser Line */}
          <div className="absolute left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_#34d399] animate-scan-laser" />

          {/* Corner brackets */}
          <div className="flex justify-between">
            <div className="w-6 h-6 border-t-4 border-l-4 border-emerald-400 -mt-1 -ml-1 rounded-tl-lg" />
            <div className="w-6 h-6 border-t-4 border-r-4 border-emerald-400 -mt-1 -mr-1 rounded-tr-lg" />
          </div>
          <div className="flex justify-between">
            <div className="w-6 h-6 border-b-4 border-l-4 border-emerald-400 -mb-1 -ml-1 rounded-bl-lg" />
            <div className="w-6 h-6 border-b-4 border-r-4 border-emerald-400 -mb-1 -mr-1 rounded-br-lg" />
          </div>
        </div>

        {/* Hint Text */}
        <div className="absolute bottom-4 left-4 right-4 text-center pointer-events-none">
          <span className="inline-block px-3 py-1.5 rounded-full text-xs font-medium bg-black/60 backdrop-blur-md text-white border border-white/10">
            Center product barcode in box
          </span>
        </div>

        {/* Loading Overlay */}
        {(isLoading || isProcessing) && (
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center text-white z-20 animate-in fade-in">
            <div className="w-12 h-12 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="font-semibold text-sm">Identifying product & nutrition...</p>
            <p className="text-xs text-slate-300 mt-1">Connecting to Open Food Facts</p>
          </div>
        )}

        {/* Camera Permission Denied / Error View */}
        {hasPermission === false && (
          <div className="absolute inset-0 bg-slate-900 p-6 flex flex-col items-center justify-center text-center text-white z-20">
            <div className="w-14 h-14 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mb-3">
              <Camera className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-base mb-1">Camera Access Required</h3>
            <p className="text-xs text-slate-300 mb-4 max-w-xs leading-relaxed">
              {errorMessage || 'Please allow camera permission in your browser address bar to scan food barcodes.'}
            </p>
            <div className="flex flex-col gap-2 w-full max-w-xs">
              <button
                onClick={retryCamera}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs transition-colors"
              >
                Grant Permission / Retry
              </button>
              <button
                onClick={() => setIsManualModalOpen(true)}
                className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs transition-colors"
              >
                Enter Barcode Manually
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Upload Error Warning */}
      {uploadError && (
        <div className="w-full max-w-md mt-2 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-2xl flex items-start gap-2.5 text-xs text-rose-800 dark:text-rose-200">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <p>{uploadError}</p>
        </div>
      )}

      {/* Quick Actions (Upload Image, Manual Barcode, Text Search) */}
      <div className="w-full max-w-md mt-4 grid grid-cols-3 gap-2.5">
        {/* Upload Picture button */}
        <label className="flex flex-col items-center justify-center py-2.5 px-2 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors cursor-pointer text-center">
          <input
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFileUpload}
            disabled={isLoading || isProcessing}
          />
          <ImageIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mb-1" />
          <span className="text-[11px] font-semibold">Upload Photo</span>
        </label>

        {/* Enter Code button */}
        <button
          onClick={() => setIsManualModalOpen(true)}
          className="flex flex-col items-center justify-center py-2.5 px-2 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors text-center"
        >
          <Keyboard className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mb-1" />
          <span className="text-[11px] font-semibold">Enter Code</span>
        </button>

        {/* Search by Name button */}
        <button
          onClick={onOpenManualSearch}
          className="flex flex-col items-center justify-center py-2.5 px-2 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors text-center"
        >
          <HelpCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mb-1" />
          <span className="text-[11px] font-semibold">Search Food</span>
        </button>
      </div>

      {/* Preset Test Barcodes for Instant Evaluation */}
      <div className="w-full max-w-md mt-4 p-3.5 bg-slate-100/80 dark:bg-slate-850/80 rounded-2xl border border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center gap-1.5 mb-2">
          <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
            Quick Test Barcodes (1-Tap Demo)
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {Object.entries(SAMPLE_PRODUCTS).slice(0, 6).map(([code, p]) => (
            <button
              key={code}
              onClick={() => onBarcodeDetected(code)}
              className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors shadow-2xs"
            >
              {p.brand} {p.name.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Manual Barcode Modal */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
              Enter Barcode
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Type the 8, 12, or 13-digit number found below the barcode on the package.
            </p>

            <form onSubmit={handleManualSubmit} className="space-y-4">
              <input
                type="text"
                pattern="[0-9]*"
                inputMode="numeric"
                placeholder="e.g. 7394376616038"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                autoFocus
                className="w-full px-4 py-3 text-base rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-center tracking-wider"
              />

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsManualModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!manualCode.trim()}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 transition-all"
                >
                  Lookup Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
