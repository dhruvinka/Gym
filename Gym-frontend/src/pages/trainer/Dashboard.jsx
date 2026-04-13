import { useState, useEffect } from 'react';
import TrainerLayout from '../../components/layouts/TrainerLayout';
import { trainerAPI } from '../../services/api';
import { 
  FiUsers, 
  FiCalendar, 
  FiClipboard, 
  FiClock,
  FiTrendingUp
} from 'react-icons/fi';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

function TrainerDashboard() {
  const [stats, setStats] = useState({
    totalMembers: 0,
    todaySessions: 0,
    pendingDietPlans: 0
  });
  const [recentMembers, setRecentMembers] = useState([]);
  const [todaySchedule, setTodaySchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch profile
      const profileRes = await trainerAPI.getProfile();
      setProfile(profileRes.data);

      // Fetch members
      const membersRes = await trainerAPI.getMembers();
      const membersData = membersRes.data;
      
      // Fetch diet plans to check pending status
      const dietPlansRes = await trainerAPI.getDietPlans();
      const dietPlans = dietPlansRes.data;
      
      // Create a Set of member IDs that have diet plans
      const membersWithDietPlans = new Set(
        dietPlans.map(plan => plan.memberId?._id || plan.memberId)
      );
      
      // Calculate pending diet plans (members without diet plans)
      const pendingCount = membersData.filter(m => !membersWithDietPlans.has(m._id)).length;
      
      setRecentMembers(membersData.slice(0, 5));
      
      const totalMembers = membersData.length;
      setStats({
        totalMembers,
        todaySessions: totalMembers,
        pendingDietPlans: pendingCount
      });

      // Set today's schedule (members by time slot)
      setTodaySchedule(membersData);

    } catch (error) {
      console.error('Failed to fetch dashboard data', error);
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  // Slot labels
  const slotLabels = {
    MORNING_5_7: '5-7 AM',
    MORNING_7_9: '7-9 AM',
    MORNING_9_11: '9-11 AM',
    EVENING_5_7: '5-7 PM',
    EVENING_7_9: '7-9 PM',
    EVENING_9_11: '9-11 PM'
  };

  // Helper function to get member name safely
  const getMemberName = (member) => {
    return member?.userId?.name || member?.name || 'Member';
  };

  // Helper function to check if member has diet plan
  const hasDietPlan = async (memberId) => {
    try {
      const dietPlans = await trainerAPI.getDietPlans();
      return dietPlans.data.some(plan => 
        (plan.memberId?._id === memberId) || (plan.memberId === memberId)
      );
    } catch {
      return false;
    }
  };

  if (loading) {
    return (
      <TrainerLayout>
        <div className="p-6 flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
        </div>
      </TrainerLayout>
    );
  }

  return (
    <TrainerLayout>
      {/* Main container with fixed height and scrolling */}
      <div className="h-screen overflow-hidden">
        {/* Scrollable content area */}
        <div className="h-full  pb-20">
          <div className="p-6">
            {/* Welcome Header */}
            <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-lg shadow-lg p-6 mb-8 text-white">
              <h1 className="text-3xl font-bold mb-2">
                Welcome back, {profile?.userId?.name || 'Trainer'}! 
              </h1>
              <p className="opacity-90">
                Here's what's happening with your trainees today.
              </p>
            </div>

            {/* Stats Cards - Responsive grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-lg p-4 md:p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 md:p-3 bg-blue-100 rounded-full">
                    <FiUsers className="text-blue-600 text-lg md:text-xl" />
                  </div>
                  <span className="text-2xl md:text-3xl font-bold text-blue-600">{stats.totalMembers}</span>
                </div>
                <p className="text-sm md:text-base text-gray-600">Total Members</p>
                <p className="text-xs text-gray-400 mt-1">Assigned to you</p>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-4 md:p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 md:p-3 bg-green-100 rounded-full">
                    <FiCalendar className="text-green-600 text-lg md:text-xl" />
                  </div>
                  <span className="text-2xl md:text-3xl font-bold text-green-600">{stats.todaySessions}</span>
                </div>
                <p className="text-sm md:text-base text-gray-600">Today's Sessions</p>
                <p className="text-xs text-gray-400 mt-1">Scheduled for today</p>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-4 md:p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 md:p-3 bg-yellow-100 rounded-full">
                    <FiClipboard className="text-yellow-600 text-lg md:text-xl" />
                  </div>
                  <span className="text-2xl md:text-3xl font-bold text-yellow-600">{stats.pendingDietPlans}</span>
                </div>
                <p className="text-sm md:text-base text-gray-600">Pending Diet Plans</p>
                <p className="text-xs text-gray-400 mt-1">Need to create</p>
              </div>
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Today's Schedule - Takes 2/3 of the space */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <FiClock className="text-yellow-400" />
                    Today's Schedule by Time Slot
                  </h2>

                  <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                    {Object.entries(slotLabels).map(([slot, label]) => {
                      const membersInSlot = todaySchedule.filter(m => m?.timeSlot === slot);
                      
                      return (
                        <div key={slot} className="border rounded-lg p-4">
                          <div className="flex justify-between items-center mb-2">
                            <h3 className="font-semibold text-gray-800">{label}</h3>
                            <span className="text-sm bg-yellow-100 text-yellow-600 px-3 py-1 rounded-full">
                              {membersInSlot.length} members
                            </span>
                          </div>
                          
                          {membersInSlot.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                              {membersInSlot.map((member, idx) => (
                                <div key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                  {getMemberName(member)}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-400 italic">No members in this slot</p>
                          )}
                        </div>
                      );
                    })}
                  </div>

                </div>
              </div>

              {/* Recent Members & Quick Actions - Takes 1/3 of the space */}
              <div className="lg:col-span-1">
                {/* Recent Members - Scrollable list */}
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <FiUsers className="text-yellow-400" />
                    Recent Members
                  </h2>

                  <div className="max-h-64 overflow-y-auto pr-2">
                    {recentMembers.length > 0 ? (
                      <div className="space-y-3">
                        {recentMembers.map((member, idx) => (
                          <div key={idx} className="flex items-center justify-between border-b pb-2 last:border-0">
                            <div>
                              <p className="font-medium text-gray-800">{getMemberName(member)}</p>
                              <p className="text-xs text-gray-500">{slotLabels[member?.timeSlot] || 'No slot'}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-400 text-center py-4">No members assigned yet</p>
                    )}
                  </div>

                  <Link 
                    to="/trainer/members"
                    className="block text-center mt-4 text-yellow-400 hover:text-yellow-500 text-sm font-medium"
                  >
                    View All Members →
                  </Link>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
                  
                  <div className="space-y-3">
                    <Link
                      to="/trainer/diet-plans"
                      className="block w-full bg-yellow-400 text-black text-center py-3 rounded-lg font-semibold hover:bg-yellow-500 transition"
                    >
                      Create Diet Plan
                    </Link>
                    
                    <Link
                      to="/trainer/members"
                      className="block w-full bg-gray-500 text-white text-center py-3 rounded-lg font-semibold hover:bg-gray-600 transition"
                    >
                      View All Members
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TrainerLayout>
  );
}

export default TrainerDashboard;