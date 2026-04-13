import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="fixed w-full z-50 bg-black bg-opacity-60 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex justify-between items-center p-4 text-white">
        
        <h1 className="text-2xl font-bold">
          TRAINING <span className="text-primary">STUDIO</span>
        </h1>

        <div className="hidden md:flex gap-8 items-center">
          <a href="#home" className="hover:text-primary">Home</a>
          <a href="#programs" className="hover:text-primary">Programs</a>
          <a href="#trainers" className="hover:text-primary">Trainers</a>
          <a href="#pricing" className="hover:text-primary">Pricing</a>

          <Link
            to="/login"
            className="border border-primary px-4 py-1 hover:bg-primary transition"
          >
            Login
          </Link>

          <Link
            to="/register"
            className="bg-primary px-4 py-1 hover:bg-red-600 transition"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;