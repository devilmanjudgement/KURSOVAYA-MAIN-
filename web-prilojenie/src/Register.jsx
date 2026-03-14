import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';

function Register() {
  const navigate = useNavigate();
  const [agreed, setAgreed] = useState(false);

  const handleRegister = (e) => {
    e.preventDefault();
    if (!agreed) return alert("Необходимо согласиться с обработкой персональных данных");
    const payload = {
      name: document.getElementById("name").value.trim(),
      login: document.getElementById("login").value.trim(),
      password: document.getElementById("password").value.trim(),
      role: "student",
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
      <div className="mobile-screen" style={{ overflowY: "auto" }}>
        <div className="header" style={{ paddingTop: "40px" }}>
          <h1 className="app-title" style={{ fontSize: "26px" }}>Регистрация</h1>
          <p className="app-subtitle">Только для студентов</p>
        </div>

        <form className="login-form" onSubmit={handleRegister} style={{ padding: "20px" }}>
          <input id="name" className="input-field" placeholder="ФИО" />
          <input id="login" className="input-field" placeholder="Логин" />
          <input id="password" type="password" className="input-field" placeholder="Пароль" />
          <input id="group" className="input-field" placeholder="Группа (например гК‑3)" />

          <label style={{
            display: "flex", alignItems: "flex-start", gap: "10px",
            fontSize: "12px", color: "#555", cursor: "pointer", marginTop: "6px"
          }}>
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              style={{ marginTop: "2px", flexShrink: 0, accentColor: "#0056b3" }}
            />
            <span>
              Я согласен(а) с{" "}
              <a
                href="https://www.consultant.ru/document/cons_doc_LAW_61801/"
                target="_blank"
                rel="noreferrer"
                style={{ color: "#0056b3" }}
              >
                Федеральным законом №152-ФЗ «О персональных данных»
              </a>
            </span>
          </label>

          <button type="submit" className="login-btn" style={{ marginTop: "14px" }}>
            Создать аккаунт
          </button>

          <button
            type="button"
            onClick={() => navigate('/')}
            style={{
              background: "transparent", border: "none", color: "#888",
              fontSize: "13px", cursor: "pointer", marginTop: "8px", textAlign: "center", width: "100%"
            }}
          >
            ← Уже есть аккаунт
          </button>
        </form>
      </div>
    </div>
  );
}

export default Register;
