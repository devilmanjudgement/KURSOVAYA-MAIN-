import React, { useEffect, useState } from 'react';
import { Check, XCircle } from 'lucide-react';
import { useLang } from './contexts/LangContext';

function TeacherBookings({ coach }) {
  const [requests, setRequests] = useState([]);
  const { t } = useLang();

  useEffect(() => {
    fetch(`/api/teacher/${coach}/bookings`)
      .then(res => res.json())
      .then(setRequests)
      .catch(err => console.error(err));
  }, [coach]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '15px' }}>
      {requests.map((r, i) => (
        <div key={i} style={{
          background: 'white',
          borderRadius: '15px',
          padding: '10px 15px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        }}>
          <div>
            <b>{r.title}</b><br />
            👤 {r.user}<br />
            📅 {r.date}
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <Check size={22} color="green" title={t('tp_approve')} />
            <XCircle size={22} color="red" title={t('tp_reject')} />
          </div>
        </div>
      ))}
      {!requests.length && <p style={{ textAlign: 'center', color: '#888' }}>{t('tb_no_requests')}</p>}
    </div>
  );
}

export default TeacherBookings;
