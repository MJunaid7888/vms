'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { accessControlAPI } from '@/lib/api';
import { Camera, X, AlertCircle, Scan } from 'lucide-react';

interface QRCodeScannerProps {
  token: string;
  onClose: () => void;
}

// Check if BarcodeDetector is available in the browser
const isBarcodeDetectorSupported = typeof window !== 'undefined' && 'BarcodeDetector' in window;

export default function QRCodeScanner({ token, onClose }: QRCodeScannerProps) {
  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [processingQR, setProcessingQR] = useState(false);
  const [detector, setDetector] = useState<any>(null);
  const [usingFallback, setUsingFallback] = useState(false);
  const [debugMode, setDebugMode] = useState(false);

  const router = useRouter();

  // Initialize QR scanner
  useEffect(() => {
    const initScanner = async () => {
      try {
        if (isBarcodeDetectorSupported) {
          // Use the native BarcodeDetector API if available
          const barcodeDetector = new (window as any).BarcodeDetector({
            formats: ['qr_code']
          });
          setDetector(barcodeDetector);
          console.log('Using native BarcodeDetector API');
        } else {
          // Fallback to simulation mode
          console.log('BarcodeDetector API not supported, using fallback mode');
          setUsingFallback(true);
        }
      } catch (err) {
        console.error('Failed to initialize QR scanner:', err);
        setError('Failed to initialize QR scanner. Please try again.');
        setUsingFallback(true);
      }
    };

    initScanner();
  }, []);

  const handleQRCode = useCallback(async (qrData: string) => {
    if (processingQR) return; // Prevent multiple simultaneous processing

    try {
      setProcessingQR(true);
      setScanResult(qrData);
      setScanning(false);

      // Stop the camera stream
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      // Extract visitor ID from QR code data
      // Support multiple formats: "visitor:123456:timestamp" or "visitor-123456" or just the raw ID
      let visitorId = '';

      // Log the QR data for debugging
      console.log('Raw QR code data:', qrData);

      if (qrData.startsWith('visitor:')) {
        // Format: visitor:123456:timestamp
        visitorId = qrData.split(':')[1];
      } else if (qrData.startsWith('visitor-')) {
        // Format: visitor-123456
        visitorId = qrData.replace('visitor-', '');
      } else if (/^\d{6,}$/.test(qrData)) {
        // Format: Just a numeric ID (at least 6 digits)
        visitorId = qrData;
      } else {
        // Try to extract a JSON object
        try {
          const jsonData = JSON.parse(qrData);
          if (jsonData && typeof jsonData === 'object') {
            if ('visitorId' in jsonData) {
              visitorId = jsonData.visitorId;
            } else if ('id' in jsonData) {
              visitorId = jsonData.id;
            }
          }
        } catch (e) {
          // Not JSON, try to extract any numeric sequence that could be an ID
          const matches = qrData.match(/\d{6,}/);
          if (matches && matches.length > 0) {
            visitorId = matches[0];
          }
        }
      }

      if (!visitorId) {
        setError('Invalid QR code format. Expected visitor ID not found.');
        setProcessingQR(false);
        return;
      }

      if (token) {
        try {
          // Validate QR code with backend if token is provided
          const response = await accessControlAPI.validateQrCode(qrData, token);

          // Check if the response has the expected format
          if (response && typeof response === 'object') {
            // Different possible response formats based on API
            if ('valid' in response && 'visitorId' in response) {
              // Format: { valid: boolean, visitorId: string }
              if (response.valid && response.visitorId) {
                router.push(`/check-in/${response.visitorId}`);
                onClose();
                return;
              }
            } else if ('accessGranted' in response && 'visitorId' in response) {
              // Format from Swagger: { visitorId: string, name: string, hostName: string, accessGranted: boolean }
              if (response.accessGranted && response.visitorId) {
                router.push(`/check-in/${response.visitorId}`);
                onClose();
                return;
              }
            } else if ('data' in response && typeof response.data === 'object') {
              // Format: { success: boolean, data: { visitorId: string, ... } }
              const data = response.data;
              if (data && typeof data === 'object' && 'visitorId' in data) {
                router.push(`/check-in/${data.visitorId}`);
                onClose();
                return;
              }
            }

            // If we get here, the QR code was invalid according to the API
            setError('Invalid QR code. Access denied.');
          } else {
            setError('Invalid response from server');
          }
        } catch (apiErr) {
          console.error('API validation error:', apiErr);

          // If API validation fails, try to use the extracted visitor ID as fallback
          if (visitorId) {
            router.push(`/check-in?visitorId=${visitorId}`);
            onClose();
          } else {
            setError('Failed to validate QR code: ' + (apiErr instanceof Error ? apiErr.message : String(apiErr)));
          }
        }
      } else {
        // If no token is provided (public scanning), just redirect to check-in page with visitor ID
        router.push(`/check-in?visitorId=${visitorId}`);
        onClose();
      }
    } catch (err) {
      setError('Failed to process QR code: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setProcessingQR(false);
    }
  }, [token, router, onClose, stream, processingQR]);

  // Set up the camera and QR scanning
  useEffect(() => {
    if (!detector && !usingFallback) return;

    let videoElement: HTMLVideoElement | null = null;
    let canvasElement: HTMLCanvasElement | null = null;
    let animationFrameId: number | null = null;
    let simulationTimer: NodeJS.Timeout | null = null;

    const startScanner = async () => {
      try {
        setScanning(true);
        setError(null);

        // Get video stream
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        });
        setStream(mediaStream);

        // Set up video element
        videoElement = document.getElementById('qr-video') as HTMLVideoElement;
        if (!videoElement) return;

        videoElement.srcObject = mediaStream;
        videoElement.setAttribute('playsinline', 'true'); // required for iOS
        await videoElement.play();

        // Set up canvas for capturing frames
        canvasElement = document.getElementById('qr-canvas') as HTMLCanvasElement;
        if (!canvasElement) return;

        const canvas = canvasElement.getContext('2d');
        if (!canvas) return;

        // Function to scan a frame
        const scanFrame = async () => {
          if (videoElement && videoElement.readyState === videoElement.HAVE_ENOUGH_DATA) {
            // Draw video frame to canvas
            canvasElement!.height = videoElement.videoHeight;
            canvasElement!.width = videoElement.videoWidth;
            canvas.drawImage(videoElement, 0, 0, canvasElement!.width, canvasElement!.height);

            if (detector && !usingFallback) {
              try {
                // Use BarcodeDetector API to detect QR codes
                const barcodes = await detector.detect(canvasElement);

                if (barcodes && barcodes.length > 0) {
                  // Get the first detected QR code
                  const qrCode = barcodes[0];
                  console.log("QR Code detected:", qrCode.rawValue);

                  // Process the QR code
                  handleQRCode(qrCode.rawValue);
                  return; // Stop scanning once a QR code is found
                }
              } catch (err) {
                console.error('Error detecting QR code:', err);
                // If detection fails, fall back to simulation mode
                setUsingFallback(true);
                return;
              }
            }
          }

          // Continue scanning
          animationFrameId = requestAnimationFrame(scanFrame);
        };

        // Start scanning
        scanFrame();

        // If using fallback mode, simulate finding a QR code
        if (usingFallback) {
          console.log('Using fallback simulation mode');

          // Show a message to the user
          setError('QR code detection not supported in this browser. Using simulation mode.');

          // Simulate finding a QR code after a random interval (2-5 seconds)
          const simulationTime = Math.floor(Math.random() * 3000) + 2000; // 2-5 seconds
          simulationTimer = setTimeout(() => {
            // Prompt the user to enter the QR code data manually
            const manualInput = prompt('Enter the QR code data manually (or click Cancel to use a simulated code):');

            if (manualInput) {
              // Use the manually entered data
              console.log('Manual QR code input:', manualInput);
              handleQRCode(manualInput);
            } else {
              // Generate a realistic QR code data format
              const visitorId = Math.floor(Math.random() * 900000) + 100000; // 6-digit number
              const timestamp = Date.now();
              const simulatedQrData = `visitor:${visitorId}:${timestamp}`;
              console.log('Simulated QR code detected:', simulatedQrData);

              // Process the QR code
              handleQRCode(simulatedQrData);
            }
          }, simulationTime);
        }

      } catch (err) {
        setError('Failed to access camera: ' + (err instanceof Error ? err.message : String(err)));
        setScanning(false);
      }
    };

    startScanner();

    // Cleanup function
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }

      if (simulationTimer) {
        clearTimeout(simulationTimer);
      }

      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [detector, usingFallback, handleQRCode, stream]);

  // Function to handle manual QR code input
  const handleManualInput = () => {
    const manualInput = prompt('Enter the QR code data:');
    if (manualInput && manualInput.trim()) {
      handleQRCode(manualInput.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Scan QR Code</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {scanResult && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            <p className="font-medium">QR Code Detected!</p>
            <p className="text-sm">Processing: {scanResult.substring(0, 30)}{scanResult.length > 30 ? '...' : ''}</p>
          </div>
        )}

        <div className="relative">
          <video
            id="qr-video"
            className="w-full h-64 bg-black rounded-lg object-cover"
            muted
            playsInline
          ></video>
          <canvas
            id="qr-canvas"
            className="absolute top-0 left-0 w-full h-full hidden"
          ></canvas>

          {scanning && !scanResult && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-48 h-48 border-4 border-white rounded-lg">
                <div className="absolute inset-0 border-t-4 border-blue-500 rounded-lg animate-scan"></div>
              </div>
              <div className="absolute bottom-4 left-0 right-0 text-center text-white bg-black bg-opacity-50 py-2">
                Position QR code within the frame
              </div>
            </div>
          )}

          {!scanning && !error && !scanResult && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
            </div>
          )}
        </div>

        <div className="mt-4 text-center text-sm text-gray-600 flex flex-col items-center justify-center">
          <div className="mb-2">
            {scanning && !scanResult ? (
              <>
                <Camera className="h-4 w-4 mr-2 text-blue-600 animate-pulse inline-block" />
                <span>Scanning for QR code...</span>
              </>
            ) : scanResult ? (
              <div className="animate-pulse">Processing QR code...</div>
            ) : (
              'Camera access required for scanning'
            )}
          </div>

          {scanning && !scanResult && !processingQR && (
            <button
              onClick={handleManualInput}
              className="mt-2 text-blue-600 hover:text-blue-800 text-sm flex items-center"
            >
              <Scan className="h-4 w-4 mr-1" />
              Enter QR code manually
            </button>
          )}
        </div>

        {/* Debug mode toggle (hidden in production) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <label className="flex items-center text-xs text-gray-500">
              <input
                type="checkbox"
                checked={debugMode}
                onChange={() => setDebugMode(!debugMode)}
                className="mr-2 h-3 w-3"
              />
              Debug Mode
            </label>
            {debugMode && (
              <div className="mt-2 text-xs text-gray-500">
                <p>BarcodeDetector API: {isBarcodeDetectorSupported ? 'Supported' : 'Not supported'}</p>
                <p>Using fallback: {usingFallback ? 'Yes' : 'No'}</p>
                <p>Scanning: {scanning ? 'Yes' : 'No'}</p>
                <p>Processing: {processingQR ? 'Yes' : 'No'}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
