import { useState, useEffect } from 'react';
import TrainerLayout from '../../components/layouts/TrainerLayout';
import { trainerAPI } from '../../services/api';
import { 
  FiUser, 
  FiCalendar, 
  FiClock, 
  FiClipboard,
  FiCheckCircle,
  FiXCircle,
  FiEye,
  FiEdit2
} from 'react-icons/fi';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

function TrainerMembers() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [filter, setFilter] = useState('ALL'); // ALL, MORNING, EVENING

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const response = await trainerAPI.getMembers();
      setMembers(response.data);
    } catch (error) {
      console.error('Failed to fetch members', error);
      toast.error('Failed to load members');
    } finally {
      setLoading(false);
    }
  };

  // Slot labels
  const slotLabels = {
    MORNING_5_7: 'Morning 5-7 AM',
    MORNING_7_9: 'Morning 7-9 AM',
    MORNING_9_11: 'Morning 9-11 AM',
    EVENING_5_7: 'Evening 5-7 PM',
    EVENING_7_9: 'Evening 7-9 PM',
    EVENING_9_11: 'Evening 9-11 PM'
  };

  // Filter members
  const getFilteredMembers = () => {
    if (filter === 'ALL') return members;
    if (filter === 'MORNING') {
      return members.filter(m => m.member?.timeSlot?.startsWith('MORNING'));
    }
    if (filter === 'EVENING') {
      return members.filter(m => m.member?.timeSlot?.startsWith('EVENING'));
    }
    return members;
  };

  // Calculate stats
  const totalMembers = members.length;
  const morningSlot = members.filter(m => m.member?.timeSlot?.startsWith('MORNING')).length;
  const eveningSlot = members.filter(m => m.member?.timeSlot?.startsWith('EVENING')).length;

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
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">My Members</h1>
          <div className="flex gap-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
            >
              <option value="ALL">All Members</option>
              <option value="MORNING">Morning Slot</option>
              <option value="EVENING">Evening Slot</option>
            </select>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600">Total Members</div>
            <div className="text-3xl font-bold">{totalMembers}</div>
          </div>
          <div className="bg-yellow-50 rounded-lg shadow p-6">
            <div className="text-sm text-yellow-600">Morning Slot</div>
            <div className="text-3xl font-bold text-yellow-600">{morningSlot}</div>
          </div>
          <div className="bg-blue-50 rounded-lg shadow p-6">
            <div className="text-sm text-blue-600">Evening Slot</div>
            <div className="text-3xl font-bold text-blue-600">{eveningSlot}</div>
          </div>
        </div>

        {/* Members Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Member</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time Slot</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Diet Plan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {getFilteredMembers().length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    No members found
                  </td>
                </tr>
              ) : (
                getFilteredMembers().map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{item.member?.name || 'N/A'}</div>
                      <div className="text-sm text-gray-500">{item.member?.email || ''}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                        {slotLabels[item.member?.timeSlot] || item.member?.timeSlot || 'Not set'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        item.member?.status === 'ACTIVE' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {item.member?.status || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.member?.dietPlan ? (
                        <span className="flex items-center gap-1 text-green-600">
                          <FiCheckCircle /> Created
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-gray-400">
                          <FiXCircle /> Not created
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => {
                          setSelectedMember(item);
                          setShowDetails(true);
                        }}
                        className="text-blue-600 hover:text-blue-800 mr-3"
                        title="View Details"
                      >
                        <FiEye />
                      </button>
                      <Link
                        to={`/trainer/create-diet-plan?memberId=${item.member?.id}`}
                        className="text-yellow-400 hover:text-yellow-500"
                        title="Create Diet Plan"
                      >
                        <FiEdit2 />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Member Details Modal */}
        {showDetails && selectedMember && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-6">Member Details</h2>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-700 mb-4">Personal Info</h3>
                  <p><span className="text-gray-500">Name:</span> {selectedMember.member?.name}</p>
                  <p><span className="text-gray-500">Email:</span> {selectedMember.member?.email}</p>
                  <p><span className="text-gray-500">Plan:</span> {selectedMember.member?.plan}</p>
                  <p><span className="text-gray-500">Status:</span> {selectedMember.member?.status}</p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-700 mb-4">Schedule</h3>
                  <p><span className="text-gray-500">Time Slot:</span> {slotLabels[selectedMember.member?.timeSlot]}</p>
                  <p><span className="text-gray-500">Start Date:</span> {new Date(selectedMember.member?.startDate).toLocaleDateString()}</p>
                  <p><span className="text-gray-500">End Date:</span> {new Date(selectedMember.member?.endDate).toLocaleDateString()}</p>
                </div>

              </div>

              <div className="flex justify-end mt-8 gap-4">
                <button
                  onClick={() => setShowDetails(false)}
                  className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Close
                </button>
                <Link
                  to={`/trainer/create-diet-plan?memberId=${selectedMember.member?.id}`}
                  className="px-4 py-2 bg-yellow-400 text-black rounded-lg font-semibold hover:bg-yellow-500"
                >
                  Create Diet Plan
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </TrainerLayout>
  );
}

export default TrainerMembers;