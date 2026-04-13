import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { inquiryAPI, publicAPI } from "../services/api";
import toast from 'react-hot-toast';
import { FiMapPin, FiPhone, FiMail, FiClock, FiActivity, FiUser } from 'react-icons/fi';
import { MdFitnessCenter, MdLocalFireDepartment, MdSelfImprovement } from 'react-icons/md';

function LandingPage() {
  const navigate = useNavigate();
  const { user, role, hasMembership } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // State for trainers from backend
  const [trainers, setTrainers] = useState([]);
  const [loadingTrainers, setLoadingTrainers] = useState(true);
  
  // State for contact form
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);

  // Fetch trainers from backend on component mount
  useEffect(() => {
    fetchTrainers();
  }, []);

  const fetchTrainers = async () => {
    setLoadingTrainers(true);
    try {
      const response = await publicAPI.getTrainers();
      setTrainers(response.data);
    } catch (error) {
      console.error('Failed to fetch trainers', error);
      setTrainers([]);
    } finally {
      setLoadingTrainers(false);
    }
  };

  const handleGetStarted = () => {
    if (role) {
      switch(role) {
        case 'ADMIN':
          navigate('/admin/dashboard');
          break;
        case 'TRAINER':
          navigate('/trainer/dashboard');
          break;
        case 'MEMBER':
          if (hasMembership) {
            navigate('/member/dashboard');
          } else {
            navigate('/plans');
          }
          break;
        default:
          navigate('/login');
      }
    } else {
      navigate('/register');
    }
  };

  const handleBecomeMember = () => {
    if (role === 'MEMBER' && !hasMembership) {
      navigate('/plans');
    } else if (!role) {
      navigate('/register');
    } else {
      handleGetStarted();
    }
  };

  // Handle contact form input changes
  const handleContactChange = (e) => {
    setContactForm({
      ...contactForm,
      [e.target.name]: e.target.value
    });
  };

  // Handle contact form submission
  const handleContactSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      toast.error('Please fill in all fields');
      return;
    }

    setSubmitting(true);
    
    try {
      await inquiryAPI.submitInquiry(contactForm);
      toast.success('Message sent successfully! We\'ll get back to you soon.');
      
      // Reset form
      setContactForm({
        name: '',
        email: '',
        message: ''
      });
    } catch (error) {
      console.error('Failed to send message', error);
      toast.error(error.response?.data?.message || 'Failed to send message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Bar */}
      <nav className="bg-black bg-opacity-90 fixed w-full z-50 top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex-shrink-0">
              <h1 className="text-2xl md:text-3xl font-bold text-white">
                TITAN <span className="text-yellow-400">FIT</span>
              </h1>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#home" className="text-white hover:text-yellow-400 transition text-sm font-semibold">HOME</a>
              <a href="#about" className="text-white hover:text-yellow-400 transition text-sm font-semibold">ABOUT</a>
              <a href="#classes" className="text-white hover:text-yellow-400 transition text-sm font-semibold">CLASSES</a>
              <a href="#trainers" className="text-white hover:text-yellow-400 transition text-sm font-semibold">TRAINERS</a>
              <a href="#contact" className="text-white hover:text-yellow-400 transition text-sm font-semibold">CONTACT</a>
              
              {role ? (
                <button
                  onClick={() => {
                    localStorage.removeItem('token');
                    localStorage.removeItem('userRole');
                    localStorage.removeItem('hasMembership');
                    window.location.href = '/';
                  }}
                  className="bg-red-500 text-white px-6 py-3 rounded font-semibold text-sm hover:bg-red-600 transition"
                >
                  LOGOUT
                </button>
              ) : (
                <Link 
                  to="/register" 
                  className="bg-yellow-400 text-black px-6 py-3 rounded font-semibold text-sm hover:bg-yellow-500 transition"
                >
                  SIGN UP
                </Link>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-white focus:outline-none"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {isMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {isMenuOpen && (
            <div className="md:hidden bg-black bg-opacity-95 py-4 px-4">
              <div className="flex flex-col space-y-4">
                <a href="#home" className="text-white hover:text-yellow-400 transition text-sm font-semibold" onClick={() => setIsMenuOpen(false)}>HOME</a>
                <a href="#about" className="text-white hover:text-yellow-400 transition text-sm font-semibold" onClick={() => setIsMenuOpen(false)}>ABOUT</a>
                <a href="#classes" className="text-white hover:text-yellow-400 transition text-sm font-semibold" onClick={() => setIsMenuOpen(false)}>CLASSES</a>
                <a href="#trainers" className="text-white hover:text-yellow-400 transition text-sm font-semibold" onClick={() => setIsMenuOpen(false)}>TRAINERS</a>
                <a href="#contact" className="text-white hover:text-yellow-400 transition text-sm font-semibold" onClick={() => setIsMenuOpen(false)}>CONTACT</a>
                
                {role ? (
                  <button
                    onClick={() => {
                      localStorage.removeItem('token');
                      localStorage.removeItem('userRole');
                      localStorage.removeItem('hasMembership');
                      window.location.href = '/';
                    }}
                    className="bg-red-500 text-white px-6 py-3 rounded font-semibold text-sm hover:bg-red-600 transition w-full"
                  >
                    LOGOUT
                  </button>
                ) : (
                  <Link 
                    to="/register" 
                    className="bg-yellow-400 text-black px-6 py-3 rounded font-semibold text-sm hover:bg-yellow-500 transition inline-block text-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    SIGN UP
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative h-screen flex items-center justify-center bg-cover bg-center" 
        style={{
          backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80')"
        }}
      >
        <div className="text-center text-white px-4">
          <h2 className="text-lg md:text-xl lg:text-2xl font-semibold mb-4 tracking-wider">
            WORK HARDER, GET STRONGER
          </h2>
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold mb-8">
            EASY WITH OUR <span className="text-yellow-400">GYM</span>
          </h1>
          <button
            onClick={handleBecomeMember}
            className="inline-block bg-yellow-400 text-black px-8 py-4 rounded font-bold text-lg hover:bg-yellow-500 transition transform hover:scale-105"
          >
            BECOME A MEMBER
          </button>
        </div>
      </section>

      {/* Choose Program Section */}
      <section id="about" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              CHOOSE <span className="text-yellow-400">PROGRAM</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              TITAN FIT offers the best fitness programs tailored to your goals. 
              Choose the perfect program that suits your fitness journey.
            </p>
          </div>

          {/* Program Grid */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Basic Fitness */}
            <div className="flex gap-4 p-6 hover:shadow-lg transition rounded-lg">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center">
                  <FiActivity className="text-2xl text-black" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Basic Fitness</h3>
                <p className="text-gray-600 mb-3">
                  Perfect for beginners looking to start their fitness journey. 
                  Includes basic equipment access and general guidance.
                </p>
                <a href="#" className="text-yellow-400 font-semibold hover:text-yellow-500 transition">
                  DISCOVER MORE →
                </a>
              </div>
            </div>

            {/* Advanced Muscle Course */}
            <div className="flex gap-4 p-6 hover:shadow-lg transition rounded-lg">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center">
                  <MdFitnessCenter className="text-2xl text-black" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Advanced Muscle Course</h3>
                <p className="text-gray-600 mb-3">
                  For intermediate to advanced lifters. Focus on muscle building, 
                  strength training, and specialized workouts.
                </p>
                <a href="#" className="text-yellow-400 font-semibold hover:text-yellow-500 transition">
                  DISCOVER MORE →
                </a>
              </div>
            </div>

            {/* New Gym Training */}
            <div className="flex gap-4 p-6 hover:shadow-lg transition rounded-lg">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center">
                  <MdLocalFireDepartment className="text-2xl text-black" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">New Gym Training</h3>
                <p className="text-gray-600 mb-3">
                  High-intensity workouts designed for maximum calorie burn 
                  and quick results. Includes HIIT and cardio sessions.
                </p>
                <a href="#" className="text-yellow-400 font-semibold hover:text-yellow-500 transition">
                  DISCOVER MORE →
                </a>
              </div>
            </div>

            {/* Yoga Training */}
            <div className="flex gap-4 p-6 hover:shadow-lg transition rounded-lg">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center">
                  <MdSelfImprovement className="text-2xl text-black" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Yoga Training</h3>
                <p className="text-gray-600 mb-3">
                  Improve flexibility, balance, and mental wellbeing with our 
                  expert-led yoga sessions for all skill levels.
                </p>
                <a href="#" className="text-yellow-400 font-semibold hover:text-yellow-500 transition">
                  DISCOVER MORE →
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="bg-cover bg-center bg-fixed py-20" 
        style={{
          backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.8)), url('https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80')"
        }}
      >
        <div className="text-center text-white px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            DON'T <span className="text-yellow-400">THINK</span>, BEGIN 
            <span className="text-yellow-400"> TODAY</span>!
          </h2>
          <p className="text-lg md:text-xl mb-8 max-w-3xl mx-auto">
            Join TITAN FIT today and transform your life with our expert trainers
            and state-of-the-art facilities. Your fitness journey starts here!
          </p>
          <button
            onClick={handleBecomeMember}
            className="inline-block bg-yellow-400 text-black px-8 py-4 rounded font-bold text-lg hover:bg-yellow-500 transition"
          >
            BECOME A MEMBER
          </button>
        </div>
      </section>

      {/* Classes Section */}
      <section id="classes" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              OUR <span className="text-yellow-400">CLASSES</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Choose from a variety of classes led by our expert trainers. 
              Each class is designed to help you achieve your fitness goals.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Class 1 */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1549060279-7e168fcee0c2?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80" 
                alt="First Training Class"
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">First Training Class</h3>
                <p className="text-gray-600 mb-4">
                  Introduction to fitness fundamentals with our expert trainers.
                  Perfect for beginners starting their fitness journey.
                </p>
                <button className="text-yellow-400 font-semibold hover:text-yellow-500">
                  VIEW DETAILS →
                </button>
              </div>
            </div>

            {/* Class 2 */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80" 
                alt="Second Training Class"
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">Second Training Class</h3>
                <p className="text-gray-600 mb-4">
                  Advanced training techniques for experienced fitness enthusiasts
                  looking to take their workout to the next level.
                </p>
                <button className="text-yellow-400 font-semibold hover:text-yellow-500">
                  VIEW DETAILS →
                </button>
              </div>
            </div>

            {/* Class 3 */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80" 
                alt="Third Training Class"
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">Third Training Class</h3>
                <p className="text-gray-600 mb-4">
                  Specialized classes focusing on specific fitness goals like
                  weight loss, muscle gain, or endurance training.
                </p>
                <button className="text-yellow-400 font-semibold hover:text-yellow-500">
                  VIEW DETAILS →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Trainers Section - Dynamic from Backend */}
      <section id="trainers" className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              OUR <span className="text-yellow-400">TRAINERS</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Meet our team of certified professional trainers dedicated to helping you
              achieve your fitness goals with personalized guidance and expertise.
            </p>
          </div>

          {loadingTrainers ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
            </div>
          ) : trainers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No trainers available at the moment.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {trainers.map((trainer) => (
                <div key={trainer._id} className="bg-white rounded-lg shadow-lg overflow-hidden transform hover:scale-105 transition duration-300">
                  <div className="relative">
                    <div className="w-full h-64 bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center">
                      <FiUser className="text-8xl text-black opacity-50" />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                      <h3 className="text-xl font-bold text-white">{trainer.userId?.name || 'Trainer'}</h3>
                      <p className="text-yellow-400 text-sm">{trainer.specialization || 'Fitness Expert'}</p>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-gray-600 mb-3">
                      {trainer.experience ? `${trainer.experience} years experience` : 'Experienced professional'}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {trainer.specialization || 'General Fitness'}
                      </span>
                      <div className="flex space-x-3">
                        <a href="#" className="text-gray-400 hover:text-yellow-400 transition">
                          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M18.77 7.46H14.5v-1.9c0-.9.6-1.1 1-1.1h3V.5h-4.33C10.24.5 9.5 3.44 9.5 5.32v2.15h-3v4h3v12h5v-12h3.85l.42-4z"/>
                          </svg>
                        </a>
                        <a href="#" className="text-gray-400 hover:text-yellow-400 transition">
                          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2.2c3.2 0 3.6 0 4.9.1 3.3.1 4.8 1.7 4.9 4.9.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c-.1 3.2-1.7 4.8-4.9 4.9-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-3.2-.1-4.8-1.7-4.9-4.9-.1-1.3-.1-1.7-.1-4.9s0-3.6.1-4.9c.1-3.2 1.7-4.8 4.9-4.9 1.3-.1 1.7-.1 4.9-.1zm0-2.2c-3.3 0-3.7 0-5 .1-4.1.2-6.1 2.3-6.3 6.3-.1 1.3-.1 1.7-.1 5s0 3.7.1 5c.2 4 2.3 6.1 6.3 6.3 1.3.1 1.7.1 5 .1s3.7 0 5-.1c4-.2 6.1-2.3 6.3-6.3.1-1.3.1-1.7.1-5s0-3.7-.1-5c-.2-4-2.3-6.1-6.3-6.3-1.3-.1-1.7-.1-5-.1z"/>
                            <path d="M12 5.8a6.2 6.2 0 1 0 0 12.4 6.2 6.2 0 0 0 0-12.4zm0 10.2a4 4 0 1 1 0-8 4 4 0 0 1 0 8z"/>
                            <circle cx="18.4" cy="5.6" r="1.5"/>
                          </svg>
                        </a>
                        <a href="#" className="text-gray-400 hover:text-yellow-400 transition">
                          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M23.44 4.83c-.8.37-1.5.38-2.22.02.93-.56.98-.96 1.32-2.02-.88.52-1.86.9-2.9 1.1-.82-.88-2-1.43-3.3-1.43-2.5 0-4.55 2.05-4.55 4.55 0 .36.04.7.12 1.03-3.78-.2-7.14-2-9.38-4.75-.4.67-.6 1.45-.6 2.28 0 1.57.8 2.96 2.02 3.77-.74-.02-1.44-.23-2.05-.57v.06c0 2.2 1.56 4.03 3.64 4.45-.38.1-.78.16-1.2.16-.3 0-.58-.03-.86-.08.58 1.82 2.26 3.15 4.25 3.18-1.56 1.22-3.52 1.95-5.66 1.95-.37 0-.73-.02-1.1-.07 2.03 1.3 4.44 2.06 7.04 2.06 8.45 0 13.07-7 13.07-13.07 0-.2 0-.4-.02-.6.9-.66 1.68-1.48 2.3-2.42z"/>
                          </svg>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              CONTACT <span className="text-yellow-400">US</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Have questions? Get in touch with us and we'll be happy to help you
              start your fitness journey.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Contact Form */}
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <form onSubmit={handleContactSubmit}>
                <div className="mb-4">
                  <input
                    type="text"
                    name="name"
                    value={contactForm.name}
                    onChange={handleContactChange}
                    placeholder="Your Name*"
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    required
                  />
                </div>
                <div className="mb-4">
                  <input
                    type="email"
                    name="email"
                    value={contactForm.email}
                    onChange={handleContactChange}
                    placeholder="Your Email*"
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    required
                  />
                </div>
                <div className="mb-4">
                  <textarea
                    rows="5"
                    name="message"
                    value={contactForm.message}
                    onChange={handleContactChange}
                    placeholder="Message*"
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    required
                  ></textarea>
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-yellow-400 text-black px-8 py-3 rounded font-semibold hover:bg-yellow-500 transition w-full disabled:opacity-50"
                >
                  {submitting ? 'SENDING...' : 'SEND MESSAGE'}
                </button>
              </form>
            </div>

            {/* Contact Info */}
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <h3 className="text-xl font-bold mb-6">Get in Touch</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <FiMapPin className="text-yellow-400 mr-4 text-xl" />
                  <div>
                    <h4 className="font-semibold">Address</h4>
                    <p className="text-gray-600">123 Fitness Street, Gym City, 12345</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <FiPhone className="text-yellow-400 mr-4 text-xl" />
                  <div>
                    <h4 className="font-semibold">Phone</h4>
                    <p className="text-gray-600">+1 234 567 8900</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <FiMail className="text-yellow-400 mr-4 text-xl" />
                  <div>
                    <h4 className="font-semibold">Email</h4>
                    <p className="text-gray-600">info@titanfit.com</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <FiClock className="text-yellow-400 mr-4 text-xl" />
                  <div>
                    <h4 className="font-semibold">Working Hours</h4>
                    <p className="text-gray-600">Monday - Friday: 6:00 AM - 10:00 PM</p>
                    <p className="text-gray-600">Saturday - Sunday: 8:00 AM - 8:00 PM</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">
              TITAN <span className="text-yellow-400">FIT</span>
            </h3>
            <p className="text-gray-400 mb-6">Your journey to fitness starts here</p>
            <div className="flex justify-center space-x-6 mb-8">
              <a href="#" className="text-gray-400 hover:text-yellow-400 transition">Facebook</a>
              <a href="#" className="text-gray-400 hover:text-yellow-400 transition">Twitter</a>
              <a href="#" className="text-gray-400 hover:text-yellow-400 transition">Instagram</a>
              <a href="#" className="text-gray-400 hover:text-yellow-400 transition">YouTube</a>
            </div>
            <p className="text-gray-500 text-sm">
              © 2026 TITAN FIT. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;