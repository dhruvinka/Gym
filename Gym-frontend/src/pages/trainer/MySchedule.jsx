import { useState, useEffect } from 'react';
import TrainerLayout from '../../components/layouts/TrainerLayout';
import { trainerAPI } from '../../services/api';
import { 
  FiClock, 
  FiCalendar, 
  FiUsers, 
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiSunrise,
  FiSun,
  FiSunset,
  FiMoon
} from 'react-icons/fi';
import toast from 'react-hot-toast';

function MySchedule() {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  useEffect(() => {
    fetchSchedule();
  }, []);

  const fetchSchedule = async () => {
    setLoading(true);
    try {
      const response = await trainerAPI.getSchedules();
      setSchedule(response.data);
    } catch (error) {
      console.error('Failed to fetch schedule', error);
      toast.error('Failed to load schedule');
    } finally {
      setLoading(false);
    }
  };

  const slotDetails = {
    MORNING_5_7: {
      label: 'Morning 5:00 AM - 7:00 AM',
      icon: <FiSunrise />,
      time: '5:00 AM - 7:00 AM',
      color: 'bg-orange-50 border-orange-200'
    },
    MORNING_7_9: {
      label: 'Morning 7:00 AM - 9:00 AM',
      icon: <FiSun />,
      time: '7:00 AM - 9:00 AM',
      color: 'bg-yellow-50 border-yellow-200'
    },
    MORNING_9_11: {
      label: 'Morning 9:00 AM - 11:00 AM',
      icon: <FiSun />,
      time: '9:00 AM - 11:00 AM',
      color: 'bg-amber-50 border-amber-200'
    },
    EVENING_5_7: {
      label: 'Evening 5:00 PM - 7:00 PM',
      icon: <FiSunset />,
      time: '5:00 PM - 7:00 PM',
      color: 'bg-purple-50 border-purple-200'
    },
    EVENING_7_9: {
      label: 'Evening 7:00 PM - 9:00 PM',
      icon: <FiMoon />,
      time: '7:00 PM - 9:00 PM',
      color: 'bg-indigo-50 border-indigo-200'
    },
    EVENING_9_11: {
      label: 'Evening 9:00 PM - 11:00 PM',
      icon: <FiMoon />,
      time: '9:00 PM - 11:00 PM',
      color: 'bg-blue-50 border-blue-200'
    }
  };

  // Days of week
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

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
      <div className="p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <h1 className="text-3xl font-bold">My Schedule</h1>
          
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <FiClock className="text-3xl opacity-80" />
              <span className="text-4xl font-bold">
                {schedule.reduce((acc, slot) => acc + slot.current, 0)}
              </span>
            </div>
            <p className="text-sm opacity-90">Total Members Today</p>
          </div>

          <div className="bg-gradient-to-br from-green-400 to-green-500 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <FiCheckCircle className="text-3xl opacity-80" />
              <span className="text-4xl font-bold">
                {schedule.filter(s => s.current > 0).length}
              </span>
            </div>
            <p className="text-sm opacity-90">Active Slots</p>
          </div>

          <div className="bg-gradient-to-br from-purple-400 to-purple-500 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <FiUsers className="text-3xl opacity-80" />
              <span className="text-4xl font-bold">
                {schedule.reduce((acc, slot) => acc + (slot.capacity - slot.current), 0)}
              </span>
            </div>
            <p className="text-sm opacity-90">Available Spots</p>
          </div>
        </div>

        {/* Schedule Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {schedule.map((slot, index) => (
            <div
              key={index}
              className={`rounded-lg shadow-lg overflow-hidden border-2 ${
                slotDetails[slot.slot]?.color || 'bg-white border-gray-200'
              }`}
            >
              {/* Slot Header */}
              <div className="p-4 border-b bg-white bg-opacity-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{slotDetails[slot.slot]?.icon || <FiClock />}</span>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        {slotDetails[slot.slot]?.label || slot.slot}
                      </h3>
                      <p className="text-sm text-gray-600">{slotDetails[slot.slot]?.time || ''}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-800">{slot.current}</p>
                    <p className="text-xs text-gray-500">out of {slot.capacity}</p>
                  </div>
                </div>
              </div>

              {/* Slot Content */}
              <div className="p-4">
                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Occupancy</span>
                    <span className="font-medium">
                      {Math.round((slot.current / slot.capacity) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(slot.current / slot.capacity) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Weekly Schedule */}
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <FiCalendar className="text-yellow-400" />
                    Weekly Schedule
                  </h4>
                  <div className="grid grid-cols-7 gap-1">
                    {daysOfWeek.map((day, idx) => (
                      <div
                        key={day}
                        className={`text-center p-1 rounded text-xs ${
                          idx < 5
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                        title={idx < 5 ? 'Training Day' : 'Rest Day'}
                      >
                        {day.slice(0, 3)}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Status Indicators */}
                <div className="mt-4 flex gap-3 text-sm">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-gray-600">{slot.available} spots left</span>
                  </div>
                  {slot.current === slot.capacity && (
                    <div className="flex items-center gap-1 text-red-500">
                      <FiAlertCircle />
                      <span>Full</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-8 bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold text-gray-800 mb-3">Schedule Legend</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
              <span className="text-sm text-gray-600">Morning Slots (5 AM - 11 AM)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-purple-100 border border-purple-300 rounded"></div>
              <span className="text-sm text-gray-600">Evening Slots (5 PM - 11 PM)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Spots Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Slot Full</span>
            </div>
          </div>
        </div>

      </div>
    </TrainerLayout>
  );
}

export default MySchedule;