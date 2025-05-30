'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import AppBar from '@/components/AppBar';
import { visitorAPI, VisitorData, employeeAPI, siteAPI, Employee, Department, MeetingLocation } from '@/lib/api';
import { ArrowLeft, Calendar, Clock, User, Building, AlertCircle, CheckCircle, MapPin } from 'lucide-react';
import Link from 'next/link';

export default function AddVisitorPage() {
  const [formData, setFormData] = useState<Partial<VisitorData>>({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    company: '',
    siteLocation: '',
    purpose: '',
    hostEmployeeId: '',
    department: '',
    meetingLocation: '',
    visitStartDate: new Date().toISOString().slice(0, 16),
    visitEndDate: new Date().toISOString().slice(0, 16),
    category: 'VISITOR',
  });

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [meetingLocations, setMeetingLocations] = useState<MeetingLocation[]>([]);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(false);
  const [isLoadingDepartments, setIsLoadingDepartments] = useState(false);
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { user, token } = useAuth();
  const router = useRouter();

  // Fetch data when component mounts
  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;

      // Fetch employees
      setIsLoadingEmployees(true);
      try {
        const employeeData = await employeeAPI.getEmployees(token);
        setEmployees(employeeData);
      } catch (err) {
        console.error('Error fetching employees:', err);
      } finally {
        setIsLoadingEmployees(false);
      }

      // Fetch departments
      setIsLoadingDepartments(true);
      try {
        const departmentData = await siteAPI.getAllDepartments(token);
        setDepartments(departmentData);
      } catch (err) {
        console.error('Error fetching departments:', err);
      } finally {
        setIsLoadingDepartments(false);
      }

      // Fetch meeting locations
      setIsLoadingLocations(true);
      try {
        const locationData = await siteAPI.getAllMeetingLocations(token);
        setMeetingLocations(locationData);
      } catch (err) {
        console.error('Error fetching meeting locations:', err);
      } finally {
        setIsLoadingLocations(false);
      }
    };

    fetchData();
  }, [token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      setError('You must be logged in to add a visitor');
      return;
    }

    // Validate form
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.purpose ||
        !formData.hostEmployeeId || !formData.department || !formData.meetingLocation ||
        !formData.visitStartDate || !formData.visitEndDate || !formData.category) {
      setError('Please fill in all required fields');
      return;
    }

    // Validate contractor-specific fields
    if (formData.category === 'CONTRACTOR') {
      if (!formData.company || !formData.siteLocation) {
        setError('Company and site location are required for contractors');
        return;
      }
    }

    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const visitorData = {
        ...formData,
        status: 'pending',
      } as VisitorData;

      const result = await visitorAPI.scheduleVisit(visitorData, token);

      setSuccessMessage('Visitor added successfully and is pending approval');
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        company: '',
        siteLocation: '',
        purpose: '',
        hostEmployeeId: '',
        department: '',
        meetingLocation: '',
        visitStartDate: new Date().toISOString().slice(0, 16),
        visitEndDate: new Date().toISOString().slice(0, 16),
        category: 'VISITOR',
      });

      // Redirect to the visitor details page after a short delay
      setTimeout(() => {
        router.push(`/admin/visitors/${result._id}`);
      }, 1500);
    } catch (err) {
      console.error('Error adding visitor:', err);
      setError(err instanceof Error ? err.message : 'Failed to add visitor');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return null; // AppBar will handle unauthorized access
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppBar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-20">
        <div className="mb-6">
          <Link href="/admin/visitors" className="inline-flex items-center text-blue-600 hover:text-blue-800">
            <ArrowLeft className="h-4 w-4 mr-1" aria-hidden="true" />
            Back to Visitors
          </Link>
        </div>

        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Add New Visitor</h1>
            <p className="mt-1 text-gray-600">Schedule a new visitor appointment</p>
          </div>

          {error && (
            <div
              className="m-6 bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded flex items-start"
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
              className="m-6 bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded flex items-start"
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

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                  First Name <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  </div>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    className="pl-10 block w-full shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300 rounded-md"
                    aria-required="true"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  </div>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    className="pl-10 block w-full shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300 rounded-md"
                    aria-required="true"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="block w-full shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300 rounded-md"
                    aria-required="true"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                  Phone <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <input
                    type="tel"
                    id="phoneNumber"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    required
                    className="block w-full shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300 rounded-md"
                    aria-required="true"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                  Visitor Category <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  </div>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    className="pl-10 block w-full shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300 rounded-md"
                    aria-required="true"
                  >
                    <option value="VISITOR">Visitor</option>
                    <option value="CONTRACTOR">Contractor</option>
                  </select>
                </div>
              </div>

              {/* Conditional fields for contractors */}
              {formData.category === 'CONTRACTOR' && (
                <>
                  <div>
                    <label htmlFor="company" className="block text-sm font-medium text-gray-700">
                      Company <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Building className="h-5 w-5 text-gray-400" aria-hidden="true" />
                      </div>
                      <input
                        type="text"
                        id="company"
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                        required={formData.category === 'CONTRACTOR'}
                        className="pl-10 block w-full shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="siteLocation" className="block text-sm font-medium text-gray-700">
                      Site Location <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MapPin className="h-5 w-5 text-gray-400" aria-hidden="true" />
                      </div>
                      <input
                        type="text"
                        id="siteLocation"
                        name="siteLocation"
                        value={formData.siteLocation}
                        onChange={handleChange}
                        required={formData.category === 'CONTRACTOR'}
                        className="pl-10 block w-full shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label htmlFor="hostEmployeeId" className="block text-sm font-medium text-gray-700">
                  Host Employee <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  </div>
                  <select
                    id="hostEmployeeId"
                    name="hostEmployeeId"
                    value={formData.hostEmployeeId}
                    onChange={handleChange}
                    required
                    className="pl-10 block w-full shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300 rounded-md"
                    aria-required="true"
                    disabled={isLoadingEmployees}
                  >
                    <option value="">Select a host employee</option>
                    {employees.map((employee) => (
                      <option key={employee.id} value={employee.id}>
                        {employee.name} - {employee.department}
                      </option>
                    ))}
                  </select>
                  {isLoadingEmployees && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <div className="animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent"></div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="department" className="block text-sm font-medium text-gray-700">
                  Department <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  </div>
                  <select
                    id="department"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    required
                    className="pl-10 block w-full shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300 rounded-md"
                    aria-required="true"
                    disabled={isLoadingDepartments}
                  >
                    <option value="">Select a department</option>
                    {departments.map((dept) => (
                      <option key={dept._id} value={dept.name}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                  {isLoadingDepartments && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <div className="animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent"></div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="meetingLocation" className="block text-sm font-medium text-gray-700">
                  Meeting Location <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  </div>
                  <select
                    id="meetingLocation"
                    name="meetingLocation"
                    value={formData.meetingLocation}
                    onChange={handleChange}
                    required
                    className="pl-10 block w-full shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300 rounded-md"
                    aria-required="true"
                    disabled={isLoadingLocations}
                  >
                    <option value="">Select a meeting location</option>
                    {meetingLocations.map((location) => (
                      <option key={location._id} value={location.name}>
                        {location.name}
                      </option>
                    ))}
                  </select>
                  {isLoadingLocations && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <div className="animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent"></div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="visitStartDate" className="block text-sm font-medium text-gray-700">
                  Visit Start Date & Time <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Clock className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  </div>
                  <input
                    type="datetime-local"
                    id="visitStartDate"
                    name="visitStartDate"
                    value={formData.visitStartDate}
                    onChange={handleChange}
                    required
                    className="pl-10 block w-full shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300 rounded-md"
                    aria-required="true"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="visitEndDate" className="block text-sm font-medium text-gray-700">
                  Visit End Date & Time <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Clock className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  </div>
                  <input
                    type="datetime-local"
                    id="visitEndDate"
                    name="visitEndDate"
                    value={formData.visitEndDate}
                    onChange={handleChange}
                    required
                    className="pl-10 block w-full shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300 rounded-md"
                    aria-required="true"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label htmlFor="purpose" className="block text-sm font-medium text-gray-700">
                  Purpose of Visit <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <textarea
                    id="purpose"
                    name="purpose"
                    rows={3}
                    value={formData.purpose}
                    onChange={handleChange}
                    required
                    className="block w-full shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300 rounded-md"
                    aria-required="true"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Link
                href="/admin/visitors"
                className="mr-4 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-live="polite"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2" aria-hidden="true"></div>
                    <span>Saving...</span>
                    <span className="sr-only">Saving visitor information, please wait</span>
                  </>
                ) : (
                  <>
                    <Clock className="mr-2 h-4 w-4" aria-hidden="true" />
                    <span>Schedule Visit</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
