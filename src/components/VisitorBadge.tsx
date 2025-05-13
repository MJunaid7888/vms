'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Visitor } from '@/lib/api';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Download, 
  Share, 
  Clock, 
  Calendar, 
  Building, 
  User, 
  Shield, 
  Info, 
  CheckCircle 
} from 'lucide-react';

interface VisitorBadgeProps {
  visitor: Visitor;
  hostName?: string;
}

export default function VisitorBadge({ visitor, hostName }: VisitorBadgeProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [qrValue, setQrValue] = useState('');
  const [showInfo, setShowInfo] = useState(false);

  // Update the current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Generate QR code data
  useEffect(() => {
    if (visitor) {
      const badgeData = {
        visitorId: visitor._id,
        name: `${visitor.firstName} ${visitor.lastName}`,
        status: visitor.status,
        timestamp: Date.now(),
        type: 'visitor-badge'
      };
      setQrValue(JSON.stringify(badgeData));
    }
  }, [visitor]);

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Format time for display
  const formatTime = (dateString?: string) => {
    const date = dateString ? new Date(dateString) : new Date();
    return date.toLocaleTimeString(undefined, { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Handle badge download
  const handleDownload = () => {
    const badgeElement = document.getElementById('visitor-badge');
    if (!badgeElement) return;

    // Use html2canvas or similar library to capture the badge as an image
    // This is a placeholder - in a real implementation, you would use a library
    alert('Download functionality would capture the badge as an image');
  };

  // Handle badge sharing
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Visitor Badge',
          text: `Visitor Badge for ${visitor.firstName} ${visitor.lastName}`,
          url: window.location.href
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      alert('Web Share API not supported in your browser');
    }
  };

  if (!visitor) return null;

  return (
    <div className="max-w-md mx-auto">
      {/* Badge Container */}
      <div 
        id="visitor-badge" 
        className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-lg"
      >
        {/* Badge Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Shield className="h-6 w-6 mr-2" />
              <h2 className="text-xl font-bold">VISITOR</h2>
            </div>
            <div className="text-sm opacity-90">
              ID: {visitor._id.substring(0, 8)}
            </div>
          </div>
        </div>

        {/* Badge Content */}
        <div className="p-4">
          {/* Visitor Info */}
          <div className="flex items-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-xl font-bold mr-3">
              {visitor.firstName.charAt(0)}{visitor.lastName.charAt(0)}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">{visitor.firstName} {visitor.lastName}</h3>
              <p className="text-gray-600">{visitor.company || 'Guest'}</p>
            </div>
          </div>

          {/* Status Badge */}
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mb-4 ${
            visitor.status === 'checked-in' 
              ? 'bg-green-100 text-green-800' 
              : visitor.status === 'scheduled' 
                ? 'bg-blue-100 text-blue-800'
                : 'bg-gray-100 text-gray-800'
          }`}>
            <CheckCircle className="h-4 w-4 mr-1" />
            {visitor.status === 'checked-in' ? 'Checked In' : 
             visitor.status === 'scheduled' ? 'Scheduled' : 
             visitor.status === 'checked-out' ? 'Checked Out' : 
             visitor.status}
          </div>

          {/* Visit Details */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center text-gray-700">
              <Calendar className="h-4 w-4 text-blue-600 mr-2" />
              <span className="font-medium mr-1">Date:</span> 
              {formatDate(visitor.visitDate)}
            </div>
            
            {visitor.checkInTime && (
              <div className="flex items-center text-gray-700">
                <Clock className="h-4 w-4 text-blue-600 mr-2" />
                <span className="font-medium mr-1">Check-in:</span> 
                {formatTime(visitor.checkInTime)}
              </div>
            )}
            
            <div className="flex items-center text-gray-700">
              <User className="h-4 w-4 text-blue-600 mr-2" />
              <span className="font-medium mr-1">Host:</span> 
              {hostName || visitor.hostEmployee || 'Not specified'}
            </div>
            
            <div className="flex items-center text-gray-700">
              <Building className="h-4 w-4 text-blue-600 mr-2" />
              <span className="font-medium mr-1">Purpose:</span> 
              {visitor.purpose || 'Visit'}
            </div>
          </div>

          {/* QR Code */}
          <div className="flex justify-center mb-4">
            <div className="bg-white p-2 border border-gray-200 rounded-lg">
              <QRCodeSVG
                value={qrValue}
                size={150}
                level="H"
                className="mx-auto"
              />
            </div>
          </div>

          {/* Current Time */}
          <div className="text-center text-gray-500 text-sm mb-4">
            Current time: {formatTime()}
          </div>

          {/* Info Button */}
          <button 
            onClick={() => setShowInfo(!showInfo)}
            className="w-full flex items-center justify-center text-blue-600 hover:text-blue-800 text-sm py-2 border-t border-gray-100"
          >
            <Info className="h-4 w-4 mr-1" />
            {showInfo ? 'Hide Information' : 'Show Information'}
          </button>

          {/* Additional Info */}
          {showInfo && (
            <div className="mt-3 p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
              <p className="mb-2">This digital badge serves as your identification while on premises.</p>
              <p>Please keep it accessible on your device. You may be asked to show this badge at security checkpoints.</p>
            </div>
          )}
        </div>

        {/* Badge Footer */}
        <div className="bg-gray-50 p-3 border-t border-gray-200">
          <div className="flex justify-between">
            <button 
              onClick={handleDownload}
              className="flex items-center text-gray-700 hover:text-blue-700 text-sm"
            >
              <Download className="h-4 w-4 mr-1" />
              Save Badge
            </button>
            
            {navigator.share && (
              <button 
                onClick={handleShare}
                className="flex items-center text-gray-700 hover:text-blue-700 text-sm"
              >
                <Share className="h-4 w-4 mr-1" />
                Share
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
