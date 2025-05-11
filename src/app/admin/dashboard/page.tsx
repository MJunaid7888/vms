import Image from 'next/image';
import { ArrowUpRight, QrCode } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-indigo-100 to-purple-200">
      {/* Navbar */}
      <nav className="flex flex-col sm:flex-row justify-between items-center px-6 py-4 bg-white/80 shadow-md">
        <div className="text-2xl font-bold text-blue-900">Quick<span className="text-black">Pass</span></div>
        <div className="flex items-center gap-4 mt-2 sm:mt-0">
          <a href="#" className="text-black font-medium">Have Appointment</a>
          <a href="#" className="text-black font-medium">Been here Before</a>
          <a href="#" className="text-black font-medium">Check-out</a>
          <div className="relative group">
            <button className="font-medium text-black flex items-center gap-1">
              <span className="font-bold">GB</span> English ▼
            </button>
          </div>
          <button className="bg-blue-900 text-white px-5 py-2 rounded-full">Dashboard</button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="flex flex-col md:flex-row items-center justify-between px-6 py-12 max-w-7xl mx-auto gap-8">
        {/* Text */}
        <div className="max-w-xl">
          <p className="text-sm text-gray-500 mb-2 border-l-4 pl-2 border-black">
            QUICKPASS – APPOINTMENT BOOKING & VISITOR GATE PASS SYSTEM WITH QR CODE
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold text-black mb-4 leading-tight">
            Visitor Pass <br />
            Management System.
          </h1>
          <p className="text-lg text-gray-700 mb-6">
            Welcome, please tap on button to check-in
          </p>
          <div className="flex flex-wrap gap-4">
            <button className="bg-blue-900 text-white px-6 py-3 rounded-full text-lg font-semibold flex items-center gap-2 hover:bg-blue-800">
              Check-in <ArrowUpRight size={20} />
            </button>
            <button className="border-2 border-blue-900 text-blue-900 px-6 py-3 rounded-full text-lg font-semibold flex items-center gap-2 hover:bg-blue-100">
              Scan QR <QrCode size={20} />
            </button>
          </div>
        </div>

        {/* Image Stack */}
        <div className="relative w-full max-w-md flex-shrink-0">
          <div className="rounded-[30px] overflow-hidden shadow-lg mb-6">
            <Image
              src="/building.jpg" // Add your building image here
              alt="Building"
              width={500}
              height={300}
              className="object-cover w-full h-full"
            />
          </div>
          <div className="rounded-[30px] overflow-hidden shadow-lg absolute bottom-[-30px] left-[-40px] w-64 sm:w-72">
            <Image
              src="/tablet-checkin.jpg" // Add your tablet image here
              alt="Tablet check-in"
              width={400}
              height={300}
              className="object-cover w-full h-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
