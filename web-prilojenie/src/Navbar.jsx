import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, LayoutGrid, CalendarDays, User, MessageCircle } from 'lucide-react';
import { useTheme } from './contexts/ThemeContext';
import { useLang } from './contexts/LangContext';
import Toast from './components/Toast';
import './App.css';

let toastIdCounter = 0;

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggle: toggleTheme, isDark } = useTheme();
  const { lang, toggleLang, t } = useLang();
  const [unread, setUnread] = useState(0);
  const [toasts, setToasts] = useState([]);
  const sseRef = useRef(null);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const isActive = (path) => location.pathname === path;

  const addToast = useCallback((type, title, body) => {
    const id = ++toastIdCounter;
    setToasts((prev) => [...prev, { id, type, title, body }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  /* ── Непрочитанные сообщения ── */
  useEffect(() => {
    if (!user.id) return;
    const check = () => {
      fetch(`/api/messages/unread/${user.id}`)
        .then((r) => r.json())
        .then((d) => setUnread(d.count || 0))
        .catch(() => {});
    };
    check();
    const iv = setInterval(check, 5000);
    return () => clearInterval(iv);
  }, [user.id]);

  /* ── SSE: уведомления реального времени ── */
  useEffect(() => {
    if (!user.id) return;
    let retryTimeout;

    const connect = () => {
      const es = new EventSource(`/api/events/${user.id}`);
      sseRef.current = es;

      es.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          if (data.type === 'booking_update') {
            const typeKey = { approved: 'approved', cancelled: 'cancelled' }[data.status] || 'info';
            addToast(typeKey, t(`notif_${data.status}`) || data.status, data.sectionTitle);
          }
        } catch (_) {}
      };

      es.onerror = () => {
        es.close();
        retryTimeout = setTimeout(connect, 6000);
      };
    };

    connect();
    return () => {
      sseRef.current?.close();
      clearTimeout(retryTimeout);
    };
  }, [user.id]);

  const navColor = (path) => isActive(path) ? '#0056b3' : (isDark ? '#6b7280' : '#ccc');

  const btnStyle = {
    background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)',
    border: 'none', borderRadius: '8px', padding: '5px 9px',
    cursor: 'pointer', fontSize: '14px', lineHeight: 1,
    color: isDark ? '#cdd6f4' : '#555', fontWeight: 600,
  };

  return (
    <>
      {/* Кнопки темы и языка — в правом верхнем углу экрана */}
      <div style={{
        position: 'absolute', top: '10px', right: '10px',
        display: 'flex', gap: '6px', zIndex: 20,
      }}>
        <button onClick={toggleTheme} title={isDark ? 'Светлая тема' : 'Тёмная тема'} style={btnStyle}>
          {isDark ? '☀️' : '🌙'}
        </button>
        <button onClick={toggleLang} title={lang === 'ru' ? 'Switch to English' : 'Переключить на русский'} style={btnStyle}>
          {lang === 'ru' ? 'EN' : 'RU'}
        </button>
      </div>

      {/* Тосты */}
      <Toast messages={toasts} onRemove={removeToast} />

      {/* Нижняя навигация */}
      <div className="bottom-nav">
        <div className={`nav-item ${isActive('/home') ? 'active' : ''}`} onClick={() => navigate('/home')}>
          <Home size={22} color={navColor('/home')} />
          <span>{t('nav_home')}</span>
        </div>

        <div className={`nav-item ${isActive('/sections') ? 'active' : ''}`} onClick={() => navigate('/sections')}>
          <LayoutGrid size={22} color={navColor('/sections')} />
          <span>{t('nav_sections')}</span>
        </div>

        <div className={`nav-item ${isActive('/schedule') ? 'active' : ''}`} onClick={() => navigate('/schedule')}>
          <CalendarDays size={22} color={navColor('/schedule')} />
          <span>{t('nav_schedule')}</span>
        </div>

        <div
          className={`nav-item ${isActive('/chat') ? 'active' : ''}`}
          onClick={() => navigate('/chat')}
          style={{ position: 'relative' }}
        >
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <MessageCircle size={22} color={navColor('/chat')} />
            {unread > 0 && (
              <div style={{
                position: 'absolute', top: '-5px', right: '-6px',
                background: '#e53935', color: '#fff',
                borderRadius: '50%', width: '16px', height: '16px',
                fontSize: '10px', fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {unread > 9 ? '9+' : unread}
              </div>
            )}
          </div>
          <span>{t('nav_chat')}</span>
        </div>

        <div className={`nav-item ${isActive('/profile') ? 'active' : ''}`} onClick={() => navigate('/profile')}>
          <User size={22} color={navColor('/profile')} />
          <span>{t('nav_profile')}</span>
        </div>
      </div>
    </>
  );
}
