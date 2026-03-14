import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./App.css";

function Login() {
  const navigate = useNavigate();
  const [agreed, setAgreed] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!agreed) return alert("Необходимо согласиться с обработкой персональных данных");
    const login = document.getElementById("login").value.trim();
    const password = document.getElementById("password").value.trim();
    if (!login || !password) return alert("Введите логин и пароль");

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login, password }),
      });

      if (!res.ok) {
        const err = await res.json();
        return alert(err.message || "Ошибка авторизации");
      }

      const data = await res.json();
      if (data.success && data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
        navigate("/home", { replace: true });
      } else alert(data.message || "Ошибка входа");
    } catch (err) {
      alert("Сервер не отвечает. Убедись, что Node‑сервер запущен!");
    }
  };

  return (
    <div className="mobile-wrapper">
      <div className="mobile-screen">
        <div className="header" style={{ textAlign: "center", marginTop: "60px" }}>
          <div className="logo-circle">🏛️</div>
          <h1 className="app-title">КГУ<br />СПОРТ</h1>
          <p className="app-subtitle">Вход в систему</p>
        </div>

        <form className="login-form" onSubmit={handleLogin} style={{ padding: "20px" }}>
          <input id="login" placeholder="Логин" className="input-field" />
          <input id="password" type="password" placeholder="Пароль" className="input-field" />

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

          <div className="form-footer" style={{ marginTop: "16px", display: "flex", justifyContent: "space-between" }}>
            <a href="#" onClick={(e) => { e.preventDefault(); navigate("/register"); }}>
              Нет аккаунта?
            </a>
            <button className="login-btn" type="submit" style={{ width: "auto", padding: "12px 24px" }}>
              Войти&nbsp;&nbsp;›
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
