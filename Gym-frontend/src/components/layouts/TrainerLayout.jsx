import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FiHome,
  FiCalendar,
  FiUsers,
  FiClipboard,
  FiLogOut,
  FiMenu,
  FiX,
  FiUser
} from 'react-icons/fi';

function TrainerLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { logout } = useAuth();
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/trainer/dashboard', icon: FiHome },
    { name: 'My Profile', href: '/trainer/profile', icon: FiUser },
    { name: 'My Schedule', href: '/trainer/schedule', icon: FiCalendar },
    { name: 'My Members', href: '/trainer/members', icon: FiUsers },
    { name: 'Diet Plans', href: '/trainer/diet-plans', icon: FiClipboard },
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
          <p className="text-sm text-gray-400 mt-1">Trainer Panel</p>
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
                <Icon className="mr-3 h-5 w-5" />
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

export default TrainerLayout;