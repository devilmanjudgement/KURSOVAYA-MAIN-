import React from "react";
import { useNavigate } from "react-router-dom";
import "./App.css";

function Login() {
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
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
          <h1 className="app-title">
            КГУ<br />СПОРТ
          </h1>
          <p className="app-subtitle">Вход в систему</p>
        </div>

        <form
          className="login-form"
          onSubmit={handleLogin}
          style={{ padding: "20px" }}
        >
          <input id="login" placeholder="Логин" className="input-field" />
          <input
            id="password"
            type="password"
            placeholder="Пароль"
            className="input-field"
          />
          <div
            className="form-footer"
            style={{
              marginTop: "20px",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                navigate("/register");
              }}
            >
              Нет аккаунта?
            </a>
            <button className="login-btn" type="submit">
              Войти&nbsp;&nbsp;›
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;