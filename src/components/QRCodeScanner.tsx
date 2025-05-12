'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { accessControlAPI } from '@/lib/api';

interface QRCodeScannerProps {
  token: string;
  onClose: () => void;
}

export default function QRCodeScanner({ token, onClose }: QRCodeScannerProps) {
  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const router = useRouter();

  useEffect(() => {
    let videoElement: HTMLVideoElement | null = null;
    let canvasElement: HTMLCanvasElement | null = null;
    let animationFrameId: number | null = null;

    const startScanner = async () => {
      try {
        setScanning(true);

        // Get video stream
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });
        setStream(mediaStream);

        // Set up video element
        videoElement = document.getElementById('qr-video') as HTMLVideoElement;
        if (!videoElement) return;

        videoElement.srcObject = mediaStream;
        videoElement.setAttribute('playsinline', 'true'); // required for iOS
        videoElement.play();

        // Set up canvas for capturing frames
        canvasElement = document.getElementById('qr-canvas') as HTMLCanvasElement;
        if (!canvasElement) return;

        const canvas = canvasElement.getContext('2d');
        if (!canvas) return;

        // Function to scan a frame
        const scanFrame = () => {
          if (videoElement && videoElement.readyState === videoElement.HAVE_ENOUGH_DATA) {
            // Draw video frame to canvas
            canvasElement!.height = videoElement.videoHeight;
            canvasElement!.width = videoElement.videoWidth;
            canvas.drawImage(videoElement, 0, 0, canvasElement!.width, canvasElement!.height);

            // Get image data (would be used with a QR code library in a real implementation)
            // const imageData = canvas.getImageData(0, 0, canvasElement!.width, canvasElement!.height);

            // Here you would normally use a QR code library to decode the image
            // For this example, we'll simulate finding a QR code after a few seconds

            // In a real implementation, you would use a library like jsQR:
            // const code = jsQR(imageData.data, imageData.width, imageData.height);
            // if (code) {
            //   handleQRCode(code.data);
            // }
          }

          // Continue scanning
          animationFrameId = requestAnimationFrame(scanFrame);
        };

        // Start scanning
        scanFrame();

        // Simulate finding a QR code after 3 seconds (for demo purposes)
        // In a real implementation, this would be replaced with actual QR code detection
        // using a library like jsQR or a dedicated QR code scanning library
        setTimeout(() => {
          handleQRCode('visitor-123456');
        }, 3000);

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

      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleQRCode = async (qrData: string) => {
    try {
      // Stop scanning
      setScanning(false);

      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      // Validate QR code with backend
      const response = await accessControlAPI.validateQrCode(qrData, token);

      // If valid, redirect to visitor check-in page
      if (response && typeof response === 'object' && 'valid' in response && 'visitorId' in response) {
        if (response.valid && response.visitorId) {
          router.push(`/check-in/${response.visitorId}`);
          onClose();
        } else {
          setError('Invalid QR code');
        }
      } else {
        setError('Invalid response from server');
      }
    } catch (err) {
      setError('Failed to validate QR code: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Scan QR Code</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            &times;
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="relative">
          <video
            id="qr-video"
            className="w-full h-64 bg-black rounded-lg object-cover"
          ></video>
          <canvas
            id="qr-canvas"
            className="absolute top-0 left-0 w-full h-full hidden"
          ></canvas>

          {scanning && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-48 h-48 border-4 border-white rounded-lg"></div>
              <div className="absolute bottom-4 left-0 right-0 text-center text-white">
                Position QR code within the frame
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 text-center text-sm text-gray-600">
          {scanning ? 'Scanning for QR code...' : 'Camera access required for scanning'}
        </div>
      </div>
    </div>
  );
}
