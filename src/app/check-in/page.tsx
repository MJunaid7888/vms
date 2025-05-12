'use client';

import { useState, FormEvent, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { visitorAPI, employeeAPI, Employee } from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';
import { User, Phone, Mail, Building, Calendar, MapPin, FileText, Check } from 'lucide-react';
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

  const { user, token } = useAuth();

  // Fetch employees when component mounts
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
  }, [token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' && (e.target as HTMLInputElement).checked;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
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

      if (token) {
        await visitorAPI.scheduleVisit(visitorData, token);
      } else {
        // For guest check-in, we would need a public endpoint
        // This is a placeholder for now
        console.log('Guest check-in:', visitorData);
      }

      setSuccess('Check-in successful! Please wait for your host.');

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
          <h1 className="text-3xl md:text-4xl font-bold text-blue-900 mb-2">Visitor Registration</h1>
          <p className="text-gray-600 mb-4">Please fill in your details to register for a visit</p>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6">
              <p className="font-medium">Error</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded mb-6">
              <p className="font-medium">Success</p>
              <p className="text-sm">{success}</p>
            </div>
          )}

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
                  className="w-full pl-10 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
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
                  className="w-full pl-10 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
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
                  className="w-full pl-10 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
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
                  className="w-full pl-10 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender*</label>
              <select
                name="gender"
                required
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Host Employee*</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  name="hostEmployeeId"
                  required
                  value={formData.hostEmployeeId}
                  onChange={handleChange}
                  className="w-full pl-10 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
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
                  className="w-full pl-10 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">National ID*</label>
              <input
                name="nationalId"
                required
                value={formData.nationalId}
                onChange={handleChange}
                placeholder="ID Number"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
              />
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
                className="w-full pl-10 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 h-24 resize-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
                  className="w-full pl-10 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
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
                  className="w-full pl-10 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                />
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 text-sm bg-blue-50 p-4 rounded-lg">
            <div className="mt-0.5">
              <input
                type="checkbox"
                name="agreed"
                id="agreed"
                checked={formData.agreed}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
            <label htmlFor="agreed" className="text-gray-700">
              I agree to the <a href="#" className="text-blue-600 hover:underline font-medium">Terms and Conditions</a> and acknowledge that my personal information will be processed in accordance with the <a href="#" className="text-blue-600 hover:underline font-medium">Privacy Policy</a>.
            </label>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link
              href="/"
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg w-full sm:w-auto text-center transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="bg-blue-900 hover:bg-blue-800 text-white px-6 py-3 rounded-lg w-full sm:w-auto disabled:bg-blue-300 transition-colors flex items-center justify-center"
              disabled={isLoading}
            >
              {isLoading ? (
                <>Processing...</>
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
