import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, User, Clock } from 'lucide-react';
import { useLang } from './contexts/LangContext';
import './App.css';

function BookingConfirm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { t } = useLang();
  const [section, setSection] = useState(null);
  const [uploadType, setUploadType] = useState('auto');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetch(`/api/sections/${id}`)
      .then(r => r.ok ? r.json() : null)
      .then(setSection)
      .catch(() => setSection(null));
  }, [id]);

  const handleConfirm = () => {
    if (!user.id) return alert(t('bc_not_auth'));

    const bookingData = {
      sectionId: id,
      user: user.name,
      date: new Date().toLocaleDateString('ru-RU'),
      docType: uploadType,
    };

    fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingData),
    })
      .then(res => res.json())
      .then(data => { if (data.success) navigate('/success'); })
      .catch(() => alert(t('err_server_unavail')));
  };

  if (!section) return (
    <div className="mobile-wrapper">
      <div className="mobile-screen" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <p style={{ color: '#aaa' }}>{t('loading')}</p>
      </div>
    </div>
  );

  return (
    <div className="mobile-wrapper">
      <div className="mobile-screen" style={{ justifyContent: 'flex-start', paddingTop: '20px', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '30px' }}>
          <button onClick={() => navigate(-1)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '10px' }}>
            <ArrowLeft size={24} color="#333" />
          </button>
          <h2 style={{ margin: 0, fontSize: '20px', flex: 1, textAlign: 'center', paddingRight: '40px' }}>
            {t('bc_title')}
          </h2>
        </div>

        <div style={{ padding: '0 20px', marginBottom: '30px' }}>
          <div style={{
            background: section.color || '#0056b3',
            borderRadius: '14px',
            padding: '16px',
            color: '#fff',
            marginBottom: '20px',
          }}>
            <div style={{ fontSize: '18px', fontWeight: 700, marginBottom: '4px' }}>{section.title}</div>
            <div style={{ fontSize: '13px', opacity: 0.85 }}>📍 {section.place}</div>
          </div>

          <p style={{ fontWeight: 'bold', marginBottom: '10px' }}>{t('bc_doc_upload')}</p>
          <div style={{ background: '#eee', padding: '4px', borderRadius: '12px', display: 'flex', marginBottom: '24px' }}>
            <button onClick={() => setUploadType('auto')}
              style={{
                flex: 1, padding: '10px', borderRadius: '10px', border: 'none',
                background: uploadType === 'auto' ? '#0056b3' : 'transparent',
                color: uploadType === 'auto' ? 'white' : '#888', fontWeight: '600', transition: '0.3s',
              }}>
              {t('bc_auto')}
            </button>
            <button onClick={() => setUploadType('manual')}
              style={{
                flex: 1, padding: '10px', borderRadius: '10px', border: 'none',
                background: uploadType === 'manual' ? '#0056b3' : 'transparent',
                color: uploadType === 'manual' ? 'white' : '#888', fontWeight: '600', transition: '0.3s',
              }}>
              {t('bc_manual')}
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <User size={24} color="#333" />
              <div>
                <span style={{ display: 'block', fontWeight: 'bold' }}>{t('bc_coach')}</span>
                <span style={{ color: '#555' }}>{section.coach_name || t('bc_no_coach')}</span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <User size={24} color="#0056b3" />
              <div>
                <span style={{ display: 'block', fontWeight: 'bold' }}>{t('bc_student')}</span>
                <span style={{ color: '#0056b3', fontWeight: '600' }}>{user.name}</span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <Clock size={24} color="#333" />
              <div>
                <span style={{ display: 'block', fontWeight: 'bold' }}>{t('bc_date')}</span>
                <span style={{ color: '#0056b3', fontWeight: 'bold' }}>
                  {new Date().toLocaleDateString('ru-RU')}
                </span>
              </div>
            </div>
          </div>
        </div>

        <button className="login-btn"
          style={{ margin: '0 20px 20px', width: 'calc(100% - 40px)' }}
          onClick={handleConfirm}>
          {t('bc_confirm')}
        </button>
      </div>
    </div>
  );
}

export default BookingConfirm;
