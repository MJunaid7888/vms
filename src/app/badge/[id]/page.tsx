'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import { visitorAPI, employeeAPI, Visitor, Employee } from '@/lib/api';
import VisitorBadge from '@/components/VisitorBadge';
import AppBar from '@/components/AppBar';
import { 
  ArrowLeft, 
  AlertCircle, 
  CheckCircle, 
  LogOut, 
  RefreshCw,
  Printer,
  Share
} from 'lucide-react';

export default function VisitorBadgePage() {
  const [visitor, setVisitor] = useState<Visitor | null>(null);
  const [host, setHost] = useState<Employee | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [checkingOut, setCheckingOut] = useState(false);
  
  const { id } = useParams();
  const { token } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchVisitor = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        setError('');
        
        const visitorId = Array.isArray(id) ? id[0] : id;
        const visitorData = await visitorAPI.getVisitor(visitorId, token || '');
        setVisitor(visitorData);
        
        // Fetch host information if available
        if (visitorData.hostEmployee) {
          try {
            const hostData = await employeeAPI.getEmployee(visitorData.hostEmployee, token || '');
            setHost(hostData);
          } catch (hostErr) {
            console.error('Error fetching host:', hostErr);
            // Don't set an error, just continue without host info
          }
        }
      } catch (err) {
        console.error('Error fetching visitor:', err);
        setError(err instanceof Error ? err.message : 'Failed to load visitor information');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchVisitor();
  }, [id, token]);

  const handleCheckOut = async () => {
    if (!visitor || !id) return;
    
    try {
      setCheckingOut(true);
      setError('');
      setSuccess('');
      
      const visitorId = Array.isArray(id) ? id[0] : id;
      await visitorAPI.checkOutVisitor(visitorId, token || '');
      
      setSuccess('You have been checked out successfully. Thank you for your visit!');
      
      // Update visitor status locally
      setVisitor(prev => prev ? {
        ...prev,
        status: 'checked-out',
        checkOutTime: new Date().toISOString()
      } : null);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check out');
    } finally {
      setCheckingOut(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Visitor Badge',
          text: `Visitor Badge for ${visitor?.firstName} ${visitor?.lastName}`,
          url: window.location.href
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      alert('Web Share API not supported in your browser');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AppBar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link 
            href="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Home
          </Link>
        </div>
        
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Visitor Badge</h1>
            
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg mb-6 flex items-start">
                <AlertCircle className="h-5 w-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium mb-1">Error</p>
                  <p>{error}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="mt-3 text-sm text-red-600 hover:text-red-800 flex items-center"
                  >
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Try Again
                  </button>
                </div>
              </div>
            ) : success ? (
              <div className="bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-lg mb-6 flex items-start">
                <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium mb-1">Success</p>
                  <p>{success}</p>
                  <div className="mt-4">
                    <Link
                      href="/"
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors inline-flex items-center"
                    >
                      Return to Home
                    </Link>
                  </div>
                </div>
              </div>
            ) : visitor ? (
              <div>
                <div className="mb-6">
                  <VisitorBadge 
                    visitor={visitor} 
                    hostName={host?.name}
                  />
                </div>
                
                <div className="flex flex-wrap gap-3 justify-center mt-8 print:hidden">
                  <button
                    onClick={handlePrint}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center shadow-sm"
                  >
                    <Printer className="h-4 w-4 mr-2" />
                    Print Badge
                  </button>
                  
                  {navigator.share && (
                    <button
                      onClick={handleShare}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center shadow-sm"
                    >
                      <Share className="h-4 w-4 mr-2" />
                      Share Badge
                    </button>
                  )}
                  
                  {visitor.status === 'checked-in' && (
                    <button
                      onClick={handleCheckOut}
                      disabled={checkingOut}
                      className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center shadow-sm disabled:bg-red-400"
                    >
                      {checkingOut ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <LogOut className="h-4 w-4 mr-2" />
                          Check Out
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">No visitor information found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
