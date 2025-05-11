"use client";

import Image from "next/image";
import { ArrowUpRight, Camera } from "lucide-react";
import { useState, useEffect } from "react";

export default function Home() {
  const [languageOpen, setLanguageOpen] = useState(false);

  // Ensure hydration consistency
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
  }, []);

  if (!hydrated) return null;

  return (
    <main className="min-h-screen bg-gradient-to-r from-white to-purple-100 px-4 py-8 md:px-12 lg:px-24 font-sans">
      {/* Navbar */}
      <nav className="flex flex-col md:flex-row justify-between items-center mb-12 relative">
        <div className="text-2xl md:text-3xl font-bold text-blue-800">QuickPass</div>
        <div className="flex flex-col md:flex-row items-center gap-4 mt-4 md:mt-0">
          <a href="/haveappoinment" className="text-black font-semibold">Have Appointment</a>
          <a href="/beenherebefore" className="text-black font-semibold">Been here Before</a>
          <div className="relative">
            <button
              onClick={() => setLanguageOpen(!languageOpen)}
              className="text-black font-medium focus:outline-none"
            >
              GB English ▼
            </button>
            {languageOpen && (
              <ul className="absolute right-0 mt-2 w-40 bg-white border border-gray-300 rounded shadow-lg z-10">
                <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">GB English</li>
                <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">FR Français</li>
                <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">ES Español</li>
                <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">DE Deutsch</li>
                <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">IT Italiano</li>
                <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">ZH 中文</li>
              </ul>
            )}
          </div>
            <a href="/login/page.tsx" className="bg-blue-700 text-white px-6 py-2 rounded-full">Login</a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex flex-col-reverse lg:flex-row items-center justify-between gap-10">
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
            <a href="/check-in/page.tsx" className="flex items-center justify-center bg-blue-800 text-white px-6 py-3 rounded-full font-semibold w-full sm:w-auto">
              Check-in <ArrowUpRight className="ml-2" />
            </a>
            <button className="flex items-center justify-center border border-blue-800 text-blue-800 px-6 py-3 rounded-full font-semibold w-full sm:w-auto">
              Scan QR <Camera className="ml-2 w-4 h-4" />
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
      </section>
    </main>
  );
}
