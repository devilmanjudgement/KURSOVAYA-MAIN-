import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import { Clock, MapPin, Edit3, User } from "lucide-react";
import { useLang } from "./contexts/LangContext";
import { useTheme } from "./contexts/ThemeContext";
import "./App.css";

const DAY_ORDER_RU = ["Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота", "Воскресенье"];
const DAY_SHORT_RU = { Понедельник: "ПН", Вторник: "ВТ", Среда: "СР", Четверг: "ЧТ", Пятница: "ПТ", Суббота: "СБ", Воскресенье: "ВС" };
const DAY_SHORT_EN = { Понедельник: "MO", Вторник: "TU", Среда: "WE", Четверг: "TH", Пятница: "FR", Суббота: "SA", Воскресенье: "SU" };
const DAY_EN = { Понедельник: "Monday", Вторник: "Tuesday", Среда: "Wednesday", Четверг: "Thursday", Пятница: "Friday", Суббота: "Saturday", Воскресенье: "Sunday" };

function Schedule() {
  const [schedule, setSchedule] = useState([]);
  const navigate = useNavigate();
  const { t, lang } = useLang();
  const { isDark } = useTheme();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    fetch("/api/schedule")
      .then((res) => res.json())
      .then(setSchedule)
      .catch((err) => console.error("Schedule load error:", err));
  }, []);

  const grouped = DAY_ORDER_RU.reduce((acc, day) => {
    const items = schedule.filter((s) => s.day_of_week === day);
    if (items.length) acc[day] = items.sort((a, b) => a.time.localeCompare(b.time));
    return acc;
  }, {});

  const dayLabel = (day) => lang === "en" ? (DAY_EN[day] || day) : day;
  const dayShort = (day) => lang === "en" ? (DAY_SHORT_EN[day] || day.slice(0, 2).toUpperCase()) : (DAY_SHORT_RU[day] || day.slice(0, 2).toUpperCase());

  return (
    <div className="mobile-wrapper">
      <div className="mobile-screen" style={{ justifyContent: "flex-start", position: "relative" }}>
        <div style={{
          background: "linear-gradient(135deg, #0056b3, #0077cc)",
          padding: "28px 20px 20px",
          color: "#fff",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h2 style={{ margin: 0, fontSize: "22px", fontWeight: 800 }}>📅 {t("schedule_title")}</h2>
              <p style={{ margin: "4px 0 0", fontSize: "12px", opacity: 0.8 }}>
                {Object.values(grouped).flat().length} {t("schedule_count")}
              </p>
            </div>
            {user.role === "coach" && (
              <button
                onClick={() => navigate("/schedule/edit")}
                style={{
                  background: "rgba(255,255,255,0.2)",
                  color: "#fff",
                  border: "1px solid rgba(255,255,255,0.4)",
                  borderRadius: "10px",
                  padding: "7px 12px",
                  fontSize: "13px",
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  cursor: "pointer",
                }}
              >
                <Edit3 size={14} /> {t("schedule_edit")}
              </button>
            )}
          </div>
        </div>

        <div style={{ overflowY: "auto", paddingBottom: "85px", flex: 1 }}>
          {Object.keys(grouped).length === 0 ? (
            <div style={{ textAlign: "center", color: "#aaa", marginTop: "60px" }}>
              <div style={{ fontSize: "40px" }}>📭</div>
              <p>{t("schedule_empty")}</p>
            </div>
          ) : (
            Object.entries(grouped).map(([day, items]) => (
              <div key={day} style={{ padding: "0 14px", marginTop: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                  <div style={{
                    background: "#0056b3",
                    color: "#fff",
                    borderRadius: "8px",
                    padding: "4px 10px",
                    fontSize: "12px",
                    fontWeight: 700,
                    letterSpacing: "1px",
                  }}>
                    {dayShort(day)}
                  </div>
                  <div style={{ fontWeight: 700, fontSize: "15px", color: "var(--text-main)" }}>{dayLabel(day)}</div>
                  <div style={{ flex: 1, height: "1px", background: isDark ? "#333" : "#eee" }} />
                  <div style={{ fontSize: "12px", color: "#aaa" }}>{items.length} {t("schedule_lessons")}</div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {items.map((it, i) => (
                    <div
                      key={i}
                      style={{
                        background: isDark ? "var(--bg-card)" : "#fff",
                        borderRadius: "14px",
                        boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
                        overflow: "hidden",
                        display: "flex",
                      }}
                    >
                      <div style={{
                        width: "5px",
                        background: it.color || "#0056b3",
                        flexShrink: 0,
                      }} />

                      <div style={{
                        padding: "12px 10px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRight: "1px solid #f0f0f0",
                        minWidth: "52px",
                      }}>
                        <div style={{ fontSize: "15px", fontWeight: 800, color: "#0056b3", lineHeight: 1 }}>
                          {it.time?.slice(0, 5)}
                        </div>
                        <div style={{ fontSize: "10px", color: "#aaa", marginTop: "2px" }}>
                          <Clock size={9} /> {t("schedule_time")}
                        </div>
                      </div>

                      <div style={{ padding: "10px 12px", flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: "14px", marginBottom: "4px", color: "#1a1a1a" }}>
                          {it.title}
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                          {it.place && (
                            <div style={{ fontSize: "12px", color: "#666", display: "flex", alignItems: "center", gap: "4px" }}>
                              <MapPin size={11} color="#999" /> {it.place}
                            </div>
                          )}
                          {it.coach_name && (
                            <div style={{ fontSize: "12px", color: "#666", display: "flex", alignItems: "center", gap: "4px" }}>
                              <User size={11} color="#999" /> {it.coach_name}
                            </div>
                          )}
                        </div>
                      </div>

                      <div style={{
                        display: "flex", alignItems: "center", padding: "0 12px",
                      }}>
                        <div style={{
                          width: "10px", height: "10px",
                          borderRadius: "50%",
                          background: it.color || "#0056b3",
                        }} />
                      </div>
                    </div>
                  ))}
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

export default Schedule;
