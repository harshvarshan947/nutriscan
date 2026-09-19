import {
  MultiFormatReader,
  BarcodeFormat,
  DecodeHintType,
  RGBLuminanceSource,
  BinaryBitmap,
  HybridBinarizer,
} from '@zxing/library';

class BarcodeService {
  private zxingReader: MultiFormatReader | null = null;
  private isNativeSupported: boolean | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;

  constructor() {
    this.checkNativeSupport();
    this.initZxing();
  }

  private initZxing() {
    const hints = new Map();
    hints.set(DecodeHintType.POSSIBLE_FORMATS, [
      BarcodeFormat.EAN_13,
      BarcodeFormat.EAN_8,
      BarcodeFormat.UPC_A,
      BarcodeFormat.UPC_E,
      BarcodeFormat.CODE_128,
      BarcodeFormat.CODE_39,
      BarcodeFormat.QR_CODE,
    ]);
    hints.set(DecodeHintType.TRY_HARDER, true);

    this.zxingReader = new MultiFormatReader();
    this.zxingReader.setHints(hints);
  }

  private checkNativeSupport(): boolean {
    if (this.isNativeSupported !== null) return this.isNativeSupported;
    if (typeof window !== 'undefined' && 'BarcodeDetector' in window) {
      this.isNativeSupported = true;
    } else {
      this.isNativeSupported = false;
    }
    return this.isNativeSupported;
  }

  /**
   * Decode barcode from an HTML Video element
   */
  async decodeFromVideoElement(video: HTMLVideoElement): Promise<string | null> {
    if (!video || video.videoWidth === 0 || video.videoHeight === 0) return null;

    // 1. Try Native BarcodeDetector API first (high performance hardware acceleration)
    if (this.checkNativeSupport()) {
      try {
        const detector = new (window as any).BarcodeDetector({
          formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39', 'qr_code'],
        });
        const barcodes = await detector.detect(video);
        if (barcodes && barcodes.length > 0 && barcodes[0].rawValue) {
          return barcodes[0].rawValue.trim();
        }
      } catch (e) {
        // Fallback to ZXing
      }
    }

    // 2. Decode via ZXing offscreen canvas extraction
    try {
      if (!this.canvas) {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
      }

      const width = Math.min(640, video.videoWidth);
      const height = Math.min(480, video.videoHeight);
      this.canvas.width = width;
      this.canvas.height = height;

      if (this.ctx) {
        this.ctx.drawImage(video, 0, 0, width, height);
        const imageData = this.ctx.getImageData(0, 0, width, height);
        const luminanceSource = new RGBLuminanceSource(
          new Uint8ClampedArray(imageData.data.buffer),
          width,
          height
        );
        const binaryBitmap = new BinaryBitmap(new HybridBinarizer(luminanceSource));

        if (this.zxingReader) {
          const result = this.zxingReader.decodeWithState(binaryBitmap);
          if (result && result.getText()) {
            return result.getText().trim();
          }
        }
      }
    } catch (e) {
      // Frame didn't contain a readable barcode
    } finally {
      if (this.zxingReader) {
        this.zxingReader.reset();
      }
    }

    return null;
  }

  /**
   * Decode barcode from an uploaded image File / Blob
   */
  async decodeFromImageFile(file: File): Promise<string | null> {
    try {
      const imgBitmap = await createImageBitmap(file);

      // 1. Try Native BarcodeDetector
      if (this.checkNativeSupport()) {
        try {
          const detector = new (window as any).BarcodeDetector({
            formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39', 'qr_code'],
          });
          const barcodes = await detector.detect(imgBitmap);
          if (barcodes && barcodes.length > 0 && barcodes[0].rawValue) {
            return barcodes[0].rawValue.trim();
          }
        } catch (e) {
          // Fallback to ZXing
        }
      }

      // 2. Fallback to ZXing canvas extraction
      const canvas = document.createElement('canvas');
      canvas.width = imgBitmap.width;
      canvas.height = imgBitmap.height;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (ctx) {
        ctx.drawImage(imgBitmap, 0, 0);
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const luminanceSource = new RGBLuminanceSource(
          new Uint8ClampedArray(imgData.data.buffer),
          canvas.width,
          canvas.height
        );
        const binaryBitmap = new BinaryBitmap(new HybridBinarizer(luminanceSource));

        if (this.zxingReader) {
          const result = this.zxingReader.decodeWithState(binaryBitmap);
          if (result && result.getText()) {
            return result.getText().trim();
          }
        }
      }
    } catch (e) {
      console.warn('Image file barcode detection failed', e);
    } finally {
      if (this.zxingReader) {
        this.zxingReader.reset();
      }
    }

    return null;
  }
}

export const barcodeService = new BarcodeService();
