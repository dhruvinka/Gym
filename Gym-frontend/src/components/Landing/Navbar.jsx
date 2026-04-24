import { Link } from "react-router-dom";

function Navbar({ role, isMenuOpen, setIsMenuOpen }) {
  return (
    <nav className="bg-black bg-opacity-90 fixed w-full z-50 top-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              TITAN <span className="text-yellow-400">FIT</span>
            </h1>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#home" className="text-white hover:text-yellow-400 transition text-sm font-semibold">HOME</a>
            <a href="#about" className="text-white hover:text-yellow-400 transition text-sm font-semibold">ABOUT</a>
            <a href="#classes" className="text-white hover:text-yellow-400 transition text-sm font-semibold">CLASSES</a>
            <a href="#trainers" className="text-white hover:text-yellow-400 transition text-sm font-semibold">TRAINERS</a>
            <a href="#contact" className="text-white hover:text-yellow-400 transition text-sm font-semibold">CONTACT</a>

            {role ? (
              <button
                onClick={() => {
                  localStorage.removeItem('token');
                  localStorage.removeItem('userRole');
                  localStorage.removeItem('hasMembership');
                  window.location.href = '/';
                }}
                className="bg-red-500 text-white px-6 py-3 rounded font-semibold text-sm hover:bg-red-600 transition"
              >
                LOGOUT
              </button>
            ) : (
              <Link
                to="/register"
                className="bg-yellow-400 text-black px-6 py-3 rounded font-semibold text-sm hover:bg-yellow-500 transition"
              >
                SIGN UP
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-white focus:outline-none">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-black bg-opacity-95 py-4 px-4">
            <div className="flex flex-col space-y-4">
              <a href="#home" className="text-white hover:text-yellow-400 transition text-sm font-semibold" onClick={() => setIsMenuOpen(false)}>HOME</a>
              <a href="#about" className="text-white hover:text-yellow-400 transition text-sm font-semibold" onClick={() => setIsMenuOpen(false)}>ABOUT</a>
              <a href="#classes" className="text-white hover:text-yellow-400 transition text-sm font-semibold" onClick={() => setIsMenuOpen(false)}>CLASSES</a>
              <a href="#trainers" className="text-white hover:text-yellow-400 transition text-sm font-semibold" onClick={() => setIsMenuOpen(false)}>TRAINERS</a>
              <a href="#contact" className="text-white hover:text-yellow-400 transition text-sm font-semibold" onClick={() => setIsMenuOpen(false)}>CONTACT</a>

              {role ? (
                <button
                  onClick={() => {
                    localStorage.removeItem('token');
                    localStorage.removeItem('userRole');
                    localStorage.removeItem('hasMembership');
                    window.location.href = '/';
                  }}
                  className="bg-red-500 text-white px-6 py-3 rounded font-semibold text-sm hover:bg-red-600 transition w-full"
                >
                  LOGOUT
                </button>
              ) : (
                <Link
                  to="/register"
                  className="bg-yellow-400 text-black px-6 py-3 rounded font-semibold text-sm hover:bg-yellow-500 transition inline-block text-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  SIGN UP
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
