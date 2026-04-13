import { useState, useEffect } from 'react';
import { memberAPI } from '../../services/api';
import MemberLayout from '../../components/layouts/MemberLayout';
import { useAuth } from '../../context/AuthContext';
import { FiUser, FiCalendar, FiClock, FiDollarSign, FiCheckCircle, FiXCircle } from 'react-icons/fi';

function MemberDashboard() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const { hasMembership, plan: contextPlan } = useAuth();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await memberAPI.getProfile();
      console.log('Member profile:', response.data);
      setProfile(response.data);
    } catch (error) {
      console.error('Failed to fetch profile', error);
    } finally {
      setLoading(false);
    }
  };

  // Get plan from profile or context
  const memberPlan = profile?.plan || contextPlan || 'N/A';
  const memberStatus = profile?.status || (hasMembership ? 'ACTIVE' : 'INACTIVE');

  // Format dates
  const startDate = profile?.startDate ? new Date(profile.startDate).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  }) : null;

  const endDate = profile?.endDate ? new Date(profile.endDate).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  }) : null;

  // Calculate days remaining
  const getDaysRemaining = () => {
    if (!profile?.endDate) return null;
    const today = new Date();
    const end = new Date(profile.endDate);
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const daysRemaining = getDaysRemaining();

  // Time slot labels
  const slotLabels = {
    MORNING_5_7: 'Morning 5:00 AM - 7:00 AM',
    MORNING_7_9: 'Morning 7:00 AM - 9:00 AM',
    MORNING_9_11: 'Morning 9:00 AM - 11:00 AM',
    EVENING_5_7: 'Evening 5:00 PM - 7:00 PM',
    EVENING_7_9: 'Evening 7:00 PM - 9:00 PM',
    EVENING_9_11: 'Evening 9:00 PM - 11:00 PM'
  };

  return (
    <MemberLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-8">Member Dashboard</h1>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Welcome Card */}
            <div className="lg:col-span-3 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-lg shadow-lg p-6 text-white">
              <h2 className="text-2xl font-bold mb-2">
                Welcome back, {profile?.userId?.name || 'Member'}!
              </h2>
              <p className="opacity-90">
                {memberStatus === 'ACTIVE'
                  ? 'Your fitness journey is progressing well. Keep up the great work!'
                  : 'Ready to start your fitness journey? Check out our membership plans.'}
              </p>
            </div>

            {/* Membership Status Card */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-3 rounded-full ${memberStatus === 'ACTIVE' ? 'bg-green-100' : 'bg-red-100'}`}>
                  {memberStatus === 'ACTIVE'
                    ? <FiCheckCircle className="text-green-600 text-xl" />
                    : <FiXCircle className="text-red-600 text-xl" />
                  }
                </div>
                <h3 className="text-lg font-semibold">Membership Status</h3>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Status:</span>
                  <span className={`font-semibold ${memberStatus === 'ACTIVE' ? 'text-green-600' : 'text-red-600'}`}>
                    {memberStatus}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Plan:</span>
                  <span className={`font-semibold ${memberPlan === 'PREMIUM' ? 'text-yellow-600' : 'text-blue-600'}`}>
                    {memberPlan}
                  </span>
                </div>

                {memberPlan === 'PREMIUM' && profile?.timeSlot && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Time Slot:</span>
                    <span className="font-semibold text-purple-600">
                      {slotLabels[profile.timeSlot] || profile.timeSlot}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Membership Details Card */}
            {(startDate || endDate) && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-full bg-blue-100">
                    <FiCalendar className="text-blue-600 text-xl" />
                  </div>
                  <h3 className="text-lg font-semibold">Membership Details</h3>
                </div>

                <div className="space-y-3">
                  {startDate && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Start Date:</span>
                      <span className="font-medium">{startDate}</span>
                    </div>
                  )}

                  {endDate && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">End Date:</span>
                      <span className="font-medium">{endDate}</span>
                    </div>
                  )}

                  {daysRemaining !== null && daysRemaining > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Days Remaining:</span>
                      <span className="font-semibold text-green-600">{daysRemaining} days</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Quick Actions Card */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-full bg-yellow-100">
                  <FiClock className="text-yellow-600 text-xl" />
                </div>
                <h3 className="text-lg font-semibold">Quick Actions</h3>
              </div>

              <div className="space-y-3">
                {!hasMembership && (
                  <button
                    onClick={() => window.location.href = '/plans'}
                    className="w-full bg-yellow-400 text-black py-2 px-4 rounded-lg font-semibold hover:bg-yellow-500 transition"
                  >
                    Purchase Membership
                  </button>
                )}

                {hasMembership && memberPlan === 'PREMIUM' && (
                  <>
                    <button
                      onClick={() => window.location.href = '/member/my-trainer'}
                      className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-600 transition"
                    >
                      View My Trainer
                    </button>
                  </>
                )}

                <button
                  onClick={() => window.location.href = '/member/billing-history'}
                  className="w-full bg-gray-500 text-white py-2 px-4 rounded-lg font-semibold hover:bg-gray-600 transition"
                >
                  Billing History
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MemberLayout>
  );
}

export default MemberDashboard;