import { useState, useEffect } from 'react';
import AdminLayout from '../../components/layouts/AdminLayout';
import { adminAPI } from '../../services/api';
import {
  FiMessageSquare,
  FiMail,
  FiCheck,
  FiX,
  FiEye,
  FiSend,
  FiClock,
  FiCheckCircle,
  FiTrash2
} from 'react-icons/fi';
import toast from 'react-hot-toast';

function Inquiries() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getInquiries();
      setInquiries(response.data);
    } catch (error) {
      console.error('Failed to fetch inquiries', error);
      toast.error('Failed to load inquiries');
    } finally {
      setLoading(false);
    }
  };

  const handleViewInquiry = (inquiry) => {
    setSelectedInquiry(inquiry);
    setShowViewModal(true);
  };

  const handleReply = async () => {
    if (!replyText.trim()) {
      toast.error('Please enter a reply message');
      return;
    }

    const loadingToast = toast.loading('Sending reply...');

    try {
      await adminAPI.respondToInquiry(selectedInquiry._id, replyText);

      toast.dismiss(loadingToast);
      toast.success(
        <div>
          <p className="font-semibold">Reply sent successfully!</p>
          <p className="text-xs mt-1">Email sent to: {selectedInquiry.email}</p>
        </div>,
        {
          icon: '',
          duration: 5000
        }
      );

      setShowReplyModal(false);
      setReplyText('');
      setSelectedInquiry(null);
      fetchInquiries();
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error('Failed to send reply', error);
      toast.error(
        <div>
          <p className="font-semibold">Failed to send reply</p>
          <p className="text-xs mt-1">{error.response?.data?.message || 'Please try again'}</p>
        </div>,
        { icon: '', duration: 4000 }
      );
    }
  };

  // Delete inquiry function
  const handleDelete = async (inquiryId, inquiryName) => {
    // Show confirmation toast
    toast((t) => (
      <div className="p-2">
        <p className="font-semibold mb-3">Delete inquiry from {inquiryName}?</p>
        <p className="text-sm text-gray-600 mb-3">This action cannot be undone.</p>
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => {
              toast.dismiss(t.id);
              confirmDelete(inquiryId, inquiryName);
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

  const confirmDelete = async (inquiryId, inquiryName) => {
    setDeletingId(inquiryId);
    const loadingToast = toast.loading(`Deleting inquiry from ${inquiryName}...`);

    try {
      await adminAPI.deleteInquiry(inquiryId);

      toast.dismiss(loadingToast);
      toast.success(
        <div>
          <p className="font-semibold">Inquiry deleted successfully!</p>
          <p className="text-xs mt-1">Message from {inquiryName} has been removed</p>
        </div>,
        { icon: '', duration: 4000 }
      );


      fetchInquiries();


      if (selectedInquiry?._id === inquiryId) {
        setShowViewModal(false);
        setShowReplyModal(false);
        setSelectedInquiry(null);
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error('Failed to delete inquiry', error);
      toast.error(
        <div>
          <p className="font-semibold">Failed to delete inquiry</p>
          <p className="text-xs mt-1">{error.response?.data?.message || 'Please try again'}</p>
        </div>,
        { icon: '', duration: 4000 }
      );
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'replied': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <FiClock className="inline mr-1" size={12} />;
      case 'replied': return <FiCheckCircle className="inline mr-1" size={12} />;
      default: return null;
    }
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Contact Inquiries</h1>
          <button
            onClick={fetchInquiries}
            className="flex items-center gap-2 bg-yellow-400 text-black px-4 py-2 rounded-lg font-semibold hover:bg-yellow-500 transition"
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading inquiries...</p>
          </div>
        ) : inquiries.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <FiMessageSquare className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Inquiries Yet</h3>
            <p className="text-gray-500">When users contact you through the website, their messages will appear here.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Message</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {inquiries.map((inquiry) => (
                    <tr key={inquiry._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(inquiry.createdAt).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{inquiry.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {inquiry.email}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                        {inquiry.message}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full inline-flex items-center ${getStatusColor(inquiry.status)}`}>
                          {getStatusIcon(inquiry.status)}
                          {inquiry.status || 'pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => {
                            setSelectedInquiry(inquiry);
                            setShowReplyModal(true);
                          }}
                          className="text-yellow-400 hover:text-yellow-500 mr-3 inline-flex items-center gap-1"
                          title="Reply to inquiry"
                        >
                          <FiSend /> Reply
                        </button>
                        <button
                          onClick={() => handleViewInquiry(inquiry)}
                          className="text-blue-600 hover:text-blue-800 mr-3 inline-flex items-center gap-1"
                          title="View full message"
                        >
                          <FiEye /> View
                        </button>
                        <button
                          onClick={() => handleDelete(inquiry._id, inquiry.name)}
                          disabled={deletingId === inquiry._id}
                          className="text-red-600 hover:text-red-800 inline-flex items-center gap-1 disabled:opacity-50"
                          title="Delete inquiry"
                        >
                          <FiTrash2 /> {deletingId === inquiry._id ? 'Deleting...' : 'Delete'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* View Message Modal */}
        {showViewModal && selectedInquiry && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Message from {selectedInquiry.name}</h3>
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    setSelectedInquiry(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FiX size={24} />
                </button>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-500">Name</p>
                    <p className="font-medium">{selectedInquiry.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="font-medium">{selectedInquiry.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Date</p>
                    <p className="font-medium">
                      {new Date(selectedInquiry.createdAt).toLocaleString('en-IN', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Status</p>
                    <p className={`font-medium inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${getStatusColor(selectedInquiry.status)}`}>
                      {getStatusIcon(selectedInquiry.status)}
                      {selectedInquiry.status || 'pending'}
                    </p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <p className="text-xs text-gray-500 mb-2">Message</p>
                  <p className="text-gray-800 whitespace-pre-wrap">{selectedInquiry.message}</p>
                </div>

                {selectedInquiry.response && (
                  <div className="mt-4 border-t pt-4">
                    <p className="text-xs text-gray-500 mb-2">Your Reply</p>
                    <div className="bg-green-50 p-3 rounded-lg">
                      <p className="text-gray-800 whitespace-pre-wrap">{selectedInquiry.response}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        Replied on: {new Date(selectedInquiry.respondedAt).toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center gap-3">
                <button
                  onClick={() => handleDelete(selectedInquiry._id, selectedInquiry.name)}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition"
                >
                  <FiTrash2 className="inline mr-2" /> Delete
                </button>
                <div className="flex gap-3">
                  {selectedInquiry.status === 'pending' && (
                    <button
                      onClick={() => {
                        setShowViewModal(false);
                        setShowReplyModal(true);
                      }}
                      className="px-4 py-2 bg-yellow-400 text-black rounded-lg font-semibold hover:bg-yellow-500 transition"
                    >
                      <FiSend className="inline mr-2" /> Reply
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setShowViewModal(false);
                      setSelectedInquiry(null);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reply Modal */}
        {showReplyModal && selectedInquiry && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-lg w-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Reply to {selectedInquiry.name}</h3>
                <button
                  onClick={() => {
                    setShowReplyModal(false);
                    setReplyText('');
                    setSelectedInquiry(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FiX size={24} />
                </button>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  <span className="font-medium">Original Message:</span>
                </p>
                <p className="text-gray-800 mb-2">"{selectedInquiry.message}"</p>
                <p className="text-xs text-gray-500">
                  Replying to: <span className="font-medium">{selectedInquiry.email}</span>
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Reply <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  placeholder="Type your reply here... (This will be sent to the user's email)"
                  autoFocus
                />
                <p className="text-xs text-gray-500 mt-1">
                  <FiMail className="inline mr-1" /> This reply will be emailed to {selectedInquiry.email}
                </p>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowReplyModal(false);
                    setReplyText('');
                    setSelectedInquiry(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReply}
                  disabled={!replyText.trim()}
                  className="px-4 py-2 bg-yellow-400 text-black rounded-lg font-semibold hover:bg-yellow-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiSend className="inline mr-2" /> Send Reply
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export default Inquiries;