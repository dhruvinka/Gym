import { FiClock, FiUsers, FiActivity, FiAward } from 'react-icons/fi';
import { MdFitnessCenter, MdRestaurant } from 'react-icons/md';

const features = [
  {
    icon: <FiUsers className="text-3xl text-black" />,
    title: 'Expert Trainers',
    desc: 'Our certified personal trainers are dedicated to guiding you every step of the way with tailored one-on-one attention.'
  },
  {
    icon: <MdFitnessCenter className="text-3xl text-black" />,
    title: 'Modern Equipment',
    desc: 'Train with state-of-the-art gym equipment maintained to the highest standards for a safe and effective workout.'
  },
  {
    icon: <FiClock className="text-3xl text-black" />,
    title: 'Flexible Time Slots',
    desc: 'Choose from 6 morning and evening time slots that fit your schedule — so fitness works around your life, not the other way.'
  },
  {
    icon: <MdRestaurant className="text-3xl text-black" />,
    title: 'Custom Diet Plans',
    desc: 'Premium members get personalized diet plans crafted by their assigned trainer to complement their fitness goals.'
  },
  {
    icon: <FiActivity className="text-3xl text-black" />,
    title: 'Progress Tracking',
    desc: 'Stay on top of your fitness journey with scheduled sessions and trainer-monitored progress throughout your membership.'
  },
  {
    icon: <FiAward className="text-3xl text-black" />,
    title: 'Premium Membership',
    desc: 'Unlock full access — personal trainer, diet plans, priority scheduling, and more — with our Premium annual membership.'
  }
];

function WhyChooseUs() {
  return (
    <section id="about" className="py-20 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            WHY CHOOSE <span className="text-yellow-400">TITAN FIT</span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            We're more than a gym. We provide a complete fitness ecosystem — expert trainers,
            flexible schedules, and personalized plans — all under one roof.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group p-6 rounded-xl border border-gray-100 hover:border-yellow-400 hover:shadow-lg transition duration-300"
            >
              <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition duration-300">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default WhyChooseUs;
