import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Button } from '@/components/ui/button';
import { Camera, CameraOff, ScanLine } from 'lucide-react';

const BarcodeScanner = ({ onScan, onError, isActive = true }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [hasCamera, setHasCamera] = useState(true);
  const [lastScanned, setLastScanned] = useState(null);
  const scannerRef = useRef(null);
  const html5QrCodeRef = useRef(null);

  const startScanner = async () => {
    if (!scannerRef.current || html5QrCodeRef.current?.isScanning) return;

    try {
      const html5QrCode = new Html5Qrcode("barcode-scanner");
      html5QrCodeRef.current = html5QrCode;

      const config = {
        fps: 10,
        qrbox: { width: 280, height: 150 },
        aspectRatio: 1.777,
        formatsToSupport: [
          0,  // QR_CODE
          1,  // AZTEC
          2,  // CODABAR
          3,  // CODE_39
          4,  // CODE_93
          5,  // CODE_128
          6,  // DATA_MATRIX
          7,  // MAXICODE
          8,  // ITF
          9,  // EAN_13
          10, // EAN_8
          11, // PDF_417
          12, // RSS_14
          13, // RSS_EXPANDED
          14, // UPC_A
          15, // UPC_E
          16, // UPC_EAN_EXTENSION
        ]
      };

      await html5QrCode.start(
        { facingMode: "environment" },
        config,
        (decodedText) => {
          // Prevent duplicate scans
          if (decodedText !== lastScanned) {
            setLastScanned(decodedText);
            // Vibrate on successful scan
            if (navigator.vibrate) {
              navigator.vibrate(200);
            }
            onScan(decodedText);
          }
        },
        (errorMessage) => {
          // Ignore scan errors (no barcode found)
        }
      );

      setIsScanning(true);
      setHasCamera(true);
    } catch (err) {
      console.error("Scanner error:", err);
      setHasCamera(false);
      if (onError) {
        onError(err.message || "Failed to start camera");
      }
    }
  };

  const stopScanner = async () => {
    if (html5QrCodeRef.current?.isScanning) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
      } catch (err) {
        console.error("Error stopping scanner:", err);
      }
    }
    setIsScanning(false);
    setLastScanned(null);
  };

  useEffect(() => {
    if (isActive) {
      startScanner();
    } else {
      stopScanner();
    }

    return () => {
      stopScanner();
    };
  }, [isActive]);

  // Reset last scanned after 2 seconds to allow re-scanning same code
  useEffect(() => {
    if (lastScanned) {
      const timer = setTimeout(() => {
        setLastScanned(null);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [lastScanned]);

  return (
    <div className="barcode-scanner-container">
      <div 
        id="barcode-scanner" 
        ref={scannerRef}
        className="w-full rounded-lg overflow-hidden bg-slate-900"
        style={{ minHeight: '200px' }}
      />
      
      {!hasCamera && (
        <div className="flex flex-col items-center justify-center p-8 bg-slate-100 dark:bg-slate-800 rounded-lg">
          <CameraOff className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-center">
            Camera not available or permission denied.
            <br />
            Please allow camera access and try again.
          </p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={startScanner}
          >
            <Camera className="h-4 w-4 mr-2" />
            Retry Camera
          </Button>
        </div>
      )}

      {isScanning && (
        <div className="flex items-center justify-center gap-2 mt-3 text-sm text-muted-foreground">
          <ScanLine className="h-4 w-4 animate-pulse" />
          <span>Point camera at barcode...</span>
        </div>
      )}

      {lastScanned && (
        <div className="mt-3 p-2 bg-green-100 dark:bg-green-900 rounded-lg text-center">
          <p className="text-sm font-medium text-green-800 dark:text-green-200">
            Scanned: {lastScanned}
          </p>
        </div>
      )}
    </div>
  );
};

export default BarcodeScanner;
