import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import { useLang } from "./contexts/LangContext";
import "./App.css";

const PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='70' height='70' viewBox='0 0 70 70'%3E%3Crect width='70' height='70' fill='%23e5e7eb'/%3E%3Ctext x='50%25' y='54%25' dominant-baseline='middle' text-anchor='middle' font-size='28' fill='%239ca3af'%3E🏟%3C/text%3E%3C/svg%3E";

function SectionsList() {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { t } = useLang();

  useEffect(() => {
    fetch("/api/sections")
      .then((res) => res.json())
      .then((data) => { setSections(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="mobile-wrapper">
      <div className="mobile-screen" style={{ justifyContent: "center", alignItems: "center" }}>
        <p style={{ color: "#aaa" }}>{t("loading")}</p>
      </div>
    </div>
  );

  return (
    <div className="mobile-wrapper">
      <div className="mobile-screen" style={{ justifyContent: "flex-start", position: "relative" }}>
        <div style={{
          background: "linear-gradient(135deg, #0056b3, #0077cc)",
          padding: "28px 20px 20px",
          color: "#fff",
        }}>
          <h2 style={{ margin: 0, fontSize: "22px", fontWeight: 800 }}>{t("sl_title")}</h2>
          <p style={{ margin: "4px 0 0", fontSize: "12px", opacity: 0.8 }}>
            {sections.length} {t("sections_available")}
          </p>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "14px 14px 90px" }}>
          {sections.length === 0 ? (
            <div style={{ textAlign: "center", color: "#aaa", marginTop: "60px" }}>
              <div style={{ fontSize: "40px" }}>📭</div>
              <p>{t("sections_none")}</p>
            </div>
          ) : sections.map((s) => (
            <div
              key={s.id}
              onClick={() => navigate(`/section/${s.id}`)}
              style={{
                background: "#fff",
                borderRadius: "16px",
                padding: "12px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                display: "flex",
                alignItems: "center",
                gap: "14px",
                cursor: "pointer",
                marginBottom: "10px",
                borderLeft: `4px solid ${s.color || "#0056b3"}`,
              }}
            >
              <img
                src={s.image || PLACEHOLDER}
                alt={s.title}
                onError={(e) => { e.target.src = PLACEHOLDER; }}
                style={{
                  width: "64px",
                  height: "64px",
                  borderRadius: "10px",
                  objectFit: "cover",
                  flexShrink: 0,
                }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: "15px", marginBottom: "3px", color: "#111" }}>
                  {s.title}
                </div>
                <div style={{ fontSize: "12px", color: "#666", marginBottom: "2px" }}>
                  📍 {s.place || t("sl_no_place")}
                </div>
                <div style={{ fontSize: "12px", color: "#666", marginBottom: "4px" }}>
                  👨‍🏫 {s.coach_name || t("sl_no_coach")}
                </div>
                <div style={{
                  display: "inline-block",
                  background: "#f0f4ff",
                  color: "#0056b3",
                  borderRadius: "6px",
                  padding: "2px 8px",
                  fontSize: "11px",
                  fontWeight: 600,
                }}>
                  👥 {s.students_count || 0} / {s.max_students || 20}
                </div>
              </div>
              <div style={{ fontSize: "18px", color: "#ccc" }}>›</div>
            </div>
          ))}
        </div>

        <Navbar />
      </div>
    </div>
  );
}

export default SectionsList;
