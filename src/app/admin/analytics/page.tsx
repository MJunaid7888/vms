'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import { analyticsAPI } from '@/lib/api';
import { ArrowLeft, BarChart2, PieChart, Users, Calendar, Clock, LogOut } from 'lucide-react';

interface VisitorMetrics {
  totalVisitors: number;
  checkedIn: number;
  checkedOut: number;
  scheduled: number;
  cancelled: number;
  visitorsByDay: {
    date: string;
    count: number;
  }[];
  visitorsByPurpose: {
    purpose: string;
    count: number;
  }[];
}

interface AccessMetrics {
  totalAccesses: number;
  successfulAccesses: number;
  deniedAccesses: number;
  accessesByDay: {
    date: string;
    count: number;
  }[];
}

interface TrainingMetrics {
  totalTrainings: number;
  completedTrainings: number;
  failedTrainings: number;
  averageScore: number;
  trainingsByDay: {
    date: string;
    count: number;
  }[];
}

interface SystemMetrics {
  totalUsers: number;
  activeUsers: number;
  totalEmployees: number;
}

export default function AnalyticsDashboard() {
  const [visitorMetrics, setVisitorMetrics] = useState<VisitorMetrics | null>(null);
  const [accessMetrics, setAccessMetrics] = useState<AccessMetrics | null>(null);
  const [trainingMetrics, setTrainingMetrics] = useState<TrainingMetrics | null>(null);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
    endDate: new Date().toISOString().split('T')[0], // today
  });
  
  const { user, token, logout } = useAuth();
  const router = useRouter();
  
  // Redirect if not logged in
  useEffect(() => {
    if (!user || !token) {
      router.push('/login');
    }
  }, [user, token, router]);
  
  // Fetch analytics data
  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!token) return;
      
      try {
        setIsLoading(true);
        setError('');
        
        // Fetch all metrics in parallel
        const [visitorData, accessData, trainingData, systemData] = await Promise.all([
          analyticsAPI.getVisitorMetrics(token, dateRange.startDate, dateRange.endDate),
          analyticsAPI.getAccessMetrics(token, dateRange.startDate, dateRange.endDate),
          analyticsAPI.getTrainingMetrics(token, dateRange.startDate, dateRange.endDate),
          analyticsAPI.getSystemMetrics(token),
        ]);
        
        setVisitorMetrics(visitorData);
        setAccessMetrics(accessData);
        setTrainingMetrics(trainingData);
        setSystemMetrics(systemData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch analytics data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAnalytics();
  }, [token, dateRange]);
  
  const handleDateRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value,
    }));
  };
  
  if (!user || !token) {
    return null; // Will redirect in useEffect
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <Link 
            href="/admin/dashboard"
            className="flex items-center text-blue-900 hover:text-blue-700"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Back to Dashboard
          </Link>
          
          <button 
            onClick={() => {
              logout();
              router.push('/');
            }}
            className="flex items-center text-red-600 hover:text-red-800"
          >
            <LogOut className="mr-2 h-5 w-5" />
            Logout
          </button>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Analytics Dashboard</h1>
        
        {/* Date Range Selector */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <h2 className="text-lg font-semibold mb-4">Date Range</h2>
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                name="startDate"
                value={dateRange.startDate}
                onChange={handleDateRangeChange}
                className="border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                name="endDate"
                value={dateRange.endDate}
                onChange={handleDateRangeChange}
                className="border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Visitor Metrics */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-4 bg-blue-900 text-white flex items-center">
                <Users className="h-6 w-6 mr-2" />
                <h2 className="text-lg font-semibold">Visitor Metrics</h2>
              </div>
              
              {visitorMetrics ? (
                <div className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500">Total Visitors</p>
                      <p className="text-2xl font-bold">{visitorMetrics.totalVisitors}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500">Checked In</p>
                      <p className="text-2xl font-bold">{visitorMetrics.checkedIn}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500">Checked Out</p>
                      <p className="text-2xl font-bold">{visitorMetrics.checkedOut}</p>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500">Scheduled</p>
                      <p className="text-2xl font-bold">{visitorMetrics.scheduled}</p>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <h3 className="text-md font-semibold mb-2">Visitors by Day</h3>
                    <div className="h-64 bg-gray-50 p-4 rounded-lg">
                      {/* This would be a chart in a real implementation */}
                      <div className="h-full flex items-center justify-center">
                        <BarChart2 className="h-12 w-12 text-gray-400" />
                        <p className="ml-2 text-gray-500">Chart visualization would go here</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-md font-semibold mb-2">Visitors by Purpose</h3>
                    <div className="h-64 bg-gray-50 p-4 rounded-lg">
                      {/* This would be a chart in a real implementation */}
                      <div className="h-full flex items-center justify-center">
                        <PieChart className="h-12 w-12 text-gray-400" />
                        <p className="ml-2 text-gray-500">Chart visualization would go here</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 text-center text-gray-500">
                  No visitor metrics available
                </div>
              )}
            </div>
            
            {/* Access Metrics */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-4 bg-green-800 text-white flex items-center">
                <Clock className="h-6 w-6 mr-2" />
                <h2 className="text-lg font-semibold">Access Metrics</h2>
              </div>
              
              {accessMetrics ? (
                <div className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500">Total Accesses</p>
                      <p className="text-2xl font-bold">{accessMetrics.totalAccesses}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500">Successful</p>
                      <p className="text-2xl font-bold">{accessMetrics.successfulAccesses}</p>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500">Denied</p>
                      <p className="text-2xl font-bold">{accessMetrics.deniedAccesses}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-md font-semibold mb-2">Accesses by Day</h3>
                    <div className="h-64 bg-gray-50 p-4 rounded-lg">
                      {/* This would be a chart in a real implementation */}
                      <div className="h-full flex items-center justify-center">
                        <BarChart2 className="h-12 w-12 text-gray-400" />
                        <p className="ml-2 text-gray-500">Chart visualization would go here</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 text-center text-gray-500">
                  No access metrics available
                </div>
              )}
            </div>
            
            {/* Training Metrics */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-4 bg-purple-800 text-white flex items-center">
                <Calendar className="h-6 w-6 mr-2" />
                <h2 className="text-lg font-semibold">Training Metrics</h2>
              </div>
              
              {trainingMetrics ? (
                <div className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500">Total Trainings</p>
                      <p className="text-2xl font-bold">{trainingMetrics.totalTrainings}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500">Completed</p>
                      <p className="text-2xl font-bold">{trainingMetrics.completedTrainings}</p>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500">Failed</p>
                      <p className="text-2xl font-bold">{trainingMetrics.failedTrainings}</p>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500">Average Score</p>
                      <p className="text-2xl font-bold">{trainingMetrics.averageScore}%</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 text-center text-gray-500">
                  No training metrics available
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
