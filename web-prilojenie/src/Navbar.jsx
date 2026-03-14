import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Search, CalendarDays, User, MessageCircle } from 'lucide-react';
import './App.css';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <div className="bottom-nav">
      <div
        className={`nav-item ${isActive('/home') ? 'active' : ''}`}
        onClick={() => navigate('/home')}
      >
        <Home size={22} color={isActive('/home') ? '#0056b3' : '#ccc'} />
        <span>Домой</span>
      </div>

      <div
        className={`nav-item ${isActive('/sections') ? 'active' : ''}`}
        onClick={() => navigate('/sections')}
      >
        <Home size={22} color={isActive('/sections') ? '#0056b3' : '#ccc'} />
        <span>Секции</span>
      </div>

      <div
        className={`nav-item ${isActive('/schedule') ? 'active' : ''}`}
        onClick={() => navigate('/schedule')}
      >
        <CalendarDays size={22} color={isActive('/schedule') ? '#0056b3' : '#ccc'} />
        <span>Расписание</span>
      </div>

      <div
        className={`nav-item ${isActive('/chat') ? 'active' : ''}`}
        onClick={() => navigate('/chat')}
      >
        <MessageCircle size={22} color={isActive('/chat') ? '#0056b3' : '#ccc'} />
        <span>Чат</span>
      </div>

      <div
        className={`nav-item ${isActive('/profile') ? 'active' : ''}`}
        onClick={() => navigate('/profile')}
      >
        <User size={22} color={isActive('/profile') ? '#0056b3' : '#ccc'} />
        <span>Профиль</span>
      </div>
    </div>
  );
}

export default Navbar;
