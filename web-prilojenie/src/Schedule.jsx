import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import { Clock, MapPin, Edit3, User } from "lucide-react";
import "./App.css";

const DAY_ORDER = ["Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота", "Воскресенье"];
const DAY_SHORT = { Понедельник: "ПН", Вторник: "ВТ", Среда: "СР", Четверг: "ЧТ", Пятница: "ПТ", Суббота: "СБ", Воскресенье: "ВС" };

function Schedule() {
  const [schedule, setSchedule] = useState([]);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    fetch("/api/schedule")
      .then((res) => res.json())
      .then(setSchedule)
      .catch((err) => console.error("Ошибка загрузки:", err));
  }, []);

  const grouped = DAY_ORDER.reduce((acc, day) => {
    const items = schedule.filter((s) => s.day_of_week === day);
    if (items.length) acc[day] = items.sort((a, b) => a.time.localeCompare(b.time));
    return acc;
  }, {});

  return (
    <div className="mobile-wrapper">
      <div className="mobile-screen" style={{ justifyContent: "flex-start", position: "relative" }}>
        {/* Шапка */}
        <div style={{
          background: "linear-gradient(135deg, #0056b3, #0077cc)",
          padding: "28px 20px 20px",
          color: "#fff",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h2 style={{ margin: 0, fontSize: "22px", fontWeight: 800 }}>📅 Расписание</h2>
              <p style={{ margin: "4px 0 0", fontSize: "12px", opacity: 0.8 }}>
                {Object.values(grouped).flat().length} занятий на неделе
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
                <Edit3 size={14} /> Изменить
              </button>
            )}
          </div>
        </div>

        {/* Список по дням */}
        <div style={{ overflowY: "auto", paddingBottom: "85px", flex: 1 }}>
          {Object.keys(grouped).length === 0 ? (
            <div style={{ textAlign: "center", color: "#aaa", marginTop: "60px" }}>
              <div style={{ fontSize: "40px" }}>📭</div>
              <p>Расписание пока пустое</p>
            </div>
          ) : (
            Object.entries(grouped).map(([day, items]) => (
              <div key={day} style={{ padding: "0 14px", marginTop: "16px" }}>
                {/* Заголовок дня */}
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
                    {DAY_SHORT[day] || day.slice(0, 2).toUpperCase()}
                  </div>
                  <div style={{ fontWeight: 700, fontSize: "15px", color: "#222" }}>{day}</div>
                  <div style={{ flex: 1, height: "1px", background: "#eee" }} />
                  <div style={{ fontSize: "12px", color: "#aaa" }}>{items.length} зан.</div>
                </div>

                {/* Карточки занятий */}
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {items.map((it, i) => (
                    <div
                      key={i}
                      style={{
                        background: "#fff",
                        borderRadius: "14px",
                        boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
                        overflow: "hidden",
                        display: "flex",
                      }}
                    >
                      {/* Цветная полоска слева */}
                      <div style={{
                        width: "5px",
                        background: it.color || "#0056b3",
                        flexShrink: 0,
                      }} />

                      {/* Время */}
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
                          <Clock size={9} /> время
                        </div>
                      </div>

                      {/* Основная информация */}
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

                      {/* Цветной кружок */}
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
