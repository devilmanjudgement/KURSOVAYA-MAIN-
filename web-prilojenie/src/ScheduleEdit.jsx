import React, { useEffect, useState } from "react";
import Navbar from "./Navbar";
import { Trash2, Save, PlusCircle } from "lucide-react";
import { useLang } from "./contexts/LangContext";
import "./App.css";

function ScheduleEdit() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const { t } = useLang();
  const [schedule, setSchedule] = useState([]);
  const [sections, setSections] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ day_of_week: "", time: "", section_id: "" });
  const [newItem, setNewItem] = useState({ day_of_week: "", time: "", section_id: "" });

  const DAYS = [t("se_day_mon"), t("se_day_tue"), t("se_day_wed"), t("se_day_thu"), t("se_day_fri")];
  const DAYS_RU = ["Понедельник", "Вторник", "Среда", "Четверг", "Пятница"];

  const loadData = () => {
    Promise.all([
      fetch("/api/schedule").then((r) => r.json()),
      fetch("/api/sections").then((r) => r.json()),
    ])
      .then(([sched, secs]) => {
        const mine =
          user.role === "coach"
            ? sched.filter((row) => row.coach_id === user.id)
            : sched;
        setSchedule(mine);
        setSections(secs.filter((s) => s.coach_id === user.id));
      })
      .catch(() => alert(t("err_server_short")));
  };

  useEffect(loadData, []);

  if (user.role !== "coach") {
    return (
      <div className="mobile-wrapper">
        <div className="mobile-screen" style={{ padding: "100px 20px", textAlign: "center" }}>
          <h3>{t("se_coach_only")}</h3>
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
      alert(t("se_fill_all"));
      return;
    }
    fetch(`/api/schedule/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
      .then((r) => r.json())
      .then(() => {
        setEditing(null);
        loadData();
      })
      .catch(() => alert(t("err_server_short")));
  };

  const removeItem = (id) => {
    if (!window.confirm(t("se_delete_confirm"))) return;
    fetch(`/api/schedule/${id}`, { method: "DELETE" })
      .then(() => setSchedule((p) => p.filter((r) => r.id !== id)))
      .catch(() => alert(t("err_server_short")));
  };

  const addItem = () => {
    if (!newItem.day_of_week || !newItem.time || !newItem.section_id) {
      alert(t("se_fill_all"));
      return;
    }
    fetch("/api/schedule", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newItem),
    })
      .then((r) => r.json())
      .then(() => {
        setNewItem({ day_of_week: "", time: "", section_id: "" });
        loadData();
      })
      .catch(() => alert(t("err_server_short")));
  };

  return (
    <div className="mobile-wrapper">
      <div
        className="mobile-screen"
        style={{ padding: "30px 25px 90px", justifyContent: "flex-start", overflowY: "auto" }}
      >
        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>{t("se_title")}</h2>

        <div
          style={{
            background: "#fff",
            borderRadius: "16px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            padding: "12px 16px",
            marginBottom: "14px",
          }}
        >
          <h4 style={{ margin: "0 0 8px 0" }}>{t("se_add_lesson")}</h4>

          <select
            className="input-field"
            value={newItem.day_of_week}
            onChange={(e) => setNewItem({ ...newItem, day_of_week: e.target.value })}
          >
            <option value="">{t("se_pick_day")}</option>
            {DAYS_RU.map((d, i) => (
              <option key={d} value={d}>
                {DAYS[i]}
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
            <option value="">{t("se_pick_section")}</option>
            {sections.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </select>

          <button className="login-btn" onClick={addItem}>
            <PlusCircle size={16} /> {t("se_add_btn")}
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
                  {DAYS_RU.map((d, i) => (
                    <option key={d} value={d}>
                      {DAYS[i]}
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
                  <option value="">{t("se_pick_section")}</option>
                  {sections.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.title}
                    </option>
                  ))}
                </select>

                <button className="login-btn" onClick={() => saveEdit(row.id)}>
                  <Save size={14} /> {t("se_save_btn")}
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
          <p style={{ color: "#999", textAlign: "center" }}>{t("se_empty")}</p>
        )}
        <Navbar />
      </div>
    </div>
  );
}

export default ScheduleEdit;
