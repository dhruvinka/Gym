import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/layouts/AdminLayout';
import { paymentAPI } from '../../services/api';
import { FiTrendingUp, FiCalendar, FiUser, FiCreditCard } from 'react-icons/fi';

function Payments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalPayments: 0,
    premiumPayments: 0,
    simplePayments: 0
  });

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const response = await paymentAPI.getAllPayments();
      setPayments(response.data);
      
      // Calculate stats
      const total = response.data.reduce((sum, p) => sum + p.amount, 0) / 100;
      const premium = response.data.filter(p => p.plan === 'PREMIUM').length;
      const simple = response.data.filter(p => p.plan === 'SIMPLE').length;
      
      setStats({
        totalRevenue: total,
        totalPayments: response.data.length,
        premiumPayments: premium,
        simplePayments: simple
      });
    } catch (error) {
      console.error('Failed to fetch payments', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-8">Payment Management</h1>

        {/* Stats Cards - Updated with ₹ symbol */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600">Total Revenue</div>
                <div className="text-3xl font-bold text-green-600">
                  ₹{stats.totalRevenue.toLocaleString('en-IN')}
                </div>
              </div>
              <FiTrendingUp className="text-4xl text-green-400" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600">Total Payments</div>
                <div className="text-3xl font-bold">{stats.totalPayments}</div>
              </div>
              <FiCreditCard className="text-4xl text-blue-400" />
            </div>
          </div>
          
          <div className="bg-yellow-50 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-yellow-600">Premium Memberships</div>
                <div className="text-3xl font-bold text-yellow-600">{stats.premiumPayments}</div>
              </div>
              <FiTrendingUp className="text-4xl text-yellow-400" />
            </div>
          </div>
          
          <div className="bg-blue-50 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-blue-600">Simple Memberships</div>
                <div className="text-3xl font-bold text-blue-600">{stats.simplePayments}</div>
              </div>
              <FiCreditCard className="text-4xl text-blue-400" />
            </div>
          </div>
        </div>

        {/* Payments Table - Updated with ₹ symbol */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Member
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Plan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount (₹)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    No payments found
                  </td>
                </tr>
              ) : (
                payments.map((payment) => (
                  <tr key={payment._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <FiCalendar className="text-gray-400" />
                        {new Date(payment.createdAt).toLocaleDateString('en-IN')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <FiUser className="text-gray-400" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {payment.userId?.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {payment.userId?.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        payment.plan === 'PREMIUM' 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {payment.plan}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <span className="font-semibold">₹</span>{(payment.amount / 100).toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500 font-mono">
                      {payment.razorpayPaymentId?.slice(0, 12)}...
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                        {payment.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Summary Footer */}
        {!loading && payments.length > 0 && (
          <div className="mt-6 bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Revenue (All Time):</span>
              <span className="text-2xl font-bold text-green-600">
                ₹{stats.totalRevenue.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex justify-between items-center mt-2 text-sm text-gray-500">
              <span>Average payment: ₹{(stats.totalRevenue / stats.totalPayments).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
              <span>Premium/Simple ratio: {stats.premiumPayments}:{stats.simplePayments}</span>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export default Payments;