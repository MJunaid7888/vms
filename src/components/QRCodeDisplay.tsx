'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { accessControlAPI } from '@/lib/api';

interface QRCodeDisplayProps {
  visitorId: string;
  token: string;
  onClose: () => void;
}

export default function QRCodeDisplay({ visitorId, token, onClose }: QRCodeDisplayProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQrCode = async () => {
      try {
        setIsLoading(true);
        const data = await accessControlAPI.generateQrCode(visitorId, token);

        // Handle different API response formats
        if (data && typeof data === 'object') {
          if ('qrCodeUrl' in data && typeof data.qrCodeUrl === 'string') {
            setQrCodeUrl(data.qrCodeUrl);
          } else if ('qrCode' in data && typeof data.qrCode === 'string') {
            setQrCodeUrl(data.qrCode);
          } else {
            // Fallback to a placeholder QR code for demo purposes
            setQrCodeUrl('https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=' + encodeURIComponent(`visitor:${visitorId}`));
          }
        } else if (typeof data === 'string') {
          // If the API returns the QR code URL directly as a string
          setQrCodeUrl(data);
        } else {
          // Fallback to a placeholder QR code for demo purposes
          setQrCodeUrl('https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=' + encodeURIComponent(`visitor:${visitorId}`));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to generate QR code');
        // Fallback to a placeholder QR code for demo purposes
        setQrCodeUrl('https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=' + encodeURIComponent(`visitor:${visitorId}`));
      } finally {
        setIsLoading(false);
      }
    };

    fetchQrCode();
  }, [visitorId, token]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Visitor QR Code</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            &times;
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
        ) : qrCodeUrl ? (
          <div className="flex flex-col items-center">
            <div className="relative w-64 h-64 mb-4">
              <Image
                src={qrCodeUrl}
                alt="Visitor QR Code"
                fill
                style={{ objectFit: 'contain' }}
              />
            </div>
            <p className="text-sm text-gray-600 text-center mb-4">
              This QR code can be used for visitor check-in and check-out.
            </p>
            <button
              onClick={() => {
                // Download QR code
                const link = document.createElement('a');
                link.href = qrCodeUrl;
                link.download = `visitor-qr-${visitorId}.png`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
              className="bg-blue-900 text-white px-4 py-2 rounded-lg"
            >
              Download QR Code
            </button>
          </div>
        ) : (
          <div className="text-center py-8">
            No QR code available
          </div>
        )}
      </div>
    </div>
  );
}
