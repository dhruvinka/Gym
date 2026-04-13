import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';
import { FiMail, FiArrowLeft } from 'react-icons/fi';
import toast from 'react-hot-toast';

function VerifyOTP() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const { verifyOTP } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;



  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (element, index) => {
    if (isNaN(element.value)) return;

    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    // Move to next input
    if (element.nextSibling && element.value !== '') {
      element.nextSibling.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error('No email found. Please register first.');
      return;
    }

    const otpString = otp.join('');

    if (otpString.length !== 6) {
      toast.error('Please enter complete OTP');
      return;
    }

    setLoading(true);
    try {
      await verifyOTP(email, otpString);
      toast.success('Email verified successfully!');
      navigate('/login');
    } catch (error) {
      console.error('OTP verification failed', error);
      toast.error('Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!email) {
      toast.error('No email found. Please register first.');
      return;
    }

    setResendLoading(true);
    try {
      await authAPI.resendOtp(email);
      toast.success('New OTP sent!');
      setTimer(60);
      setOtp(['', '', '', '', '', '']);
    } catch (error) {
      console.error('Failed to resend OTP', error);
      toast.error('Failed to resend OTP');
    } finally {
      setResendLoading(false);
    }
  };

  // If no email, show a friendly message
  if (!email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat relative"
        style={{
          backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('https://images.unsplash.com/photo-1558618666-fcd25c85e529?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80')"
        }}
      >
        <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-black to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-black to-transparent"></div>

        <div className="max-w-md w-full bg-white/95 backdrop-blur-sm p-10 rounded-2xl shadow-2xl relative z-10 mx-4">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              TITAN <span className="text-yellow-400">FIT</span>
            </h1>
            <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiMail className="h-8 w-8 text-black" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Verify Your Email
            </h2>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
              <p className="text-blue-800 mb-4">
                This page is for verifying your email after registration.
              </p>
              <div className="space-y-3">
                <Link
                  to="/register"
                  className="block w-full bg-yellow-400 text-black py-3 px-4 rounded-lg font-semibold hover:bg-yellow-500 transition"
                >
                  Create an Account
                </Link>
                <Link
                  to="/login"
                  className="block w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-semibold hover:bg-gray-300 transition"
                >
                  Sign In to Existing Account
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Normal OTP verification page when email exists
  return (
    <div className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat relative"
      style={{
        backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('https://images.unsplash.com/photo-1558618666-fcd25c85e529?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80')"
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
              <FiMail className="h-8 w-8 text-black" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Verify Your Email
          </h2>
          <p className="text-gray-600">
            We've sent a 6-digit OTP to <span className="font-semibold text-yellow-400">{email}</span>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="flex justify-center gap-2 sm:gap-3">
            {otp.map((data, index) => (
              <input
                key={index}
                type="text"
                maxLength="1"
                value={data}
                onChange={(e) => handleChange(e.target, index)}
                onFocus={(e) => e.target.select()}
                className="w-12 h-12 sm:w-14 sm:h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent hover:border-yellow-400 transition"
              />
            ))}
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-black bg-yellow-400 hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed transition transform hover:scale-105"
            >
              {loading ? 'Verifying...' : 'VERIFY OTP'}
            </button>
          </div>

          <div className="text-center">
            {timer > 0 ? (
              <p className="text-sm text-gray-600">
                Resend OTP in <span className="font-bold text-yellow-400">{timer}</span> seconds
              </p>
            ) : (
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={resendLoading}
                className="text-sm font-bold text-yellow-400 hover:text-yellow-500 disabled:opacity-50"
              >
                {resendLoading ? 'Sending...' : 'Resend OTP'}
              </button>
            )}
          </div>

          <div className="text-center pt-4 border-t">
            <Link to="/login" className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-yellow-400">
              <FiArrowLeft className="mr-2" />
              Back to login
            </Link>
          </div>
        </form>

        <div className="text-center text-sm text-gray-500 italic">
          "One step closer to your fitness journey."
        </div>
      </div>
    </div>
  );
}

export default VerifyOTP;