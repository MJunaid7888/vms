'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Users, Calendar, Settings, LogOut, Bell, Search, QrCode, BarChart2 } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { visitorAPI } from '@/lib/api';
import QRCodeDisplay from '@/components/QRCodeDisplay';
import ChangePasswordModal from '@/components/ChangePasswordModal';
import NotificationsPanel from '@/components/NotificationsPanel';

interface Visitor {
  _id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  purpose: string;
  hostEmployee: string;
  company?: string;
  checkInTime?: string;
  checkOutTime?: string;
  status: 'scheduled' | 'checked-in' | 'checked-out' | 'cancelled';
  visitDate: string;
  qrCode?: string;
  trainingCompleted?: boolean;
}

export default function AdminDashboard() {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [filteredVisitors, setFilteredVisitors] = useState<Visitor[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [selectedVisitorForQR, setSelectedVisitorForQR] = useState<string | null>(null);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const { user, token, logout } = useAuth();
  const router = useRouter();

  // Redirect if not logged in
  useEffect(() => {
    if (!user || !token) {
      router.push('/login');
    }
  }, [user, token, router]);

  // Fetch visitors
  useEffect(() => {
    const fetchVisitors = async () => {
      if (token) {
        try {
          setIsLoading(true);
          const data = await visitorAPI.getVisitorsByHost(token);
          setVisitors(data);
          setFilteredVisitors(data);
        } catch (err) {
          setError('Failed to load visitors');
          console.error(err);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchVisitors();
  }, [token]);

  // Filter visitors based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredVisitors(visitors);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = visitors.filter(visitor =>
        visitor.firstName.toLowerCase().includes(query) ||
        visitor.lastName.toLowerCase().includes(query) ||
        visitor.email.toLowerCase().includes(query) ||
        visitor.phoneNumber.toLowerCase().includes(query) ||
        visitor.purpose.toLowerCase().includes(query) ||
        visitor.company?.toLowerCase().includes(query)
      );
      setFilteredVisitors(filtered);
    }
  }, [searchQuery, visitors]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const handleCheckout = async (visitorId: string) => {
    if (!token) return;

    setCheckoutLoading(visitorId);
    setError('');
    setSuccess('');

    try {
      await visitorAPI.checkOutVisitor(visitorId, token);

      // Update the visitor in the local state
      setVisitors(prevVisitors =>
        prevVisitors.map(visitor =>
          visitor._id === visitorId
            ? {
                ...visitor,
                status: 'checked-out',
                checkOutTime: new Date().toISOString()
              }
            : visitor
        )
      );

      setSuccess('Visitor checked out successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check out visitor');
    } finally {
      setCheckoutLoading(null);
    }
  };

  if (!user || !token) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* QR Code Modal */}
      {selectedVisitorForQR && token && (
        <QRCodeDisplay
          visitorId={selectedVisitorForQR}
          token={token}
          onClose={() => setSelectedVisitorForQR(null)}
        />
      )}

      {/* Change Password Modal */}
      {showChangePasswordModal && token && (
        <ChangePasswordModal
          token={token}
          onClose={() => setShowChangePasswordModal(false)}
          onSuccess={() => {
            setShowChangePasswordModal(false);
            setSuccess('Password changed successfully');
          }}
        />
      )}

      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md hidden md:block">
        <div className="p-6">
          <Link href="/" className="text-2xl font-bold text-blue-900">Quick<span className="text-black">Pass</span></Link>
        </div>
        <div className="mt-6">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center w-full px-6 py-3 ${activeTab === 'dashboard' ? 'bg-blue-50 text-blue-900 border-r-4 border-blue-900' : 'text-gray-700'}`}
          >
            <Calendar className="mr-3 h-5 w-5" />
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('visitors')}
            className={`flex items-center w-full px-6 py-3 ${activeTab === 'visitors' ? 'bg-blue-50 text-blue-900 border-r-4 border-blue-900' : 'text-gray-700'}`}
          >
            <Users className="mr-3 h-5 w-5" />
            Visitors
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center w-full px-6 py-3 ${activeTab === 'settings' ? 'bg-blue-50 text-blue-900 border-r-4 border-blue-900' : 'text-gray-700'}`}
          >
            <Settings className="mr-3 h-5 w-5" />
            Settings
          </button>
          <Link
            href="/admin/analytics"
            className="flex items-center w-full px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-900"
          >
            <BarChart2 className="mr-3 h-5 w-5" />
            Analytics
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-6 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 mt-auto"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Navigation */}
        <header className="bg-white shadow-sm p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-800">Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search visitors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              </div>
              <div className="relative">
                <button
                  className="relative"
                  onClick={() => setShowNotifications(!showNotifications)}
                >
                  <Bell className="h-6 w-6 text-gray-600 hover:text-blue-700" />
                  <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
                </button>
                {showNotifications && (
                  <NotificationsPanel onClose={() => setShowNotifications(false)} />
                )}
              </div>
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                  {user.firstName ? user.firstName.charAt(0) : ''}
                </div>
                <span className="ml-2 text-sm font-medium">{user.firstName} {user.lastName}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 p-6 overflow-auto">
          {activeTab === 'dashboard' && (
            <div>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-gray-500 text-sm font-medium">Total Visitors Today</h3>
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold mt-2">{visitors.filter(v => v.checkInTime && new Date(v.checkInTime).toDateString() === new Date().toDateString()).length}</p>
                  <p className="text-green-500 text-sm mt-2">+12% from yesterday</p>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-gray-500 text-sm font-medium">Currently Checked In</h3>
                    <div className="bg-green-100 p-2 rounded-lg">
                      <Users className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold mt-2">{visitors.filter(v => v.status === 'checked-in').length}</p>
                  <p className="text-green-500 text-sm mt-2">Active visitors</p>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-gray-500 text-sm font-medium">Total This Month</h3>
                    <div className="bg-purple-100 p-2 rounded-lg">
                      <Calendar className="h-5 w-5 text-purple-600" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold mt-2">{visitors.length}</p>
                  <p className="text-green-500 text-sm mt-2">+5% from last month</p>
                </div>
              </div>

              {/* Recent Visitors */}
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-6 border-b">
                  <h2 className="text-lg font-semibold text-gray-800">Recent Visitors</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Visitor</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purpose</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check In</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {isLoading ? (
                        <tr>
                          <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">Loading visitors...</td>
                        </tr>
                      ) : error ? (
                        <tr>
                          <td colSpan={4} className="px-6 py-4 text-center text-sm text-red-500">{error}</td>
                        </tr>
                      ) : filteredVisitors.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">No visitors found</td>
                        </tr>
                      ) : (
                        filteredVisitors.slice(0, 5).map((visitor) => (
                          <tr key={visitor._id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                  {visitor.firstName.charAt(0)}{visitor.lastName.charAt(0)}
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{visitor.firstName} {visitor.lastName}</div>
                                  <div className="text-sm text-gray-500">{visitor.phoneNumber}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{visitor.purpose}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {visitor.checkInTime ? new Date(visitor.checkInTime).toLocaleString() : 'Not checked in'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                                ${visitor.status === 'checked-in' ? 'bg-green-100 text-green-800' :
                                  visitor.status === 'checked-out' ? 'bg-gray-100 text-gray-800' :
                                  visitor.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                                  'bg-red-100 text-red-800'}`}>
                                {visitor.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'visitors' && (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-6 border-b flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-800">All Visitors</h2>
                <Link href="/check-in" className="bg-blue-900 text-white px-4 py-2 rounded-lg text-sm inline-block hover:bg-blue-800 transition-colors">Add New Visitor</Link>
              </div>
              {error && (
                <div className="mx-6 mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}
              {success && (
                <div className="mx-6 mt-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                  {success}
                </div>
              )}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Visitor</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purpose</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check In</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check Out</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {isLoading ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">Loading visitors...</td>
                      </tr>
                    ) : error ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-4 text-center text-sm text-red-500">{error}</td>
                      </tr>
                    ) : filteredVisitors.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">No visitors found</td>
                      </tr>
                    ) : (
                      filteredVisitors.map((visitor) => (
                        <tr key={visitor._id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                {visitor.firstName.charAt(0)}{visitor.lastName.charAt(0)}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{visitor.firstName} {visitor.lastName}</div>
                                <div className="text-sm text-gray-500">{visitor.phoneNumber}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{visitor.purpose}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {visitor.checkInTime ? new Date(visitor.checkInTime).toLocaleString() : 'Not checked in'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {visitor.checkOutTime ? new Date(visitor.checkOutTime).toLocaleString() : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                              ${visitor.status === 'checked-in' ? 'bg-green-100 text-green-800' :
                                visitor.status === 'checked-out' ? 'bg-gray-100 text-gray-800' :
                                visitor.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                                'bg-red-100 text-red-800'}`}>
                              {visitor.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <Link
                              href={`/admin/visitors/${visitor._id}`}
                              className="text-blue-600 hover:text-blue-900 mr-3"
                            >
                              View Details
                            </Link>
                            <button
                              className="text-blue-600 hover:text-blue-900 mr-3"
                              onClick={() => setSelectedVisitorForQR(visitor._id)}
                            >
                              <QrCode className="inline-block h-4 w-4 mr-1" />
                              QR Code
                            </button>
                            {visitor.status === 'checked-in' && (
                              <button
                                className="text-red-600 hover:text-red-900 disabled:text-red-300"
                                onClick={() => handleCheckout(visitor._id)}
                                disabled={checkoutLoading === visitor._id}
                              >
                                {checkoutLoading === visitor._id ? 'Processing...' : 'Check Out'}
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-6">Account Settings</h2>
              <div className="max-w-md">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={`${user.firstName} ${user.lastName}`}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    disabled
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={user.email}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    disabled
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <input
                    type="text"
                    value={user.role}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    disabled
                  />
                </div>
                <button
                  onClick={() => setShowChangePasswordModal(true)}
                  className="bg-blue-900 text-white px-4 py-2 rounded-md hover:bg-blue-800 transition-colors"
                >
                  Change Password
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
