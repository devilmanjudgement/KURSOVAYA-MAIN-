import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import { Clock, MapPin, Edit3 } from "lucide-react";
import "./App.css";

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

  const grouped = schedule.reduce((acc, cur) => {
    if (!acc[cur.day_of_week]) acc[cur.day_of_week] = [];
    acc[cur.day_of_week].push(cur);
    return acc;
  }, {});

  return (
    <div className="mobile-wrapper">
      <div
        className="mobile-screen"
        style={{
          justifyContent: "flex-start",
          paddingTop: "30px",
          position: "relative",
        }}
      >
        {/* Заголовок + кнопка */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginBottom: "15px",
          }}
        >
          <h2 style={{ textAlign: "center", margin: 0 }}>Расписание</h2>
          {user.role === "coach" && (
            <button
              onClick={() => navigate("/schedule/edit")}
              style={{
                marginTop: "10px",
                background: "#0056b3",
                color: "#fff",
                border: "none",
                borderRadius: "10px",
                padding: "8px 14px",
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                cursor: "pointer",
              }}
            >
              <Edit3 size={16} /> Редактировать
            </button>
          )}
        </div>

        {/* Список расписаний */}
        <div style={{ overflowY: "auto", paddingBottom: "80px" }}>
          {Object.entries(grouped).map(([day, items]) => (
            <div key={day} style={{ marginBottom: "25px" }}>
              <div
                style={{
                  fontWeight: "bold",
                  color: "#888",
                  marginBottom: "10px",
                  textTransform: "uppercase",
                }}
              >
                {day}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {items.map((it, i) => (
                  <div
                    key={i}
                    style={{
                      background: "white",
                      borderRadius: "16px",
                      padding: "12px 16px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: "bold" }}>{it.title}</div>
                      <div style={{ fontSize: "12px", color: "#666" }}>
                        <Clock size={12} /> {it.time} &nbsp;&nbsp;
                        <MapPin size={12} /> {it.place}
                      </div>
                    </div>
                    <div
                      style={{
                        width: "14px",
                        height: "14px",
                        borderRadius: "50%",
                        background: it.color,
                      }}
                    ></div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <Navbar />
      </div>
    </div>
  );
}

export default Schedule;