import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, User } from "lucide-react";
import "./App.css";

function Section() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [section, setSection] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));

    fetch(`/api/sections/${id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then(setSection)
      .catch(() => setSection(null));
  }, [id]);

  const handleBooking = () => {
    if (!user || user.role !== "student") {
      alert("Запись доступна только студентам!");
      return;
    }

    const payload = {
      sectionId: id,
      user: user.name,
      date: new Date().toLocaleDateString(),
      docType: "auto",
    };

    fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          alert("✅ Заявка отправлена тренеру!");
          navigate("/home");
        } else alert("Ошибка при записи!");
      })
      .catch(() => alert("Сервер недоступен"));
  };

  if (!section)
    return (
      <div className="mobile-wrapper">
        <div className="mobile-screen" style={{ textAlign: "center" }}>
          <p>Загрузка...</p>
        </div>
      </div>
    );

  return (
    <div className="mobile-wrapper">
      <div className="mobile-screen" style={{ paddingTop: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: "15px" }}>
          <button
            onClick={() => navigate(-1)}
            style={{ background: "none", border: "none", cursor: "pointer", padding: "10px" }}
          >
            <ArrowLeft size={24} color="#333" />
          </button>
          <h2 style={{ flex: 1, textAlign: "center" }}>Секция</h2>
        </div>

        <div
          style={{
            background: section.color || "#0056b3",
            borderRadius: "20px",
            color: "#fff",
            padding: "20px",
            margin: "0 15px 20px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <h1 style={{ margin: 0 }}>{section.title}</h1>
            {section.image && (
              <img
                src={section.image}
                alt={section.title}
                style={{
                  width: "70px",
                  height: "70px",
                  borderRadius: "12px",
                  objectFit: "cover",
                }}
              />
            )}
          </div>
          <div style={{ fontSize: "14px", marginTop: "10px" }}>
            <MapPin size={14} /> {section.place}
            <br />
            <User size={14} /> Тренер: {section.coach_name || "Без тренера"}
          </div>
        </div>

        <div style={{ padding: "0 20px" }}>
          <p><b>Описание:</b> {section.description || "Описание отсутствует"}</p>
          <p>
            <b>Занято:</b> {section.students_count || 0} /{" "}
            {section.max_students || 20}
          </p>

          <div
            style={{
              marginTop: "15px",
              background: "#f5f5f5",
              borderRadius: "12px",
              padding: "10px 12px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              boxShadow: "0 2px 5px rgba(0,0,0,0.08)",
            }}
          >
            {section.coach_avatar ? (
              <img
                src={section.coach_avatar}
                alt="coach"
                style={{
                  width: "60px",
                  height: "60px",
                  borderRadius: "50%",
                  objectFit: "cover",
                }}
              />
            ) : (
              <div
                style={{
                  width: "60px",
                  height: "60px",
                  borderRadius: "50%",
                  background: "#ddd",
                }}
              />
            )}
            <div>
              <p style={{ margin: 0, fontWeight: 600 }}>Тренер:</p>
              <p style={{ margin: 0 }}>{section.coach_name || "Без тренера"}</p>
            </div>
          </div>
        </div>

        {user?.role === "student" && (
          <button className="login-btn" style={{ margin: "20px" }} onClick={handleBooking}>
            Отправить заявку »
          </button>
        )}
      </div>
    </div>
  );
}

export default Section;