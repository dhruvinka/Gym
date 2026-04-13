import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiUser, FiMail, FiLock, FiCheck, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordValid, setPasswordValid] = useState({
    length: false
  });
  const [touched, setTouched] = useState({
    email: false,
    password: false,
    confirmPassword: false
  });

  const { register } = useAuth();
  const navigate = useNavigate();

  // Email validation function
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address';
    }
    return '';
  };

  const validatePassword = (password) => {
    setPasswordValid({
      length: password.length >= 8
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    if (name === 'email') {
      setEmailError(validateEmail(value));
    }

    if (name === 'password') {
      validatePassword(value);
    }
  };

  const handleBlur = (field) => {
    setTouched({
      ...touched,
      [field]: true
    });

    if (field === 'email') {
      setEmailError(validateEmail(formData.email));
    }
  };

  const isPasswordValid = () => {
    return Object.values(passwordValid).every(Boolean);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setTouched({
      email: true,
      password: true,
      confirmPassword: true
    });

    const emailValidationError = validateEmail(formData.email);
    if (emailValidationError) {
      toast.error(emailValidationError);
      return;
    }

    if (!isPasswordValid()) {
      toast.error('Please meet all password requirements');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password
      });

      navigate('/verify-otp', { state: { email: formData.email } });
    } catch (error) {
      console.error('Registration failed', error);
    } finally {
      setLoading(false);
    }
  };

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
    <div className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat relative py-12"
      style={{
        backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80')"
      }}
    >
      {/* Decorative overlay elements */}
      <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-black to-transparent"></div>
      <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-black to-transparent"></div>

      <div className="max-w-md w-full space-y-8 bg-white/95 backdrop-blur-sm p-8 rounded-2xl shadow-2xl relative z-10 mx-4">
        {/* Gym Logo/Brand */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            TITAN <span className="text-yellow-400">FIT</span>
          </h1>
          <p className="text-gray-600">Join our fitness family today!</p>
        </div>

        {/* Sign In Link - MOVED OUTSIDE THE FORM */}
        <div className="text-right mb-2">
          <Link
            to="/login"
            className="text-sm font-medium text-yellow-400 hover:text-yellow-500"
          >
            Already have an account? Sign in
          </Link>
        </div>

        <form className="mt-2 space-y-4" onSubmit={handleSubmit}>
          {/* Name Field */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <div className="mt-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiUser className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                className="appearance-none block w-full pl-10 px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                placeholder="John Doe"
              />
            </div>
          </div>

          {/* Email Field */}
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
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                onBlur={() => handleBlur('email')}
                className={`appearance-none block w-full pl-10 px-3 py-2 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent ${touched.email && emailError
                    ? 'border-red-500 bg-red-50'
                    : touched.email && !emailError && formData.email
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-300'
                  }`}
                placeholder="you@example.com"
              />
            </div>
            {touched.email && emailError && (
              <p className="mt-1 text-xs text-red-600">{emailError}</p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="mt-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiLock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                onBlur={() => handleBlur('password')}
                className={`appearance-none block w-full pl-10 px-3 py-2 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent ${touched.password && !isPasswordValid() && formData.password
                    ? 'border-red-500 bg-red-50'
                    : touched.password && isPasswordValid()
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-300'
                  }`}
                placeholder="••••••••"
              />
            </div>

            {/* Password Requirements */}
            {touched.password && formData.password && (
              <div className="mt-2 bg-gray-50 p-2 rounded-md space-y-1">
                <PasswordRequirement valid={passwordValid.length} text="8+ characters" />
              </div>
            )}
          </div>

          {/* Confirm Password Field */}
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
                onBlur={() => handleBlur('confirmPassword')}
                className={`appearance-none block w-full pl-10 px-3 py-2 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent ${touched.confirmPassword && formData.confirmPassword
                    ? formData.password === formData.confirmPassword
                      ? 'border-green-500 bg-green-50'
                      : 'border-red-500 bg-red-50'
                    : 'border-gray-300'
                  }`}
                placeholder="••••••••"
              />
            </div>
            {touched.confirmPassword && formData.confirmPassword && (
              <p className={`mt-1 text-xs ${formData.password === formData.confirmPassword ? 'text-green-600' : 'text-red-600'}`}>
                {formData.password === formData.confirmPassword
                  ? '✓ Passwords match'
                  : '✗ Passwords do not match'}
              </p>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || !isPasswordValid() || formData.password !== formData.confirmPassword || emailError}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-black bg-yellow-400 hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account...' : 'CREATE ACCOUNT'}
            </button>
          </div>
        </form>

        {/* Motivational Quote */}
        <div className="text-center text-sm text-gray-500 italic border-t pt-4">
          "Your journey to a stronger, healthier you starts here."
        </div>
      </div>
    </div>
  );
}

export default Register;