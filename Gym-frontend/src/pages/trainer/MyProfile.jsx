import { useState, useEffect } from 'react';
import TrainerLayout from '../../components/layouts/TrainerLayout';
import { trainerAPI, photoAPI } from '../../services/api';
import {
  FiUser,
  FiMail,
  FiEdit2,
  FiSave,
  FiX,
  FiCamera,
  FiTrash2,
  FiCheckCircle,
  FiXCircle,
  FiAlertTriangle,
  FiStar,
  FiBriefcase,
  FiFileText,
} from 'react-icons/fi';
import toast from 'react-hot-toast';

function TrainerProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    specialization: '',
    experience: '',
    bio: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const t = toast.loading('Loading profile...');
    try {
      const res = await trainerAPI.getProfile();
      setProfile(res.data);
      setFormData({
        specialization: res.data.specialization || '',
        experience: res.data.experience || '',
        bio: res.data.bio || '',
      });
      toast.dismiss(t);
    } catch (err) {
      toast.dismiss(t);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const t = toast.loading('Updating profile...');
    try {
      await trainerAPI.updateProfile(formData);
      toast.dismiss(t);
      toast.success(
        <div>
          <p className="font-semibold">Profile updated!</p>
          <p className="text-xs mt-1">Your changes have been saved</p>
        </div>,
        { icon: <FiCheckCircle className="text-green-500" />, duration: 4000 }
      );
      setEditing(false);
      fetchProfile();
    } catch (err) {
      toast.dismiss(t);
      toast.error(
        <div>
          <p className="font-semibold">Failed to update</p>
          <p className="text-xs mt-1">{err.response?.data?.message || 'Please try again'}</p>
        </div>,
        { icon: <FiXCircle className="text-red-500" />, duration: 4000 }
      );
    }
  };

  const handleCancelEdit = () => {
    setEditing(false);
    if (profile) {
      setFormData({
        specialization: profile.specialization || '',
        experience: profile.experience || '',
        bio: profile.bio || '',
      });
    }
    toast.success('Edit cancelled', { icon: <FiX className="text-gray-500" />, duration: 2000 });
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.match(/image\/(jpeg|jpg|png|gif|webp)/)) {
      toast.error('Invalid file type. Use JPEG, PNG, GIF or WEBP.', {
        icon: <FiAlertTriangle className="text-yellow-500" />,
      });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File too large. Max size is 5 MB.', {
        icon: <FiAlertTriangle className="text-yellow-500" />,
      });
      return;
    }

    const fd = new FormData();
    fd.append('photo', file);
    setUploading(true);
    const t = toast.loading('Uploading photo...');
    try {
      await photoAPI.uploadTrainerPhoto(fd);
      toast.dismiss(t);
      toast.success('Photo uploaded!', { icon: <FiCamera className="text-blue-500" /> });
      fetchProfile();
    } catch (err) {
      toast.dismiss(t);
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePhoto = () => {
    toast(
      (toastRef) => (
        <div className="p-2">
          <p className="font-semibold mb-2">Delete profile photo?</p>
          <p className="text-sm text-gray-600 mb-3">This cannot be undone.</p>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => { toast.dismiss(toastRef.id); confirmDeletePhoto(); }}
              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Delete
            </button>
            <button
              onClick={() => toast.dismiss(toastRef.id)}
              className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      { duration: 8000, position: 'top-center' }
    );
  };

  const confirmDeletePhoto = async () => {
    const t = toast.loading('Deleting photo...');
    try {
      await photoAPI.deleteTrainerPhoto();
      toast.dismiss(t);
      toast.success('Photo deleted', { icon: <FiTrash2 className="text-red-500" /> });
      fetchProfile();
    } catch (err) {
      toast.dismiss(t);
      toast.error(err.response?.data?.message || 'Failed to delete photo');
    }
  };

  if (loading) {
    return (
      <TrainerLayout>
        <div className="p-6 flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400" />
          <p className="ml-3 text-gray-600">Loading profile...</p>
        </div>
      </TrainerLayout>
    );
  }

  return (
    <TrainerLayout>
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
                  duration: 2000,
                });
              }}
              className="flex items-center gap-2 bg-yellow-400 text-black px-4 py-2 rounded-lg font-semibold hover:bg-yellow-500 transition"
            >
              <FiEdit2 /> Edit Profile
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── LEFT: Summary Card ── */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="text-center mb-6">

                {/* Photo */}
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

                  {/* Upload / Delete buttons */}
                  <div className="absolute -bottom-2 right-1/2 transform translate-x-16 flex gap-2">
                    <label
                      className={`cursor-pointer ${uploading ? 'opacity-50 cursor-not-allowed' : ''} bg-yellow-400 text-black p-2 rounded-full hover:bg-yellow-500 transition`}
                    >
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
                    <p className="text-xs text-yellow-500 mt-2 animate-pulse">Uploading...</p>
                  )}
                </div>

                <h2 className="text-xl font-bold mt-2">{profile?.userId?.name || 'Trainer'}</h2>
                <p className="text-gray-500 text-sm">{profile?.userId?.email || ''}</p>
              </div>

              {/* Read-only stats */}
              <div className="border-t pt-4 space-y-3">
                <div className="flex items-center gap-3">
                  <FiStar className="text-yellow-400 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500">Specialization</p>
                    <p className="text-sm font-medium">{profile?.specialization || 'Not set'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FiBriefcase className="text-yellow-400 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500">Experience</p>
                    <p className="text-sm font-medium">
                      {profile?.experience ? `${profile.experience} years` : 'Not set'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div
                    className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${profile?.activeStatus ? 'bg-green-500' : 'bg-red-500'
                      }`}
                  />
                  <div>
                    <p className="text-xs text-gray-500">Status</p>
                    <p className={`text-sm font-medium ${profile?.activeStatus ? 'text-green-600' : 'text-red-600'}`}>
                      {profile?.activeStatus ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── RIGHT: Details / Edit Card ── */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-6">Professional Information</h3>

              {editing ? (
                /* ── Edit Form ── */
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    {/* Specialization */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Specialization
                      </label>
                      <input
                        type="text"
                        name="specialization"
                        value={formData.specialization}
                        onChange={handleInputChange}
                        placeholder="e.g. Weight Training"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      />
                    </div>

                    {/* Experience */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Experience (years)
                      </label>
                      <input
                        type="number"
                        name="experience"
                        min="0"
                        value={formData.experience}
                        onChange={handleInputChange}
                        placeholder="e.g. 5"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      />
                    </div>

                    {/* Bio */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Bio
                      </label>
                      <textarea
                        name="bio"
                        rows={4}
                        value={formData.bio}
                        onChange={handleInputChange}
                        placeholder="Tell members about yourself..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-none"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 mt-6">
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                    >
                      <FiX /> Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex items-center gap-2 bg-yellow-400 text-black px-4 py-2 rounded-lg font-semibold hover:bg-yellow-500 transition"
                    >
                      <FiSave /> Save Changes
                    </button>
                  </div>
                </form>
              ) : (
                /* ── View Mode ── */
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Full Name</p>
                      <p className="font-medium">{profile?.userId?.name || 'N/A'}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Email</p>
                      <p className="font-medium">{profile?.userId?.email || 'N/A'}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Specialization</p>
                      <p className="font-medium">{profile?.specialization || 'Not set'}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Experience</p>
                      <p className="font-medium">
                        {profile?.experience ? `${profile.experience} years` : 'Not set'}
                      </p>
                    </div>
                    <div className="md:col-span-2 bg-gray-50 p-4 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                        <FiFileText className="text-yellow-500" /> Bio
                      </p>
                      <p className="font-medium text-gray-700 leading-relaxed">
                        {profile?.bio || 'No bio added yet.'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </TrainerLayout>
  );
}

export default TrainerProfile;
