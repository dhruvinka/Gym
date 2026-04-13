import { useState, useEffect } from 'react';
import MemberLayout from '../../components/layouts/MemberLayout';
import { memberAPI } from '../../services/api';
import { FiClock, FiCalendar, FiUser, FiDownload, FiAlertCircle } from 'react-icons/fi';
import { MdBreakfastDining, MdLunchDining, MdDinnerDining, MdLocalCafe, MdRestaurant } from 'react-icons/md';
import toast from 'react-hot-toast';

function MyDietPlan() {
  const [dietPlans, setDietPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [memberInfo, setMemberInfo] = useState(null);

  useEffect(() => {
    fetchDietPlans();
    fetchMemberInfo();
  }, []);

  const fetchDietPlans = async () => {
    setLoading(true);
    try {
      const response = await memberAPI.getDietPlan();
      setDietPlans(response.data);
      if (response.data.length > 0) {
        setSelectedWeek(response.data[0].week);
      }
    } catch (error) {
      console.error('Failed to fetch diet plans', error);
      if (error.response?.status === 403) {
        // Premium members only
      } else {
        toast.error('Failed to load diet plans');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchMemberInfo = async () => {
    try {
      const response = await memberAPI.getProfile();
      setMemberInfo(response.data);
    } catch (error) {
      console.error('Failed to fetch member info', error);
    }
  };

  const getCurrentPlan = () => {
    return dietPlans.find(plan => plan.week === selectedWeek) || dietPlans[0];
  };

  const mealTimeLabels = {
    breakfast: 'Breakfast',
    morningSnack: 'Morning Snack',
    lunch: 'Lunch',
    eveningSnack: 'Evening Snack',
    dinner: 'Dinner'
  };

  const mealIcons = {
    breakfast: <MdBreakfastDining />,
    morningSnack: <MdLocalCafe />,
    lunch: <MdLunchDining />,
    eveningSnack: <MdLocalCafe />,
    dinner: <MdDinnerDining />
  };

  if (loading) {
    return (
      <MemberLayout>
        <div className="p-6 flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
        </div>
      </MemberLayout>
    );
  }

  // Check if member is premium
  if (memberInfo?.plan !== 'PREMIUM') {
    return (
      <MemberLayout>
        <div className="p-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center max-w-2xl mx-auto">
            <FiAlertCircle className="text-6xl text-yellow-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Premium Feature</h2>
            <p className="text-gray-600 mb-6">
              Diet plans are only available for Premium members. Upgrade your membership to get personalized diet plans from your trainer.
            </p>
            <button
              onClick={() => window.location.href = '/plans'}
              className="bg-yellow-400 text-black px-6 py-3 rounded-lg font-semibold hover:bg-yellow-500 transition"
            >
              Upgrade to Premium
            </button>
          </div>
        </div>
      </MemberLayout>
    );
  }

  if (dietPlans.length === 0) {
    return (
      <MemberLayout>
        <div className="p-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center max-w-2xl mx-auto">
            <FiCalendar className="text-6xl text-blue-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">No Diet Plan Yet</h2>
            <p className="text-gray-600">
              Your trainer hasn't created a diet plan for you yet. Please check back later.
            </p>
          </div>
        </div>
      </MemberLayout>
    );
  }

  const currentPlan = getCurrentPlan();

  return (
    <MemberLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">My Diet Plan</h1>
          <div className="flex items-center gap-4">
            <select
              value={selectedWeek || ''}
              onChange={(e) => setSelectedWeek(parseInt(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
            >
              {dietPlans.map(plan => (
                <option key={plan.week} value={plan.week}>
                  Week {plan.week}
                </option>
              ))}
            </select>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 bg-yellow-400 text-black px-4 py-2 rounded-lg font-semibold hover:bg-yellow-500 transition"
            >
              <FiDownload /> Download Plan
            </button>
          </div>
        </div>

        {/* Trainer Info */}
        {currentPlan?.trainerId && (
          <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-lg p-6 mb-8 text-white">
            <div className="flex items-center gap-4">
              <div className="bg-white bg-opacity-20 p-4 rounded-full">
                <FiUser className="text-3xl" />
              </div>
              <div>
                <p className="text-sm opacity-90">Your Trainer</p>
                <h3 className="text-2xl font-bold">
                  {currentPlan.trainerId.userId?.name || 'Trainer'}
                </h3>
                <p className="text-sm opacity-90">{currentPlan.trainerId.specialization}</p>
              </div>
            </div>
          </div>
        )}

        {/* Week Info */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <FiCalendar className="text-yellow-400 text-2xl" />
            <h2 className="text-xl font-semibold">Week {currentPlan.week} Diet Plan</h2>
          </div>
          <p className="text-gray-600">
            Follow this diet plan consistently for best results. Adjust portions based on your hunger levels and activity.
          </p>
        </div>

        {/* Meals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentPlan.meals?.map((meal, index) => (
            <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="bg-yellow-400 p-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{mealIcons[meal.mealTime] || <MdRestaurant />}</span>
                  <h3 className="text-lg font-semibold text-black">
                    {mealTimeLabels[meal.mealTime] || meal.mealTime}
                  </h3>
                </div>
              </div>
              <div className="p-4">
                <ul className="space-y-2">
                  {meal.items?.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-gray-700">
                      <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                      {item}
                    </li>
                  ))}
                </ul>
                {meal.items?.length === 0 && (
                  <p className="text-gray-400 text-center py-2">No items specified</p>
                )}
              </div>
            </div>
          ))}
        </div>


      </div>
    </MemberLayout>
  );
}

export default MyDietPlan;