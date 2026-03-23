import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, LayoutGrid, CalendarDays, User, MessageCircle } from 'lucide-react';
import './App.css';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [unread, setUnread] = useState(0);
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    if (!user.id) return;
    const check = () => {
      fetch(`/api/messages/unread/${user.id}`)
        .then((r) => r.json())
        .then((d) => setUnread(d.count || 0))
        .catch(() => {});
    };
    check();
    const interval = setInterval(check, 5000);
    return () => clearInterval(interval);
  }, [user.id]);

  return (
    <div className="bottom-nav">
      <div className={`nav-item ${isActive('/home') ? 'active' : ''}`} onClick={() => navigate('/home')}>
        <Home size={22} color={isActive('/home') ? '#0056b3' : '#ccc'} />
        <span>Домой</span>
      </div>

      <div className={`nav-item ${isActive('/sections') ? 'active' : ''}`} onClick={() => navigate('/sections')}>
        <LayoutGrid size={22} color={isActive('/sections') ? '#0056b3' : '#ccc'} />
        <span>Секции</span>
      </div>

      <div className={`nav-item ${isActive('/schedule') ? 'active' : ''}`} onClick={() => navigate('/schedule')}>
        <CalendarDays size={22} color={isActive('/schedule') ? '#0056b3' : '#ccc'} />
        <span>Расписание</span>
      </div>

      <div
        className={`nav-item ${isActive('/chat') ? 'active' : ''}`}
        onClick={() => navigate('/chat')}
        style={{ position: 'relative' }}
      >
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <MessageCircle size={22} color={isActive('/chat') ? '#0056b3' : '#ccc'} />
          {unread > 0 && (
            <div style={{
              position: 'absolute',
              top: '-5px',
              right: '-6px',
              background: '#e53935',
              color: '#fff',
              borderRadius: '50%',
              width: '16px',
              height: '16px',
              fontSize: '10px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              lineHeight: 1,
            }}>
              {unread > 9 ? '9+' : unread}
            </div>
          )}
        </div>
        <span>Чат</span>
      </div>

      <div className={`nav-item ${isActive('/profile') ? 'active' : ''}`} onClick={() => navigate('/profile')}>
        <User size={22} color={isActive('/profile') ? '#0056b3' : '#ccc'} />
        <span>Профиль</span>
      </div>
    </div>
  );
}

export default Navbar;
