import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import TrainerLayout from '../../components/layouts/TrainerLayout';
import { trainerAPI } from '../../services/api';
import { FiPlus, FiTrash2, FiSave, FiArrowLeft } from 'react-icons/fi';
import { MdBreakfastDining, MdLunchDining, MdDinnerDining, MdLocalCafe, MdRestaurant } from 'react-icons/md';
import toast from 'react-hot-toast';

function CreateDietPlan() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get parameters from URL or state
  const memberId = searchParams.get('memberId');
  const editId = searchParams.get('edit');
  
  // Check if we have state from navigation
  const editMode = location.state?.editMode || !!editId;
  const planData = location.state?.planData;
  const planId = location.state?.planId || editId;

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [members, setMembers] = useState([]);
  const [formData, setFormData] = useState({
    memberId: memberId || '',
    week: 1,
    meals: [
      { mealTime: 'breakfast', items: [''] },
      { mealTime: 'morningSnack', items: [''] },
      { mealTime: 'lunch', items: [''] },
      { mealTime: 'eveningSnack', items: [''] },
      { mealTime: 'dinner', items: [''] }
    ]
  });

  useEffect(() => {
    if (editMode && planData) {
      // We have data from state - use it directly
      console.log('Loading plan from state:', planData);
      loadPlanData(planData);
      setFetching(false);
    } else if (editMode && !planData) {
      // No state data, but in edit mode - should not happen with our approach
      toast.error('No plan data available');
      navigate('/trainer/diet-plans');
    } else {
      // Create mode - fetch members
      fetchMembers();
    }
  }, [editMode, planData]);

  const loadPlanData = (plan) => {
    // Ensure meals array exists and has the right structure
    const meals = plan.meals && plan.meals.length > 0 ? plan.meals : [
      { mealTime: 'breakfast', items: [''] },
      { mealTime: 'morningSnack', items: [''] },
      { mealTime: 'lunch', items: [''] },
      { mealTime: 'eveningSnack', items: [''] },
      { mealTime: 'dinner', items: [''] }
    ];
    
    setFormData({
      memberId: plan.memberId?._id || plan.memberId,
      week: plan.week || 1,
      meals: meals
    });
  };

  const fetchMembers = async () => {
    try {
      const response = await trainerAPI.getMembers();
      setMembers(response.data);
    } catch (error) {
      console.error('Failed to fetch members', error);
      toast.error('Failed to load members');
    }
  };

  const handleMemberChange = (e) => {
    setFormData({
      ...formData,
      memberId: e.target.value
    });
  };

  const handleWeekChange = (e) => {
    setFormData({
      ...formData,
      week: parseInt(e.target.value)
    });
  };

  const handleMealItemChange = (mealIndex, itemIndex, value) => {
    const updatedMeals = [...formData.meals];
    updatedMeals[mealIndex].items[itemIndex] = value;
    setFormData({
      ...formData,
      meals: updatedMeals
    });
  };

  const addMealItem = (mealIndex) => {
    const updatedMeals = [...formData.meals];
    updatedMeals[mealIndex].items.push('');
    setFormData({
      ...formData,
      meals: updatedMeals
    });
  };

  const removeMealItem = (mealIndex, itemIndex) => {
    const updatedMeals = [...formData.meals];
    updatedMeals[mealIndex].items.splice(itemIndex, 1);
    setFormData({
      ...formData,
      meals: updatedMeals
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!editMode && !formData.memberId) {
      toast.error('Please select a member');
      return;
    }

    // Validate that at least one meal has items
    const hasItems = formData.meals.some(meal => meal.items.some(item => item.trim() !== ''));
    if (!hasItems) {
      toast.error('Please add at least one food item');
      return;
    }

    // Clean up empty items
    const cleanedMeals = formData.meals.map(meal => ({
      ...meal,
      items: meal.items.filter(item => item.trim() !== '')
    })).filter(meal => meal.items.length > 0);

    setLoading(true);
    try {
      if (editMode) {
        // Update existing diet plan
        await trainerAPI.updateDietPlan(planId, {
          week: formData.week,
          meals: cleanedMeals
        });
        toast.success('Diet plan updated successfully!');
      } else {
        // Create new diet plan
        await trainerAPI.createDietPlan({
          memberId: formData.memberId,
          week: formData.week,
          meals: cleanedMeals
        });
        toast.success('Diet plan created successfully!');
      }
      navigate('/trainer/diet-plans');
    } catch (error) {
      console.error('Failed to save diet plan', error);
      toast.error(error.response?.data?.message || 'Failed to save diet plan');
    } finally {
      setLoading(false);
    }
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

  const slotLabels = {
    MORNING_5_7: 'Morning 5-7 AM',
    MORNING_7_9: 'Morning 7-9 AM',
    MORNING_9_11: 'Morning 9-11 AM',
    EVENING_5_7: 'Evening 5-7 PM',
    EVENING_7_9: 'Evening 7-9 PM',
    EVENING_9_11: 'Evening 9-11 PM'
  };

  const getMemberName = (member) => {
    if (!member) return 'Unknown Member';
    if (member.userId?.name) return member.userId.name;
    return 'Unknown Member';
  };

  const getMemberEmail = (member) => {
    if (!member) return '';
    if (member.userId?.email) return member.userId.email;
    return '';
  };

  const getTimeSlotLabel = (member) => {
    if (!member || !member.timeSlot) return '';
    return slotLabels[member.timeSlot] || member.timeSlot;
  };

  if (fetching) {
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
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <FiArrowLeft className="text-xl" />
          </button>
          <h1 className="text-3xl font-bold">
            {editMode ? 'Edit Diet Plan' : 'Create Diet Plan'}
          </h1>
          {editMode && (
            <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
              Editing Mode
            </span>
          )}
        </div>

        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          {/* Member Selection - Disabled in edit mode */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">
              {editMode ? 'Member Information' : 'Select Member'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Member {!editMode && '*'}
                </label>
                {editMode ? (
                  <input
                    type="text"
                    value="Member selected (cannot change)"
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
                  />
                ) : (
                  <select
                    value={formData.memberId}
                    onChange={handleMemberChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  >
                    <option value="">Select a member</option>
                    {members.map((member) => {
                      const memberName = getMemberName(member);
                      const memberEmail = getMemberEmail(member);
                      const timeSlot = getTimeSlotLabel(member);
                      
                      return (
                        <option key={member._id} value={member._id}>
                          {memberName} {memberEmail ? `(${memberEmail})` : ''} 
                          {timeSlot ? ` - ${timeSlot}` : ''}
                        </option>
                      );
                    })}
                  </select>
                )}
                {!editMode && members.length === 0 && (
                  <p className="text-sm text-red-500 mt-2">No members available</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Week Number
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.week}
                  onChange={handleWeekChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>
            </div>
          </div>

          {/* Meals */}
          <div className="space-y-6">
            {formData.meals.map((meal, mealIndex) => (
              <div key={meal.mealTime || mealIndex} className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">{mealIcons[meal.mealTime] || <MdRestaurant />}</span>
                  <h3 className="text-lg font-semibold">
                    {mealTimeLabels[meal.mealTime] || meal.mealTime}
                  </h3>
                </div>

                <div className="space-y-3">
                  {meal.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex gap-2">
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => handleMealItemChange(mealIndex, itemIndex, e.target.value)}
                        placeholder={`Enter food item ${itemIndex + 1}`}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      />
                      {meal.items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeMealItem(mealIndex, itemIndex)}
                          className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        >
                          <FiTrash2 />
                        </button>
                      )}
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => addMealItem(mealIndex)}
                    className="flex items-center gap-2 text-yellow-400 hover:text-yellow-500 text-sm font-medium mt-2"
                  >
                    <FiPlus /> Add Item
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Submit Button */}
          <div className="mt-8 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-yellow-400 text-black px-6 py-3 rounded-lg font-semibold hover:bg-yellow-500 transition disabled:opacity-50"
            >
              <FiSave />
              {loading 
                ? (editMode ? 'Updating...' : 'Creating...') 
                : (editMode ? 'Update Diet Plan' : 'Create Diet Plan')}
            </button>
          </div>
        </form>
      </div>
    </TrainerLayout>
  );
}

export default CreateDietPlan;