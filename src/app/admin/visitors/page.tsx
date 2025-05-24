'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { visitorAPI, siteAPI, Visitor, Department, MeetingLocation } from '@/lib/api';
import { Users, Search, AlertCircle, CheckCircle, XCircle, Eye, FileText, Check, X, Download, Filter } from 'lucide-react';
import Link from 'next/link';

export default function VisitorsPage() {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [filteredVisitors, setFilteredVisitors] = useState<Visitor[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [checkingOut, setCheckingOut] = useState<string | null>(null);

  // New state for filtering and approval
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [approvingVisitor, setApprovingVisitor] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const { user, token } = useAuth();

  useEffect(() => {
    if (token) {
      fetchVisitors();
      fetchDepartments();
    }
  }, [token]);

  useEffect(() => {
    let filtered = visitors;

    // Apply search filter
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (visitor) =>
          visitor.firstName.toLowerCase().includes(query) ||
          visitor.lastName.toLowerCase().includes(query) ||
          visitor.email.toLowerCase().includes(query) ||
          (visitor.company && visitor.company.toLowerCase().includes(query)) ||
          (visitor.hostEmployee && visitor.hostEmployee.toLowerCase().includes(query)) ||
          (visitor.purpose && visitor.purpose.toLowerCase().includes(query))
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(visitor => visitor.status === statusFilter);
    }

    // Apply category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(visitor => visitor.category === categoryFilter);
    }

    // Apply department filter
    if (departmentFilter !== 'all') {
      filtered = filtered.filter(visitor => visitor.department === departmentFilter);
    }

    setFilteredVisitors(filtered);
  }, [searchQuery, visitors, statusFilter, categoryFilter, departmentFilter]);

  const fetchVisitors = async () => {
    if (!token) return;

    setIsLoading(true);
    setError(null);

    try {
      // For admin users, get all visitors; for others, get only their hosted visitors
      const visitorData = user?.role === 'admin' || user?.role === 'manager'
        ? await visitorAPI.getVisitHistory(token)
        : await visitorAPI.getVisitorsByHost(token);
      setVisitors(visitorData);
      setFilteredVisitors(visitorData);
    } catch (err) {
      console.error('Error fetching visitors:', err);
      setError(err instanceof Error ? err.message : 'Failed to load visitors');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDepartments = async () => {
    if (!token) return;

    try {
      const departmentData = await siteAPI.getAllDepartments(token);
      setDepartments(departmentData);
    } catch (err) {
      console.error('Error fetching departments:', err);
    }
  };

  const handleApproveVisitor = async (visitorId: string, approved: boolean) => {
    if (!token) return;

    setApprovingVisitor(visitorId);
    setError(null);
    setSuccessMessage(null);

    try {
      await visitorAPI.approveVisitor(visitorId, approved, token);

      // Update local state
      setVisitors(prev =>
        prev.map(visitor =>
          visitor._id === visitorId
            ? { ...visitor, status: approved ? 'approved' : 'cancelled' }
            : visitor
        )
      );

      setSuccessMessage(`Visitor ${approved ? 'approved' : 'rejected'} successfully`);
    } catch (err) {
      console.error('Error approving visitor:', err);
      setError(err instanceof Error ? err.message : 'Failed to update visitor status');
    } finally {
      setApprovingVisitor(null);
    }
  };

  const handleExportToExcel = async () => {
    if (!token) return;

    try {
      const filters = {
        status: statusFilter !== 'all' ? statusFilter : undefined,
        category: categoryFilter !== 'all' ? categoryFilter : undefined,
        department: departmentFilter !== 'all' ? departmentFilter : undefined,
      };

      const blob = await visitorAPI.exportToExcel(token, filters);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `visitor-report-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setSuccessMessage('Report exported successfully');
    } catch (err) {
      console.error('Error exporting report:', err);
      setError(err instanceof Error ? err.message : 'Failed to export report');
    }
  };

  const handleCheckOut = async (visitorId: string) => {
    if (!token) return;

    setCheckingOut(visitorId);
    setError(null);
    setSuccessMessage(null);

    try {
      await visitorAPI.checkOutVisitor(visitorId, token);

      // Update local state
      setVisitors(prev =>
        prev.map(visitor =>
          visitor._id === visitorId
            ? { ...visitor, status: 'checked-out', checkOutTime: new Date().toISOString() }
            : visitor
        )
      );

      setSuccessMessage('Visitor checked out successfully');
    } catch (err) {
      console.error('Error checking out visitor:', err);
      setError(err instanceof Error ? err.message : 'Failed to check out visitor');
    } finally {
      setCheckingOut(null);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-blue-100 text-blue-800';
      case 'checked-in':
        return 'bg-green-100 text-green-800';
      case 'checked-out':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <AlertCircle className="h-4 w-4" />;
      case 'approved':
        return <Users className="h-4 w-4" />;
      case 'checked-in':
        return <CheckCircle className="h-4 w-4" />;
      case 'checked-out':
        return <XCircle className="h-4 w-4" />;
      case 'cancelled':
        return <X className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (dateString?: string) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!user) {
    return null; // AppBar will handle unauthorized access
  }

  return (
    <>
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Visitors</h1>
          <p className="mt-2 text-gray-600">
            Manage all visitors and their check-in/check-out status
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleExportToExcel}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Download className="mr-2 h-4 w-4" aria-hidden="true" />
            Export to Excel
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Filter className="mr-2 h-4 w-4" aria-hidden="true" />
            Filters
          </button>
          <Link
            href="/admin/visitors/add"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Users className="mr-2 h-4 w-4" aria-hidden="true" />
            Add New Visitor
          </Link>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="mb-6 bg-white shadow-md rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="checked-in">Checked In</option>
                <option value="checked-out">Checked Out</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Categories</option>
                <option value="VISITOR">Visitor</option>
                <option value="CONTRACTOR">Contractor</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept._id} value={dept.name}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

        {error && (
          <div
            className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6 flex items-start"
            role="alert"
            aria-labelledby="error-heading"
          >
            <AlertCircle className="h-5 w-5 mr-2 mt-0.5" aria-hidden="true" />
            <div>
              <p id="error-heading" className="font-medium">Error</p>
              <p>{error}</p>
            </div>
          </div>
        )}

        {successMessage && (
          <div
            className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded mb-6 flex items-start"
            role="status"
            aria-labelledby="success-heading"
          >
            <CheckCircle className="h-5 w-5 mr-2 mt-0.5" aria-hidden="true" />
            <div>
              <p id="success-heading" className="font-medium">Success</p>
              <p>{successMessage}</p>
            </div>
          </div>
        )}

        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-xl font-semibold text-gray-900">All Visitors</h2>
              <div className="mt-4 sm:mt-0 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  type="text"
                  placeholder="Search visitors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full sm:w-64 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  aria-label="Search visitors"
                />
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center p-8" role="status" aria-live="polite">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500" aria-hidden="true"></div>
              <span className="ml-2 text-gray-600">Loading visitors...</span>
              <span className="sr-only">Loading visitors, please wait</span>
            </div>
          ) : filteredVisitors.length === 0 ? (
            <div className="p-8 text-center" role="status">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" aria-hidden="true" />
              <h3 className="text-lg font-medium text-gray-900">No visitors found</h3>
              <p className="text-gray-500 mt-1">
                {searchQuery ? 'Try adjusting your search criteria.' : 'There are no visitors in the system yet.'}
              </p>
            </div>
          ) : (
            <>
              {/* Desktop view */}
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200" aria-label="Visitors list">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Visitor
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Host & Department
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Visit Details
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredVisitors.map((visitor) => (
                      <tr key={visitor._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center" aria-hidden="true">
                              <span className="text-blue-600 font-medium">
                                {visitor.firstName.charAt(0)}{visitor.lastName.charAt(0)}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {visitor.firstName} {visitor.lastName}
                              </div>
                              <div className="text-sm text-gray-500">{visitor.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div>
                            <div className="font-medium text-gray-900">{visitor.hostEmployee || '—'}</div>
                            <div className="text-gray-500">{visitor.department || '—'}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div>
                            <div className="font-medium text-gray-900">
                              {formatDate(visitor.visitStartDate)} - {formatDate(visitor.visitEndDate)}
                            </div>
                            <div className="text-gray-500">{visitor.meetingLocation || '—'}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {visitor.category || 'Not specified'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(
                              visitor.status
                            )}`}
                          >
                            <span aria-hidden="true">{getStatusIcon(visitor.status)}</span>
                            <span className="ml-1 capitalize">{visitor.status}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <Link
                              href={`/admin/visitors/${visitor._id}`}
                              className="text-blue-600 hover:text-blue-900"
                              aria-label={`View details for ${visitor.firstName} ${visitor.lastName}`}
                            >
                              <Eye className="h-4 w-4" aria-hidden="true" />
                            </Link>
                            <Link
                              href={`/admin/documents?visitorId=${visitor._id}`}
                              className="text-green-600 hover:text-green-900"
                              aria-label={`View documents for ${visitor.firstName} ${visitor.lastName}`}
                            >
                              <FileText className="h-4 w-4" aria-hidden="true" />
                            </Link>

                            {/* Approval buttons for pending visitors */}
                            {visitor.status === 'pending' && (user?.role === 'admin' || user?.role === 'manager') && (
                              <>
                                <button
                                  onClick={() => handleApproveVisitor(visitor._id, true)}
                                  disabled={approvingVisitor === visitor._id}
                                  className="text-green-600 hover:text-green-900 disabled:text-green-300 disabled:cursor-not-allowed"
                                  aria-label={`Approve ${visitor.firstName} ${visitor.lastName}`}
                                >
                                  {approvingVisitor === visitor._id ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-green-600" aria-hidden="true"></div>
                                  ) : (
                                    <Check className="h-4 w-4" aria-hidden="true" />
                                  )}
                                </button>
                                <button
                                  onClick={() => handleApproveVisitor(visitor._id, false)}
                                  disabled={approvingVisitor === visitor._id}
                                  className="text-red-600 hover:text-red-900 disabled:text-red-300 disabled:cursor-not-allowed"
                                  aria-label={`Reject ${visitor.firstName} ${visitor.lastName}`}
                                >
                                  <X className="h-4 w-4" aria-hidden="true" />
                                </button>
                              </>
                            )}

                            {/* Check out button for checked-in visitors */}
                            {visitor.status === 'checked-in' && (
                              <button
                                onClick={() => handleCheckOut(visitor._id)}
                                disabled={checkingOut === visitor._id}
                                className="text-red-600 hover:text-red-900 disabled:text-red-300 disabled:cursor-not-allowed"
                                aria-label={`Check out ${visitor.firstName} ${visitor.lastName}`}
                              >
                                {checkingOut === visitor._id ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-red-600" aria-hidden="true"></div>
                                ) : (
                                  <XCircle className="h-4 w-4" aria-hidden="true" />
                                )}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile view */}
              <div className="md:hidden">
                <ul className="divide-y divide-gray-200" aria-label="Visitors list">
                  {filteredVisitors.map((visitor) => (
                    <li key={visitor._id} className="p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center" aria-hidden="true">
                            <span className="text-blue-600 font-medium">
                              {visitor.firstName.charAt(0)}{visitor.lastName.charAt(0)}
                            </span>
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {visitor.firstName} {visitor.lastName}
                            </div>
                            <div className="text-xs text-gray-500">{visitor.email}</div>
                          </div>
                        </div>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(
                            visitor.status
                          )}`}
                        >
                          <span aria-hidden="true">{getStatusIcon(visitor.status)}</span>
                          <span className="ml-1 capitalize">{visitor.status}</span>
                        </span>
                      </div>

                      <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="font-medium text-gray-500">Host:</span>
                          <div className="mt-1 text-gray-900">{visitor.hostEmployee || '—'}</div>
                        </div>

                        <div>
                          <span className="font-medium text-gray-500">Department:</span>
                          <div className="mt-1 text-gray-900">{visitor.department || '—'}</div>
                        </div>

                        <div>
                          <span className="font-medium text-gray-500">Category:</span>
                          <div className="mt-1 text-gray-900">{visitor.category || 'Not specified'}</div>
                        </div>

                        <div>
                          <span className="font-medium text-gray-500">Meeting Location:</span>
                          <div className="mt-1 text-gray-900">{visitor.meetingLocation || '—'}</div>
                        </div>

                        <div className="col-span-2">
                          <span className="font-medium text-gray-500">Visit Period:</span>
                          <div className="mt-1 text-gray-900">
                            {formatDate(visitor.visitStartDate)} - {formatDate(visitor.visitEndDate)}
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 flex justify-between items-center">
                        <div className="flex space-x-3">
                          <Link
                            href={`/admin/visitors/${visitor._id}`}
                            className="text-blue-600 hover:text-blue-900 flex items-center"
                            aria-label={`View details for ${visitor.firstName} ${visitor.lastName}`}
                          >
                            <Eye className="h-4 w-4 mr-1" aria-hidden="true" />
                            <span>Details</span>
                          </Link>
                          <Link
                            href={`/admin/documents?visitorId=${visitor._id}`}
                            className="text-green-600 hover:text-green-900 flex items-center"
                            aria-label={`View documents for ${visitor.firstName} ${visitor.lastName}`}
                          >
                            <FileText className="h-4 w-4 mr-1" aria-hidden="true" />
                            <span>Docs</span>
                          </Link>
                        </div>

                        <div className="flex space-x-2">
                          {/* Approval buttons for pending visitors */}
                          {visitor.status === 'pending' && (user?.role === 'admin' || user?.role === 'manager') && (
                            <>
                              <button
                                onClick={() => handleApproveVisitor(visitor._id, true)}
                                disabled={approvingVisitor === visitor._id}
                                className="text-green-600 hover:text-green-900 disabled:text-green-300 disabled:cursor-not-allowed flex items-center"
                                aria-label={`Approve ${visitor.firstName} ${visitor.lastName}`}
                              >
                                {approvingVisitor === visitor._id ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-green-600" aria-hidden="true"></div>
                                ) : (
                                  <>
                                    <Check className="h-4 w-4 mr-1" aria-hidden="true" />
                                    <span>Approve</span>
                                  </>
                                )}
                              </button>
                              <button
                                onClick={() => handleApproveVisitor(visitor._id, false)}
                                disabled={approvingVisitor === visitor._id}
                                className="text-red-600 hover:text-red-900 disabled:text-red-300 disabled:cursor-not-allowed flex items-center"
                                aria-label={`Reject ${visitor.firstName} ${visitor.lastName}`}
                              >
                                <X className="h-4 w-4 mr-1" aria-hidden="true" />
                                <span>Reject</span>
                              </button>
                            </>
                          )}

                          {/* Check out button for checked-in visitors */}
                          {visitor.status === 'checked-in' && (
                            <button
                              onClick={() => handleCheckOut(visitor._id)}
                              disabled={checkingOut === visitor._id}
                              className="text-red-600 hover:text-red-900 disabled:text-red-300 disabled:cursor-not-allowed flex items-center"
                              aria-label={`Check out ${visitor.firstName} ${visitor.lastName}`}
                            >
                              {checkingOut === visitor._id ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-red-600 mr-1" aria-hidden="true"></div>
                                  <span>Processing...</span>
                                </>
                              ) : (
                                <>
                                  <XCircle className="h-4 w-4 mr-1" aria-hidden="true" />
                                  <span>Check Out</span>
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>
    </>
  );
}
