'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/AuthContext';
import VisitHistoryTable from '@/components/VisitHistoryTable';
import { Users, Calendar, Clock, BarChart2, ArrowUp, FileText, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { visitorAPI, analyticsAPI } from '@/lib/api';
import AnalyticsDashboard from '@/components/charts/AnalyticsDashboard';

export default function AdminDashboard() {
  const [startDate] = useState<string>(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [endDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [visitorStats, setVisitorStats] = useState({
    total: 0,
    checkedIn: 0,
    checkedOut: 0,
    scheduled: 0,
    pending: 0,
    approved: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const { user, token } = useAuth();

    const fetchVisitorStats = useCallback(async () => {
    if (!token) return;

    setIsLoading(true);
    try {
      // Try to get visitor stats from analytics API first
      try {
        const stats = await analyticsAPI.getVisitorStats(token);
        // Transform the stats to match our expected format
        setVisitorStats({
          total: stats.total,
          checkedIn: stats.checkedIn,
          checkedOut: stats.checkedOut,
          scheduled: stats.scheduled,
          pending: stats.pending || 0,
          approved: stats.approved || 0
        });
        return;
      } catch (analyticsError) {
        console.error('Error fetching visitor stats from analytics API:', analyticsError);
      }

      // Fallback: Try to calculate stats from visitor data
      try {
        const visitors = await visitorAPI.getVisitorsByHost(token);
        if (Array.isArray(visitors) && visitors.length > 0) {
          // Calculate stats from the visitor data
          const total = visitors.length;
          const pending = visitors.filter(v => v.status === 'pending').length;
          const approved = visitors.filter(v => v.status === 'approved').length;
          const checkedIn = visitors.filter(v => v.status === 'checked-in').length;
          const checkedOut = visitors.filter(v => v.status === 'checked-out').length;
          const scheduled = approved; // For backward compatibility

          setVisitorStats({ total, checkedIn, checkedOut, scheduled });
          return;
        }
      } catch (visitorError) {
        console.error('Error fetching visitor data for stats:', visitorError);
      }

      // If all API calls fail, show zero stats
      console.log('All API calls failed, showing empty stats');
      setVisitorStats({
        total: 0,
        checkedIn: 0,
        checkedOut: 0,
        scheduled: 0,
        pending: 0,
        approved: 0
      });

    } catch (error) {
      console.error('Error in visitor stats component:', error);

      // Show zero stats on error
      setVisitorStats({
        total: 0,
        checkedIn: 0,
        checkedOut: 0,
        scheduled: 0,
        pending: 0,
        approved: 0
      });
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchVisitorStats();
    }
  }, [token, fetchVisitorStats]);


  if (!user) {
    return null; // AppBar will handle unauthorized access
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Welcome back, {user.firstName}. Here&apos;s an overview of your visitor management system.
        </p>
      </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-gray-500 text-sm font-medium">Total Visitors</h3>
              <div className="bg-blue-100 p-2 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" aria-hidden="true" />
              </div>
            </div>
            <p className="text-3xl font-bold mt-2">{isLoading ? '...' : visitorStats.total}</p>
            <p className="text-green-500 text-sm mt-2 flex items-center">
              <ArrowUp className="h-3 w-3 mr-1" aria-hidden="true" />
              <span>12% from last month</span>
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-gray-500 text-sm font-medium">Currently Checked In</h3>
              <div className="bg-green-100 p-2 rounded-lg">
                <Clock className="h-5 w-5 text-green-600" aria-hidden="true" />
              </div>
            </div>
            <p className="text-3xl font-bold mt-2">{isLoading ? '...' : visitorStats.checkedIn}</p>
            <p className="text-gray-500 text-sm mt-2">Active visitors</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-gray-500 text-sm font-medium">Scheduled</h3>
              <div className="bg-blue-100 p-2 rounded-lg">
                <Calendar className="h-5 w-5 text-blue-600" aria-hidden="true" />
              </div>
            </div>
            <p className="text-3xl font-bold mt-2">{isLoading ? '...' : visitorStats.scheduled}</p>
            <p className="text-gray-500 text-sm mt-2">Upcoming visits</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-gray-500 text-sm font-medium">Checked Out</h3>
              <div className="bg-purple-100 p-2 rounded-lg">
                <Clock className="h-5 w-5 text-purple-600" aria-hidden="true" />
              </div>
            </div>
            <p className="text-3xl font-bold mt-2">{isLoading ? '...' : visitorStats.checkedOut}</p>
            <p className="text-gray-500 text-sm mt-2">Completed visits</p>
          </div>
        </div>

        {/* Quick Access Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Link href="/admin/visitors" className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center mb-4">
              <div className="bg-blue-100 p-2 rounded-lg mr-3">
                <Users className="h-5 w-5 text-blue-600" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">Manage Visitors</h3>
            </div>
            <p className="text-gray-600">View, edit, and manage all visitor records and check-ins.</p>
          </Link>

          <Link href="/admin/documents" className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center mb-4">
              <div className="bg-green-100 p-2 rounded-lg mr-3">
                <FileText className="h-5 w-5 text-green-600" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">Document Management</h3>
            </div>
            <p className="text-gray-600">Upload and manage visitor documents and certifications.</p>
          </Link>

          <Link href="/admin/training" className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center mb-4">
              <div className="bg-purple-100 p-2 rounded-lg mr-3">
                <BookOpen className="h-5 w-5 text-purple-600" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">Training</h3>
            </div>
            <p className="text-gray-600">Manage training modules and visitor enrollments.</p>
          </Link>

          <Link href="/admin/users" className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center mb-4">
              <div className="bg-yellow-100 p-2 rounded-lg mr-3">
                <Users className="h-5 w-5 text-yellow-600" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">User Management</h3>
            </div>
            <p className="text-gray-600">Manage system users, roles, and permissions.</p>
          </Link>
        </div>

        {/* Analytics Dashboard */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex flex-col md:flex-row items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Analytics Dashboard</h2>
              <p className="text-gray-600 mt-1">Real-time analytics and reports for visitors and access control</p>
            </div>
            <Link
              href="/admin/analytics"
              className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <BarChart2 className="h-4 w-4 mr-2" />
              Full Analytics
            </Link>
          </div>

          {/* Embedded Analytics Dashboard */}
          <AnalyticsDashboard refreshInterval={300000} />
        </div>

        {/* Recent Visit History */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Recent Visit History</h2>
            <p className="text-gray-600 mt-1">View recent visitor activity</p>
          </div>

          <div className="p-6">
            <VisitHistoryTable startDate={startDate} endDate={endDate} />
          </div>
        </div>
    </>
  );
}
