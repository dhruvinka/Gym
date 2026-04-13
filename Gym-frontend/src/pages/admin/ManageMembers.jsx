import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/layouts/AdminLayout';
import { adminAPI, trainerAPI } from '../../services/api';
import { FiUserCheck, FiUserX, FiEye, FiCalendar, FiClock } from 'react-icons/fi';
import toast from 'react-hot-toast';

function ManageMembers() {
  const [members, setMembers] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch members
      const membersRes = await adminAPI.getMembers();
      console.log('Members data:', membersRes.data);

      // Fetch trainers for name lookup
      const trainersRes = await adminAPI.getTrainers();
      setTrainers(trainersRes.data);

      setMembers(membersRes.data);

    } catch (error) {
      console.error('Failed to fetch data', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };
  const updateMemberStatus = async (memberId, newStatus) => {
    try {
      await adminAPI.updateMemberStatus(memberId, newStatus);
      toast.success(`Member status updated to ${newStatus}`);
      fetchData();
    } catch (error) {
      console.error('Failed to update status', error);
      toast.error('Failed to update status');
    }
  };

  const getFilteredMembers = () => {
    switch (filter) {
      case 'ACTIVE':
        return members.filter(m => m.status === 'ACTIVE');
      case 'EXPIRED':
        return members.filter(m => m.status === 'EXPIRED');
      case 'PREMIUM':
        return members.filter(m => m.plan === 'PREMIUM');
      case 'SIMPLE':
        return members.filter(m => m.plan === 'SIMPLE');
      default:
        return members;
    }
  };

  const slotLabels = {
    MORNING_5_7: 'Morning 5-7 AM',
    MORNING_7_9: 'Morning 7-9 AM',
    MORNING_9_11: 'Morning 9-11 AM',
    EVENING_5_7: 'Evening 5-7 PM',
    EVENING_7_9: 'Evening 7-9 PM',
    EVENING_9_11: 'Evening 9-11 PM'
  };

  // ✅ FIXED: Get trainer name safely
  const getTrainerName = (member) => {
    if (!member.assignedTrainerId) return '-';

    console.log('Getting trainer for member:', member.userId?.name);
    console.log('assignedTrainerId:', member.assignedTrainerId);

    // Case 1: assignedTrainerId is an object with userId
    if (typeof member.assignedTrainerId === 'object') {
      // If it has userId with name
      if (member.assignedTrainerId.userId?.name) {
        return member.assignedTrainerId.userId.name;
      }
      // If it has name directly
      if (member.assignedTrainerId.name) {
        return member.assignedTrainerId.name;
      }
      // If it has _id, try to find in trainers array
      if (member.assignedTrainerId._id) {
        const trainer = trainers.find(t => t._id === member.assignedTrainerId._id);
        if (trainer) {
          return trainer.userId?.name || 'Unknown';
        }
      }
    }

    // Case 2: assignedTrainerId is a string ID
    if (typeof member.assignedTrainerId === 'string') {
      const trainer = trainers.find(t => t._id === member.assignedTrainerId);
      if (trainer) {
        return trainer.userId?.name || 'Unknown';
      }
      return `ID: ${member.assignedTrainerId.slice(-6)}`;
    }

    return '-';
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Manage Members</h1>
          <div className="flex gap-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
            >
              <option value="ALL">All Members</option>
              <option value="ACTIVE">Active</option>
              <option value="EXPIRED">Expired</option>
              <option value="PREMIUM">Premium</option>
              <option value="SIMPLE">Simple</option>
            </select>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600">Total Members</div>
            <div className="text-3xl font-bold">{members.length}</div>
          </div>
          <div className="bg-green-50 rounded-lg shadow p-6">
            <div className="text-sm text-green-600">Active</div>
            <div className="text-3xl font-bold text-green-600">
              {members.filter(m => m.status === 'ACTIVE').length}
            </div>
          </div>
          <div className="bg-yellow-50 rounded-lg shadow p-6">
            <div className="text-sm text-yellow-600">Premium</div>
            <div className="text-3xl font-bold text-yellow-600">
              {members.filter(m => m.plan === 'PREMIUM').length}
            </div>
          </div>
          <div className="bg-red-50 rounded-lg shadow p-6">
            <div className="text-sm text-red-600">Expired</div>
            <div className="text-3xl font-bold text-red-600">
              {members.filter(m => m.status === 'EXPIRED').length}
            </div>
          </div>
        </div>

        {/* Members Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Member
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Plan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time Slot
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trainer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                      Loading...
                    </td>
                  </tr>
                ) : getFilteredMembers().length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                      No members found
                    </td>
                  </tr>
                ) : (
                  getFilteredMembers().map((member) => {
                    return (
                      <tr key={member._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">{member.userId?.name || 'N/A'}</div>
                          <div className="text-sm text-gray-500">{member.userId?.email || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${member.plan === 'PREMIUM'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-blue-100 text-blue-800'
                            }`}>
                            {member.plan || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${member.status === 'ACTIVE'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                            }`}>
                            {member.status || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {slotLabels[member.timeSlot] || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {getTrainerName(member)}
                        </td>

                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Member Details Modal */}
        {showDetails && selectedMember && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Member Details</h2>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-700 mb-4">Personal Info</h3>
                  <p className="mb-2"><span className="text-gray-500">Name:</span> {selectedMember.userId?.name || 'N/A'}</p>
                  <p className="mb-2"><span className="text-gray-500">Email:</span> {selectedMember.userId?.email || 'N/A'}</p>
                  <p className="mb-2"><span className="text-gray-500">Phone:</span> {selectedMember.phone || 'N/A'}</p>
                  <p className="mb-2"><span className="text-gray-500">Age:</span> {selectedMember.age || 'N/A'}</p>
                  <p className="mb-2"><span className="text-gray-500">Gender:</span> {selectedMember.gender || 'N/A'}</p>
                  <p className="mb-2"><span className="text-gray-500">Fitness Goal:</span> {selectedMember.fitnessGoal?.replace(/_/g, ' ') || 'N/A'}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-700 mb-4">Membership Details</h3>
                  <p className="mb-2"><span className="text-gray-500">Plan:</span> {selectedMember.plan || 'N/A'}</p>
                  <p className="mb-2"><span className="text-gray-500">Status:</span> {selectedMember.status || 'N/A'}</p>
                  <p className="mb-2"><span className="text-gray-500">Start Date:</span> {selectedMember.startDate ? new Date(selectedMember.startDate).toLocaleDateString() : '-'}</p>
                  <p className="mb-2"><span className="text-gray-500">End Date:</span> {selectedMember.endDate ? new Date(selectedMember.endDate).toLocaleDateString() : '-'}</p>
                  <p className="mb-2"><span className="text-gray-500">Time Slot:</span> {slotLabels[selectedMember.timeSlot] || '-'}</p>
                </div>

                {selectedMember.plan === 'PREMIUM' && (
                  <div className="col-span-1 md:col-span-2">
                    <h3 className="font-semibold text-gray-700 mb-4">Trainer Information</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="mb-2"><span className="text-gray-500">Trainer:</span> {getTrainerName(selectedMember)}</p>
                      <p className="mb-2"><span className="text-gray-500">Specialization:</span> {
                        selectedMember.assignedTrainerId?.specialization ||
                        trainers.find(t => t._id === selectedMember.assignedTrainerId?._id)?.specialization ||
                        '-'
                      }</p>
                    </div>
                  </div>
                )}

                <div className="col-span-1 md:col-span-2">
                  {/* Physical Stats */}
                  {(selectedMember.height || selectedMember.weight) && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Physical Stats</h4>
                      <div className="grid grid-cols-2 gap-4">
                        {selectedMember.height && (
                          <p><span className="text-gray-500">Height:</span> {selectedMember.height} cm</p>
                        )}
                        {selectedMember.weight && (
                          <p><span className="text-gray-500">Weight:</span> {selectedMember.weight} kg</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end mt-8 gap-4">
                <button
                  onClick={() => setShowDetails(false)}
                  className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export default ManageMembers;