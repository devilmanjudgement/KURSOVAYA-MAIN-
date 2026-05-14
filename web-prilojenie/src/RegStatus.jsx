import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

function RegStatus() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [login, setLogin] = useState(searchParams.get("login") || "");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (searchParams.get("login")) {
      checkStatus(searchParams.get("login"));
    }
  }, []);

  const checkStatus = async (loginVal) => {
    const q = (loginVal ?? login).trim();
    if (!q) return setError("Введите логин");
    setError("");
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`/api/registration-status?login=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (data.success) {
        setResult(data);
      } else {
        setError(data.message || "Заявка не найдена");
      }
    } catch {
      setError("Ошибка соединения с сервером");
    } finally {
      setLoading(false);
    }
  };

  const statusConfig = {
    pending: {
      icon: "⏳",
      label: "На рассмотрении",
      desc: "Ваша заявка получена и ожидает проверки администратором. Обычно это занимает 1–2 рабочих дня.",
      bg: "#fefce8",
      border: "#fde68a",
      color: "#92400e",
      badgeBg: "#fef3c7",
    },
    approved: {
      icon: "✅",
      label: "Одобрена",
      desc: "Ваша заявка одобрена! Аккаунт создан — можете войти в систему по вашему логину и паролю.",
      bg: "#f0fdf4",
      border: "#86efac",
      color: "#15803d",
      badgeBg: "#dcfce7",
    },
    rejected: {
      icon: "❌",
      label: "Отклонена",
      desc: "Ваша заявка была отклонена администратором.",
      bg: "#fff1f2",
      border: "#fca5a5",
      color: "#dc2626",
      badgeBg: "#fee2e2",
    },
  };

  const inputStyle = {
    width: "100%", padding: "12px 14px", borderRadius: "12px",
    border: "1.5px solid #e5e5e5", fontSize: "14px", background: "#f9f9f9",
    marginBottom: "10px", boxSizing: "border-box", outline: "none",
  };

  const cfg = result ? (statusConfig[result.status] || statusConfig.pending) : null;

  return (
    <div className="mobile-wrapper">
      <div className="mobile-screen" style={{ overflowY: "auto" }}>
        <div className="header" style={{ paddingTop: "36px", textAlign: "center", paddingBottom: "8px" }}>
          <div style={{ fontSize: "40px", marginBottom: "8px" }}>🔍</div>
          <h1 className="app-title" style={{ fontSize: "22px" }}>Статус заявки</h1>
          <p className="app-subtitle">Проверьте статус вашей заявки на регистрацию</p>
        </div>

        <div style={{ padding: "20px" }}>
          <input
            style={inputStyle}
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            placeholder="Ваш логин"
            onKeyDown={(e) => e.key === "Enter" && checkStatus()}
          />

          {error && (
            <div style={{
              background: "#fff0f0", border: "1px solid #fcc", borderRadius: "10px",
              padding: "10px 12px", fontSize: "13px", color: "#c00", marginBottom: "10px",
            }}>
              {error}
            </div>
          )}

          <button
            onClick={() => checkStatus()}
            disabled={loading}
            className="login-btn"
            style={{ opacity: loading ? 0.7 : 1, marginBottom: "12px" }}
          >
            {loading ? "Проверяем..." : "Проверить статус"}
          </button>

          {result && cfg && (
            <div style={{
              background: cfg.bg, border: `1.5px solid ${cfg.border}`,
              borderRadius: "16px", padding: "20px", marginTop: "8px",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                <div style={{ fontSize: "36px" }}>{cfg.icon}</div>
                <div>
                  <div style={{
                    display: "inline-block", background: cfg.badgeBg, color: cfg.color,
                    borderRadius: "8px", padding: "3px 12px", fontSize: "13px",
                    fontWeight: 700, marginBottom: "4px",
                  }}>
                    {cfg.label}
                  </div>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "#111827" }}>
                    {result.name}
                  </div>
                </div>
              </div>

              <p style={{ fontSize: "13px", color: "#374151", lineHeight: "1.6", margin: "0 0 10px" }}>
                {cfg.desc}
              </p>

              {result.rejection_reason && (
                <div style={{
                  background: "#fff", border: "1px solid #fca5a5",
                  borderRadius: "10px", padding: "10px 12px",
                  fontSize: "13px", color: "#dc2626", marginBottom: "10px",
                }}>
                  <b>Причина отклонения:</b> {result.rejection_reason}
                </div>
              )}

              <div style={{ fontSize: "11px", color: "#9ca3af", marginTop: "8px" }}>
                Заявка подана: {result.created_at
                  ? result.created_at.slice(0, 16).replace("T", " ")
                  : "—"}
              </div>

              {result.status === "approved" && (
                <button
                  onClick={() => navigate("/")}
                  className="login-btn"
                  style={{ marginTop: "14px" }}
                >
                  Войти в систему →
                </button>
              )}
            </div>
          )}

          <button onClick={() => navigate("/")} style={{
            background: "transparent", border: "none", color: "#888",
            fontSize: "13px", cursor: "pointer", marginTop: "16px", width: "100%",
          }}>
            ← Вернуться на страницу входа
          </button>
        </div>
      </div>
    </div>
  );
}

export default RegStatus;
