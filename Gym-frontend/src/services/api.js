import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = 'http://localhost:5000/api';

// List of public endpoints that don't need authentication
const publicEndpoints = [
  '/auth/login',
  '/auth/register',
  '/auth/verify-otp',
  '/auth/resend-otp',
  '/auth/forgot-password',
  '/auth/reset-password'
];

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});


export const inquiryAPI = {
  submitInquiry: (data) => api.post('/inquiry/submit', data), // This will be public
};

export const publicAPI = {
  getTrainers: () => api.get('/public/trainers'), // This will be public
};


// Photo APIs (protected)
export const photoAPI = {
  uploadMemberPhoto: (formData) => api.post('/photo/member/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteMemberPhoto: () => api.delete('/photo/member/delete'),
  uploadTrainerPhoto: (formData) => api.post('/photo/trainer/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteTrainerPhoto: () => api.delete('/photo/trainer/delete'),
};



// Request interceptor to add token ONLY for protected endpoints
api.interceptors.request.use(
  (config) => {
    // Check if this is a public endpoint
    const isPublicEndpoint = publicEndpoints.some(endpoint =>
      config.url.includes(endpoint)
    );

    console.log(`Request to ${config.url} - isPublic: ${isPublicEndpoint}`);

    // Only add token for non-public endpoints
    if (!isPublicEndpoint) {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('Added token to request');
      }
    } else {
      console.log('Public endpoint - no token added');
      // Ensure no Authorization header is sent for public endpoints
      delete config.headers.Authorization;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Don't show toast for 401 on public endpoints
    const isPublicEndpoint = error.config?.url ?
      publicEndpoints.some(endpoint => error.config.url.includes(endpoint)) :
      false;

    console.log('Error response:', {
      url: error.config?.url,
      status: error.response?.status,
      isPublic: isPublicEndpoint,
      message: error.response?.data?.message
    });

    // Handle unauthorized access only for protected endpoints
    if (error.response?.status === 401 && !isPublicEndpoint) {
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      localStorage.removeItem('hasMembership');
      window.location.href = '/login';
      toast.error('Session expired. Please login again.');
    } else if (!isPublicEndpoint) {
      const message = error.response?.data?.message || 'Something went wrong';
      toast.error(message);
    }

    return Promise.reject(error);
  }
);

// Auth APIs - these will automatically be treated as public
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  verifyOtp: (data) => api.post('/auth/verify-otp', data),
  resendOtp: (email) => api.post('/auth/resend-otp', { email }),
  login: (credentials) => api.post('/auth/login', credentials),
  getMe: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data) => api.post('/auth/reset-password', data),
};

// Member API
export const memberAPI = {
  getProfile: () => api.get('/member/profile'),
  updateProfile: (data) => api.put('/member/profile', data),
  getSubscription: () => api.get('/member/subscription'),
  getMyTrainer: () => api.get('/member/my-trainer'),
  getDietPlan: () => api.get('/member/diet-plan'),
  getMySchedule: () => api.get('/member/my-schedule'),
};

// Trainer API
export const trainerAPI = {
  getProfile: () => api.get('/trainer/profile'),
  updateProfile: (data) => api.put('/trainer/profile', data),
  getSchedules: () => api.get('/trainer/schedules'),
  getMembers: () => api.get('/trainer/members'),
  getDietPlans: () => api.get('/trainer/diet-plans'),
  createDietPlan: (data) => api.post('/trainer/diet-plan', data),
  updateDietPlan: (id, data) => api.put(`/trainer/diet-plan/${id}`, data),
  deleteDietPlan: (id) => api.delete(`/trainer/diet-plan/${id}`),
  getDietPlanById: (id) => api.get(`/trainer/diet-plan/${id}`),
};

// Admin APIs (protected)
export const adminAPI = {
  getTrainers: () => api.get('/admin/trainers'),
  addTrainer: (data) => api.post('/admin/trainers', data),
  updateTrainer: (id, data) => api.put(`/admin/trainers/${id}`, data),
  deleteTrainer: (id) => api.delete(`/admin/trainers/${id}`),
  getTrainerAvailableSlots: (trainerId) => api.get(`/admin/trainers/${trainerId}/available-slots`),
  getAllAvailableSlots: () => api.get('/admin/available-slots'),
  getMembers: () => api.get('/admin/members'),
  updateMemberStatus: (id, status) => api.put(`/admin/members/${id}/status`, { status }),
  assignTrainer: (data) => api.post('/admin/assign-trainer', data),
  reassignMemberSlot: (data) => api.post('/admin/reassign-slot', data),
  removeMemberFromTrainer: (memberId) => api.delete(`/admin/members/${memberId}/remove-trainer`),
  getDashboard: () => api.get('/admin/dashboard'),
  getInquiries: () => api.get('/admin/inquiries'),
  respondToInquiry: (id, response) => api.post(`/admin/inquiries/${id}/respond`, { response }),
  deleteInquiry: (id) => api.delete(`/admin/inquiries/${id}`),

};

// Payment APIs
export const paymentAPI = {
  getAvailableTimeSlots: () => api.get('/payment/available-slots'),
  createOrder: (plan) => api.post('/payment/create-order', { plan }),
  verifyPayment: (data) => api.post('/payment/verify-payment', data),
  getMyPayments: () => api.get('/payment/my-payments'),
  getAllPayments: () => api.get('/payment'),
};

export default api;