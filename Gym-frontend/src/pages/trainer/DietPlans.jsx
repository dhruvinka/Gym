import { useState, useEffect } from 'react';
import TrainerLayout from '../../components/layouts/TrainerLayout';
import { trainerAPI } from '../../services/api';
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiEye,
  FiCalendar,
  FiUser,
  FiXCircle,
  FiX
} from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

function DietPlans() {
  const [dietPlans, setDietPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [memberNames, setMemberNames] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchDietPlans();
  }, []);

  const fetchDietPlans = async () => {
    setLoading(true);
    try {
      const response = await trainerAPI.getDietPlans();
      console.log('Diet plans data:', response.data);
      setDietPlans(response.data);

      // Extract unique member IDs from all plans
      const memberIds = [...new Set(response.data.map(plan =>
        plan.memberId?._id
      ).filter(id => id))];

      console.log('Member IDs to fetch:', memberIds);

      // Fetch member names for all unique IDs
      if (memberIds.length > 0) {
        await fetchMemberNames(memberIds);
      }
    } catch (error) {
      console.error('Failed to fetch diet plans', error);
      toast.error('Failed to load diet plans');
    } finally {
      setLoading(false);
    }
  };

  const fetchMemberNames = async (memberIds) => {
    try {
      // Fetch all members from trainer API
      const response = await trainerAPI.getMembers();
      console.log('Members list:', response.data);

      // Create a map of member ID to name based on the actual data structure
      const nameMap = {};

      response.data.forEach(item => {
        // The member ID is directly in item._id
        const memberId = item._id;
        // The member name is in item.userId.name
        const memberName = item.userId?.name;

        if (memberId && memberName) {
          nameMap[memberId] = memberName;
          console.log(` Mapped ${memberId} -> ${memberName}`);
        }
      });

      console.log('Final name map:', nameMap);
      setMemberNames(nameMap);

      // For any IDs not found, we'll keep using ID-based names
    } catch (error) {
      console.error('Failed to fetch member names', error);
    }
  };

  // Get member name from cache or use ID-based name
  const getMemberName = (plan) => {
    if (!plan) return 'Unknown Member';

    const memberId = plan.memberId?._id;

    // If we have the name in cache
    if (memberId && memberNames[memberId]) {
      return memberNames[memberId];
    }

    // If we have memberId but no name in cache
    if (memberId) {
      return `Member (${memberId.slice(-6)})`;
    }

    return 'Unknown Member';
  };

  // Get time slot
  const getTimeSlot = (plan) => {
    if (!plan) return '';

    if (plan.memberId?.timeSlot) {
      return plan.memberId.timeSlot;
    }

    return '';
  };

  const handleDelete = async (planId, memberName) => {
    toast((t) => (
      <div className="p-2">
        <p className="font-semibold mb-3">Delete diet plan for {memberName}?</p>
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => {
              toast.dismiss(t.id);
              confirmDelete(planId, memberName);
            }}
            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Yes, Delete
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      </div>
    ), {
      duration: 5000,
      position: 'top-center',
    });
  };

  const confirmDelete = async (planId, memberName) => {
    setDeleting(true);
    const loadingToast = toast.loading(`Deleting diet plan for ${memberName}...`);

    try {
      await trainerAPI.deleteDietPlan(planId);
      toast.dismiss(loadingToast);
      toast.success(`Diet plan for ${memberName} deleted successfully!`, {
        icon: <FiTrash2 className="text-red-500" />,
        duration: 3000
      });
      fetchDietPlans();
    } catch (error) {
      console.error('Failed to delete diet plan', error);
      toast.dismiss(loadingToast);
      toast.error(error.response?.data?.message || 'Failed to delete diet plan', {
        icon: <FiXCircle className="text-red-500" />,
        duration: 3000
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleViewDetails = (plan) => {
    setSelectedPlan(plan);
    setShowDetails(true);
  };

  const handleEdit = (plan) => {
    navigate('/trainer/create-diet-plan', {
      state: {
        editMode: true,
        planData: plan,
        planId: plan._id
      }
    });
  };

  const handleCreateNew = () => {
    navigate('/trainer/create-diet-plan');
  };

  const mealTimeLabels = {
    breakfast: 'Breakfast',
    morningSnack: 'Morning Snack',
    lunch: 'Lunch',
    eveningSnack: 'Evening Snack',
    dinner: 'Dinner'
  };

  const slotLabels = {
    MORNING_5_7: 'Morning 5-7 AM',
    MORNING_7_9: 'Morning 7-9 AM',
    MORNING_9_11: 'Morning 9-11 AM',
    EVENING_5_7: 'Evening 5-7 PM',
    EVENING_7_9: 'Evening 7-9 PM',
    EVENING_9_11: 'Evening 9-11 PM'
  };

  if (loading) {
    return (
      <TrainerLayout>
        <div className="p-6 flex flex-col justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mb-4"></div>
          <p className="text-gray-600">Loading your diet plans...</p>
        </div>
      </TrainerLayout>
    );
  }

  return (
    <TrainerLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Diet Plans</h1>
            <p className="text-gray-600 mt-1">
              You have created {dietPlans.length} diet plan{dietPlans.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={handleCreateNew}
            className="flex items-center gap-2 bg-yellow-400 text-black px-4 py-2 rounded-lg font-semibold hover:bg-yellow-500 transition"
          >
            <FiPlus /> Create New Plan
          </button>
        </div>

        {dietPlans.length === 0 ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-12 text-center">
            <FiCalendar className="text-6xl text-yellow-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">No Diet Plans Created</h2>
            <p className="text-gray-600 mb-6">
              You haven't created any diet plans yet. Click the button below to create your first diet plan.
            </p>
            <button
              onClick={handleCreateNew}
              className="inline-block bg-yellow-400 text-black px-6 py-3 rounded-lg font-semibold hover:bg-yellow-500 transition"
            >
              Create First Diet Plan
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dietPlans.map((plan) => {
              const memberName = getMemberName(plan);
              const timeSlot = getTimeSlot(plan);
              const slotLabel = slotLabels[timeSlot] || timeSlot;

              return (
                <div key={plan._id} className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition">
                  <div className="bg-yellow-400 p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold text-black">
                          Week {plan.week} Plan
                        </h3>
                        <p className="text-sm text-black opacity-75">
                          {new Date(plan.createdAt).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                      <span className="bg-black text-yellow-400 text-xs px-2 py-1 rounded-full">
                        {plan.meals?.length || 0} Meals
                      </span>
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-200">
                      <div className="bg-gray-100 p-2 rounded-full">
                        <FiUser className="text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">{memberName}</p>
                        {slotLabel && (
                          <p className="text-xs text-gray-400 mt-1">{slotLabel}</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2 mb-4 min-h-[100px]">
                      {plan.meals?.slice(0, 3).map((meal, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-sm">
                          <span className="text-yellow-400 font-medium w-20">
                            {mealTimeLabels[meal.mealTime]?.slice(0, 8)}:
                          </span>
                          <span className="text-gray-600 truncate flex-1">
                            {meal.items?.slice(0, 2).join(', ')}
                            {meal.items?.length > 2 && '...'}
                          </span>
                        </div>
                      ))}
                      {plan.meals?.length > 3 && (
                        <p className="text-xs text-gray-400">
                          +{plan.meals.length - 3} more meals
                        </p>
                      )}
                    </div>

                    <div className="flex justify-end gap-2 pt-3 border-t border-gray-200">
                      <button
                        onClick={() => handleViewDetails(plan)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="View Details"
                      >
                        <FiEye size={18} />
                      </button>

                      <button
                        onClick={() => handleEdit(plan)}
                        className="p-2 text-yellow-400 hover:bg-yellow-50 rounded-lg transition"
                        title="Edit Plan"
                      >
                        <FiEdit2 size={18} />
                      </button>

                      <button
                        onClick={() => handleDelete(plan._id, memberName)}
                        disabled={deleting}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                        title="Delete Plan"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {showDetails && selectedPlan && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Diet Plan Details</h2>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FiX size={24} />
                </button>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Member</p>
                    <p className="font-medium">{getMemberName(selectedPlan)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Week</p>
                    <p className="font-medium">Week {selectedPlan.week}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Created</p>
                    <p className="font-medium">
                      {new Date(selectedPlan.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Meals</p>
                    <p className="font-medium">{selectedPlan.meals?.length || 0}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Meal Plan</h3>
                {selectedPlan.meals?.map((meal, idx) => (
                  <div key={idx} className="border rounded-lg p-4 hover:shadow-md transition">
                    <h4 className="font-semibold text-yellow-400 mb-2">
                      {mealTimeLabels[meal.mealTime] || meal.mealTime}
                    </h4>
                    <ul className="list-disc list-inside space-y-1">
                      {meal.items?.map((item, i) => (
                        <li key={i} className="text-gray-700 text-sm">{item}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-3 mt-8">
                <button
                  onClick={() => {
                    setShowDetails(false);
                    handleEdit(selectedPlan);
                  }}
                  className="px-4 py-2 bg-yellow-400 text-black rounded-lg font-semibold hover:bg-yellow-500 transition"
                >
                  Edit Plan
                </button>
                <button
                  onClick={() => setShowDetails(false)}
                  className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </TrainerLayout>
  );
}

export default DietPlans;