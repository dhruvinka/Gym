import { useState, useEffect } from 'react';
import MemberLayout from '../../components/layouts/MemberLayout';
import { memberAPI } from '../../services/api';
import { FiUser, FiMail, FiAward, FiClock, FiCalendar, FiBriefcase, FiAlertCircle } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

function MyTrainer() {
  const [trainerData, setTrainerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [memberInfo, setMemberInfo] = useState(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [profileRes, trainerRes] = await Promise.all([
        memberAPI.getProfile(),
        memberAPI.getMyTrainer(),
      ]);
      setMemberInfo(profileRes.data);
      setTrainerData(trainerRes.data);
    } catch (err) {
      const status = err.response?.status;
      const message = err.response?.data?.message || err.message;
      setError({ status, message });
      if (status === 403) toast.error('Trainer assignment is only for PREMIUM members');
      else if (status === 404) toast.error(message || 'No trainer assigned yet');
      else toast.error('Failed to load trainer information');
    } finally {
      setLoading(false);
    }
  };

  const slotLabels = {
    MORNING_5_7: 'Morning 5:00 AM – 7:00 AM',
    MORNING_7_9: 'Morning 7:00 AM – 9:00 AM',
    MORNING_9_11: 'Morning 9:00 AM – 11:00 AM',
    EVENING_5_7: 'Evening 5:00 PM – 7:00 PM',
    EVENING_7_9: 'Evening 7:00 PM – 9:00 PM',
    EVENING_9_11: 'Evening 9:00 PM – 11:00 PM',
  };

  if (loading) {
    return (
      <MemberLayout>
        <div className="p-6 flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400" />
        </div>
      </MemberLayout>
    );
  }

  if (error || memberInfo?.plan !== 'PREMIUM' || !trainerData?.trainer) {
    const noPremium = !error && memberInfo?.plan !== 'PREMIUM';
    return (
      <MemberLayout>
        <div className="p-6">
          <div className={`rounded-lg p-8 text-center max-w-md mx-auto border ${noPremium ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200'}`}>
            <FiAlertCircle className={`text-5xl mx-auto mb-3 ${noPremium ? 'text-yellow-400' : 'text-red-400'}`} />
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              {noPremium ? 'No Trainer Assigned' : error?.status === 403 ? 'Premium Feature' : 'Unable to Load'}
            </h2>
            <p className="text-gray-600 mb-4 text-sm">
              {noPremium
                ? memberInfo?.plan !== 'PREMIUM'
                  ? 'Personal trainers are only available for Premium members.'
                  : "You don't have a trainer assigned yet."
                : error?.message}
            </p>
            {(noPremium && memberInfo?.plan !== 'PREMIUM') || error?.status === 403 ? (
              <Link to="/plans" className="inline-block bg-yellow-400 text-black px-6 py-2 rounded-lg font-semibold hover:bg-yellow-500 transition">
                Upgrade to Premium
              </Link>
            ) : (
              <button onClick={fetchData} className="text-yellow-500 hover:text-yellow-600 text-sm font-medium">
                Try Again
              </button>
            )}
          </div>
        </div>
      </MemberLayout>
    );
  }

  const { trainer, timeSlot, timeSlotLabel, assignedSince } = trainerData;
  const slotDisplay = timeSlotLabel || slotLabels[timeSlot] || timeSlot;

  return (
    <MemberLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">My Trainer</h1>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden max-w-2xl">

          {/* Photo + Name Header */}
          <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 p-8 flex flex-col sm:flex-row items-center gap-6">
            <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-md flex-shrink-0">
              {trainer.profilePhoto?.url ? (
                <img src={trainer.profilePhoto.url} alt={trainer.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-yellow-200 flex items-center justify-center">
                  <FiUser className="text-4xl text-yellow-600" />
                </div>
              )}
            </div>
            <div className="text-center sm:text-left">
              <p className="text-black/60 text-sm font-medium mb-1">Your Personal Trainer</p>
              <h2 className="text-2xl font-bold text-black">{trainer.name}</h2>
              <p className="text-black/70 mt-1">{trainer.specialization || 'Fitness Expert'}</p>
            </div>
          </div>

          {/* Details */}
          <div className="divide-y divide-gray-100">

            <div className="flex items-center gap-4 px-6 py-4">
              <FiAward className="text-yellow-400 text-xl flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-400">Specialization</p>
                <p className="font-medium text-gray-800">{trainer.specialization || 'General Fitness'}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 px-6 py-4">
              <FiBriefcase className="text-yellow-400 text-xl flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-400">Experience</p>
                <p className="font-medium text-gray-800">
                  {trainer.experience ? `${trainer.experience} years` : 'N/A'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 px-6 py-4">
              <FiMail className="text-yellow-400 text-xl flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-400">Email</p>
                <p className="font-medium text-gray-800">{trainer.email || 'N/A'}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 px-6 py-4">
              <FiClock className="text-yellow-400 text-xl flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-400">Time Slot</p>
                <p className="font-medium text-gray-800">{slotDisplay}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 px-6 py-4">
              <FiCalendar className="text-yellow-400 text-xl flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-400">Assigned Since</p>
                <p className="font-medium text-gray-800">
                  {assignedSince
                    ? new Date(assignedSince).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
                    : 'N/A'}
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </MemberLayout>
  );
}

export default MyTrainer;