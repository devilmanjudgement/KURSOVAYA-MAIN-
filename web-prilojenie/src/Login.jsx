import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLang } from "./contexts/LangContext";
import "./App.css";

function Login() {
  const navigate = useNavigate();
  const { t } = useLang();
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    const login = document.getElementById("login").value.trim();
    const password = document.getElementById("password").value.trim();
    if (!login || !password) return alert(t("err_login_empty"));
    setLoading(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login, password }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
        if (data.user.role === "admin") {
          navigate("/admin", { replace: true });
        } else {
          navigate("/home", { replace: true });
        }
      } else {
        alert(data.message || t("err_login_fail"));
      }
    } catch {
      alert(t("err_server"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mobile-wrapper">
      <div className="mobile-screen">
        <div className="header" style={{ textAlign: "center", marginTop: "60px" }}>
          <div className="logo-circle">🏛️</div>
          <h1 className="app-title">КГУ<br />СПОРТ</h1>
          <p className="app-subtitle">{t("login_title")}</p>
        </div>

        <form className="login-form" onSubmit={handleLogin} style={{ padding: "20px" }}>
          <input id="login" placeholder={t("field_login")} className="input-field" maxLength={50} />
          <input id="password" type="password" placeholder={t("field_password")} className="input-field" maxLength={100} />

          <div className="form-footer" style={{ marginTop: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <a href="#" onClick={(e) => { e.preventDefault(); navigate("/register"); }}>
              {t("no_account")}
            </a>
            <button className="login-btn" type="submit" disabled={loading}
              style={{ width: "auto", padding: "12px 24px", opacity: loading ? 0.7 : 1 }}>
              {loading ? t("login_loading") : t("login_btn") + "  ›"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
