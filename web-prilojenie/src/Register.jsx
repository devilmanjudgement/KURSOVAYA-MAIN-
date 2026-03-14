import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';

function Register() {
  const [role, setRole] = useState("student");
  const navigate = useNavigate();

  const handleRegister = (e) => {
    e.preventDefault();
    const payload = {
      name: document.getElementById("name").value.trim(),
      login: document.getElementById("login").value.trim(),
      password: document.getElementById("password").value.trim(),
      role,
      group_name: document.getElementById("group")?.value || null
    };

    if (!payload.name || !payload.login || !payload.password)
      return alert("Заполните все поля!");

    fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          alert("Регистрация успешна! Теперь войдите.");
          navigate('/');
        } else alert(data.message || "Ошибка регистрации");
      })
      .catch(() => alert("Сервер не отвечает"));
  };

  return (
    <div className="mobile-wrapper">
      <div className="mobile-screen">
        <div className="header">
          <h1 className="app-title">Регистрация</h1>
        </div>

        <form className="login-form" onSubmit={handleRegister}>
          <input id="name" className="input-field" placeholder="ФИО" />
          <input id="login" className="input-field" placeholder="Логин" />
          <input id="password" type="password" className="input-field" placeholder="Пароль" />

          <select className="input-field" value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="student">Студент</option>
            <option value="coach">Преподаватель</option>
          </select>

          {role === 'student' && (
            <input id="group" className="input-field" placeholder="Группа (например гК‑3)" />
          )}

          <button type="submit" className="login-btn">Создать аккаунт</button>
        </form>
      </div>
    </div>
  );
}

export default Register;