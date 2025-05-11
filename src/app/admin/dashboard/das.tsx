// pages/admin-dashboard.js
import Sidebar from '@/components/Sidebar';
import Header from '../../components/Header';
import StatCard from '@/components/StatCard';

export default function AdminDashboard() {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1">
        <Header />
        <div className="p-6">
          <div className="bg-red-100 text-red-700 p-4 rounded mb-6">
            <strong>Reminder!</strong> Dummy data will be reset in every 30 minutes.
          </div>

          <h2 className="text-2xl font-semibold text-blue-900 mb-1">Good Night!</h2>
          <p className="text-lg text-gray-600 mb-6">John Doe</p>

          <h3 className="text-xl font-medium mb-4">Overview</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard title="Total Employees" count="5" color="bg-blue-900" icon="💰" />
            <StatCard title="Total Visitors" count="5" color="bg-purple-500" icon="📦" />
            <StatCard title="Total Pre Registers" count="5" color="bg-blue-500" icon="👥" />
            <StatCard title="Today Attendance" count="0" color="bg-fuchsia-500" icon="📄" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white p-4 rounded shadow">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-semibold">Pre-Registered Visitors</h4>
                <span className="text-sm text-gray-500">05 May - 11 May</span>
              </div>
              <div className="h-24 bg-gray-50 flex items-center justify-center text-gray-400">
                Chart or list here
              </div>
            </div>

            <div className="bg-white p-4 rounded shadow">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-semibold">Front-Desk Visitors</h4>
                <span className="text-sm text-gray-500">05 May - 11 May</span>
              </div>
              <div className="h-24 bg-gray-50 flex items-center justify-center text-gray-400">
                Chart or list here
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded shadow">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-semibold">Visitor Stats</h4>
              <span className="text-sm text-gray-500">12 Apr - 11 May</span>
            </div>
            <div className="h-24 bg-gray-50 flex items-center justify-center text-gray-400">
              Chart or list here
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
