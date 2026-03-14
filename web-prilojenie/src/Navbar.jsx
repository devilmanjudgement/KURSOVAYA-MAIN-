import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Search, CalendarDays, User } from 'lucide-react';
import './App.css';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation(); //*навигация

  //*Проверить кнопку
  const isActive = (path) => location.pathname === path;

  return (
    <div className="bottom-nav">
      
      {/* Кнопка Домой */}
      <div 
        className={`nav-item ${isActive('/home') ? 'active' : ''}`} 
        onClick={() => navigate('/home')}
      >
        <Home size={24} color={isActive('/home') ? '#000' : '#ccc'} />
        <span>Домой</span>
      </div>
      <div
        className={`nav-item ${isActive('/sections') ? 'active' : ''}`}
        onClick={() => navigate('/sections')}
      >
        <Home size={24} color={isActive('/sections') ? '#000' : '#ccc'} />
        <span>Секции</span>
      </div>

      {/* Кнопка Поиск */}
      <div
        className={`nav-item ${isActive('/search') ? 'active' : ''}`}
        onClick={() => navigate('/search')}
        >
        <Search size={24} color={isActive('/search') ? '#000' : '#ccc'} />
        <span>Поиск</span>
      </div>

      {/* Кнопка Расписание */}
      <div
          className={`nav-item ${isActive('/schedule') ? 'active' : ''}`}
          onClick={() => navigate('/schedule')}
          >
          <CalendarDays size={24} color={isActive('/schedule') ? '#000' : '#ccc'} />
          <span>Расписание</span>
      </div>

      {/* Кнопка Профиль */}
      <div 
        className={`nav-item ${isActive('/profile') ? 'active' : ''}`}
        onClick={() => navigate('/profile')}
      >
        <User size={24} color={isActive('/profile') ? '#000' : '#ccc'} />
        <span>Профиль</span>
      </div>

    </div>
  );
}
localStorage.removeItem('user');
export default Navbar;