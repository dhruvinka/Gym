import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import TrainerLayout from '../../components/layouts/TrainerLayout';
import { trainerAPI } from '../../services/api';
import { FiPlus, FiTrash2, FiSave, FiArrowLeft } from 'react-icons/fi';
import { MdBreakfastDining, MdLunchDining, MdDinnerDining, MdLocalCafe, MdRestaurant } from 'react-icons/md';
import toast from 'react-hot-toast';

function EditDietPlan() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState({
    memberId: '',
    week: 1,
    meals: []
  });

  useEffect(() => {
    fetchDietPlan();
  }, [id]);

  const fetchDietPlan = async () => {
    setFetching(true);
    try {
      // You'll need to add this endpoint to your API
      const response = await trainerAPI.getDietPlanById(id);
      const plan = response.data;
      
      setFormData({
        memberId: plan.memberId,
        week: plan.week,
        meals: plan.meals || []
      });
    } catch (error) {
      console.error('Failed to fetch diet plan', error);
      toast.error('Failed to load diet plan');
      navigate('/trainer/diet-plans');
    } finally {
      setFetching(false);
    }
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
      // You'll need to add this endpoint to your API
      await trainerAPI.updateDietPlan(id, {
        week: formData.week,
        meals: cleanedMeals
      });
      
      toast.success('Diet plan updated successfully!');
      navigate('/trainer/diet-plans');
    } catch (error) {
      console.error('Failed to update diet plan', error);
      toast.error(error.response?.data?.message || 'Failed to update diet plan');
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
          <h1 className="text-3xl font-bold">Edit Diet Plan</h1>
        </div>

        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          {/* Week Number */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Plan Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Week Number
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.week}
                  onChange={(e) => setFormData({...formData, week: parseInt(e.target.value)})}
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
              {loading ? 'Updating...' : 'Update Diet Plan'}
            </button>
          </div>
        </form>
      </div>
    </TrainerLayout>
  );
}

export default EditDietPlan;