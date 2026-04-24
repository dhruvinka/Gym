import { FiUser } from 'react-icons/fi';

function Trainers({ trainers, loading }) {
  return (
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

        {loading ? (
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
                  <div className="w-full h-64 bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center overflow-hidden">
                    {trainer.profilePhoto?.url ? (
                      <img
                        src={trainer.profilePhoto.url}
                        alt={trainer.userId?.name || 'Trainer'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <FiUser className="text-8xl text-black opacity-50" />
                    )}
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
                  <span className="text-xs text-gray-500">
                    {trainer.specialization || 'General Fitness'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default Trainers;
