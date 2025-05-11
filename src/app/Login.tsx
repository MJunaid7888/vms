// App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// Removed incorrect import of Login as it is defined in this file
import { Signup } from './pages/Signup';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </Router>
  );
};

export default App;

// pages/Login.tsx
// Removed duplicate import of 'React'

const Login = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-purple-50 to-white p-4">
      <div className="flex flex-col md:flex-row bg-white shadow-lg rounded-3xl overflow-hidden max-w-4xl w-full">
        {/* Left form section */}
        <div className="md:w-1/2 p-8">
          <h2 className="text-3xl font-bold text-blue-900 mb-6">Login</h2>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">E-mail<span className="text-red-500">*</span></label>
              <input type="email" className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="admin@example.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password<span className="text-red-500">*</span></label>
              <input type="password" className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="••••••" />
            </div>
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" /> Remember Me
              </label>
              <a href="#" className="text-blue-700 hover:underline">Reset Password?</a>
            </div>
            <button type="submit" className="w-full bg-blue-900 text-white rounded-full py-3 font-semibold hover:bg-blue-800">Login</button>
          </form>
          <p className="mt-4 text-sm text-gray-600">Don't have an account? <Link to="/signup" className="text-blue-700 hover:underline">Sign up</Link></p>

          <div className="mt-6 text-sm">
            <p className="mb-2 font-medium">For Demo Login, Click Below</p>
            <div className="flex gap-2">
              <button className="bg-blue-500 text-white px-4 py-2 rounded-full">Admin</button>
              <button className="bg-orange-400 text-white px-4 py-2 rounded-full">Employee</button>
              <button className="bg-purple-500 text-white px-4 py-2 rounded-full">Reception</button>
            </div>
          </div>
        </div>

        {/* Right image section */}
        <div className="hidden md:block md:w-1/2">
          <img src="/login-image.jpg" alt="Login Visual" className="w-full h-full object-cover" />
        </div>
      </div>
    </div>
  );
};

export { Login };

// pages/Signup.tsx
import React from 'react';
import { Link } from 'react-router-dom';

const Signup = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-purple-50 to-white p-4">
      <div className="flex flex-col md:flex-row bg-white shadow-lg rounded-3xl overflow-hidden max-w-4xl w-full">
        <div className="md:w-1/2 p-8">
          <h2 className="text-3xl font-bold text-blue-900 mb-6">Sign Up</h2>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name<span className="text-red-500">*</span></label>
              <input type="text" className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="John Doe" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email<span className="text-red-500">*</span></label>
              <input type="email" className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="john@example.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password<span className="text-red-500">*</span></label>
              <input type="password" className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="••••••" />
            </div>
            <button type="submit" className="w-full bg-blue-900 text-white rounded-full py-3 font-semibold hover:bg-blue-800">Create Account</button>
          </form>
          <p className="mt-4 text-sm text-gray-600">Already have an account? <Link to="/" className="text-blue-700 hover:underline">Log in</Link></p>
        </div>

        <div className="hidden md:block md:w-1/2">
          <img src="/signup-image.jpg" alt="Signup Visual" className="w-full h-full object-cover" />
        </div>
      </div>
    </div>
  );
};

export { Signup };
