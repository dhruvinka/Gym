import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/layouts/AdminLayout';
import { adminAPI } from '../../services/api';
import { FiEdit2, FiTrash2, FiUserPlus, FiCheck, FiX, FiClock } from 'react-icons/fi';
import toast from 'react-hot-toast';

function ManageTrainers() {
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTrainer, setEditingTrainer] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    specialization: '',
    experience: ''
  });

  useEffect(() => {
    fetchTrainers();
  }, []);

  const fetchTrainers = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getTrainers();
      setTrainers(response.data);
    } catch (error) {
      console.error('Failed to fetch trainers', error);
      toast.error('Failed to load trainers');
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
    try {
      if (editingTrainer) {
        // Update trainer
        await adminAPI.updateTrainer(editingTrainer._id, formData);
        toast.success('Trainer updated successfully');
      } else {
        // Add new trainer
        await adminAPI.addTrainer(formData);
        toast.success('Trainer added successfully');
      }
      setShowModal(false);
      setEditingTrainer(null);
      setFormData({ name: '', email: '', specialization: '', experience: '' });
      fetchTrainers();
    } catch (error) {
      console.error('Failed to save trainer', error);
      toast.error(error.response?.data?.message || 'Failed to save trainer');
    }
  };

  const handleEdit = (trainer) => {
    setEditingTrainer(trainer);
    setFormData({
      name: trainer.userId?.name || '',
      email: trainer.userId?.email || '',
      specialization: trainer.specialization || '',
      experience: trainer.experience || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (trainerId) => {
    if (!window.confirm('Are you sure you want to delete this trainer?')) return;
    
    try {
      await adminAPI.deleteTrainer(trainerId);
      toast.success('Trainer deleted successfully');
      fetchTrainers();
    } catch (error) {
      console.error('Failed to delete trainer', error);
      toast.error('Failed to delete trainer');
    }
  };

  const toggleStatus = async (trainerId, currentStatus) => {
    try {
      await adminAPI.updateTrainer(trainerId, { activeStatus: !currentStatus });
      toast.success(`Trainer ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      fetchTrainers();
    } catch (error) {
      console.error('Failed to update status', error);
      toast.error('Failed to update status');
    }
  };

  // Slot labels for display
  const slotLabels = {
    MORNING_5_7: '5-7 AM',
    MORNING_7_9: '7-9 AM',
    MORNING_9_11: '9-11 AM',
    EVENING_5_7: '5-7 PM',
    EVENING_7_9: '7-9 PM',
    EVENING_9_11: '9-11 PM'
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Manage Trainers</h1>
          <button
            onClick={() => {
              setEditingTrainer(null);
              setFormData({ name: '', email: '', specialization: '', experience: '' });
              setShowModal(true);
            }}
            className="flex items-center gap-2 bg-yellow-400 text-black px-4 py-2 rounded-lg font-semibold hover:bg-yellow-500 transition"
          >
            <FiUserPlus /> Add New Trainer
          </button>
        </div>

        {/* Trainers Grid */}
        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {trainers.map((trainer) => (
              <div key={trainer._id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-xl font-bold">{trainer.userId?.name}</h2>
                      <p className="text-gray-600">{trainer.specialization}</p>
                      <p className="text-sm text-gray-500">{trainer.experience} years experience</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleStatus(trainer._id, trainer.activeStatus)}
                        className={`p-2 rounded-full ${
                          trainer.activeStatus 
                            ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                            : 'bg-red-100 text-red-600 hover:bg-red-200'
                        }`}
                      >
                        {trainer.activeStatus ? <FiCheck /> : <FiX />}
                      </button>
                      <button
                        onClick={() => handleEdit(trainer)}
                        className="p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200"
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        onClick={() => handleDelete(trainer._id)}
                        className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>

                  {/* Slot Occupancy */}
                  <div className="mt-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                      <FiClock /> Slot Occupancy
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(slotLabels).map(([slot, label]) => (
                        <div key={slot} className="text-sm">
                          <span className="text-gray-600">{label}:</span>
                          <span className="ml-2 font-semibold">
                            {trainer.currentSlotMembers?.[slot] || 0}/5
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Total Members */}
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-gray-600">
                      Total Members: <span className="font-bold">
                        {Object.values(trainer.currentSlotMembers || {}).reduce((a, b) => a + b, 0)}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full">
              <h2 className="text-2xl font-bold mb-6">
                {editingTrainer ? 'Edit Trainer' : 'Add New Trainer'}
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      disabled={editingTrainer}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Specialization
                    </label>
                    <input
                      type="text"
                      name="specialization"
                      value={formData.specialization}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Experience (years)
                    </label>
                    <input
                      type="number"
                      name="experience"
                      value={formData.experience}
                      onChange={handleInputChange}
                      required
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-4 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-yellow-400 text-black rounded-lg font-semibold hover:bg-yellow-500"
                  >
                    {editingTrainer ? 'Update' : 'Add'} Trainer
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export default ManageTrainers;