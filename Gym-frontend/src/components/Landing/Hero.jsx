function Hero({ onBecomeMember }) {
  return (
    <section
      id="home"
      className="relative h-screen flex items-center justify-center bg-cover bg-center"
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
          onClick={onBecomeMember}
          className="inline-block bg-yellow-400 text-black px-8 py-4 rounded font-bold text-lg hover:bg-yellow-500 transition transform hover:scale-105"
        >
          BECOME A MEMBER
        </button>
      </div>
    </section>
  );
}

export default Hero;