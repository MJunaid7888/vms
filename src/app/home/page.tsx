"use client";

import Image from "next/image";
import { ArrowUpRight, Camera, CheckCircle, Clock, Shield, Users } from "lucide-react";
import { useState, useEffect } from "react";
import QRCodeScanner from "@/components/QRCodeScanner";
import AppBar from "@/components/AppBar";
import Link from "next/link";

export default function Home() {
  const [showQRScanner, setShowQRScanner] = useState(false);

  // Ensure hydration consistency
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
  }, []);

  if (!hydrated) return null;

  return (
    <div className="min-h-screen bg-gradient-to-r from-white to-purple-100 font-sans">
      {/* Use the AppBar component for consistent navigation */}
      <AppBar showAuthButtons={true} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <section className="py-12 md:py-20">
          <div className="flex flex-col-reverse lg:flex-row items-center justify-between gap-10">
            {/* Text Content */}
            <div className="text-center lg:text-left max-w-xl">
              <p className="text-xs font-medium tracking-widest text-purple-700 uppercase">
                QuickPass - Appointment Booking & Visitor Gate Pass System with QR Code
              </p>
              <h1 className="text-4xl md:text-5xl font-extrabold my-4 text-black leading-tight">
                Visitor Pass <br className="hidden md:block" /> Management System
              </h1>
              <p className="text-lg text-gray-700 mb-6">
                Streamline your visitor management process with our secure and efficient system.
                Quick check-ins, real-time notifications, and comprehensive analytics.
              </p>

              <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
                <Link href="/check-in" className="flex items-center justify-center bg-blue-800 text-white px-6 py-3 rounded-full font-semibold w-full sm:w-auto hover:bg-blue-700 transition-colors">
                  Check-in <ArrowUpRight className="ml-2" />
                </Link>
                <button
                  onClick={() => setShowQRScanner(true)}
                  className="flex items-center justify-center border border-blue-800 text-blue-800 px-6 py-3 rounded-full font-semibold w-full sm:w-auto hover:bg-blue-50 transition-colors"
                >
                  Scan QR <Camera className="ml-2 w-4 h-4" />
                </button>

                {/* QR Code Scanner Modal */}
                {showQRScanner && (
                  <QRCodeScanner
                    token="" // No token needed for public scanning
                    onClose={() => setShowQRScanner(false)}
                  />
                )}
              </div>
            </div>

            {/* Images */}
            <div className="flex flex-col lg:flex-row items-center gap-6">
              <Image
                src="/img2.png"
                alt="QR Scan"
                width={320}
                height={320}
                className="rounded-xl shadow-lg"
                priority
              />
              <Image
                src="/img1.png"
                alt="Office"
                width={320}
                height={320}
                className="rounded-xl shadow-lg"
                priority
              />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-white bg-opacity-70 rounded-3xl shadow-sm my-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-blue-900">Key Features</h2>
            <p className="text-gray-600 mt-2 max-w-2xl mx-auto">
              Our visitor management system offers everything you need to streamline your front desk operations
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 px-4">
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                <CheckCircle className="h-6 w-6 text-blue-700" />
              </div>
              <h3 className="text-xl font-semibold text-center mb-2">Easy Check-in</h3>
              <p className="text-gray-600 text-center">
                Simple and quick check-in process for visitors with minimal waiting time
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                <Shield className="h-6 w-6 text-blue-700" />
              </div>
              <h3 className="text-xl font-semibold text-center mb-2">Enhanced Security</h3>
              <p className="text-gray-600 text-center">
                Know exactly who is in your building at all times with detailed visitor logs
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                <Clock className="h-6 w-6 text-blue-700" />
              </div>
              <h3 className="text-xl font-semibold text-center mb-2">Real-time Notifications</h3>
              <p className="text-gray-600 text-center">
                Instant alerts when visitors arrive, ensuring hosts are always informed
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                <Users className="h-6 w-6 text-blue-700" />
              </div>
              <h3 className="text-xl font-semibold text-center mb-2">Visitor Analytics</h3>
              <p className="text-gray-600 text-center">
                Comprehensive reports and insights on visitor traffic and patterns
              </p>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-16 my-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-blue-900">How It Works</h2>
            <p className="text-gray-600 mt-2 max-w-2xl mx-auto">
              Our simple three-step process makes visitor management effortless
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="relative">
              <div className="bg-blue-800 text-white w-10 h-10 rounded-full flex items-center justify-center text-xl font-bold mb-4 mx-auto">
                1
              </div>
              <h3 className="text-xl font-semibold text-center mb-2">Register</h3>
              <p className="text-gray-600 text-center">
                Visitors enter their details through our user-friendly interface
              </p>
              <div className="hidden md:block absolute top-5 right-0 w-1/2 h-0.5 bg-blue-200"></div>
            </div>

            <div className="relative">
              <div className="bg-blue-800 text-white w-10 h-10 rounded-full flex items-center justify-center text-xl font-bold mb-4 mx-auto">
                2
              </div>
              <h3 className="text-xl font-semibold text-center mb-2">Notify</h3>
              <p className="text-gray-600 text-center">
                The system automatically alerts the host about their visitor's arrival
              </p>
              <div className="hidden md:block absolute top-5 right-0 w-1/2 h-0.5 bg-blue-200"></div>
            </div>

            <div>
              <div className="bg-blue-800 text-white w-10 h-10 rounded-full flex items-center justify-center text-xl font-bold mb-4 mx-auto">
                3
              </div>
              <h3 className="text-xl font-semibold text-center mb-2">Check-in</h3>
              <p className="text-gray-600 text-center">
                Visitors receive a digital pass for seamless access to the premises
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-blue-900 rounded-3xl text-white my-12">
          <div className="text-center max-w-3xl mx-auto px-4">
            <h2 className="text-3xl font-bold mb-4">Ready to transform your visitor experience?</h2>
            <p className="text-blue-100 mb-8">
              Join thousands of organizations that have streamlined their visitor management process with QuickPass
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/signup" className="bg-white text-blue-900 hover:bg-blue-50 px-8 py-3 rounded-full font-semibold transition-colors">
                Get Started
              </Link>
              <Link href="/contact" className="border border-white text-white hover:bg-blue-800 px-8 py-3 rounded-full font-semibold transition-colors">
                Contact Sales
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <div className="text-2xl font-bold text-blue-800">QuickPass</div>
              <p className="text-gray-600 text-sm mt-1">© {new Date().getFullYear()} QuickPass. All rights reserved.</p>
            </div>
            <div className="flex gap-6">
              <Link href="/about" className="text-gray-600 hover:text-blue-800">About</Link>
              <Link href="/privacy" className="text-gray-600 hover:text-blue-800">Privacy</Link>
              <Link href="/terms" className="text-gray-600 hover:text-blue-800">Terms</Link>
              <Link href="/contact" className="text-gray-600 hover:text-blue-800">Contact</Link>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
