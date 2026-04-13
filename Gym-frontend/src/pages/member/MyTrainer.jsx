import { useState, useEffect } from 'react';
import MemberLayout from '../../components/layouts/MemberLayout';
import { memberAPI } from '../../services/api';
import { 
  FiUser, 
  FiMail, 
  FiPhone, 
  FiAward, 
  FiClock, 
  FiCalendar,
  FiStar,
  FiMessageCircle,
  FiAlertCircle,
  FiZap
} from 'react-icons/fi';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

function MyTrainer() {
  const [trainerData, setTrainerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [memberInfo, setMemberInfo] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch member profile first
      const profileRes = await memberAPI.getProfile();
      console.log('Member profile:', profileRes.data);
      setMemberInfo(profileRes.data);

      // Then fetch trainer data
      const trainerRes = await memberAPI.getMyTrainer();
      console.log('Trainer data:', trainerRes.data);
      setTrainerData(trainerRes.data);
      
    } catch (error) {
      console.error('Failed to fetch trainer data:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      setError({
        status: error.response?.status,
        message: error.response?.data?.message || error.message
      });
      
      // Show specific error messages
      if (error.response?.status === 403) {
        toast.error('Trainer assignment is only for PREMIUM members');
      } else if (error.response?.status === 404) {
        toast.error(error.response?.data?.message || 'No trainer assigned yet');
      } else {
        toast.error('Failed to load trainer information');
      }
    } finally {
      setLoading(false);
    }
  };

  // Time slot labels
  const slotLabels = {
    MORNING_5_7: 'Morning 5:00 AM - 7:00 AM',
    MORNING_7_9: 'Morning 7:00 AM - 9:00 AM',
    MORNING_9_11: 'Morning 9:00 AM - 11:00 AM',
    EVENING_5_7: 'Evening 5:00 PM - 7:00 PM',
    EVENING_7_9: 'Evening 7:00 PM - 9:00 PM',
    EVENING_9_11: 'Evening 9:00 PM - 11:00 PM'
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

  // Show error state
  if (error) {
    return (
      <MemberLayout>
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center max-w-2xl mx-auto">
            <FiAlertCircle className="text-6xl text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {error.status === 403 ? 'Premium Feature' : 'Unable to Load Trainer'}
            </h2>
            <p className="text-gray-600 mb-4">
              {error.message}
            </p>
            {error.status === 403 && (
              <Link
                to="/plans"
                className="inline-block bg-yellow-400 text-black px-6 py-3 rounded-lg font-semibold hover:bg-yellow-500 transition"
              >
                Upgrade to Premium
              </Link>
            )}
            {error.status === 404 && (
              <p className="text-sm text-gray-500">
                Please contact the admin to get a trainer assigned.
              </p>
            )}
            <button
              onClick={fetchData}
              className="mt-4 text-yellow-400 hover:text-yellow-500 text-sm font-medium"
            >
              Try Again
            </button>
          </div>
        </div>
      </MemberLayout>
    );
  }

  // Check if member has trainer (premium with assigned trainer)
  if (memberInfo?.plan !== 'PREMIUM' || !trainerData?.trainer) {
    return (
      <MemberLayout>
        <div className="p-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center max-w-2xl mx-auto">
            <FiAlertCircle className="text-6xl text-yellow-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">No Trainer Assigned</h2>
            <p className="text-gray-600 mb-4">
              {memberInfo?.plan !== 'PREMIUM' 
                ? 'Personal trainers are only available for Premium members.'
                : 'You don\'t have a trainer assigned yet.'}
            </p>
            {memberInfo?.plan !== 'PREMIUM' ? (
              <Link
                to="/plans"
                className="bg-yellow-400 text-black px-6 py-3 rounded-lg font-semibold hover:bg-yellow-500 transition"
              >
                Upgrade to Premium
              </Link>
            ) : (
              <p className="text-sm text-gray-500">
                Please contact the admin to get a trainer assigned.
              </p>
            )}
          </div>
        </div>
      </MemberLayout>
    );
  }

  const { trainer, timeSlot, timeSlotLabel, assignedSince } = trainerData;

  return (
    <MemberLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-8">My Trainer</h1>

        {/* Trainer Profile Header */}
        <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-lg shadow-lg p-8 mb-8 text-white">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="bg-white bg-opacity-20 p-6 rounded-full">
              <FiUser className="text-5xl" />
            </div>
            <div className="text-center md:text-left">
              <p className="text-sm opacity-90">Your Personal Trainer</p>
              <h2 className="text-3xl font-bold mb-2">{trainer.name}</h2>
              <p className="text-xl opacity-90">{trainer.specialization}</p>
            </div>
          </div>
        </div>

        {/* Trainer Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Personal Info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Trainer Information</h3>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <FiAward className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Experience</p>
                    <p className="font-medium">{trainer.experience} years</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <FiStar className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Rating</p>
                    <p className="font-medium flex items-center gap-1">4.8 <FiStar className="text-yellow-400 fill-current" /> (124 reviews)</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <FiCalendar className="text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Assigned Since</p>
                    <p className="font-medium">
                      {new Date(assignedSince).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Schedule & Contact */}
          <div className="lg:col-span-2">
            {/* Time Slot Card */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FiClock className="text-yellow-400" />
                Your Training Schedule
              </h3>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Your Assigned Time Slot</p>
                <p className="text-xl font-bold text-yellow-600">{timeSlotLabel || slotLabels[timeSlot]}</p>
                <p className="text-sm text-gray-500 mt-2">
                  This time slot is fixed for the entire membership duration
                </p>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4 hover:shadow-md transition">
                  <div className="flex items-center gap-3 mb-2">
                    <FiMail className="text-yellow-400" />
                    <span className="font-medium">Email</span>
                  </div>
                  <p className="text-sm text-gray-600">{trainer.email || 'trainer@gym.com'}</p>
                  <button className="text-xs text-yellow-400 mt-2 hover:text-yellow-500">
                    Send Message
                  </button>
                </div>

                <div className="border rounded-lg p-4 hover:shadow-md transition">
                  <div className="flex items-center gap-3 mb-2">
                    <FiPhone className="text-yellow-400" />
                    <span className="font-medium">Phone</span>
                  </div>
                  <p className="text-sm text-gray-600">{trainer.phone || '+91 98765 43210'}</p>
                  <button className="text-xs text-yellow-400 mt-2 hover:text-yellow-500">
                    Call Now
                  </button>
                </div>
              </div>

              {/* Communication Preferences */}
              <div className="mt-6 bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium mb-2">Preferred Communication</h4>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input type="radio" name="comm" className="text-yellow-400" defaultChecked />
                    <span className="text-sm">Email</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" name="comm" className="text-yellow-400" />
                    <span className="text-sm">WhatsApp</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" name="comm" className="text-yellow-400" />
                    <span className="text-sm">SMS</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center justify-center gap-2 bg-yellow-400 text-black p-4 rounded-lg font-semibold hover:bg-yellow-500 transition">
            <FiMessageCircle /> Message Trainer
          </button>
          <button className="flex items-center justify-center gap-2 bg-blue-500 text-white p-4 rounded-lg font-semibold hover:bg-blue-600 transition">
            <FiCalendar /> Schedule Session
          </button>
          <button className="flex items-center justify-center gap-2 bg-green-500 text-white p-4 rounded-lg font-semibold hover:bg-green-600 transition">
            <FiClock /> View Availability
          </button>
        </div>

        {/* Tips */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <span className="font-semibold inline-flex items-center gap-1"><FiZap className="text-yellow-500 fill-current" /> Pro Tip:</span> Communicate regularly with your trainer for the best results. 
            Share your progress, ask questions, and provide feedback after each session.
          </p>
        </div>
      </div>
    </MemberLayout>
  );
}

export default MyTrainer;