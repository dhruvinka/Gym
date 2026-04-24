import { FiMapPin, FiPhone, FiMail, FiClock } from 'react-icons/fi';

function ContactSection({ contactForm, onChange, onSubmit, submitting }) {
  return (
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
            <form onSubmit={onSubmit}>
              <div className="mb-4">
                <input
                  type="text"
                  name="name"
                  value={contactForm.name}
                  onChange={onChange}
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
                  onChange={onChange}
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
                  onChange={onChange}
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
                  <p className="text-gray-600">123, College Road, Nadiad, Gujarat</p>
                </div>
              </div>
              <div className="flex items-start">
                <FiPhone className="text-yellow-400 mr-4 text-xl" />
                <div>
                  <h4 className="font-semibold">Phone</h4>
                  <p className="text-gray-600">+91 7434948095</p>
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
  );
}

export default ContactSection;
