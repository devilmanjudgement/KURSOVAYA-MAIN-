import React, { useEffect, useState } from 'react';
import { Check, XCircle } from 'lucide-react';
import { useLang } from './contexts/LangContext';
import { useTheme } from './contexts/ThemeContext';

function TeacherBookings({ coach }) {
  const [requests, setRequests] = useState([]);
  const { t } = useLang();
  const { isDark } = useTheme();

  useEffect(() => {
    fetch(`/api/teacher/${coach}/bookings`)
      .then(res => res.json())
      .then(setRequests)
      .catch(err => console.error(err));
  }, [coach]);

  const changeStatus = (id, status) => {
    fetch(`/api/bookings/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    }).then(() => {
      setRequests(prev => prev.filter(r => r.bookingId !== id));
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '15px' }}>
      {requests.map((r, i) => (
        <div key={i} style={{
          background: isDark ? 'var(--bg-card)' : '#fff',
          borderRadius: '15px',
          padding: '10px 15px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          color: 'var(--text-main)',
        }}>
          <div>
            <b>{r.title}</b><br />
            <span style={{ color: 'var(--text-muted)' }}>👤 {r.user}</span><br />
            <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>📅 {r.date}</span>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <Check size={22} color="green" style={{ cursor: 'pointer' }}
              title={t('tp_approve')} onClick={() => changeStatus(r.bookingId, 'approved')} />
            <XCircle size={22} color="red" style={{ cursor: 'pointer' }}
              title={t('tp_reject')} onClick={() => changeStatus(r.bookingId, 'cancelled')} />
          </div>
        </div>
      ))}
      {!requests.length && <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>{t('tb_no_requests')}</p>}
    </div>
  );
}

export default TeacherBookings;
