import React, { useEffect, useState } from "react";
import { Check, XCircle } from "lucide-react";
import "./App.css";

function TeacherPanel() {
  const user = JSON.parse(localStorage.getItem("user"));

  const [sections, setSections] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [students, setStudents] = useState([]);
  const [openSection, setOpenSection] = useState(null);

  // === Загрузка данных ===
  const loadData = () => {
    Promise.all([
      fetch("http://localhost:5000/api/sections").then((r) => r.json()),
      fetch(`http://localhost:5000/api/teacher/${user.id}/bookings`).then((r) =>
        r.ok ? r.json() : []
      ),
    ])
      .then(([secs, books]) => {
        // фильтрация секций по преподавателю
        setSections(Array.isArray(secs) ? secs.filter((s) => s.coach_id === user.id) : []);
        setBookings(Array.isArray(books) ? books : []);
      })
      .catch(() => alert("Ошибка загрузки данных"));
  };

  useEffect(loadData, []);

  // === Загрузка студентов секции ===
  const viewStudents = (sectionId) => {
    if (openSection === sectionId) {
      setOpenSection(null);
      return;
    }
    setOpenSection(sectionId);
    fetch(`http://localhost:5000/api/sections/${sectionId}/enrolled`)
      .then((r) => r.json())
      .then(setStudents)
      .catch(() => setStudents([]));
  };

  // === Изменение статуса заявки ===
  const changeStatus = (id, status) => {
    fetch(`http://localhost:5000/api/bookings/${id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
      .then((r) => r.json())
      .then(() => loadData())
      .catch(() => alert("Ошибка при изменении статуса"));
  };

  return (
    <div style={{ maxHeight: "72vh", overflowY: "auto", paddingRight: "6px" }}>
      {/* === Мои секции === */}
      <h3 style={{ margin: "15px 0 10px" }}>Мои секции</h3>
      {sections.length > 0 ? (
        sections.map((s) => (
          <div
            key={s.id}
            style={{
              background: "#fff",
              borderRadius: "10px",
              padding: "10px 15px",
              marginBottom: "10px",
              boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
            }}
          >
            <b>{s.title}</b>
            <div style={{ fontSize: "13px", color: "#555" }}>📍 {s.place}</div>
            <button
              className="login-btn"
              style={{ fontSize: "13px", padding: "6px 10px", marginTop: "6px" }}
              onClick={() => viewStudents(s.id)}
            >
              👥 {openSection === s.id ? "Скрыть студентов" : "Посмотреть студентов"}
            </button>

            {/* === Список студентов секции === */}
            {openSection === s.id && (
              <div
                style={{
                  marginTop: "8px",
                  background: "#f9f9f9",
                  borderRadius: "8px",
                  padding: "8px 10px",
                }}
              >
                <h4 style={{ marginTop: "5px" }}>Студенты:</h4>
                {students.length > 0 ? (
                  students.map((st, i) => (
                    <div key={i} style={{ fontSize: "13px", padding: "3px 0" }}>
                      ✅ {st.name} {st.group_name ? `(${st.group_name})` : ""}
                      {st.health_doc ? (
                        <a
                          href={st.health_doc}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            color: "#0056b3",
                            marginLeft: "6px",
                            textDecoration: "underline",
                          }}
                        >
                          [мед. справка]
                        </a>
                      ) : (
                        <span style={{ color: "#888", marginLeft: "6px" }}>
                          нет справки
                        </span>
                      )}
                      {st.status && (
                        <span style={{ color: "#aaa", marginLeft: "6px" }}>
                          ({st.status})
                        </span>
                      )}
                    </div>
                  ))
                ) : (
                  <p style={{ color: "#999" }}>Пока нет студентов.</p>
                )}
              </div>
            )}
          </div>
        ))
      ) : (
        <p style={{ color: "#999" }}>Нет созданных секций</p>
      )}

      {/* === Заявки студентов === */}
      <h3 style={{ marginTop: "20px" }}>Заявки студентов</h3>
      {bookings.length > 0 ? (
        bookings.map((b) => (
          <div
            key={b.bookingId}
            style={{
              background: "#fff",
              borderRadius: "10px",
              padding: "10px 15px",
              marginBottom: "10px",
              boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
            }}
          >
            <div>
              <b>{b.title}</b>
              <div style={{ fontSize: "13px", color: "#666" }}>👤 {b.user}</div>
              <div style={{ fontSize: "12px", color: "#888" }}>📍 {b.place}</div>
            </div>
            <div style={{ marginTop: "8px" }}>
              <button
                style={{
                  background: "#4caf50",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  padding: "5px 10px",
                  marginRight: "6px",
                  fontSize: "13px",
                  cursor: "pointer",
                }}
                onClick={() => changeStatus(b.bookingId, "approved")}
              >
                <Check size={14} /> Принять
              </button>
              <button
                style={{
                  background: "#f44336",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  padding: "5px 10px",
                  fontSize: "13px",
                  cursor: "pointer",
                }}
                onClick={() => changeStatus(b.bookingId, "rejected")}
              >
                <XCircle size={14} /> Отклонить
              </button>
            </div>
          </div>
        ))
      ) : (
        <p style={{ color: "#999" }}>Нет заявок</p>
      )}
    </div>
  );
}

export default TeacherPanel;