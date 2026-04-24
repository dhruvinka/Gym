function CTABanner({ onBecomeMember }) {
  return (
    <section
      className="bg-cover bg-center bg-fixed py-20"
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
          onClick={onBecomeMember}
          className="inline-block bg-yellow-400 text-black px-8 py-4 rounded font-bold text-lg hover:bg-yellow-500 transition"
        >
          BECOME A MEMBER
        </button>
      </div>
    </section>
  );
}

export default CTABanner;
