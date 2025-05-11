import Image from 'next/image';

export default function ResetPassword() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-indigo-100 to-purple-200">
      {/* Navbar */}
      <nav className="flex flex-col sm:flex-row justify-between items-center px-6 py-4 bg-white/80 shadow-md">
        <div className="text-2xl font-bold text-blue-900">Quick<span className="text-black">Pass</span></div>
        <div className="flex items-center gap-4 mt-2 sm:mt-0">
          <a href="#" className="text-black font-medium">Have Appointment</a>
          <a href="#" className="text-black font-medium">Been here Before</a>
          <div className="relative group">
            <button className="font-medium text-black flex items-center gap-1">
              <span className="font-bold">GB</span> English ▼
            </button>
            {/* Dropdown on hover (optional) */}
            {/* <ul className="absolute hidden group-hover:block bg-white border mt-2 rounded shadow-lg">
              ...
            </ul> */}
          </div>
          <button className="bg-blue-900 text-white px-5 py-2 rounded-full">Login</button>
        </div>
      </nav>

      {/* Form + Image */}
      <div className="flex flex-col md:flex-row items-center justify-center px-6 py-12 gap-8">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-lg w-full">
          <h1 className="text-2xl sm:text-3xl font-bold text-blue-900 mb-6">Reset Password</h1>
          <form>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              E-mail<span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              required
              placeholder="Enter your email"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="bg-blue-900 text-white w-full py-3 rounded-full font-semibold hover:bg-blue-800 transition"
            >
              Send Password Reset Link
            </button>
          </form>
        </div>

        <div className="rounded-2xl overflow-hidden max-w-sm shadow-xl">
          <Image
            src="/password-side.jpg" // <-- Save your blurred image here
            alt="Reset visual"
            width={500}
            height={400}
            className="object-cover w-full h-full"
          />
        </div>
      </div>
    </div>
  );
}
