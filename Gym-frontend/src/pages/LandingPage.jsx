import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { inquiryAPI, publicAPI } from "../services/api";
import toast from "react-hot-toast";

import Navbar from "../components/Landing/Navbar";
import Hero from "../components/Landing/Hero";
import Programs from "../components/Landing/Programs";
import CTABanner from "../components/Landing/CTABanner";
import Classes from "../components/Landing/Classes";
import Trainers from "../components/Landing/Trainer";
import ContactSection from "../components/Landing/ContactSection";
import Footer from "../components/Landing/Footer";

function LandingPage() {
  const navigate = useNavigate();
  const { role, hasMembership } = useAuth();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [trainers, setTrainers] = useState([]);
  const [loadingTrainers, setLoadingTrainers] = useState(true);
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

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
      switch (role) {
        case 'ADMIN': navigate('/admin/dashboard'); break;
        case 'TRAINER': navigate('/trainer/dashboard'); break;
        case 'MEMBER': navigate(hasMembership ? '/member/dashboard' : '/plans'); break;
        default: navigate('/login');
      }
    } else {
      navigate('/register');
    }
  };

  const handleBecomeMember = () => {
    if (role === 'MEMBER' && !hasMembership) navigate('/plans');
    else if (!role) navigate('/register');
    else handleGetStarted();
  };

  const handleContactChange = (e) => {
    setContactForm({ ...contactForm, [e.target.name]: e.target.value });
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      toast.error('Please fill in all fields');
      return;
    }
    setSubmitting(true);
    try {
      await inquiryAPI.submitInquiry(contactForm);
      toast.success("Message sent successfully! We'll get back to you soon.");
      setContactForm({ name: '', email: '', message: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar role={role} isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
      <Hero onBecomeMember={handleBecomeMember} />
      <Programs />
      <CTABanner onBecomeMember={handleBecomeMember} />
      <Classes />
      <Trainers trainers={trainers} loading={loadingTrainers} />
      <ContactSection
        contactForm={contactForm}
        onChange={handleContactChange}
        onSubmit={handleContactSubmit}
        submitting={submitting}
      />
      <Footer />
    </div>
  );
}

export default LandingPage;