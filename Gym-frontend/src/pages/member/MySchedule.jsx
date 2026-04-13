import { useState, useEffect } from 'react';
import MemberLayout from '../../components/layouts/MemberLayout';
import { memberAPI } from '../../services/api';
import { FiCalendar, FiClock, FiUser, FiMapPin, FiAlertCircle, FiSunrise, FiSun, FiSunset, FiMoon } from 'react-icons/fi';
import toast from 'react-hot-toast';

function MySchedule() {
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [memberInfo, setMemberInfo] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [scheduleRes, profileRes] = await Promise.all([
        memberAPI.getMySchedule(),
        memberAPI.getProfile()
      ]);
      setSchedule(scheduleRes.data);
      setMemberInfo(profileRes.data);
    } catch (error) {
      console.error('Failed to fetch schedule', error);
      toast.error('Failed to load schedule');
    } finally {
      setLoading(false);
    }
  };

  // Time slot labels and details
  const slotDetails = {
    MORNING_5_7: {
      label: 'Morning 5:00 AM - 7:00 AM',
      icon: <FiSunrise />,
      time: '5:00 AM - 7:00 AM',
      intensity: 'Moderate'
    },
    MORNING_7_9: {
      label: 'Morning 7:00 AM - 9:00 AM',
      icon: <FiSun />,
      time: '7:00 AM - 9:00 AM',
      intensity: 'High'
    },
    MORNING_9_11: {
      label: 'Morning 9:00 AM - 11:00 AM',
      icon: <FiSun />,
      time: '9:00 AM - 11:00 AM',
      intensity: 'Moderate'
    },
    EVENING_5_7: {
      label: 'Evening 5:00 PM - 7:00 PM',
      icon: <FiSunset />,
      time: '5:00 PM - 7:00 PM',
      intensity: 'High'
    },
    EVENING_7_9: {
      label: 'Evening 7:00 PM - 9:00 PM',
      icon: <FiMoon />,
      time: '7:00 PM - 9:00 PM',
      intensity: 'Moderate'
    },
    EVENING_9_11: {
      label: 'Evening 9:00 PM - 11:00 PM',
      icon: <FiMoon />,
      time: '9:00 PM - 11:00 PM',
      intensity: 'Low'
    }
  };

  // Days of week
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  if (loading) {
    return (
      <MemberLayout>
        <div className="p-6 flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
        </div>
      </MemberLayout>
    );
  }

  // Check if member has schedule (premium with trainer)
  if (memberInfo?.plan !== 'PREMIUM' || !schedule?.trainer) {
    return (
      <MemberLayout>
        <div className="p-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center max-w-2xl mx-auto">
            <FiAlertCircle className="text-6xl text-yellow-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">No Schedule Available</h2>
            <p className="text-gray-600 mb-4">
              {memberInfo?.plan !== 'PREMIUM' 
                ? 'Schedules are only available for Premium members with assigned trainers.'
                : 'You don\'t have a trainer assigned yet.'}
            </p>
            {memberInfo?.plan !== 'PREMIUM' ? (
              <button
                onClick={() => window.location.href = '/plans'}
                className="bg-yellow-400 text-black px-6 py-3 rounded-lg font-semibold hover:bg-yellow-500 transition"
              >
                Upgrade to Premium
              </button>
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

  const currentSlot = slotDetails[schedule.timeSlot] || {
    label: schedule.timeSlot,
    icon: <FiClock />,
    time: 'Flexible',
    intensity: 'Moderate'
  };

  return (
    <MemberLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-8">My Schedule</h1>

        {/* Trainer Info Card */}
        <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-lg shadow-lg p-6 mb-8 text-white">
          <div className="flex items-center gap-4">
            <div className="bg-white bg-opacity-20 p-4 rounded-full">
              <FiUser className="text-3xl" />
            </div>
            <div className="flex-1">
              <p className="text-sm opacity-90">Your Personal Trainer</p>
              <h2 className="text-2xl font-bold">{schedule.trainer?.name || 'Trainer'}</h2>
              <p className="text-sm opacity-90">{schedule.trainer?.specialization || 'Fitness Expert'}</p>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-90">Experience</p>
              <p className="text-xl font-bold">{schedule.trainer?.experience || '5'}+ years</p>
            </div>
          </div>
        </div>

        {/* Time Slot Card */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <FiClock className="text-yellow-400" />
            Your Assigned Time Slot
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <span className="text-5xl mb-2 block">{currentSlot.icon}</span>
              <h3 className="text-lg font-semibold text-gray-800">{currentSlot.label}</h3>
              <p className="text-yellow-400 font-medium mt-2">{currentSlot.time}</p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-bold">✓</span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Workout Intensity</p>
                  <p className="font-medium">{currentSlot.intensity}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <FiCalendar className="text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Membership Period</p>
                  <p className="font-medium">
                    {new Date(schedule.startDate).toLocaleDateString('en-IN')} - {new Date(schedule.endDate).toLocaleDateString('en-IN')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Weekly Schedule */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <FiCalendar className="text-yellow-400" />
            Weekly Training Schedule
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {daysOfWeek.map((day, index) => (
              <div 
                key={day} 
                className={`border rounded-lg p-4 ${
                  index < 5 ? 'bg-white' : 'bg-yellow-50'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-800">{day}</h3>
                  {index < 5 ? (
                    <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">
                      Active
                    </span>
                  ) : (
                    <span className="text-xs bg-yellow-100 text-yellow-600 px-2 py-1 rounded-full">
                      Weekend
                    </span>
                  )}
                </div>
                
                {index < 5 ? (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      <FiClock className="text-yellow-400" size={12} />
                      {currentSlot.time}
                    </p>
                    <p className="text-xs text-gray-500">
                      With {schedule.trainer?.name?.split(' ')[0] || 'Trainer'}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">Rest Day / Self Practice</p>
                )}
              </div>
            ))}
          </div>


        </div>
      </div>
    </MemberLayout>
  );
}

export default MySchedule;