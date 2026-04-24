function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center">
          <h3 className="text-2xl font-bold mb-4">
            TITAN <span className="text-yellow-400">FIT</span>
          </h3>
          <p className="text-gray-400 mb-6">Your journey to fitness starts here</p>
          <div className="flex justify-center space-x-6 mb-8">
            <a href="#" className="text-gray-400 hover:text-yellow-400 transition">Facebook</a>
            <a href="#" className="text-gray-400 hover:text-yellow-400 transition">Twitter</a>
            <a href="#" className="text-gray-400 hover:text-yellow-400 transition">Instagram</a>
            <a href="#" className="text-gray-400 hover:text-yellow-400 transition">YouTube</a>
          </div>
          <p className="text-gray-500 text-sm">© 2026 TITAN FIT. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
