import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/layouts/AdminLayout';
import { adminAPI } from '../../services/api';
import { FiUserCheck, FiClock, FiRefreshCw, FiUserX } from 'react-icons/fi';
import toast from 'react-hot-toast';

function AssignTrainer() {
  const [assignedMembers, setAssignedMembers] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Reassignment states
  const [reassignMember, setReassignMember] = useState(null);
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [newSlot, setNewSlot] = useState('');
  const [newTrainer, setNewTrainer] = useState('');
  const [availableTrainersForSlot, setAvailableTrainersForSlot] = useState([]);

  const timeSlots = [
    { value: 'MORNING_5_7', label: 'Morning 5:00 AM - 7:00 AM' },
    { value: 'MORNING_7_9', label: 'Morning 7:00 AM - 9:00 AM' },
    { value: 'MORNING_9_11', label: 'Morning 9:00 AM - 11:00 AM' },
    { value: 'EVENING_5_7', label: 'Evening 5:00 PM - 7:00 PM' },
    { value: 'EVENING_7_9', label: 'Evening 7:00 PM - 9:00 PM' },
    { value: 'EVENING_9_11', label: 'Evening 9:00 PM - 11:00 PM' }
  ];

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (newSlot) {
      fetchAvailableTrainersForSlot();
    }
  }, [newSlot]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch all members
      const membersRes = await adminAPI.getMembers();
      console.log('📊 MEMBERS DATA:', membersRes.data);
      
      // Fetch active trainers
      const trainersRes = await adminAPI.getTrainers();
      console.log('📊 TRAINERS DATA:', trainersRes.data);
      setTrainers(trainersRes.data.filter(t => t.activeStatus));
      
      // Get only assigned premium members
      const assigned = membersRes.data.filter(
        m => m.plan === 'PREMIUM' && m.assignedTrainerId && m.status === 'ACTIVE'
      );
      
      setAssignedMembers(assigned);

    } catch (error) {
      console.error('Failed to fetch data', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableTrainersForSlot = async () => {
    try {
      const response = await adminAPI.getAllAvailableSlots();
      const slotData = response.data.slots[newSlot];
      setAvailableTrainersForSlot(slotData?.trainers || []);
    } catch (error) {
      console.error('Failed to fetch trainers', error);
      toast.error('Failed to load available trainers');
    }
  };

  const handleReassign = async () => {
    if (!reassignMember || !newSlot) {
      toast.error('Please select a new time slot');
      return;
    }

    try {
      const reassignData = {
        memberId: reassignMember._id,
        newTimeSlot: newSlot
      };

      if (newTrainer) {
        reassignData.trainerId = newTrainer;
      }

      await adminAPI.reassignMemberSlot(reassignData);
      
      toast.success('Member reassigned successfully');
      setShowReassignModal(false);
      setReassignMember(null);
      setNewSlot('');
      setNewTrainer('');
      fetchData();
    } catch (error) {
      console.error('Failed to reassign member', error);
      toast.error(error.response?.data?.message || 'Failed to reassign member');
    }
  };

  const handleRemoveTrainer = async (memberId, memberName) => {
    if (!window.confirm(`Are you sure you want to remove trainer from ${memberName}?`)) {
      return;
    }

    try {
      await adminAPI.removeMemberFromTrainer(memberId);
      toast.success('Trainer removed successfully');
      fetchData();
    } catch (error) {
      console.error('Failed to remove trainer', error);
      toast.error('Failed to remove trainer');
    }
  };

  // ✅ FIXED: Get trainer name from member's assignedTrainerId
  const getTrainerName = (member) => {
    if (!member.assignedTrainerId) return 'No Trainer';
    
    // Case 1: assignedTrainerId is an object with userId (your current structure)
    if (typeof member.assignedTrainerId === 'object') {
      // Try to find the trainer in the trainers array by _id
      const trainer = trainers.find(t => t._id === member.assignedTrainerId._id);
      if (trainer && trainer.userId) {
        return trainer.userId.name;
      }
      // Fallback to the userId field in the assignedTrainerId
      if (member.assignedTrainerId.userId?.name) {
        return member.assignedTrainerId.userId.name;
      }
      // If it has name directly
      if (member.assignedTrainerId.name) {
        return member.assignedTrainerId.name;
      }
      // If it has userId string but not populated
      if (member.assignedTrainerId.userId) {
        return `Trainer ID: ${member.assignedTrainerId._id.slice(-6)}`;
      }
    }
    
    // Case 2: assignedTrainerId is a string ID
    if (typeof member.assignedTrainerId === 'string') {
      const trainer = trainers.find(t => t._id === member.assignedTrainerId);
      return trainer?.userId?.name || `Trainer ID: ${member.assignedTrainerId.slice(-6)}`;
    }
    
    return 'Unknown Trainer';
  };

  // ✅ FIXED: Get trainer specialization
  const getTrainerSpecialization = (member) => {
    if (!member.assignedTrainerId) return '';
    
    if (typeof member.assignedTrainerId === 'object') {
      // If it has specialization directly
      if (member.assignedTrainerId.specialization) {
        return member.assignedTrainerId.specialization;
      }
      // Try to find in trainers array
      const trainer = trainers.find(t => t._id === member.assignedTrainerId._id);
      return trainer?.specialization || '';
    }
    
    if (typeof member.assignedTrainerId === 'string') {
      const trainer = trainers.find(t => t._id === member.assignedTrainerId);
      return trainer?.specialization || '';
    }
    
    return '';
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-8">Trainer Reassignment</h1>

        {/* Assigned Members List */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-6">Members with Trainers</h2>
          
          {loading ? (
            <p className="text-gray-500">Loading...</p>
          ) : assignedMembers.length === 0 ? (
            <p className="text-gray-500">No assigned members found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Member</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Current Trainer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Specialization</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time Slot</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {assignedMembers.map(member => (
                    <tr key={member._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium">{member.userId?.name}</div>
                        <div className="text-sm text-gray-500">{member.userId?.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                        {getTrainerName(member)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {getTrainerSpecialization(member)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                          {timeSlots.find(s => s.value === member.timeSlot)?.label || member.timeSlot}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => {
                            setReassignMember(member);
                            setShowReassignModal(true);
                          }}
                          className="text-yellow-400 hover:text-yellow-500 mr-3 inline-flex items-center gap-1"
                          title="Reassign"
                        >
                          <FiRefreshCw /> Reassign
                        </button>
                        <button
                          onClick={() => handleRemoveTrainer(member._id, member.userId?.name)}
                          className="text-red-600 hover:text-red-700 inline-flex items-center gap-1"
                          title="Remove Trainer"
                        >
                          <FiUserX /> Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Reassignment Modal */}
        {showReassignModal && reassignMember && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-xl font-bold mb-4">Reassign {reassignMember.userId?.name}</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Assignment
                  </label>
                  <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                    <p className="text-sm">
                      <span className="font-medium">Trainer:</span> {getTrainerName(reassignMember)}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Time Slot:</span> {timeSlots.find(s => s.value === reassignMember.timeSlot)?.label || reassignMember.timeSlot}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Time Slot <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newSlot}
                    onChange={(e) => setNewSlot(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  >
                    <option value="">Select new time slot</option>
                    {timeSlots.map(slot => (
                      <option key={slot.value} value={slot.value}>
                        {slot.label}
                      </option>
                    ))}
                  </select>
                </div>

                {newSlot && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      New Trainer (Optional)
                    </label>
                    <select
                      value={newTrainer}
                      onChange={(e) => setNewTrainer(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    >
                      <option value="">Auto-assign to any available trainer</option>
                      {availableTrainersForSlot.map(trainer => (
                        <option key={trainer.id} value={trainer.id}>
                          {trainer.name} ({trainer.availableSpots} spots)
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowReassignModal(false);
                    setReassignMember(null);
                    setNewSlot('');
                    setNewTrainer('');
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReassign}
                  disabled={!newSlot}
                  className="px-4 py-2 bg-yellow-400 text-black rounded-lg font-semibold hover:bg-yellow-500 disabled:opacity-50"
                >
                  Confirm Reassignment
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export default AssignTrainer;