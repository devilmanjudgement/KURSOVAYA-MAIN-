import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import { ArrowLeft, CheckCircle, XCircle, CalendarDays } from "lucide-react";
import { useLang } from "./contexts/LangContext";
import { useTheme } from "./contexts/ThemeContext";

export default function Attendance() {
  const navigate = useNavigate();
  const { t } = useLang();
  const { isDark } = useTheme();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user.id) { navigate("/"); return; }
    const endpoint = user.role === "student"
      ? `/api/attendance/student/${encodeURIComponent(user.name)}`
      : `/api/attendance/coach/${user.id}`;

    fetch(endpoint)
      .then((r) => r.json())
      .then((d) => { setRecords(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const stats = {
    total: records.length,
    present: records.filter((r) => r.present).length,
    absent: records.filter((r) => !r.present).length,
    pct: records.length ? Math.round((records.filter((r) => r.present).length / records.length) * 100) : 0,
  };

  return (
    <div className="mobile-wrapper">
      <div className="mobile-screen" style={{ position: "relative" }}>
        <div style={{
          background: "linear-gradient(135deg, #0056b3, #0077cc)",
          padding: "28px 20px 20px",
          color: "#fff",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button onClick={() => navigate(-1)} style={{
              background: "rgba(255,255,255,0.2)", border: "none", borderRadius: "10px",
              color: "#fff", padding: "6px 10px", cursor: "pointer",
            }}>
              <ArrowLeft size={18} />
            </button>
            <div>
              <h2 style={{ margin: 0, fontSize: "20px", fontWeight: 800 }}>
                📋 {t("att_title")}
              </h2>
              <p style={{ margin: "2px 0 0", fontSize: "12px", opacity: 0.8 }}>
                {user.role === "student" ? user.name : t("att_all_students")}
              </p>
            </div>
          </div>
        </div>

        {user.role === "student" && records.length > 0 && (
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
            gap: "10px", padding: "14px 14px 0",
          }}>
            {[
              { label: t("att_total"), value: stats.total, color: "#0056b3" },
              { label: t("att_present"), value: stats.present, color: "#16a34a" },
              { label: t("att_absent"), value: stats.absent, color: "#dc2626" },
            ].map((s) => (
              <div key={s.label} style={{
                background: isDark ? "var(--bg-card)" : "#fff",
                borderRadius: "12px", padding: "12px 8px",
                textAlign: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
                borderTop: `3px solid ${s.color}`,
              }}>
                <div style={{ fontSize: "22px", fontWeight: 800, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "2px" }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {user.role === "student" && stats.total > 0 && (
          <div style={{ padding: "12px 14px 0" }}>
            <div style={{ background: isDark ? "var(--bg-input)" : "#f3f4f6", borderRadius: "100px", height: "8px", overflow: "hidden" }}>
              <div style={{
                width: `${stats.pct}%`, height: "100%",
                background: stats.pct >= 75 ? "#16a34a" : stats.pct >= 50 ? "#f59e0b" : "#dc2626",
                borderRadius: "100px", transition: "width 0.5s ease",
              }} />
            </div>
            <div style={{ fontSize: "11px", color: "#888", marginTop: "4px", textAlign: "right" }}>
              {t("att_attendance_pct")} {stats.pct}%
            </div>
          </div>
        )}

        <div style={{ flex: 1, overflowY: "auto", padding: "12px 14px 90px" }}>
          {loading ? (
            <p style={{ color: "#aaa", textAlign: "center", marginTop: "40px" }}>{t("loading")}</p>
          ) : records.length === 0 ? (
            <div style={{ textAlign: "center", color: "#aaa", marginTop: "50px" }}>
              <div style={{ fontSize: "40px" }}>📭</div>
              <p>{t("att_no_records")}</p>
            </div>
          ) : (
            records.map((r, i) => (
              <div key={i} style={{
                background: isDark ? "var(--bg-card)" : "#fff",
                borderRadius: "12px",
                padding: "12px 14px",
                marginBottom: "8px",
                boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                borderLeft: `4px solid ${r.present ? "#16a34a" : "#dc2626"}`,
              }}>
                {r.present
                  ? <CheckCircle size={20} color="#16a34a" />
                  : <XCircle size={20} color="#dc2626" />
                }
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: "14px", color: "var(--text-main)" }}>
                    {user.role === "student" ? r.section_title || r.section_id : r.student_name}
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px", display: "flex", gap: "8px" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "3px" }}>
                      <CalendarDays size={11} /> {r.date}
                    </span>
                    {user.role !== "student" && r.section_title && (
                      <span>· {r.section_title}</span>
                    )}
                  </div>
                </div>
                <div style={{
                  fontSize: "11px", fontWeight: 700,
                  color: r.present ? "#16a34a" : "#dc2626",
                  background: r.present ? "#dcfce7" : "#fee2e2",
                  borderRadius: "6px", padding: "3px 8px",
                }}>
                  {r.present ? t("att_present_badge") : t("att_absent_badge")}
                </div>
              </div>
            ))
          )}
        </div>

        <Navbar />
      </div>
    </div>
  );
}
