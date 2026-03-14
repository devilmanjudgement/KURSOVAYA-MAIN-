import React, { useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ArrowLeft, User, Users, Clock } from 'lucide-react';
import './App.css';

function BookingConfirm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const day = location.state?.selectedDay || 1;
  const [uploadType, setUploadType] = useState('auto');

  const handleConfirm = () => {
    const bookingData = {
        sectionId: id,
        user: "Иван Иванов",
        date: `${day} Ноября, 19:00`,
        docType: uploadType
    };

    fetch('http://localhost:5000/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData)
    })
    .then(res => res.json())
    .then(data => { if (data.success) navigate('/success'); })
    .catch(err => alert("Ошибка! Сервер не отвечает."));
  };

  return (
    <div className="mobile-wrapper">
      <div className="mobile-screen" style={{ justifyContent: 'flex-start', paddingTop: '20px', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '30px' }}>
          <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '10px' }}><ArrowLeft size={24} color="#333" /></button>
          <h2 style={{ margin: 0, fontSize: '20px', flex: 1, textAlign: 'center', paddingRight: '40px' }}>Подтвердить запись</h2>
        </div>
        <div style={{ marginBottom: '40px' }}>
          <p style={{ fontWeight: 'bold', marginBottom: '10px' }}>Загрузка документов</p>
          <div style={{ background: '#eee', padding: '4px', borderRadius: '12px', display: 'flex' }}>
            <button onClick={() => setUploadType('auto')} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', background: uploadType === 'auto' ? '#0056b3' : 'transparent', color: uploadType === 'auto' ? 'white' : '#888', fontWeight: '600', transition: '0.3s' }}>Автоматически</button>
            <button onClick={() => setUploadType('manual')} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', background: uploadType === 'manual' ? '#0056b3' : 'transparent', color: uploadType === 'manual' ? 'white' : '#888', fontWeight: '600', transition: '0.3s' }}>Вручную</button>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}><User size={24} color="#333" /><div><span style={{ display: 'block', fontWeight: 'bold' }}>Тренер:</span><span style={{ color: '#555' }}>Иванов С.Ю.</span></div></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}><Clock size={24} color="#333" /><div><span style={{ display: 'block', fontWeight: 'bold' }}>Дата:</span><span style={{ color: '#0056b3', fontWeight: 'bold', fontSize: '18px' }}>{day} Ноября, 19:00</span></div></div>
        </div>
        <button className="login-btn" style={{ marginTop: 'auto', marginBottom: '20px' }} onClick={handleConfirm}>Подтвердить запись {'>'}</button>
      </div>
    </div>
  );
}
export default BookingConfirm;