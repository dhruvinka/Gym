import class1 from '../../assets/photo-1549060279-7e168fcee0c2.avif';
import class2 from '../../assets/photo-1517836357463-d25dfeac3438.avif';
import class3 from '../../assets/photo-1571019613454-1cb2f99b2d8b.avif';

const classes = [
  {
    img: class1,
    alt: 'First Training Class',
    title: 'First Training Class',
    desc: 'Introduction to fitness fundamentals with our expert trainers. Perfect for beginners starting their fitness journey.'
  },
  {
    img: class2,
    alt: 'Second Training Class',
    title: 'Second Training Class',
    desc: 'Advanced training techniques for experienced fitness enthusiasts looking to take their workout to the next level.'
  },
  {
    img: class3,
    alt: 'Third Training Class',
    title: 'Third Training Class',
    desc: 'Specialized classes focusing on specific fitness goals like weight loss, muscle gain, or endurance training.'
  }
];

function Classes() {
  return (
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
          {classes.map((cls) => (
            <div key={cls.title} className="bg-white rounded-lg shadow-lg overflow-hidden">
              <img src={cls.img} alt={cls.alt} className="w-full h-48 object-cover" />
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">{cls.title}</h3>
                <p className="text-gray-600 mb-4">{cls.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Classes;
