// pages/visitor.tsx

import { useState, FormEvent } from 'react';

interface VisitorFormData {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  gender: string;
  employee: string;
  companyName: string;
  nid: string;
  purpose: string;
  address: string;
  agreed: boolean;
}

export default function VisitorForm() {
  const [formData, setFormData] = useState<VisitorFormData>({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    gender: 'Male',
    employee: '',
    companyName: '',
    nid: '',
    purpose: '',
    address: '',
    agreed: false,
  });

  const [languageOpen, setLanguageOpen] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' && (e.target as HTMLInputElement).checked;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    console.log(formData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-indigo-100 to-purple-100 px-4 py-6">
      {/* Navbar */}
      <nav className="flex flex-col md:flex-row justify-between items-center mb-8 relative z-20">
        <div className="text-2xl md:text-3xl font-bold text-blue-800">QuickPass</div>
        <div className="flex flex-col md:flex-row items-center gap-4 mt-4 md:mt-0">
          <a href="#" className="text-black font-semibold">Have Appointment</a>
          <a href="#" className="text-black font-semibold">Been here Before</a>
          <div className="relative">
            <button
              onClick={() => setLanguageOpen(!languageOpen)}
              className="text-black font-medium focus:outline-none"
            >
              GB English ▼
            </button>
            {languageOpen && (
              <ul className="absolute right-0 mt-2 w-40 bg-white border border-gray-300 rounded shadow-lg z-30">
                <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">GB English</li>
                <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">FR Français</li>
                <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">ES Español</li>
                <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">DE Deutsch</li>
                <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">IT Italiano</li>
                <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">ZH 中文</li>
              </ul>
            )}
          </div>
          <button className="bg-blue-700 text-white px-6 py-2 rounded-full">Login</button>
        </div>
      </nav>

      {/* Visitor Form Container */}
      <div className="bg-white rounded-3xl shadow-lg p-6 md:p-10 w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* FORM SECTION */}
        <form onSubmit={handleSubmit} className="space-y-5 w-full">
          <h1 className="text-3xl md:text-4xl font-bold text-blue-900">Visitor Details</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input name="firstName" required value={formData.firstName} onChange={handleChange} placeholder="First Name*" className="border border-gray-300 rounded-lg px-4 py-2 w-full" />
            <input name="lastName" required value={formData.lastName} onChange={handleChange} placeholder="Last Name*" className="border border-gray-300 rounded-lg px-4 py-2 w-full" />
            <input name="phone" required value={formData.phone} onChange={handleChange} placeholder="Phone*" className="border border-gray-300 rounded-lg px-4 py-2 w-full" />
            <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="E-mail" className="border border-gray-300 rounded-lg px-4 py-2 w-full" />
            <select name="gender" required value={formData.gender} onChange={handleChange} className="border border-gray-300 rounded-lg px-4 py-2 w-full">
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
            <select name="employee" required value={formData.employee} onChange={handleChange} className="border border-gray-300 rounded-lg px-4 py-2 w-full">
              <option value="">Select Employee</option>
              <option value="John">John</option>
              <option value="Jane">Jane</option>
            </select>
            <input name="companyName" value={formData.companyName} onChange={handleChange} placeholder="Company Name" className="border border-gray-300 rounded-lg px-4 py-2 w-full" />
            <input name="nid" required value={formData.nid} onChange={handleChange} placeholder="National ID No*" className="border border-gray-300 rounded-lg px-4 py-2 w-full" />
          </div>
          <textarea name="purpose" required value={formData.purpose} onChange={handleChange} placeholder="Purpose*" className="border border-gray-300 rounded-lg px-4 py-2 w-full h-24 resize-none" />
          <input name="address" value={formData.address} onChange={handleChange} placeholder="Address" className="border border-gray-300 rounded-lg px-4 py-2 w-full" />
          <div className="flex items-start gap-2 text-sm">
            <input type="checkbox" name="agreed" checked={formData.agreed} onChange={handleChange} />
            <label>I agree to these <a href="#" className="text-blue-600 underline">Terms and Conditions</a>.</label>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button type="button" className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-full w-full sm:w-auto">Cancel</button>
            <button type="submit" className="bg-blue-900 hover:bg-blue-800 text-white px-6 py-2 rounded-full w-full sm:w-auto">Continue</button>
          </div>
        </form>

        {/* IMAGE SECTION */}
        <div className="flex flex-col gap-4 items-center justify-center w-full">
          <img src="/building.jpg" alt="Building" className="rounded-xl w-full h-48 md:h-60 lg:h-64 object-cover" loading="lazy" />
          <img src="/reception.jpg" alt="Reception" className="rounded-xl w-full h-48 md:h-60 lg:h-64 object-cover" loading="lazy" />
        </div>
      </div>
    </div>
  );
}
