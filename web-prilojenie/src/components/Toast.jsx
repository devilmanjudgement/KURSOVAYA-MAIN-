import React, { useEffect } from "react";

export default function Toast({ messages, onRemove }) {
  return (
    <div style={{
      position: "fixed",
      bottom: "90px",
      left: "50%",
      transform: "translateX(-50%)",
      zIndex: 9999,
      display: "flex",
      flexDirection: "column",
      gap: "8px",
      width: "320px",
      pointerEvents: "none",
    }}>
      {messages.map((msg) => (
        <ToastItem key={msg.id} msg={msg} onRemove={onRemove} />
      ))}
    </div>
  );
}

function ToastItem({ msg, onRemove }) {
  useEffect(() => {
    const t = setTimeout(() => onRemove(msg.id), 4000);
    return () => clearTimeout(t);
  }, [msg.id]);

  const colors = {
    approved: { bg: "#dcfce7", border: "#16a34a", icon: "✅", text: "#15803d" },
    cancelled: { bg: "#fee2e2", border: "#dc2626", icon: "❌", text: "#b91c1c" },
    pending:   { bg: "#fef9c3", border: "#d97706", icon: "🔔", text: "#92400e" },
    info:      { bg: "#e0f2fe", border: "#0284c7", icon: "ℹ️",  text: "#0369a1" },
  };
  const c = colors[msg.type] || colors.info;

  return (
    <div style={{
      background: c.bg,
      border: `1.5px solid ${c.border}`,
      borderRadius: "14px",
      padding: "12px 16px",
      boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
      display: "flex",
      gap: "10px",
      alignItems: "flex-start",
      pointerEvents: "auto",
      animation: "slideUp 0.3s ease",
    }}>
      <span style={{ fontSize: "18px", lineHeight: 1 }}>{c.icon}</span>
      <div>
        <div style={{ fontSize: "13px", fontWeight: 700, color: c.text }}>{msg.title}</div>
        {msg.body && <div style={{ fontSize: "12px", color: c.text, opacity: 0.85, marginTop: "2px" }}>{msg.body}</div>}
      </div>
    </div>
  );
}
