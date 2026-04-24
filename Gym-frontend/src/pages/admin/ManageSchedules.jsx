import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/layouts/AdminLayout';
import { adminAPI } from '../../services/api';
import { FiClock, FiUser, FiCalendar, FiChevronDown, FiInfo, FiCheckCircle, FiXCircle, FiRefreshCw } from 'react-icons/fi';
import toast from 'react-hot-toast';

function ManageSchedules() {
  const [slotData, setSlotData] = useState(null);
  const [trainers, setTrainers] = useState([]);
  const [selectedTrainer, setSelectedTrainer] = useState('');
  const [selectedTrainerInfo, setSelectedTrainerInfo] = useState(null);
  const [trainerSlots, setTrainerSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchingTrainerSlots, setFetchingTrainerSlots] = useState(false);

  const timeSlots = [
    { id: 'MORNING_5_7', label: 'Morning 5-7 AM', startTime: '05:00', endTime: '07:00' },
    { id: 'MORNING_7_9', label: 'Morning 7-9 AM', startTime: '07:00', endTime: '09:00' },
    { id: 'MORNING_9_11', label: 'Morning 9-11 AM', startTime: '09:00', endTime: '11:00' },
    { id: 'EVENING_5_7', label: 'Evening 5-7 PM', startTime: '17:00', endTime: '19:00' },
    { id: 'EVENING_7_9', label: 'Evening 7-9 PM', startTime: '19:00', endTime: '21:00' },
    { id: 'EVENING_9_11', label: 'Evening 9-11 PM', startTime: '21:00', endTime: '23:00' }
  ];

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedTrainer) {
      fetchTrainerSlotDetails();
    } else {
      setTrainerSlots([]);
      setSelectedTrainerInfo(null);
    }
  }, [selectedTrainer]);

  const fetchData = async () => {
    const loadingToast = toast.loading('Loading schedule data...');

    try {
      // Fetch all available slots data
      const slotsRes = await adminAPI.getAllAvailableSlots();
      setSlotData(slotsRes.data);

      // Fetch all trainers
      const trainersRes = await adminAPI.getTrainers();
      setTrainers(trainersRes.data.filter(t => t.activeStatus));

      toast.dismiss(loadingToast);
      toast.success('Schedule data loaded successfully', {
        icon: <FiCheckCircle className="text-green-500" />,
        duration: 3000
      });

    } catch (error) {
      toast.dismiss(loadingToast);
      console.error('Failed to fetch data', error);
      toast.error('Failed to load schedule data', {
        icon: <FiXCircle className="text-red-500" />,
        duration: 4000
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTrainerSlotDetails = async () => {
    if (!selectedTrainer) return;

    setFetchingTrainerSlots(true);
    const loadingToast = toast.loading(`Loading details for selected trainer...`);

    try {
      // Fetch trainer details
      const trainerInfo = trainers.find(t => t._id === selectedTrainer);
      setSelectedTrainerInfo(trainerInfo);

      // Fetch trainer's available slots
      const response = await adminAPI.getTrainerAvailableSlots(selectedTrainer);
      setTrainerSlots(response.data.slots);

      toast.dismiss(loadingToast);

    } catch (error) {
      toast.dismiss(loadingToast);
      console.error('Failed to fetch trainer slots', error);
      toast.error('Failed to load trainer slot details', {
        icon: <FiXCircle className="text-red-500" />,
        duration: 4000
      });
    } finally {
      setFetchingTrainerSlots(false);
    }
  };

  const getTrainerName = (trainerId) => {
    const trainer = trainers.find(t => t._id === trainerId);
    return trainer?.userId?.name || 'Unknown Trainer';
  };

  const getSlotOccupancyColor = (current, capacity) => {
    const percentage = (current / capacity) * 100;
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const showSlotInfo = (slot) => {
    const slotInfo = slotData?.slots[slot.id];

    toast(
      <div className="p-2 max-w-sm">
        <h3 className="font-bold text-lg mb-2">{slot.label}</h3>
        <div className="space-y-2 text-sm">
          <p><span className="font-medium">Time:</span> {slot.startTime} - {slot.endTime}</p>
          <p><span className="font-medium">Total Capacity:</span> {slotInfo?.totalCapacity || 0} members</p>
          <p><span className="font-medium">Current Members:</span> {slotInfo?.currentMembers || 0}</p>
          <p><span className="font-medium">Available Spots:</span> {slotInfo?.availableSpots || 0}</p>
          <p><span className="font-medium">Available Trainers:</span> {slotInfo?.trainers?.length || 0}</p>
        </div>
      </div>,
      {
        icon: <FiInfo className="text-blue-500" />,
        duration: 5000,
        position: 'top-center'
      }
    );
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Slot Management</h1>
          <button
            onClick={() => {
              toast.success('Refreshing data...', { icon: <FiRefreshCw className="text-yellow-500" />, duration: 2000 });
              fetchData();
            }}
            className="flex items-center gap-2 text-yellow-400 hover:text-yellow-500"
          >
            <FiCalendar /> Refresh
          </button>
        </div>

        {/* Trainer Selection Dropdown */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Select Trainer to View Details</h2>
          <div className="relative max-w-md">
            <select
              value={selectedTrainer}
              onChange={(e) => setSelectedTrainer(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 appearance-none bg-white"
            >
              <option value="">-- Choose a trainer --</option>
              {trainers.map(trainer => (
                <option key={trainer._id} value={trainer._id}>
                  {trainer.userId?.name} - {trainer.specialization}
                </option>
              ))}
            </select>
            <FiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        {/* Selected Trainer Info */}
        {selectedTrainerInfo && (
          <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-lg shadow-lg p-6 mb-8 text-white">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white border-opacity-50 flex-shrink-0">
                {selectedTrainerInfo.profilePhoto?.url ? (
                  <img
                    src={selectedTrainerInfo.profilePhoto.url}
                    alt={selectedTrainerInfo.userId?.name || 'Trainer'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-white bg-opacity-20 flex items-center justify-center">
                    <FiUser className="text-2xl text-white" />
                  </div>
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold">{selectedTrainerInfo.userId?.name}</h2>
                <p className="opacity-90">{selectedTrainerInfo.specialization}</p>
                <p className="text-sm opacity-75 mt-1">{selectedTrainerInfo.experience} years experience</p>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading slot data...</p>
          </div>
        ) : (
          <>
            {/* Trainer-specific Slot Details */}
            {selectedTrainer && (
              <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-6">
                  {fetchingTrainerSlots ? 'Loading...' : `${selectedTrainerInfo?.userId?.name}'s Slot Details`}
                </h2>

                {fetchingTrainerSlots ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400 mx-auto"></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {trainerSlots.map(slot => (
                      <div key={slot.value} className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-yellow-400">
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="font-semibold text-gray-800">{slot.label}</h3>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${slot.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                            {slot.isAvailable ? 'Available' : 'Full'}
                          </span>
                        </div>

                        <div className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Current Members:</span>
                            <span className="font-medium">{slot.currentMembers}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Capacity:</span>
                            <span className="font-medium">{slot.capacity}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Available Spots:</span>
                            <span className={`font-medium ${slot.availableSpots > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {slot.availableSpots}
                            </span>
                          </div>

                          <div className="mt-2">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${getSlotOccupancyColor(slot.currentMembers, slot.capacity)}`}
                                style={{ width: `${(slot.currentMembers / slot.capacity) * 100}%` }}
                              ></div>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              {Math.round((slot.currentMembers / slot.capacity) * 100)}% occupied
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Overall Slot Availability */}
            <div className="mt-8">
              <h2 className="text-2xl font-semibold mb-6">Overall Slot Availability</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {timeSlots.map(slot => (
                  <div key={slot.id} className="bg-white rounded-lg shadow-lg p-6 relative">
                    <button
                      onClick={() => showSlotInfo(slot)}
                      className="absolute top-4 right-4 text-gray-400 hover:text-yellow-400"
                      title="View Details"
                    >
                      <FiInfo />
                    </button>

                    <div className="flex items-center gap-3 mb-4">
                      <FiClock className="text-2xl text-yellow-400" />
                      <h2 className="text-xl font-semibold">{slot.label}</h2>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Total Capacity:</span>
                        <span className="font-medium">{slotData?.slots[slot.id]?.totalCapacity || 0}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Current Members:</span>
                        <span className="font-medium">{slotData?.slots[slot.id]?.currentMembers || 0}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Available Spots:</span>
                        <span className={`font-medium ${slotData?.slots[slot.id]?.availableSpots > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {slotData?.slots[slot.id]?.availableSpots || 0}
                        </span>
                      </div>

                      <div className="mt-4">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-yellow-400 h-2 rounded-full"
                            style={{
                              width: `${((slotData?.slots[slot.id]?.currentMembers || 0) / (slotData?.slots[slot.id]?.totalCapacity || 1)) * 100}%`
                            }}
                          ></div>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t">
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Available Trainers:</h3>
                        {slotData?.slots[slot.id]?.trainers?.length > 0 ? (
                          <ul className="text-sm text-gray-600 max-h-32 overflow-y-auto">
                            {slotData.slots[slot.id].trainers.map(trainer => (
                              <li key={trainer.id} className="flex justify-between py-1 hover:bg-gray-50 px-2 rounded">
                                <span>{trainer.name}</span>
                                <span className="text-green-600 font-medium">{trainer.availableSpots} spots</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-gray-500 italic">No trainers available</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary Stats */}
            <div className="mt-8 bg-gradient-to-r from-yellow-50 to-white rounded-lg p-6 border border-yellow-100">
              <h3 className="text-lg font-semibold mb-4">Summary Statistics</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg shadow">
                  <p className="text-sm text-gray-600">Total Slots</p>
                  <p className="text-2xl font-bold">{timeSlots.length}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                  <p className="text-sm text-gray-600">Active Trainers</p>
                  <p className="text-2xl font-bold">{trainers.length}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                  <p className="text-sm text-gray-600">Total Members</p>
                  <p className="text-2xl font-bold">
                    {Object.values(slotData?.slots || {}).reduce((sum, slot) => sum + (slot.currentMembers || 0), 0)}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                  <p className="text-sm text-gray-600">Available Spots</p>
                  <p className="text-2xl font-bold text-green-600">
                    {Object.values(slotData?.slots || {}).reduce((sum, slot) => sum + (slot.availableSpots || 0), 0)}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}

export default ManageSchedules;