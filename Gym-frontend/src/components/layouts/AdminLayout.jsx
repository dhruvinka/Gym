import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FiHome,
  FiUsers,
  FiCalendar,
  FiUserCheck,
  FiLogOut,
  FiMenu,
  FiX,
  FiMessageSquare
} from 'react-icons/fi';

function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { logout } = useAuth();
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: FiHome },
    { name: 'Trainers', href: '/admin/trainers', icon: FiUsers },
    { name: 'Slot Management', href: '/admin/schedules', icon: FiCalendar },
    { name: 'Members', href: '/admin/members', icon: FiUserCheck },
    { name: 'Assign Trainer', href: '/admin/assign-trainer', icon: FiUsers },
    {
      name: 'Payments',
      href: '/admin/payments',
      icon: () => <span className="text-lg font-semibold">₹</span>
    },
    {
      name: 'Contact Inquiries',
      href: '/admin/inquiries',
      icon: FiMessageSquare
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="lg:hidden fixed top-0 left-0 right-0 z-20 bg-white shadow-md p-4">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-gray-600 hover:text-gray-900"
        >
          {sidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0 transition duration-200 ease-in-out z-30 w-64 bg-gray-900 text-white shadow-lg`}
      >
        <div className="p-6">
          <h1 className="text-2xl font-bold">
            TITAN <span className="text-yellow-400">FIT</span>
          </h1>
          <p className="text-sm text-gray-400 mt-1">Admin Panel</p>
        </div>

        <nav className="mt-6">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;

            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-6 py-3 text-sm font-medium transition ${isActive
                    ? 'bg-yellow-400 text-black'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                onClick={() => setSidebarOpen(false)}
              >
                <span className="mr-3 h-5 w-5 flex items-center justify-center">
                  {typeof Icon === 'function' ? <Icon /> : <Icon className="h-5 w-5" />}
                </span>
                {item.name}
              </Link>
            );
          })}

          <button
            onClick={logout}
            className="w-full flex items-center px-6 py-3 text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition"
          >
            <FiLogOut className="mr-3 h-5 w-5" />
            Logout
          </button>
        </nav>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        <main className="p-4 lg:p-8 mt-16 lg:mt-0">
          {children}
        </main>
      </div>


    </div>
  );
}

export default AdminLayout;