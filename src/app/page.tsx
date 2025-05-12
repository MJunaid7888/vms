"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, QrCode } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import QRCodeScanner from "@/components/QRCodeScanner";
import AppBar from "@/components/AppBar";

export default function Home() {
  const [languageOpen, setLanguageOpen] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const { user, token } = useAuth();

  // Ensure hydration consistency
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
  }, []);

  if (!hydrated) return null;

  return (
    <main className="min-h-screen bg-gradient-to-r from-white to-purple-100 font-sans">
      {/* QR Code Scanner */}
      {showScanner && token && (
        <QRCodeScanner
          token={token}
          onClose={() => setShowScanner(false)}
        />
      )}

      {/* App Bar */}
      <AppBar />

      {/* Hero Section */}
      <section className="flex flex-col-reverse lg:flex-row items-center justify-between gap-10 px-4 py-8 md:px-12 lg:px-24 mt-8">
        {/* Text Content */}
        <div className="text-center lg:text-left max-w-xl">
          <p className="text-xs font-medium tracking-widest text-purple-700 uppercase">
            QuickPass - Appointment Booking & Visitor Gate Pass System with QR Code
          </p>
          <h1 className="text-4xl md:text-5xl font-extrabold my-4 text-black leading-tight">
            Visitor Pass <br className="hidden md:block" /> Management System.
          </h1>
          <p className="text-lg text-gray-700 mb-6">
            Welcome, please tap on button to check-in
          </p>

          <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
            <Link
              href="/check-in"
              className="flex items-center justify-center bg-blue-800 text-white px-6 py-3 rounded-full font-semibold w-full sm:w-auto"
            >
              Check-in <ArrowUpRight className="ml-2" />
            </Link>
            <button
              className="flex items-center justify-center border border-blue-800 text-blue-800 px-6 py-3 rounded-full font-semibold w-full sm:w-auto"
              onClick={() => setShowScanner(true)}
            >
              Scan QR <QrCode className="ml-2 w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Images */}
        <div className="flex flex-col lg:flex-row items-center gap-6">
          <Image
            src="/img2.png"
            alt="QR Scan"
            width={320}
            height={320}
            style={{ width: 'auto', height: 'auto' }}
            className="rounded-xl shadow-lg"
            priority
          />
          <Image
            src="/img1.png"
            alt="Office"
            width={320}
            height={320}
            style={{ width: 'auto', height: 'auto' }}
            className="rounded-xl shadow-lg"
            priority
          />
        </div>
      </section>
    </main>
  );
}
