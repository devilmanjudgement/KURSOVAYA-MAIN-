import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Search } from 'lucide-react';
import './App.css';

function Success() {
  const navigate = useNavigate();

  return (
    <div className="mobile-wrapper">
      <div className="mobile-screen" style={{ justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
        
        <h1 style={{ marginBottom: '40px', fontSize: '32px' }}>Заявка подана</h1>

        <div style={{ marginBottom: '60px' }}>
           <CheckCircle size={120} color="#0056b3" fill="#e6f0fa" />
        </div>

        <button 
          className="login-btn" 
          onClick={() => navigate('/home')}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
        >
          Другие секции <Search size={18} />
        </button>

      </div>
    </div>
  );
}

export default Success;