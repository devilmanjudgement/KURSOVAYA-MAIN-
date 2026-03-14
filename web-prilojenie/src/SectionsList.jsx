import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import "./App.css";

function SectionsList() {
  const [sections, setSections] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("/api/sections")
      .then((res) => res.json())
      .then(setSections)
      .catch(() => alert("Ошибка загрузки секций!"));
  }, []);

  if (!sections.length)
    return (
      <div className="mobile-wrapper">
        <div className="mobile-screen">
          <p>Загрузка...</p>
        </div>
      </div>
    );

  return (
    <div className="mobile-wrapper">
      <div
        className="mobile-screen"
        style={{ justifyContent: "flex-start", paddingTop: "40px" }}
      >
        <h2 style={{ textAlign: "center", marginBottom: "15px" }}>
          Все секции
        </h2>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            paddingBottom: "80px",
          }}
        >
          {sections.map((s) => (
            <div
              key={s.id}
              onClick={() => navigate(`/section/${s.id}`)}
              style={{
                background: "#fff",
                borderRadius: "15px",
                padding: "12px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                cursor: "pointer",
              }}
            >
              <img
                src={s.image}
                alt={s.title}
                style={{
                  width: "70px",
                  height: "70px",
                  borderRadius: "10px",
                  objectFit: "cover",
                }}
              />
              <div>
                <div
                  style={{
                    fontWeight: "600",
                    fontSize: "16px",
                    marginBottom: "2px",
                  }}
                >
                  {s.title}
                </div>
                <div style={{ fontSize: "13px", color: "#666" }}>
                  📍 {s.place}
                </div>
                <div style={{ fontSize: "13px", color: "#666" }}>
                  👨‍🏫 {s.coach}
                </div>
              </div>
            </div>
          ))}
        </div>

        <Navbar />
      </div>
    </div>
  );
}

export default SectionsList;