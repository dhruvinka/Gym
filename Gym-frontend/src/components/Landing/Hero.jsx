import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section className="relative h-screen flex items-center justify-center text-white">

      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute w-full h-full object-cover"
      >
        <source src="/gym-video.mp4" type="video/mp4" />
      </video>

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-red/70"></div>

      {/* Content */}
      <div className="relative text-center px-4 max-w-4xl">
        <p className="uppercase tracking-widest text-sm mb-6">
          WORK HARDER, GET STRONGER
        </p>

        <h1 className="text-5xl md:text-7xl font-extrabold leading-tight">
          EASY WITH OUR{" "}
          <span className="text-primary">GYM</span>
        </h1>

        <Link
          to="/register"
          className="inline-block mt-10 bg-primary px-8 py-3 font-bold uppercase hover:bg-red-600 transition"
        >
          Become A Member
        </Link>
      </div>
    </section>
  );
};

export default Hero;