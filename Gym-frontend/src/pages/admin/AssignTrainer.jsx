import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/layouts/AdminLayout';
import { adminAPI } from '../../services/api';
import { FiRefreshCw, FiUserCheck } from 'react-icons/fi';
import toast from 'react-hot-toast';

function AssignTrainer() {
  const [assignedMembers, setAssignedMembers] = useState([]);
  const [unassignedMembers, setUnassignedMembers] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Reassignment states
  const [reassignMember, setReassignMember] = useState(null);
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [newSlot, setNewSlot] = useState('');
  const [newTrainer, setNewTrainer] = useState('');
  const [availableTrainersForSlot, setAvailableTrainersForSlot] = useState([]);

  // Assign states
  const [assignMember, setAssignMember] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignSlot, setAssignSlot] = useState('');
  const [assignTrainer, setAssignTrainer] = useState('');
  const [assignAvailableTrainers, setAssignAvailableTrainers] = useState([]);

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

  // Fetch trainers available for the selected slot (reassign modal)
  useEffect(() => {
    if (newSlot) fetchAvailableTrainersForSlot(newSlot, setAvailableTrainersForSlot);
  }, [newSlot]);

  // Fetch trainers available for the selected slot (assign modal)
  useEffect(() => {
    if (assignSlot) fetchAvailableTrainersForSlot(assignSlot, setAssignAvailableTrainers);
  }, [assignSlot]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const membersRes = await adminAPI.getMembers();
      const trainersRes = await adminAPI.getTrainers();

      setTrainers(trainersRes.data.filter(t => t.activeStatus));

      const premiumActive = membersRes.data.filter(
        m => m.plan === 'PREMIUM' && m.status === 'ACTIVE'
      );

      setAssignedMembers(premiumActive.filter(m => m.assignedTrainerId));
      setUnassignedMembers(premiumActive.filter(m => !m.assignedTrainerId));

    } catch (error) {
      console.error('Failed to fetch data', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableTrainersForSlot = async (slot, setter) => {
    try {
      const response = await adminAPI.getAllAvailableSlots();
      const slotData = response.data.slots[slot];
      setter(slotData?.trainers || []);
    } catch (error) {
      console.error('Failed to fetch trainers', error);
      toast.error('Failed to load available trainers');
    }
  };

  // --- Reassign handler ---
  const handleReassign = async () => {
    if (!reassignMember || !newSlot) {
      toast.error('Please select a new time slot');
      return;
    }
    try {
      const reassignData = { memberId: reassignMember._id, newTimeSlot: newSlot };
      if (newTrainer) reassignData.trainerId = newTrainer;

      await adminAPI.reassignMemberSlot(reassignData);
      toast.success('Member reassigned successfully');
      closeReassignModal();
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reassign member');
    }
  };

  const closeReassignModal = () => {
    setShowReassignModal(false);
    setReassignMember(null);
    setNewSlot('');
    setNewTrainer('');
    setAvailableTrainersForSlot([]);
  };

  // --- Assign handler ---
  const handleAssign = async () => {
    if (!assignMember || !assignSlot || !assignTrainer) {
      toast.error('Please select both a time slot and a trainer');
      return;
    }
    try {
      await adminAPI.assignTrainer({
        memberId: assignMember._id,
        trainerId: assignTrainer,
        timeSlot: assignSlot
      });
      toast.success('Trainer assigned successfully');
      closeAssignModal();
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to assign trainer');
    }
  };

  const closeAssignModal = () => {
    setShowAssignModal(false);
    setAssignMember(null);
    setAssignSlot('');
    setAssignTrainer('');
    setAssignAvailableTrainers([]);
  };

  // --- Helpers ---
  const getTrainerName = (member) => {
    if (!member.assignedTrainerId) return 'No Trainer';
    if (typeof member.assignedTrainerId === 'object') {
      const trainer = trainers.find(t => t._id === member.assignedTrainerId._id);
      if (trainer?.userId) return trainer.userId.name;
      if (member.assignedTrainerId.userId?.name) return member.assignedTrainerId.userId.name;
      if (member.assignedTrainerId.name) return member.assignedTrainerId.name;
    }
    if (typeof member.assignedTrainerId === 'string') {
      const trainer = trainers.find(t => t._id === member.assignedTrainerId);
      return trainer?.userId?.name || `Trainer ID: ${member.assignedTrainerId.slice(-6)}`;
    }
    return 'Unknown Trainer';
  };

  const getTrainerSpecialization = (member) => {
    if (!member.assignedTrainerId) return '';
    if (typeof member.assignedTrainerId === 'object') {
      if (member.assignedTrainerId.specialization) return member.assignedTrainerId.specialization;
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
      <div className="p-6 space-y-8">
        <h1 className="text-3xl font-bold">Trainer Assignment</h1>

        {/* ── Unassigned Members ── */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
            <FiUserCheck className="text-green-500" />
            Unassigned Premium Members
            {!loading && (
              <span className="ml-2 text-sm font-normal bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                {unassignedMembers.length} pending
              </span>
            )}
          </h2>

          {loading ? (
            <p className="text-gray-500">Loading...</p>
          ) : unassignedMembers.length === 0 ? (
            <p className="text-gray-500">All premium members have been assigned a trainer </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Member</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plan</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {unassignedMembers.map(member => (
                    <tr key={member._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium">{member.userId?.name}</div>
                        <div className="text-sm text-gray-500">{member.userId?.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                          PREMIUM
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => {
                            setAssignMember(member);
                            setShowAssignModal(true);
                          }}
                          className="text-green-600 hover:text-green-700 inline-flex items-center gap-1 font-medium"
                        >
                          <FiUserCheck /> Assign Trainer
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── Assigned Members ── */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
            <FiRefreshCw className="text-yellow-500" />
            Members with Trainers
          </h2>

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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
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
                          className="text-yellow-500 hover:text-yellow-600 inline-flex items-center gap-1 font-medium"
                          title="Reassign"
                        >
                          <FiRefreshCw /> Reassign
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── Assign Modal ── */}
        {showAssignModal && assignMember && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-xl font-bold mb-4">Assign Trainer to {assignMember.userId?.name}</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Time Slot <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={assignSlot}
                    onChange={(e) => { setAssignSlot(e.target.value); setAssignTrainer(''); }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  >
                    <option value="">Select time slot</option>
                    {timeSlots.map(slot => (
                      <option key={slot.value} value={slot.value}>{slot.label}</option>
                    ))}
                  </select>
                </div>

                {assignSlot && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Trainer <span className="text-red-500">*</span>
                    </label>
                    {assignAvailableTrainers.length === 0 ? (
                      <p className="text-sm text-red-500">No trainers available for this slot</p>
                    ) : (
                      <select
                        value={assignTrainer}
                        onChange={(e) => setAssignTrainer(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      >
                        <option value="">Select trainer</option>
                        {assignAvailableTrainers.map(trainer => (
                          <option key={trainer.id} value={trainer.id}>
                            {trainer.name} ({trainer.availableSpots} spots left)
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={closeAssignModal}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssign}
                  disabled={!assignSlot || !assignTrainer}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 disabled:opacity-50"
                >
                  Confirm Assignment
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Reassign Modal ── */}
        {showReassignModal && reassignMember && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-xl font-bold mb-4">Reassign {reassignMember.userId?.name}</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Assignment</label>
                  <div className="bg-gray-50 p-3 rounded-lg space-y-1">
                    <p className="text-sm"><span className="font-medium">Trainer:</span> {getTrainerName(reassignMember)}</p>
                    <p className="text-sm"><span className="font-medium">Time Slot:</span> {timeSlots.find(s => s.value === reassignMember.timeSlot)?.label || reassignMember.timeSlot}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Time Slot <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newSlot}
                    onChange={(e) => { setNewSlot(e.target.value); setNewTrainer(''); }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  >
                    <option value="">Select new time slot</option>
                    {timeSlots.map(slot => (
                      <option key={slot.value} value={slot.value}>{slot.label}</option>
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
                      <option value="">Keep current trainer</option>
                      {availableTrainersForSlot.map(trainer => (
                        <option key={trainer.id} value={trainer.id}>
                          {trainer.name} ({trainer.availableSpots} spots left)
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={closeReassignModal}
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