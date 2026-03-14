import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import "./App.css";

function Home() {
  const navigate = useNavigate();
  const [sections, setSections] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));
    else setUser({ name: "Гость", role: null });

    fetch("/api/sections")
      .then((res) => res.json())
      .then(setSections)
      .catch(() => alert("Ошибка загрузки секций!"));
  }, []);

  if (!user) return <p>Загрузка...</p>;

  const filtered = sections.filter((s) =>
    s.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="mobile-wrapper">
      <div className="mobile-screen" style={{ paddingTop: "60px", position: "relative" }}>
        {/* Верхняя панель */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "0 20px",
            alignItems: "center",
            marginBottom: "15px",
          }}
        >
          <div>
            <h2 style={{ margin: 0 }}>{user.name}</h2>
            {user.role && (
              <p style={{ color: "#888", margin: 0, fontSize: "14px" }}>
                {user.role === "coach" ? "👨‍🏫 Преподаватель" : "✓ Студент"}
              </p>
            )}
          </div>

          {user.avatar ? (
            <img
              src={user.avatar}
              alt="user avatar"
              style={{
                width: "45px",
                height: "45px",
                borderRadius: "50%",
                objectFit: "cover",
                border: "2px solid #0056b3",
              }}
            />
          ) : (
            <div
              style={{
                width: "45px",
                height: "45px",
                borderRadius: "50%",
                background: "#ddd",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "18px",
                color: "#777",
              }}
            >
              ?
            </div>
          )}
        </div>

        {/* Поиск */}
        <div style={{ padding: "0 20px" }}>
          <input
            placeholder="🔍 Поиск секции"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field"
          />
        </div>

        {/* Секции */}
        <div className="sections-grid" style={{ padding: "20px" }}>
          {filtered.map((section) => (
            <div
              key={section.id}
              onClick={() => navigate(`/section/${section.id}`)}
              className="sport-card"
              style={{
                position: "relative",
                overflow: "hidden",
                borderRadius: "20px",
                height: "120px",
                cursor: "pointer",
              }}
            >
              <img
                src={section.image}
                alt={section.title}
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: section.color,
                  opacity: 0.8,
                }}
              />
              <div
                style={{
                  position: "relative",
                  zIndex: 2,
                  color: "#fff",
                  padding: "15px",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <h3 style={{ margin: 0 }}>{section.title}</h3>
                <p
                  style={{
                    margin: 0,
                    fontSize: "12px",
                    opacity: 0.9,
                  }}
                >
                  👨‍🏫 {section.coach_name || "Без тренера"}
                </p>
              </div>
            </div>
          ))}
        </div>

        <Navbar />
      </div>
    </div>
  );
}

export default Home;