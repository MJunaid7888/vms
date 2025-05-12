'use client';

import { useState, useEffect } from 'react';
import { accessControlAPI } from '@/lib/api';
import { X, Download, Share } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface QRCodeDisplayProps {
  visitorId: string;
  token: string;
  onClose: () => void;
}

export default function QRCodeDisplay({ visitorId, token, onClose }: QRCodeDisplayProps) {
  const [qrData, setQrData] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQrCode = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Try to get QR code from API
        try {
          const data = await accessControlAPI.generateQrCode(visitorId, token);

          if (data && typeof data === 'object') {
            if ('qrCodeUrl' in data && typeof data.qrCodeUrl === 'string') {
              setQrData(data.qrCodeUrl);
              return;
            } else if ('qrCode' in data && typeof data.qrCode === 'string') {
              setQrData(data.qrCode);
              return;
            }
          } else if (typeof data === 'string') {
            setQrData(data);
            return;
          }
        } catch (apiError) {
          console.error('API QR code generation failed:', apiError);
          // Continue to fallback
        }

        // Fallback: Generate a QR code locally
        const qrData = `visitor:${visitorId}:${Date.now()}`;
        setQrData(qrData);
        console.log('Generated local QR code with data:', qrData);

      } catch (err) {
        console.error('Error in QR code generation:', err);
        setError(err instanceof Error ? err.message : 'Failed to generate QR code');

        // Final fallback
        const qrData = `visitor:${visitorId}:${Date.now()}`;
        setQrData(qrData);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQrCode();
  }, [visitorId, token]);

  const handleDownload = () => {
    if (!qrData) return;

    const canvas = document.getElementById('qr-code') as HTMLCanvasElement;
    if (!canvas) return;

    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = url;
    link.download = `visitor-qr-${visitorId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = async () => {
    if (!qrData) return;

    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({
          title: 'Visitor QR Code',
          text: 'Scan this QR code for visitor access',
          url: window.location.href
        });
      }
    } catch (err) {
      console.error('Error sharing QR code:', err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Visitor QR Code</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        ) : qrData ? (
          <div className="flex flex-col items-center">
            <div className="bg-white p-4 rounded-lg shadow-md mb-4">
              <QRCodeSVG
                id="qr-code"
                value={qrData}
                size={200}
                level="H"
                className="p-2"
              />
            </div>
            <p className="text-sm text-gray-600 mb-4 text-center">
              This QR code can be used for visitor check-in and access control.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={handleDownload}
                className="flex items-center bg-blue-900 text-white px-4 py-2 rounded-lg"
              >
                <Download className="mr-2 h-5 w-5" />
                Download
              </button>
              {typeof navigator !== 'undefined' && 'share' in navigator && (
                <button
                  onClick={handleShare}
                  className="flex items-center bg-green-600 text-white px-4 py-2 rounded-lg"
                >
                  <Share className="mr-2 h-5 w-5" />
                  Share
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600">No QR code available.</p>
          </div>
        )}
      </div>
    </div>
  );
}
