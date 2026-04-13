import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { paymentAPI } from '../../services/api';
import MemberLayout from '../../components/layouts/MemberLayout';
import { FiCheck, FiClock, FiUser, FiActivity, FiAward } from 'react-icons/fi';
import toast from 'react-hot-toast';

function MembershipPlans() {
  const [loading, setLoading] = useState(false);
  const [timeSlots, setTimeSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [selectedTrainer, setSelectedTrainer] = useState('');
  const [trainersForSlot, setTrainersForSlot] = useState([]);
  const [fetchingSlots, setFetchingSlots] = useState(true);
  const navigate = useNavigate();

  const plans = [
    {
      name: 'SIMPLE',
      price: 6000,
      duration: '1 Year',
      features: [
        'Gym access during operational hours',
        'Basic equipment access',
        'Locker facility',
        'No trainer assistance',
        'No diet plans'
      ],
      icon: <FiActivity />,
      color: 'bg-blue-500'
    },
    {
      name: 'PREMIUM',
      price: 10000,
      duration: '1 Year',
      features: [
        '24/7 Gym access',
        'All equipment access',
        'Personal trainer assigned',
        'Customized diet plans',
        'Priority support',
        'Free guest passes',
        'Choose your time slot & trainer'
      ],
      icon: <FiAward />,
      color: 'bg-yellow-500',
      popular: true
    }
  ];

  // Fetch available time slots
  useEffect(() => {
    fetchTimeSlots();
  }, []);

  // Update trainers when slot changes
  useEffect(() => {
    if (selectedSlot) {
      const slotData = timeSlots.find(slot => slot.value === selectedSlot);
      setTrainersForSlot(slotData?.trainers || []);
      setSelectedTrainer(''); // Reset trainer selection when slot changes
    } else {
      setTrainersForSlot([]);
    }
  }, [selectedSlot, timeSlots]);

  const fetchTimeSlots = async () => {
    setFetchingSlots(true);
    try {
      const response = await paymentAPI.getAvailableTimeSlots();
      console.log('Available slots:', response.data); // Debug log
      setTimeSlots(response.data);
    } catch (error) {
      console.error('Failed to fetch time slots', error);
      toast.error('Failed to load time slots');
    } finally {
      setFetchingSlots(false);
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => {
        console.error('Failed to load Razorpay script');
        toast.error('Failed to load payment gateway');
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  const handleSelectPlan = async (planName) => {
    // For premium plans, require time slot selection
    if (planName === 'PREMIUM' && !selectedSlot) {
      toast.error('Please select a time slot for premium membership');
      return;
    }

    setLoading(true);
    try {
      const isRazorpayLoaded = await loadRazorpayScript();
      if (!isRazorpayLoaded) {
        setLoading(false);
        return;
      }

      // Create Razorpay order
      const orderResponse = await paymentAPI.createOrder(planName);
      const order = orderResponse.data;

      // Prepare options
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'TITAN FIT',
        description: `${planName} Membership`,
        order_id: order.id,
        handler: async (response) => {
          try {
            // Prepare verification data
            const verificationData = {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              plan: planName
            };

            // Add timeSlot for premium members
            if (planName === 'PREMIUM') {
              verificationData.timeSlot = selectedSlot;
              
              // Add selectedTrainerId if user chose a specific trainer
              if (selectedTrainer) {
                verificationData.selectedTrainerId = selectedTrainer;
              }
            }

            console.log('Verification data:', verificationData); // Debug log

            // Verify payment with backend
            const verifyResponse = await paymentAPI.verifyPayment(verificationData);
            
            console.log('Verification response:', verifyResponse);
            
            // Update membership status
            localStorage.setItem('hasMembership', 'true');
            toast.success('Membership activated successfully!');
            
            // Redirect to dashboard
            navigate('/member/dashboard');
            
          } catch (error) {
            console.error('Payment verification failed', error);
            toast.error(error.response?.data?.message || 'Payment verification failed');
          }
        },
        prefill: {
          name: localStorage.getItem('userName') || 'Customer',
          email: localStorage.getItem('userEmail') || 'customer@example.com',
          contact: '9999999999'
        },
        theme: {
          color: '#FBBF24'
        },
        modal: {
          ondismiss: function() {
            setLoading(false);
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
      
    } catch (error) {
      console.error('Failed to create order', error);
      toast.error(error.response?.data?.message || 'Failed to initiate payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MemberLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-4">Choose Your Membership Plan</h1>
        <p className="text-gray-600 mb-8">Select the perfect plan for your fitness journey</p>

        {/* Selected Plan Summary */}
        {selectedSlot && (
          <div className="mb-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800">
              <span className="font-semibold">Selected:</span>{' '}
              {timeSlots.find(slot => slot.value === selectedSlot)?.label}
              {selectedTrainer && trainersForSlot.find(t => t.id === selectedTrainer) && (
                <> with Trainer: {trainersForSlot.find(t => t.id === selectedTrainer)?.name}</>
              )}
            </p>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative bg-white rounded-2xl shadow-xl overflow-hidden transform hover:scale-105 transition duration-300 ${
                plan.popular ? 'ring-2 ring-yellow-400' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute top-4 right-4 bg-yellow-400 text-black px-3 py-1 rounded-full text-sm font-semibold">
                  POPULAR
                </div>
              )}

              <div className={`${plan.color} p-6 text-white`}>
                <div className="text-4xl mb-2">{plan.icon}</div>
                <h2 className="text-3xl font-bold mb-2">{plan.name}</h2>
                <div className="text-2xl font-bold">₹{plan.price}</div>
                <div className="text-sm opacity-90">for {plan.duration}</div>
              </div>

              <div className="p-6">
                <ul className="space-y-4">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <FiCheck className="text-green-500 flex-shrink-0" />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Time Slot Selection for Premium Plan */}
                {plan.name === 'PREMIUM' && (
                  <div className="mt-6 space-y-4">
                    {/* Time Slot Dropdown */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <FiClock className="inline mr-1" /> 1. Select Your Time Slot
                      </label>
                      <select
                        value={selectedSlot}
                        onChange={(e) => setSelectedSlot(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        disabled={fetchingSlots}
                      >
                        <option value="">Choose a time slot</option>
                        {timeSlots.map((slot) => (
                          <option 
                            key={slot.value} 
                            value={slot.value}
                            disabled={!slot.isAvailable}
                          >
                            {slot.label} ({slot.availableSpots} spots, {slot.availableTrainers} trainers)
                          </option>
                        ))}
                      </select>
                      {fetchingSlots && (
                        <p className="text-sm text-gray-500 mt-2">Loading available slots...</p>
                      )}
                    </div>

                    {/* Trainer Selection (only if slot selected) */}
                    {selectedSlot && trainersForSlot.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <FiUser className="inline mr-1" /> 2. Choose Your Trainer (Optional)
                        </label>
                        <p className="text-xs text-gray-500 mb-3">
                          Select a specific trainer or leave empty for auto-assignment
                        </p>
                        
                        <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                          {/* Auto-assign option */}
                          <div
                            onClick={() => setSelectedTrainer('')}
                            className={`p-3 border rounded-lg cursor-pointer transition ${
                              selectedTrainer === '' 
                                ? 'border-yellow-400 bg-yellow-50' 
                                : 'border-gray-200 hover:border-yellow-200'
                            }`}
                          >
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="font-medium text-gray-700">Auto-assign</p>
                                <p className="text-xs text-gray-500">Let us choose the best available trainer</p>
                              </div>
                              {selectedTrainer === '' && (
                                <FiCheck className="text-yellow-400" />
                              )}
                            </div>
                          </div>

                          {/* Available trainers */}
                          {trainersForSlot.map((trainer) => (
                            <div
                              key={trainer.id}
                              onClick={() => setSelectedTrainer(trainer.id)}
                              className={`p-3 border rounded-lg cursor-pointer transition ${
                                selectedTrainer === trainer.id 
                                  ? 'border-yellow-400 bg-yellow-50' 
                                  : 'border-gray-200 hover:border-yellow-200'
                              }`}
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-medium text-gray-800">{trainer.name}</p>
                                  <p className="text-sm text-gray-600">{trainer.specialization}</p>
                                  <p className="text-xs text-green-600 mt-1">
                                    {trainer.availableSpots} spot{trainer.availableSpots > 1 ? 's' : ''} available
                                  </p>
                                </div>
                                {selectedTrainer === trainer.id && (
                                  <FiCheck className="text-yellow-400" />
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedSlot && trainersForSlot.length === 0 && (
                      <p className="text-sm text-red-500">
                        No trainers available in this slot. Please select another time slot.
                      </p>
                    )}
                  </div>
                )}

                <button
                  onClick={() => handleSelectPlan(plan.name)}
                  disabled={loading || (plan.name === 'PREMIUM' && !selectedSlot)}
                  className={`mt-8 w-full py-3 px-4 rounded-lg font-semibold text-white transition ${
                    plan.popular
                      ? 'bg-yellow-400 hover:bg-yellow-500'
                      : 'bg-gray-800 hover:bg-gray-900'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {loading ? 'Processing...' : `Select ${plan.name} Plan`}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Availability Summary */}
        {timeSlots.length > 0 && (
          <div className="mt-12 bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Current Slot Availability</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {timeSlots.map((slot) => (
                <div 
                  key={slot.value}
                  className={`p-4 rounded-lg border ${
                    slot.isAvailable 
                      ? 'border-green-200 bg-green-50' 
                      : 'border-red-200 bg-red-50'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-900">{slot.label}</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {slot.availableSpots} spots available
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {slot.availableTrainers} trainer{slot.availableTrainers !== 1 ? 's' : ''} available
                      </p>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-1 rounded ${
                      slot.isAvailable 
                        ? 'bg-green-200 text-green-800' 
                        : 'bg-red-200 text-red-800'
                    }`}>
                      {slot.isAvailable ? 'Available' : 'Full'}
                    </span>
                  </div>
                  <div className="mt-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${slot.isAvailable ? 'bg-green-500' : 'bg-red-500'}`}
                        style={{ 
                          width: `${((slot.totalCapacity - slot.availableSpots) / slot.totalCapacity) * 100}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </MemberLayout>
  );
}

export default MembershipPlans;