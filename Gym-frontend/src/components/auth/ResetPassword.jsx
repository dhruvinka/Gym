import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authAPI } from '../../services/api';
import { FiLock, FiCheck, FiX, FiArrowLeft } from 'react-icons/fi';
import toast from 'react-hot-toast';

function ResetPassword() {
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState('');
  const [tokenValid, setTokenValid] = useState(true);
  const [passwordValid, setPasswordValid] = useState({
    length: false
  });

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Get token from URL query parameters
    const params = new URLSearchParams(location.search);
    const tokenParam = params.get('token');

    if (tokenParam) {
      setToken(tokenParam);
    } else {
      setTokenValid(false);
      toast.error('Invalid reset link. Please request a new one.');
    }
  }, [location]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Validate password strength
    if (name === 'newPassword') {
      setPasswordValid({
        length: value.length >= 8
      });
    }
  };

  const validatePassword = () => {
    return Object.values(passwordValid).every(Boolean);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate passwords match
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    // Validate password strength
    if (!validatePassword()) {
      toast.error('Please meet all password requirements');
      return;
    }

    setLoading(true);

    try {
      await authAPI.resetPassword({
        token: token,
        newPassword: formData.newPassword
      });

      toast.success('Password reset successful! Please login with your new password.');

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      console.error('Failed to reset password:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!tokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat relative"
        style={{
          backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80')"
        }}
      >
        <div className="max-w-md w-full bg-white/95 backdrop-blur-sm p-10 rounded-2xl shadow-2xl mx-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiX className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Invalid Reset Link
            </h2>
            <p className="text-gray-600 mb-6">
              The password reset link is invalid or has expired.
            </p>
            <Link
              to="/forgot-password"
              className="inline-flex items-center text-sm font-medium text-yellow-400 hover:text-yellow-500"
            >
              <FiArrowLeft className="mr-2" />
              Request a new reset link
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const PasswordRequirement = ({ valid, text }) => (
    <div className="flex items-center text-sm">
      {valid ? (
        <FiCheck className="text-green-500 mr-2 flex-shrink-0" />
      ) : (
        <FiX className="text-red-500 mr-2 flex-shrink-0" />
      )}
      <span className={valid ? 'text-green-700' : 'text-red-700'}>{text}</span>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat relative"
      style={{
        backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80')"
      }}
    >
      {/* Decorative overlay elements */}
      <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-black to-transparent"></div>
      <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-black to-transparent"></div>

      <div className="max-w-md w-full space-y-8 bg-white/95 backdrop-blur-sm p-8 rounded-2xl shadow-2xl relative z-10 mx-4">
        {/* Gym Logo/Brand */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            TITAN <span className="text-yellow-400">FIT</span>          </h1>
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center">
              <FiLock className="h-8 w-8 text-black" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Set new password
          </h2>
          <p className="text-gray-600">
            Create a strong password for your account
          </p>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          {/* New Password */}
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
              New Password
            </label>
            <div className="mt-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiLock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                required
                value={formData.newPassword}
                onChange={handleChange}
                className="appearance-none block w-full pl-10 px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                placeholder="Enter new password"
              />
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <div className="mt-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiLock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="appearance-none block w-full pl-10 px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                placeholder="Confirm new password"
              />
            </div>
          </div>

          {/* Password Requirements */}
          {formData.newPassword && (
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <p className="text-sm font-medium text-gray-700 mb-2">Password requirements:</p>
              <PasswordRequirement valid={passwordValid.length} text="At least 8 characters" />
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading || !validatePassword() || formData.newPassword !== formData.confirmPassword}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-black bg-yellow-400 hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Resetting...' : 'RESET PASSWORD'}
            </button>
          </div>

          <div className="text-center pt-2 border-t">
            <Link to="/login" className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-yellow-400">
              <FiArrowLeft className="mr-2" />
              Back to login
            </Link>
          </div>
        </form>

        {/* Motivational Quote */}
        <div className="text-center text-sm text-gray-500 italic">
          "A new password, a renewed commitment to your fitness goals."
        </div>
      </div >
    </div >
  );
}

export default ResetPassword;