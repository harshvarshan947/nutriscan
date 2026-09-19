import { useEffect, useRef, useState, useCallback } from 'react';
import { barcodeService } from '../services/barcodeService';
import { audioService } from '../services/audioService';

interface UseBarcodeScannerOptions {
  onScan: (barcode: string) => void;
  enabled: boolean;
  soundEnabled?: boolean;
  hapticsEnabled?: boolean;
}

export function useBarcodeScanner({
  onScan,
  enabled,
  soundEnabled = true,
  hapticsEnabled = true,
}: UseBarcodeScannerOptions) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const isScanningRef = useRef(false);
  const lastScannedBarcodeRef = useRef<string | null>(null);
  const lastScannedTimeRef = useRef<number>(0);

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [torchAvailable, setTorchAvailable] = useState<boolean>(false);
  const [torchOn, setTorchOn] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const stopStream = useCallback(() => {
    isScanningRef.current = false;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const startCamera = useCallback(async () => {
    stopStream();
    setErrorMessage(null);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setErrorMessage('Camera access is not supported on this browser or connection.');
      setHasPermission(false);
      return;
    }

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setHasPermission(true);
      isScanningRef.current = true;

      // Check torch capability
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack && 'getCapabilities' in videoTrack) {
        const capabilities = (videoTrack as any).getCapabilities();
        setTorchAvailable(!!capabilities?.torch);
      } else {
        setTorchAvailable(false);
      }
    } catch (err: any) {
      console.error('Camera initialization error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setErrorMessage('Camera permission was denied. Please allow camera access in your browser settings.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setErrorMessage('No camera device found on this system.');
      } else {
        setErrorMessage(err.message || 'Unable to access camera.');
      }
      setHasPermission(false);
    }
  }, [facingMode, stopStream]);

  // Continuous scanning loop
  useEffect(() => {
    if (!enabled || !hasPermission) return;

    let timer: ReturnType<typeof setTimeout> | null = null;

    const scanFrame = async () => {
      if (!isScanningRef.current || !videoRef.current) return;
      if (videoRef.current.readyState < 2) {
        timer = setTimeout(scanFrame, 150);
        return;
      }

      try {
        const detected = await barcodeService.decodeFromVideoElement(videoRef.current);
        if (detected) {
          const now = Date.now();
          // Prevent repeated scanning of the exact same barcode within 2.5 seconds
          if (detected === lastScannedBarcodeRef.current && now - lastScannedTimeRef.current < 2500) {
            timer = setTimeout(scanFrame, 200);
            return;
          }

          lastScannedBarcodeRef.current = detected;
          lastScannedTimeRef.current = now;

          if (soundEnabled) audioService.playScanBeep();
          if (hapticsEnabled) audioService.triggerHaptic();

          onScan(detected);
        }
      } catch (e) {
        // frame decode pass
      }

      timer = setTimeout(scanFrame, 180);
    };

    scanFrame();

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [enabled, hasPermission, onScan, soundEnabled, hapticsEnabled]);

  // Lifecycle
  useEffect(() => {
    if (enabled) {
      startCamera();
    } else {
      stopStream();
    }

    return () => {
      stopStream();
    };
  }, [enabled, facingMode, startCamera, stopStream]);

  // Torch toggle
  const toggleTorch = async () => {
    if (!streamRef.current || !torchAvailable) return;
    try {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      const newTorchState = !torchOn;
      await (videoTrack as any).applyConstraints({
        advanced: [{ torch: newTorchState }],
      });
      setTorchOn(newTorchState);
    } catch (e) {
      console.warn('Torch toggle failed', e);
    }
  };

  // Flip Camera (Front / Rear)
  const switchCamera = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  // File Upload scanning fallback
  const scanImageFile = async (file: File) => {
    setIsProcessing(true);
    try {
      const barcode = await barcodeService.decodeFromImageFile(file);
      if (barcode) {
        if (soundEnabled) audioService.playScanBeep();
        if (hapticsEnabled) audioService.triggerHaptic();
        onScan(barcode);
        return true;
      } else {
        if (soundEnabled) audioService.playErrorTone();
        return false;
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    videoRef,
    hasPermission,
    errorMessage,
    facingMode,
    torchAvailable,
    torchOn,
    isProcessing,
    retryCamera: startCamera,
    switchCamera,
    toggleTorch,
    scanImageFile,
  };
}
