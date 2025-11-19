import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg px-4 lg:px-6 py-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="lg:hidden text-white p-2 hover:bg-white hover:bg-opacity-20 rounded-lg"
          >
            <span className="text-2xl">☰</span>
          </button>
          <div className="bg-white p-2 rounded-lg hidden sm:block">
            <span className="text-2xl">📦</span>
          </div>
          <h1 className="text-xl lg:text-2xl font-bold text-white">Inventory Dashboard</h1>
        </div>
        <div className="flex items-center gap-2 lg:gap-4">
          <div className="bg-white bg-opacity-20 px-3 lg:px-4 py-2 rounded-lg hidden sm:block">
            <span className="text-white font-medium text-sm lg:text-base">Welcome, {user?.name}</span>
          </div>
          <button
            onClick={handleLogout}
            className="bg-white text-blue-600 hover:bg-gray-100 px-3 lg:px-4 py-2 rounded-lg transition font-semibold shadow-md text-sm lg:text-base"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

