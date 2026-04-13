import { useState, useEffect } from 'react';
import { memberAPI } from '../../services/api';
import MemberLayout from '../../components/layouts/MemberLayout';
import { useAuth } from '../../context/AuthContext';

function MemberDashboard() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const { hasMembership, plan } = useAuth();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await memberAPI.getProfile();
      setProfile(response.data);
    } catch (error) {
      console.error('Failed to fetch profile', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MemberLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-8">Member Dashboard</h1>
        
        {loading ? (
          <div>Loading...</div>
        ) : (
          <div className="grid gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Welcome, {profile?.userId?.name}</h2>
              <div className="mt-4">
                <p className="text-gray-600">Membership Status: 
                  <span className={`ml-2 font-semibold ${hasMembership ? 'text-green-600' : 'text-red-600'}`}>
                    {hasMembership ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                </p>
                {hasMembership && (
                  <p className="text-gray-600 mt-2">Plan: <span className="font-semibold">{plan}</span></p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </MemberLayout>
  );
}

export default MemberDashboard;