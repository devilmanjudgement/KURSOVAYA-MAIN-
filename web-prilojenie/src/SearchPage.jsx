import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import { Search } from 'lucide-react';
import './App.css';

function SearchPage() {
  const [sections, setSections] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  // Загружаем список секций при старте
  useEffect(() => {
    fetch('/api/sections')
      .then(res => res.json())
      .then(setSections)
      .catch(err => console.error('Ошибка загрузки секций:', err));
  }, []);

  // Фильтрация
  const filtered = sections.filter(sec =>
    sec.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="mobile-wrapper">
      <div
        className="mobile-screen"
        style={{ justifyContent: 'flex-start', paddingTop: '40px', position: 'relative' }}
      >
        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Поиск</h2>

        {/* Поле поиска */}
        <div style={{ position: 'relative', marginBottom: '20px' }}>
          <Search
            size={18}
            style={{ position: 'absolute', top: '14px', left: '12px', color: '#888' }}
          />
          <input
            type="text"
            placeholder="Найти секцию (например: Йога)"
            className="input-field"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '80%', paddingLeft: '36px' }}
          />
        </div>

        {/* Карточки результатов */}
        <div className="sections-grid">
          {filtered.map((sec) => (
            <div
              key={sec.id}
              className="sport-card"
              onClick={() => navigate(`/section/${sec.id}`)}
              style={{
                position: 'relative',
                overflow: 'hidden',
                background: '#000',
              }}
            >
              <img
                src={sec.image || ''}
                alt={sec.title}
                onError={(e) => { e.target.style.display = 'none'; }}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  zIndex: 0,
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  background: sec.color,
                  opacity: 0.75,
                  zIndex: 1,
                }}
              />
              <div
                style={{
                  position: 'relative',
                  zIndex: 2,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <h3 style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)', color: 'white' }}>
                  {sec.title}
                </h3>
                <div style={{ alignSelf: 'flex-end', color: 'white' }}>➜</div>
              </div>
            </div>
          ))}

          {/* Если ничего не найдено */}
          {filtered.length === 0 && sections.length > 0 && (
            <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#888' }}>
              Ничего не найдено 
            </p>
          )}
        </div>

        <Navbar />
      </div>
    </div>
  );
}
export default SearchPage;