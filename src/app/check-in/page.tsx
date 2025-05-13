'use client';

import { useState, FormEvent, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { visitorAPI, employeeAPI, Employee } from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';
import { User, Phone, Mail, Building, Calendar, MapPin, FileText, Check, Search, CheckCircle, ArrowUpRight, AlertCircle, CreditCard } from 'lucide-react';
import AppBar from '@/components/AppBar';

interface VisitorFormData {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  gender: string;
  hostEmployeeId: string;
  company: string;
  nationalId: string;
  purpose: string;
  address: string;
  visitDate: string;
  agreed: boolean;
}

export default function VisitorForm() {
  const [formData, setFormData] = useState<VisitorFormData>({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    email: '',
    gender: 'Male',
    hostEmployeeId: '',
    company: '',
    nationalId: '',
    purpose: '',
    address: '',
    visitDate: new Date().toISOString().split('T')[0],
    agreed: false,
  });

  // State for form handling
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [response, setResponse] = useState<any>(null);

  // Return visitor search
  const [searchEmail, setSearchEmail] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const { user, token } = useAuth();

  // Fetch employees when component mounts and check for returning visitor
  useEffect(() => {
    const fetchEmployees = async () => {
      if (token) {
        try {
          const data = await employeeAPI.getEmployees(token);
          setEmployees(data);
        } catch (err) {
          console.error('Failed to fetch employees:', err);
        }
      }
    };

    fetchEmployees();

    // Check if there's a returning visitor from the been-here-before page
    if (typeof window !== 'undefined') {
      const returnVisitorData = sessionStorage.getItem('returnVisitor');
      if (returnVisitorData) {
        try {
          const visitor = JSON.parse(returnVisitorData);
          selectReturnVisitor(visitor);
          // Clear the session storage after using it
          sessionStorage.removeItem('returnVisitor');
        } catch (err) {
          console.error('Error parsing return visitor data:', err);
        }
      }
    }
  }, [token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' && (e.target as HTMLInputElement).checked;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchEmail(e.target.value);
  };

  const searchVisitor = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!searchEmail) {
      setError('Please enter an email address to search');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(searchEmail)) {
      setError('Please enter a valid email address');
      return;
    }

    if (!token) {
      setError('Authentication required to search for visitors');
      return;
    }

    setIsSearching(true);
    setError('');
    setSuccess('');
    setSearchResults([]);

    try {
      // Use the improved API to search for visitors by email
      const results = await visitorAPI.searchVisitorsByEmail(searchEmail, token);

      if (results.length === 0) {
        // If no results, show a message but don't set an error
        // This is a normal case, not an error condition
        setError('No previous visits found for this email address.');
      } else {
        // Sort results by visit date (most recent first)
        results.sort((a, b) => {
          const dateA = new Date(a.visitDate || a.checkInTime || 0);
          const dateB = new Date(b.visitDate || b.checkInTime || 0);
          return dateB.getTime() - dateA.getTime();
        });

        setSuccess(`Found ${results.length} previous visit${results.length > 1 ? 's' : ''} for this email.`);
      }

      setSearchResults(results);
    } catch (err) {
      console.error('Error searching for visitor:', err);
      setError(err instanceof Error ? err.message : 'Failed to search for visitor. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const selectReturnVisitor = (visitor: any) => {
    // Update form with visitor data
    setFormData({
      firstName: visitor.firstName,
      lastName: visitor.lastName,
      phoneNumber: visitor.phoneNumber,
      email: visitor.email,
      gender: visitor.gender || formData.gender, // Use visitor's gender if available, otherwise keep current
      hostEmployeeId: visitor.hostEmployee,
      company: visitor.company || '',
      nationalId: formData.nationalId, // Keep current ID
      purpose: '',  // Clear purpose for new visit
      address: visitor.address || formData.address, // Use visitor's address if available
      visitDate: new Date().toISOString().split('T')[0],
      agreed: false, // Require agreement again
    });

    // Clear search results and input
    setSearchResults([]);
    setSearchEmail('');

    // Show success message
    setSuccess('Welcome back! Your information has been filled in. Please update any details if needed and complete the form.');

    // Scroll to the first form field that needs attention (purpose)
    setTimeout(() => {
      const purposeElement = document.querySelector('[name="purpose"]');
      if (purposeElement) {
        purposeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    if (!formData.agreed) {
      setError('You must agree to the terms and conditions');
      setIsLoading(false);
      return;
    }

    try {
      // If user is logged in, use their token, otherwise proceed as guest
      const visitorData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber,
        email: formData.email || '', // API requires email to be a string
        gender: formData.gender,
        hostEmployeeId: formData.hostEmployeeId,
        company: formData.company || '',
        nationalId: formData.nationalId,
        purpose: formData.purpose,
        visitDate: formData.visitDate,
      };

      // Schedule the visit and get response
      let visitResponse;
      if (token) {
        visitResponse = await visitorAPI.scheduleVisit(visitorData, token);
      } else {
        // For guest check-in, we would need a public endpoint
        // This is a placeholder for now
        console.log('Guest check-in:', visitorData);
        // Create a mock response for guest check-in
        visitResponse = {
          _id: 'guest-' + Date.now(),
          ...visitorData
        };
      }

      // Set the response in state for use in the UI
      setResponse(visitResponse);

      // Get host name from employees list
      const hostName = employees.find(e => e.id === formData.hostEmployeeId)?.name || 'your host';

      setSuccess(`Your visit has been scheduled successfully! Please check in at the reception desk when you arrive. ${hostName} has been notified of your upcoming visit on ${new Date(formData.visitDate).toLocaleDateString()}.`);

      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        phoneNumber: '',
        email: '',
        gender: 'Male',
        hostEmployeeId: '',
        company: '',
        nationalId: '',
        purpose: '',
        address: '',
        visitDate: new Date().toISOString().split('T')[0],
        agreed: false,
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check in. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-indigo-100 to-purple-100">
      <AppBar />

      {/* Visitor Form Container */}
      <div className="bg-white rounded-3xl shadow-lg p-6 md:p-10 w-full max-w-7xl mx-4 md:mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        {/* FORM SECTION */}
        <form onSubmit={handleSubmit} className="space-y-6 w-full">
          <div className="flex items-center mb-2">
            <div className="bg-blue-100 p-2 rounded-full mr-3">
              <User className="h-6 w-6 text-blue-700" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-blue-900">Visitor Registration</h1>
          </div>
          <p className="text-gray-600 mb-4">Please fill in your details to register for a visit. Fields marked with * are required.</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-lg mb-6 flex items-start">
              <div className="bg-red-100 p-2 rounded-full mr-4 flex-shrink-0">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="font-medium text-lg mb-2">Registration Error</p>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 p-6 rounded-lg mb-6 flex items-start">
              <div className="bg-green-100 p-2 rounded-full mr-4 flex-shrink-0">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-lg mb-2">Registration Successful!</p>
                <p className="text-green-700">{success}</p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Link href="/" className="bg-white border border-green-300 text-green-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-green-50 transition-colors">
                    Return to Home
                  </Link>
                  {response && response._id && (
                    <Link
                      href={`/badge/${response._id}`}
                      className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center"
                    >
                      <CreditCard className="mr-2 h-4 w-4" />
                      View Digital Badge
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={() => setFormData({
                      firstName: '',
                      lastName: '',
                      phoneNumber: '',
                      email: '',
                      gender: 'Male',
                      hostEmployeeId: '',
                      company: '',
                      nationalId: '',
                      purpose: '',
                      address: '',
                      visitDate: new Date().toISOString().split('T')[0],
                      agreed: false,
                    })}
                    className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors"
                  >
                    Register Another Visitor
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Return Visitor Search */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl mb-8 shadow-sm border border-blue-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="bg-blue-100 p-2.5 rounded-full mr-3">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-blue-900">Been Here Before?</h3>
              </div>
              <Link
                href="/been-here-before"
                className="text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-3 py-1.5 rounded-md transition-colors flex items-center"
              >
                Use dedicated page <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="flex items-start mb-5">
              <div className="bg-blue-100 p-1.5 rounded-full mr-3 mt-0.5">
                <CheckCircle className="h-4 w-4 text-blue-600" />
              </div>
              <p className="text-gray-700">
                If you've visited us before, enter your email to quickly fill in your information and save time.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-grow relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  placeholder="Enter your email address"
                  className="w-full pl-10 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80"
                  value={searchEmail}
                  onChange={handleSearchChange}
                  onKeyDown={(e) => e.key === 'Enter' && searchVisitor(e)}
                />
              </div>
              <button
                type="button"
                onClick={searchVisitor}
                disabled={isSearching || !searchEmail}
                className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-3 rounded-lg disabled:bg-blue-300 transition-colors flex items-center justify-center whitespace-nowrap shadow-sm"
              >
                {isSearching ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Find My Information
                  </>
                )}
              </button>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 ? (
              <div className="mt-6 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="bg-blue-50 px-5 py-3 border-b border-gray-200 flex items-center">
                  <CheckCircle className="h-5 w-5 text-blue-600 mr-2" />
                  <h5 className="font-medium text-blue-900">Found {searchResults.length} previous {searchResults.length === 1 ? 'visit' : 'visits'}</h5>
                </div>
                <ul className="divide-y divide-gray-200">
                  {searchResults.map((visitor) => (
                    <li key={visitor._id} className="p-5 hover:bg-blue-50 transition-colors">
                      <div className="flex items-center justify-between flex-wrap gap-4">
                        <div>
                          <div className="flex items-center">
                            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 h-10 w-10 rounded-full flex items-center justify-center mr-3 text-white shadow-sm">
                              <span className="font-medium">
                                {visitor.firstName?.charAt(0)}{visitor.lastName?.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{visitor.firstName} {visitor.lastName}</p>
                              <p className="text-sm text-gray-500">{visitor.email}</p>
                            </div>
                          </div>
                          <div className="mt-3 ml-13 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
                            <p className="text-sm text-gray-500 flex items-center">
                              <Building className="h-4 w-4 text-gray-400 mr-2" />
                              <span className="font-medium mr-1">Company:</span> {visitor.company || 'Not specified'}
                            </p>
                            <p className="text-sm text-gray-500 flex items-center">
                              <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                              <span className="font-medium mr-1">Last visit:</span> {new Date(visitor.visitDate).toLocaleDateString()}
                            </p>
                            {visitor.purpose && (
                              <p className="text-sm text-gray-500 flex items-start col-span-2 mt-1">
                                <FileText className="h-4 w-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                                <span><span className="font-medium mr-1">Purpose:</span> {visitor.purpose}</span>
                              </p>
                            )}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => selectReturnVisitor(visitor)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center shadow-sm"
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Use this information
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : error && error.includes('No previous visits') ? (
              <div className="mt-6 bg-yellow-50 border border-yellow-200 p-4 rounded-lg flex items-start">
                <div className="bg-yellow-100 p-2 rounded-full mr-3 flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="font-medium text-yellow-800 mb-1">No Previous Visits Found</p>
                  <p className="text-yellow-700">
                    We couldn't find any previous visits for this email address. Please fill in your information below to register as a new visitor.
                  </p>
                </div>
              </div>
            ) : success ? (
              <div className="mt-6 bg-green-50 border border-green-200 p-4 rounded-lg flex items-start">
                <div className="bg-green-100 p-2 rounded-full mr-3 flex-shrink-0">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-green-800 mb-1">Information Retrieved</p>
                  <p className="text-green-700">
                    {success}
                  </p>
                </div>
              </div>
            ) : null}
          </div>

          {/* Form Sections */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <User className="h-5 w-5 text-blue-600 mr-2" />
              Personal Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name*</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    name="firstName"
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="John"
                    className="w-full pl-10 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white hover:bg-gray-50 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name*</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    name="lastName"
                    required
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Doe"
                    className="w-full pl-10 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white hover:bg-gray-50 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number*</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    name="phoneNumber"
                    required
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    placeholder="+1 (555) 123-4567"
                    className="w-full pl-10 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white hover:bg-gray-50 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john.doe@example.com"
                    className="w-full pl-10 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white hover:bg-gray-50 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender*</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    name="gender"
                    required
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full pl-10 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white hover:bg-gray-50 transition-colors appearance-none"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">National ID*</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FileText className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    name="nationalId"
                    required
                    value={formData.nationalId}
                    onChange={handleChange}
                    placeholder="ID Number"
                    className="w-full pl-10 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white hover:bg-gray-50 transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Building className="h-5 w-5 text-blue-600 mr-2" />
              Visit Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Host Employee*</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    name="hostEmployeeId"
                    required
                    value={formData.hostEmployeeId}
                    onChange={handleChange}
                    className="w-full pl-10 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white hover:bg-gray-50 transition-colors appearance-none"
                  >
                    <option value="">Select Employee</option>
                    {employees.map(employee => (
                      <option key={employee.id} value={employee.id}>
                        {employee.name} - {employee.department}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    placeholder="Acme Inc."
                    className="w-full pl-10 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white hover:bg-gray-50 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Visit Date*</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="date"
                    name="visitDate"
                    required
                    value={formData.visitDate}
                    onChange={handleChange}
                    className="w-full pl-10 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white hover:bg-gray-50 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Your address"
                    className="w-full pl-10 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white hover:bg-gray-50 transition-colors"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Purpose of Visit*</label>
              <div className="relative">
                <div className="absolute top-3 left-3 pointer-events-none">
                  <FileText className="h-5 w-5 text-gray-400" />
                </div>
                <textarea
                  name="purpose"
                  required
                  value={formData.purpose}
                  onChange={handleChange}
                  placeholder="Please describe the purpose of your visit"
                  className="w-full pl-10 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white hover:bg-gray-50 transition-colors h-24 resize-none"
                />
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FileText className="h-5 w-5 text-blue-600 mr-2" />
              Terms and Conditions
            </h3>

            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4 text-sm text-gray-700">
              <p className="mb-2">By checking the box below, you agree to:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Follow all safety and security protocols during your visit</li>
                <li>Wear your visitor badge visibly at all times</li>
                <li>Be escorted by your host in restricted areas</li>
                <li>Provide accurate information for security purposes</li>
                <li>Allow your information to be stored in our visitor management system</li>
              </ul>
            </div>

            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                <input
                  type="checkbox"
                  name="agreed"
                  id="agreed"
                  required
                  checked={formData.agreed}
                  onChange={handleChange}
                  className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
              <label htmlFor="agreed" className="text-gray-700">
                I agree to the <a href="#" className="text-blue-600 hover:underline font-medium">Terms and Conditions</a> and acknowledge that my personal information will be processed in accordance with the <a href="#" className="text-blue-600 hover:underline font-medium">Privacy Policy</a>.*
              </label>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-between">
            <Link
              href="/"
              className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-lg w-full sm:w-auto text-center transition-colors flex items-center justify-center"
            >
              <ArrowUpRight className="mr-2 h-5 w-5 rotate-180" />
              Return to Home
            </Link>
            <button
              type="submit"
              className="bg-blue-700 hover:bg-blue-800 text-white px-8 py-3 rounded-lg w-full sm:w-auto disabled:bg-blue-300 transition-colors flex items-center justify-center shadow-sm"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  Submit Registration
                  <Check className="ml-2 h-5 w-5" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* IMAGE SECTION */}
        <div className="flex flex-col gap-4 items-center justify-center w-full">
          <div className="relative w-full h-48 md:h-60 lg:h-64">
            <Image
              src="/building.jpeg"
              alt="Building"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              style={{ objectFit: 'cover' }}
              className="rounded-xl"
              priority
            />
          </div>
          <div className="relative w-full h-48 md:h-60 lg:h-64">
            <Image
              src="/reception.jpeg"
              alt="Reception"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              style={{ objectFit: 'cover' }}
              className="rounded-xl"
              priority
            />
          </div>
        </div>
      </div>
    </div>
  );
}
