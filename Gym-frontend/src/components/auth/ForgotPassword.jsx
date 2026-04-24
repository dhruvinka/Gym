import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authAPI } from '../../services/api';
import { FiMail, FiArrowLeft, FiCheckCircle, FiAlertCircle, FiLock, FiXCircle, FiClock } from 'react-icons/fi';
import toast from 'react-hot-toast';

function ForgotPassword() {
  const location = useLocation();
  const navigate = useNavigate();

  const [email, setEmail] = useState(location.state?.email || '');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [emailExists, setEmailExists] = useState(true);

  useEffect(() => {
    if (!email) {
      toast.error('Please enter your email on the login page first');
      navigate('/login');
    }
  }, [email, navigate]);


  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address';
    }
    return '';
  };

  useEffect(() => {
    if (email) {
      setEmailError(validateEmail(email));
    }
  }, [email]);

  const handleSubmit = async (e) => {
    e.preventDefault();


    const validationError = validateEmail(email);
    if (validationError) {
      setEmailError(validationError);
      toast.error(validationError);
      return;
    }

    setLoading(true);

    try {

      const response = await authAPI.forgotPassword(email);

      setSubmitted(true);
      setEmailExists(true);

      toast.success("Reset Link sent to your register Email");

    } catch (error) {
      console.error('Password reset request failed:', error);

      if (error.response?.status === 404) {
        setEmailExists(false);
        toast.error(
          <div>
            <p className="font-semibold">Email not found</p>
            <p className="text-xs mt-1">No account exists with this email address</p>
          </div>,
          {
            icon: <FiXCircle className="text-red-500" />,
            duration: 5000
          }
        );
      }
      else {
        toast.error(
          <div>
            <p className="font-semibold">Something went wrong</p>
            <p className="text-xs mt-1">Please try again later</p>
          </div>,
          {
            icon: <FiXCircle className="text-red-500" />,
            duration: 5000
          }
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    try {
      await authAPI.forgotPassword(email);
      toast.success('New reset link sent! Check your email', {
        icon: <FiMail className="text-yellow-500" />,
        duration: 4000
      });
    } catch (error) {
      toast.error('Failed to resend. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!email) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat relative"
      style={{
        backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('https://images.unsplash.com/photo-1517836357463-d25dfeac3438?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80')"
      }}
    >

      <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-black to-transparent"></div>
      <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-black to-transparent"></div>

      <div className="max-w-md w-full space-y-8 bg-white/95 backdrop-blur-sm p-10 rounded-2xl shadow-2xl relative z-10 mx-4">

        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            TITAN <span className="text-yellow-400">FIT</span>
          </h1>
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center">
              <svg className="h-8 w-8 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Reset your password
          </h2>
          <p className="text-gray-600">
            {!submitted
              ? 'We\'ll send a reset link to your email'
              : 'Check your email for the reset link'}
          </p>
        </div>

        {!submitted ? (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  readOnly
                  disabled
                  className="appearance-none block w-full pl-10 px-3 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <FiLock className="h-5 w-5 text-gray-400" />
                </div>
              </div>
              <p className="mt-1 text-xs text-gray-500 flex items-center gap-1">
                <FiLock size={12} /> Password reset link will be sent to this email.
              </p>
            </div>


            <div>
              <button
                type="submit"
                disabled={loading || !!emailError}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-black bg-yellow-400 hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed transition transform hover:scale-105"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </span>
                ) : 'SEND RESET LINK'}
              </button>
            </div>

            <div className="text-center">
              <Link to="/login" className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-yellow-400">
                <FiArrowLeft className="mr-2" />
                Back to login
              </Link>
            </div>

            {/* Email exists check result */}
            {!emailExists && !loading && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-red-600">
                  <FiAlertCircle className="flex-shrink-0" />
                  <p className="text-sm">
                    <Link to="/register" className="font-medium underline hover:text-red-700">
                      create a new account
                    </Link>
                  </p>
                </div>
              </div>
            )}
          </form>
        ) : (
          <div className="mt-8 text-center">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <FiCheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <p className="text-sm text-green-800 mb-2">
                Reset link sent to:
              </p>
              <p className="font-bold text-green-700 mb-4">{email}</p>
              <p className="text-sm text-green-800 mb-4">
                Please check your inbox and follow the instructions.
              </p>


            </div>

            <Link
              to="/login"
              className="inline-flex items-center text-sm font-medium text-yellow-400 hover:text-yellow-500"
            >
              <FiArrowLeft className="mr-2" />
              Return to login
            </Link>
          </div>
        )}


      </div>
    </div>
  );
}

export default ForgotPassword;