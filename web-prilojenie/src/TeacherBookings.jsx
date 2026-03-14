import React, { useEffect, useState } from 'react';
import { Check, XCircle } from 'lucide-react';

function TeacherBookings({ coach }) {
  const [requests, setRequests] = useState([]);

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
            <Check size={22} color="green" title="Принять" />
            <XCircle size={22} color="red" title="Отклонить" />
          </div>
        </div>
      ))}
      {!requests.length && <p style={{ textAlign: 'center', color: '#888' }}>Нет заявок</p>}
    </div>
  );
}

export default TeacherBookings;