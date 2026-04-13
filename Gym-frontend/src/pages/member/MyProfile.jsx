import { useState, useEffect } from 'react';
import MemberLayout from '../../components/layouts/MemberLayout';
import { memberAPI, photoAPI } from '../../services/api';
import { 
  FiUser, 
  FiMail, 
  FiCalendar, 
  FiClock, 
  FiEdit2, 
  FiSave, 
  FiX,
  FiCamera,
  FiTrash2,
  FiXCircle,
  FiCheckCircle,
  FiAlertTriangle
} from 'react-icons/fi';
import toast from 'react-hot-toast';

function MyProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    phone: '',
    age: '',
    gender: '',
    height: '',
    weight: '',
    fitnessGoal: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const loadingToast = toast.loading('Loading profile...');
    
    try {
      const response = await memberAPI.getProfile();
      setProfile(response.data);
      
      setFormData({
        phone: response.data.phone || '',
        age: response.data.age || '',
        gender: response.data.gender || '',
        height: response.data.height || '',
        weight: response.data.weight || '',
        fitnessGoal: response.data.fitnessGoal || ''
      });
      
      toast.dismiss(loadingToast);
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error('Failed to fetch profile', error);
      toast.error(
        <div>
          <p className="font-semibold">Failed to load profile</p>
          <p className="text-xs mt-1">Please try again later</p>
        </div>,
        { 
          icon: <FiXCircle className="text-red-500" />,
          duration: 4000 
        }
      );
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const loadingToast = toast.loading('Updating profile...');
    
    try {
      await memberAPI.updateProfile(formData);
      
      toast.dismiss(loadingToast);
      toast.success(
        <div>
          <p className="font-semibold">Profile updated successfully!</p>
          <p className="text-xs mt-1">Your changes have been saved</p>
        </div>,
        { 
          icon: <FiCheckCircle className="text-green-500" />,
          duration: 4000 
        }
      );
      
      setEditing(false);
      fetchProfile();
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error('Failed to update profile', error);
      toast.error(
        <div>
          <p className="font-semibold">Failed to update profile</p>
          <p className="text-xs mt-1">{error.response?.data?.message || 'Please try again'}</p>
        </div>,
        { 
          icon: <FiXCircle className="text-red-500" />,
          duration: 4000 
        }
      );
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.match(/image\/(jpeg|jpg|png|gif|webp)/)) {
      toast.error(
        <div>
          <p className="font-semibold">Invalid file type</p>
          <p className="text-xs mt-1">Please upload a valid image (JPEG, PNG, GIF, WEBP)</p>
        </div>,
        { 
          icon: <FiAlertTriangle className="text-yellow-500" />,
          duration: 4000 
        }
      );
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error(
        <div>
          <p className="font-semibold">File too large</p>
          <p className="text-xs mt-1">Maximum file size is 5MB</p>
        </div>,
        { 
          icon: <FiAlertTriangle className="text-yellow-500" />,
          duration: 4000 
        }
      );
      return;
    }

    const formData = new FormData();
    formData.append('photo', file);

    setUploading(true);
    const loadingToast = toast.loading('Uploading photo...');
    
    try {
      const response = await photoAPI.uploadMemberPhoto(formData);
      
      toast.dismiss(loadingToast);
      toast.success(
        <div>
          <p className="font-semibold">Photo uploaded successfully!</p>
          <p className="text-xs mt-1">Your profile picture has been updated</p>
        </div>,
        { 
          icon: <FiCamera className="text-blue-500" />,
          duration: 4000 
        }
      );
      
      fetchProfile(); // Refresh profile to show new photo
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error('Failed to upload photo', error);
      toast.error(
        <div>
          <p className="font-semibold">Failed to upload photo</p>
          <p className="text-xs mt-1">{error.response?.data?.message || 'Please try again'}</p>
        </div>,
        { 
          icon: <FiXCircle className="text-red-500" />,
          duration: 4000 
        }
      );
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePhoto = async () => {
    // Custom confirmation toast
    toast((t) => (
      <div className="p-2">
        <p className="font-semibold mb-3">Delete profile photo?</p>
        <p className="text-sm text-gray-600 mb-3">This action cannot be undone.</p>
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => {
              toast.dismiss(t.id);
              confirmDeletePhoto();
            }}
            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Yes, Delete
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      </div>
    ), {
      duration: 8000,
      position: 'top-center',
    });
  };

  const confirmDeletePhoto = async () => {
    const loadingToast = toast.loading('Deleting photo...');
    
    try {
      await photoAPI.deleteMemberPhoto();
      
      toast.dismiss(loadingToast);
      toast.success(
        <div>
          <p className="font-semibold">Photo deleted successfully!</p>
          <p className="text-xs mt-1">Your profile photo has been removed</p>
        </div>,
        { 
          icon: <FiTrash2 className="text-red-500" />,
          duration: 4000 
        }
      );
      
      fetchProfile();
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error('Failed to delete photo', error);
      toast.error(
        <div>
          <p className="font-semibold">Failed to delete photo</p>
          <p className="text-xs mt-1">{error.response?.data?.message || 'Please try again'}</p>
        </div>,
        { 
          icon: <FiXCircle className="text-red-500" />,
          duration: 4000 
        }
      );
    }
  };

  const handleCancelEdit = () => {
    toast.success('Edit cancelled', {
      icon: <FiX className="text-gray-500" />,
      duration: 2000
    });
    setEditing(false);
    // Reset form to original values
    if (profile) {
      setFormData({
        phone: profile.phone || '',
        age: profile.age || '',
        gender: profile.gender || '',
        height: profile.height || '',
        weight: profile.weight || '',
        fitnessGoal: profile.fitnessGoal || ''
      });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const slotLabels = {
    MORNING_5_7: 'Morning 5:00 AM - 7:00 AM',
    MORNING_7_9: 'Morning 7:00 AM - 9:00 AM',
    MORNING_9_11: 'Morning 9:00 AM - 11:00 AM',
    EVENING_5_7: 'Evening 5:00 PM - 7:00 PM',
    EVENING_7_9: 'Evening 7:00 PM - 9:00 PM',
    EVENING_9_11: 'Evening 9:00 PM - 11:00 PM'
  };

  if (loading) {
    return (
      <MemberLayout>
        <div className="p-6 flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
          <p className="ml-3 text-gray-600">Loading profile...</p>
        </div>
      </MemberLayout>
    );
  }

  return (
    <MemberLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">My Profile</h1>
          {!editing && (
            <button
              onClick={() => {
                setEditing(true);
                toast.success('Edit mode enabled', {
                  icon: <FiEdit2 className="text-yellow-500" />,
                  duration: 2000
                });
              }}
              className="flex items-center gap-2 bg-yellow-400 text-black px-4 py-2 rounded-lg font-semibold hover:bg-yellow-500 transition"
            >
              <FiEdit2 /> Edit Profile
            </button>
          )}
        </div>

        {/* Profile Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Summary Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="text-center mb-6">
                {/* Profile Photo */}
                <div className="relative inline-block">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-yellow-400 mx-auto mb-4">
                    {profile?.profilePhoto?.url ? (
                      <img 
                        src={profile.profilePhoto.url} 
                        alt={profile.userId?.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <FiUser className="text-4xl text-gray-400" />
                      </div>
                    )}
                  </div>
                  
                  {/* Photo upload buttons */}
                  <div className="absolute -bottom-2 right-1/2 transform translate-x-16 flex gap-2">
                    <label className={`cursor-pointer ${uploading ? 'opacity-50 cursor-not-allowed' : ''} bg-yellow-400 text-black p-2 rounded-full hover:bg-yellow-500 transition`}>
                      <FiCamera size={16} />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                        disabled={uploading}
                      />
                    </label>
                    {profile?.profilePhoto?.url && (
                      <button
                        onClick={handleDeletePhoto}
                        disabled={uploading}
                        className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition disabled:opacity-50"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    )}
                  </div>
                  {uploading && (
                    <p className="text-xs text-yellow-400 mt-2 animate-pulse">Uploading...</p>
                  )}
                </div>

                <h2 className="text-xl font-bold">{profile?.userId?.name || 'Member'}</h2>
                <p className="text-gray-600 text-sm">{profile?.userId?.email || ''}</p>
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center gap-3 mb-3">
                  <FiCalendar className="text-yellow-400" />
                  <div>
                    <p className="text-xs text-gray-500">Member Since</p>
                    <p className="text-sm font-medium">{formatDate(profile?.startDate)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FiClock className="text-yellow-400" />
                  <div>
                    <p className="text-xs text-gray-500">Membership Plan</p>
                    <p className="text-sm font-medium">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        profile?.plan === 'PREMIUM' 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {profile?.plan || 'N/A'}
                      </span>
                    </p>
                  </div>
                </div>
                {profile?.plan === 'PREMIUM' && profile?.timeSlot && (
                  <div className="mt-3 text-sm text-gray-600">
                    <span className="font-medium">Time Slot:</span> {slotLabels[profile.timeSlot]}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Profile Details Card */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-6">Personal Information</h3>

              {editing ? (
                // Edit Mode
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        placeholder="Enter phone number"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Age
                      </label>
                      <input
                        type="number"
                        name="age"
                        min={1}
                        value={formData.age}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        placeholder="Enter age"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Gender
                      </label>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      >
                        <option value="">Select Gender</option>
                        <option value="MALE">Male</option>
                        <option value="FEMALE">Female</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Height (cm)
                      </label>
                      <input
                        type="number"
                        name="height"
                        value={formData.height}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        placeholder="Enter height"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Weight (kg)
                      </label>
                      <input
                        type="number"
                        name="weight"
                        value={formData.weight}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        placeholder="Enter weight"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Fitness Goal
                      </label>
                      <select
                        name="fitnessGoal"
                        value={formData.fitnessGoal}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      >
                        <option value="">Select Goal</option>
                        <option value="WEIGHT_LOSS">Weight Loss</option>
                        <option value="MUSCLE_GAIN">Muscle Gain</option>
                        <option value="STRENGTH">Strength Training</option>
                        <option value="ENDURANCE">Endurance</option>
                        <option value="FLEXIBILITY">Flexibility</option>
                        <option value="GENERAL_FITNESS">General Fitness</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end gap-4 mt-6">
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      <FiX /> Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex items-center gap-2 bg-yellow-400 text-black px-4 py-2 rounded-lg font-semibold hover:bg-yellow-500"
                    >
                      <FiSave /> Save Changes
                    </button>
                  </div>
                </form>
              ) : (
                // View Mode
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-xs text-gray-500">Phone Number</p>
                      <p className="font-medium">{profile?.phone || 'Not provided'}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-xs text-gray-500">Age</p>
                      <p className="font-medium">{profile?.age ? `${profile.age} years` : 'Not provided'}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-xs text-gray-500">Gender</p>
                      <p className="font-medium">{profile?.gender || 'Not provided'}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-xs text-gray-500">Height/Weight</p>
                      <p className="font-medium">
                        {profile?.height ? `${profile.height} cm` : '-'} / 
                        {profile?.weight ? ` ${profile.weight} kg` : '-'}
                      </p>
                    </div>
                    <div className="md:col-span-2 bg-gray-50 p-4 rounded-lg">
                      <p className="text-xs text-gray-500">Fitness Goal</p>
                      <p className="font-medium">{profile?.fitnessGoal?.replace(/_/g, ' ') || 'Not set'}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MemberLayout>
  );
}

export default MyProfile;