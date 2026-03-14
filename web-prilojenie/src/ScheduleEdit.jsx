import React, { useEffect, useState } from "react";
import Navbar from "./Navbar";
import { Trash2, Save, PlusCircle } from "lucide-react";
import "./App.css";

function ScheduleEdit() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [schedule, setSchedule] = useState([]);
  const [sections, setSections] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ day_of_week: "", time: "", section_id: "" });
  const [newItem, setNewItem] = useState({ day_of_week: "", time: "", section_id: "" });

  const loadData = () => {
    Promise.all([
      fetch("http://localhost:5000/api/schedule").then((r) => r.json()),
      fetch("http://localhost:5000/api/sections").then((r) => r.json()),
    ])
      .then(([sched, secs]) => {
        const mine =
          user.role === "coach"
            ? sched.filter((row) => row.coach_id === user.id)
            : sched;
        setSchedule(mine);
        setSections(secs.filter((s) => s.coach_id === user.id));
      })
      .catch(() => alert("Ошибка загрузки данных с сервера"));
  };

  useEffect(loadData, []);

  if (user.role !== "coach") {
    return (
      <div className="mobile-wrapper">
        <div className="mobile-screen" style={{ padding: "100px 20px", textAlign: "center" }}>
          <h3>Доступ только для преподавателей</h3>
        </div>
      </div>
    );
  }

  const startEdit = (item) => {
    setEditing(item.id);
    setForm({
      day_of_week: item.day_of_week,
      time: item.time,
      section_id: item.section_id,
    });
  };

  const saveEdit = (id) => {
    if (!form.day_of_week || !form.time || !form.section_id) {
      alert("Заполните все поля");
      return;
    }
    fetch(`http://localhost:5000/api/schedule/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
      .then((r) => r.json())
      .then(() => {
        setEditing(null);
        loadData();
      })
      .catch(() => alert("Ошибка при сохранении"));
  };

  const removeItem = (id) => {
    if (!window.confirm("Удалить запись из расписания?")) return;
    fetch(`http://localhost:5000/api/schedule/${id}`, { method: "DELETE" })
      .then(() => setSchedule((p) => p.filter((r) => r.id !== id)))
      .catch(() => alert("Ошибка при удалении"));
  };

  const addItem = () => {
    if (!newItem.day_of_week || !newItem.time || !newItem.section_id) {
      alert("Заполните все поля");
      return;
    }
    fetch("http://localhost:5000/api/schedule", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newItem),
    })
      .then((r) => r.json())
      .then(() => {
        setNewItem({ day_of_week: "", time: "", section_id: "" });
        loadData();
      })
      .catch(() => alert("Ошибка при добавлении"));
  };

  return (
    <div className="mobile-wrapper">
      <div
        className="mobile-screen"
        style={{ padding: "30px 25px 90px", justifyContent: "flex-start" }}
      >
        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Моё расписание</h2>

        <div
          style={{
            background: "#fff",
            borderRadius: "16px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            padding: "12px 16px",
            marginBottom: "14px",
          }}
        >
          <h4 style={{ margin: "0 0 8px 0" }}>Добавить занятие</h4>

          <select
            className="input-field"
            value={newItem.day_of_week}
            onChange={(e) => setNewItem({ ...newItem, day_of_week: e.target.value })}
          >
            <option value="">Выберите день недели</option>
            {["Понедельник", "Вторник", "Среда", "Четверг", "Пятница"].map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          <input
            type="time"
            className="input-field"
            value={newItem.time}
            onChange={(e) => setNewItem({ ...newItem, time: e.target.value })}
          />

          <select
            className="input-field"
            value={newItem.section_id}
            onChange={(e) => setNewItem({ ...newItem, section_id: e.target.value })}
          >
            <option value="">Выберите секцию</option>
            {sections.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </select>

          <button className="login-btn" onClick={addItem}>
            <PlusCircle size={16} /> Добавить
          </button>
        </div>

        {schedule.map((row) => (
          <div
            key={row.id}
            style={{
              background: "#fff",
              borderRadius: "16px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              padding: "12px 16px",
              marginBottom: "12px",
            }}
          >
            {editing === row.id ? (
              <>
                <select
                  className="input-field"
                  value={form.day_of_week}
                  onChange={(e) => setForm({ ...form, day_of_week: e.target.value })}
                >
                  {["Понедельник", "Вторник", "Среда", "Четверг", "Пятница"].map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>

                <input
                  type="time"
                  className="input-field"
                  value={form.time}
                  onChange={(e) => setForm({ ...form, time: e.target.value })}
                />

                <select
                  className="input-field"
                  value={form.section_id}
                  onChange={(e) => setForm({ ...form, section_id: e.target.value })}
                >
                  <option value="">Выберите секцию</option>
                  {sections.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.title}
                    </option>
                  ))}
                </select>

                <button className="login-btn" onClick={() => saveEdit(row.id)}>
                  <Save size={14} /> Сохранить
                </button>
              </>
            ) : (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <b>{row.title}</b>
                  <div style={{ fontSize: "13px", color: "#666" }}>
                    {row.day_of_week}, {row.time}
                  </div>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    style={{ background: "transparent", border: "none", cursor: "pointer" }}
                    onClick={() => startEdit(row)}
                  >
                    ✎
                  </button>
                  <button
                    style={{ background: "transparent", border: "none", cursor: "pointer" }}
                    onClick={() => removeItem(row.id)}
                  >
                    <Trash2 size={18} color="#f44" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
        {schedule.length === 0 && (
          <p style={{ color: "#999", textAlign: "center" }}>Нет занятий</p>
        )}
        <Navbar />
      </div>
    </div>
  );
}

export default ScheduleEdit;