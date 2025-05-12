import React from 'react';
import { Button } from "@/components/ui/button";
import { Search, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import AppBar from '@/components/AppBar';

export default function VisitorForm() {

  return (
    <div className="min-h-screen bg-gradient-to-r from-white via-purple-50 to-white">
      <AppBar />

      {/* Main Content */}
      <div className="flex flex-col md:flex-row">
        {/* Left side form section */}
        <div className="flex flex-col justify-center items-center w-full md:w-1/2 p-6">
          <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg">
            <h1 className="text-3xl font-bold text-blue-900 mb-6 text-center md:text-left">Return Visitor</h1>
            <p className="text-gray-600 mb-6">Please enter your details to retrieve your information from our system.</p>

            <div className="relative mb-6">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="w-full pl-10 p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                placeholder="Enter Email, Phone or National ID"
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-3 sm:space-y-0">
              <Link href="/" className="w-full">
                <Button className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg shadow w-full">
                  Cancel
                </Button>
              </Link>
              <Button className="bg-blue-900 hover:bg-blue-800 text-white px-6 py-3 rounded-lg shadow w-full flex items-center justify-center">
                Continue <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                First time visitor? <Link href="/check-in" className="text-blue-600 hover:underline">Register here</Link>
              </p>
            </div>
          </div>
        </div>

        {/* Right side image section */}
        <div className="hidden md:flex md:w-1/2 flex-col justify-center items-center space-y-6 p-6">
          <img
            src="/building.jpeg"
            alt="Building"
            className="rounded-3xl w-3/4 shadow-lg"
          />
          <img
            src="/discussion.jpeg"
            alt="Discussion"
            className="rounded-3xl w-3/4 shadow-lg"
          />
        </div>
      </div>

      {/* Responsive images for small screens */}
      <div className="md:hidden w-full px-6 pt-6 space-y-4">
        <img
          src="/building.jpeg"
          alt="Building"
          className="rounded-3xl w-full shadow-lg"
        />
        <img
          src="/disscussion.jpeg"
          alt="Discussion"
          className="rounded-3xl w-full shadow-lg"
        />
      </div>
    </div>
  );
}
