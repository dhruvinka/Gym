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
  FiEdit2,
  FiSearch
} from 'react-icons/fi';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

function MyMembers() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [filter, setFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const response = await trainerAPI.getMembers();
      const membersData = response.data;
      
      // Fetch all diet plans to check which members have them
      const dietPlansResponse = await trainerAPI.getDietPlans();
      const dietPlans = dietPlansResponse.data;
      
      // Create a Set of member IDs that have diet plans
      const membersWithDietPlans = new Set(
        dietPlans.map(plan => plan.memberId?._id || plan.memberId)
      );
      
      // Add hasDietPlan flag to each member
      const enhancedMembers = membersData.map(member => ({
        ...member,
        hasDietPlan: membersWithDietPlans.has(member._id)
      }));
      
      setMembers(enhancedMembers);
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

  // Helper functions to get member data safely
  const getMemberName = (member) => {
    return member?.userId?.name || 'N/A';
  };

  const getMemberEmail = (member) => {
    return member?.userId?.email || '';
  };

  const getMemberTimeSlot = (member) => {
    return member?.timeSlot || '';
  };

  const getMemberStatus = (member) => {
    return member?.status || 'N/A';
  };

  const getMemberPlan = (member) => {
    return member?.plan || 'N/A';
  };

  const getMemberStartDate = (member) => {
    return member?.startDate || null;
  };

  const getMemberEndDate = (member) => {
    return member?.endDate || null;
  };

  const getMemberId = (member) => {
    return member?._id || '';
  };

  // Filter and search members
  const getFilteredMembers = () => {
    let filtered = members;

    // Apply time slot filter
    if (filter === 'MORNING') {
      filtered = filtered.filter(m => m?.timeSlot?.startsWith('MORNING'));
    } else if (filter === 'EVENING') {
      filtered = filtered.filter(m => m?.timeSlot?.startsWith('EVENING'));
    }

    // Apply search
    if (searchTerm) {
      filtered = filtered.filter(m => 
        getMemberName(m).toLowerCase().includes(searchTerm.toLowerCase()) ||
        getMemberEmail(m).toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  };

  // Calculate stats
  const totalMembers = members.length;
  const morningSlot = members.filter(m => m?.timeSlot?.startsWith('MORNING')).length;
  const eveningSlot = members.filter(m => m?.timeSlot?.startsWith('EVENING')).length;

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
          <h1 className="text-3xl font-bold">My Members</h1>
          
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 w-full sm:w-64"
              />
            </div>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Members</p>
                <p className="text-3xl font-bold mt-1">{totalMembers}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <FiUser className="text-blue-600 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Morning Slot</p>
                <p className="text-3xl font-bold mt-1 text-yellow-600">{morningSlot}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <FiClock className="text-yellow-600 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Evening Slot</p>
                <p className="text-3xl font-bold mt-1 text-purple-600">{eveningSlot}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <FiCalendar className="text-purple-600 text-xl" />
              </div>
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
                    Time Slot
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Diet Plan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {getFilteredMembers().length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                      {searchTerm ? 'No members match your search' : 'No members assigned yet'}
                    </td>
                  </tr>
                ) : (
                  getFilteredMembers().map((member) => (
                    <tr key={member._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <FiUser className="text-gray-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {getMemberName(member)}
                            </div>
                            <div className="text-sm text-gray-500">
                              {getMemberEmail(member)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                          {slotLabels[getMemberTimeSlot(member)] || getMemberTimeSlot(member) || 'Not set'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          getMemberStatus(member) === 'ACTIVE' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {getMemberStatus(member)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {member.hasDietPlan ? (
                          <span className="flex items-center gap-1 text-green-600 text-sm">
                            <FiCheckCircle /> Created
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-gray-400 text-sm">
                            <FiXCircle /> Not created
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => {
                            setSelectedMember(member);
                            setShowDetails(true);
                          }}
                          className="text-blue-600 hover:text-blue-800 mr-3 p-1 hover:bg-blue-50 rounded transition"
                          title="View Details"
                        >
                          <FiEye size={18} />
                        </button>
                        
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Member Details Modal */}
        {showDetails && selectedMember && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
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
                  <h3 className="font-semibold text-gray-700 mb-3">Personal Info</h3>
                  <div className="space-y-2">
                    <p><span className="text-gray-500">Name:</span> {getMemberName(selectedMember)}</p>
                    <p><span className="text-gray-500">Email:</span> {getMemberEmail(selectedMember)}</p>
                    <p><span className="text-gray-500">Plan:</span> {getMemberPlan(selectedMember)}</p>
                    <p><span className="text-gray-500">Status:</span> {getMemberStatus(selectedMember)}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-700 mb-3">Schedule</h3>
                  <div className="space-y-2">
                    <p><span className="text-gray-500">Time Slot:</span> {slotLabels[getMemberTimeSlot(selectedMember)] || getMemberTimeSlot(selectedMember) || 'Not set'}</p>
                    <p><span className="text-gray-500">Start Date:</span> {getMemberStartDate(selectedMember) ? new Date(getMemberStartDate(selectedMember)).toLocaleDateString() : 'N/A'}</p>
                    <p><span className="text-gray-500">End Date:</span> {getMemberEndDate(selectedMember) ? new Date(getMemberEndDate(selectedMember)).toLocaleDateString() : 'N/A'}</p>
                  </div>
                </div>

                {/* Diet Plan Info */}
                <div className="md:col-span-2">
                  <h3 className="font-semibold text-gray-700 mb-3">Diet Plan Status</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    {selectedMember.hasDietPlan ? (
                      <div className="flex items-center gap-2 text-green-600">
                        <FiCheckCircle size={20} />
                        <span className="font-medium">Diet plan has been created for this member</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-gray-500">
                        <FiXCircle size={20} />
                        <span className="font-medium">No diet plan created yet</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-8">
                <button
                  onClick={() => setShowDetails(false)}
                  className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
                >
                  Close
                </button>
                {!selectedMember.hasDietPlan && (
                  <Link
                    to={`/trainer/create-diet-plan?memberId=${getMemberId(selectedMember)}`}
                    className="px-4 py-2 bg-yellow-400 text-black rounded-lg font-semibold hover:bg-yellow-500 transition"
                  >
                    Create Diet Plan
                  </Link>
                )}
                {selectedMember.hasDietPlan && (
                  <Link
                    to={`/trainer/diet-plans`}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition"
                  >
                    View Diet Plans
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </TrainerLayout>
  );
}

export default MyMembers;