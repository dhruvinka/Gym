import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import AdminLayout from '../../components/layouts/AdminLayout';
import { FiUsers, FiUserCheck, FiUserX, FiActivity, FiDollarSign, FiCalendar, FiTrendingUp } from 'react-icons/fi';

function AdminDashboard() {
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeMembers: 0,
    expiredMembers: 0,
    totalTrainers: 0,
    totalPayments: 0,
    totalSchedules: 0,
    totalRevenue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await adminAPI.getDashboard();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { title: 'Total Members', value: stats.totalMembers, icon: <FiUsers />, color: 'bg-blue-500' },
    { title: 'Active Members', value: stats.activeMembers, icon: <FiUserCheck />, color: 'bg-green-500' },
    { title: 'Expired Members', value: stats.expiredMembers, icon: <FiUserX />, color: 'bg-red-500' },
    { title: 'Total Trainers', value: stats.totalTrainers, icon: <FiActivity />, color: 'bg-purple-500' },
    { title: 'Total Payments', value: stats.totalPayments, icon: <FiDollarSign />, color: 'bg-yellow-500' },
    { title: 'Total Schedules', value: stats.totalSchedules, icon: <FiCalendar />, color: 'bg-indigo-500' },
    { title: 'Total Revenue', value: `₹${stats.totalRevenue}`, icon: <FiTrendingUp />, color: 'bg-pink-500' },
  ];

  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

        {loading ? (
          <div className="text-center">Loading...</div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {statCards.map((stat, index) => (
                <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className={`flex-shrink-0 rounded-md p-3 ${stat.color}`}>
                        <span className="text-2xl text-white">{stat.icon}</span>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            {stat.title}
                          </dt>
                          <dd className="text-lg font-semibold text-gray-900">
                            {stat.value}
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>


            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link to="/admin/trainers" className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
                <h3 className="text-xl font-bold mb-2">Manage Trainers</h3>
                <p className="text-gray-600">Add, edit, or remove trainers</p>
              </Link>

              <Link to="/admin/schedules" className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
                <h3 className="text-xl font-bold mb-2">Manage Schedules</h3>
                <p className="text-gray-600">Create and manage trainer schedules</p>
              </Link>

              <Link to="/admin/members" className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
                <h3 className="text-xl font-bold mb-2">Manage Members</h3>
                <p className="text-gray-600">View and update member status</p>
              </Link>

              <Link to="/admin/assign-trainer" className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
                <h3 className="text-xl font-bold mb-2">Assign Trainer</h3>
                <p className="text-gray-600">Assign trainers to premium members</p>
              </Link>

              <Link to="/admin/payments" className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
                <h3 className="text-xl font-bold mb-2">View Payments</h3>
                <p className="text-gray-600">Track all payment transactions</p>
              </Link>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}

export default AdminDashboard;