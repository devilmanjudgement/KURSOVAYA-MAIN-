import React, { useEffect, useState } from "react";
import { Check, XCircle, PlusCircle, Trash2, User, FileText } from "lucide-react";
import { useLang } from "./contexts/LangContext";
import { useTheme } from "./contexts/ThemeContext";
import "./App.css";

function TeacherPanel() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const { t } = useLang();
  const { isDark } = useTheme();

  const card = {
    background: isDark ? "var(--bg-card)" : "#fff",
    borderRadius: "10px",
    padding: "10px 15px",
    marginBottom: "10px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
    color: "var(--text-main)",
  };

  const subPanel = {
    background: isDark ? "var(--bg-input)" : "#f9f9f9",
    borderRadius: "8px",
    padding: "8px 10px",
    marginTop: "8px",
  };

  const formBox = {
    background: isDark ? "var(--bg-input)" : "#f5f8ff",
    border: `1px solid ${isDark ? "var(--border-color)" : "#dce6ff"}`,
    borderRadius: "12px",
    padding: "14px",
    marginBottom: "14px",
  };

  const [sections, setSections] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [students, setStudents] = useState([]);
  const [openSection, setOpenSection] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [studentModal, setStudentModal] = useState(null);
  const [form, setForm] = useState({
    title: "",
    place: "",
    color: "#0056b3",
    description: "",
    max_students: 20,
  });

  const loadData = () => {
    Promise.all([
      fetch("/api/sections").then((r) => r.json()),
      fetch(`/api/teacher/${user.id}/bookings`).then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([secs, books]) => {
        setSections(Array.isArray(secs) ? secs.filter((s) => s.coach_id === user.id) : []);
        setBookings(Array.isArray(books) ? books : []);
      })
      .catch(() => alert(t("err_server_short")));
  };

  useEffect(loadData, []);

  const viewStudents = (sectionId) => {
    if (openSection === sectionId) { setOpenSection(null); return; }
    setOpenSection(sectionId);
    fetch(`/api/sections/${sectionId}/enrolled`)
      .then((r) => r.json())
      .then(setStudents)
      .catch(() => setStudents([]));
  };

  const changeStatus = (id, status) => {
    fetch(`/api/bookings/${id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
      .then(() => loadData())
      .catch(() => alert(t("err_server_short")));
  };

  const createSection = () => {
    if (!form.title || !form.place) return alert(t("tp_fill_required"));
    const fd = new FormData();
    fd.append("title", form.title);
    fd.append("place", form.place);
    fd.append("color", form.color);
    fd.append("description", form.description);
    fd.append("max_students", String(form.max_students));
    fd.append("coach_id", String(user.id));
    if (imageFile) fd.append("image", imageFile);
    fetch("/api/sections", { method: "POST", body: fd })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setShowForm(false);
          setForm({ title: "", place: "", color: "#0056b3", description: "", max_students: 20 });
          setImageFile(null);
          loadData();
        } else alert(d.message || t("tp_section_create_err"));
      })
      .catch(() => alert(t("err_server_short")));
  };

  const deleteSection = (id) => {
    if (!window.confirm(t("tp_delete_section_confirm"))) return;
    fetch(`/api/sections/${id}`, { method: "DELETE" }).then(() => loadData());
  };

  return (
    <div style={{ maxHeight: "72vh", overflowY: "auto", paddingRight: "6px" }}>

      {/* ── Модальное окно профиля студента ── */}
      {studentModal && (
        <div
          onClick={() => setStudentModal(null)}
          style={{
            position: "absolute", inset: 0, zIndex: 100,
            background: "rgba(0,0,0,0.55)",
            display: "flex", alignItems: "center", justifyContent: "center",
            borderRadius: "34px",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: isDark ? "var(--bg-card)" : "#fff",
              borderRadius: "18px",
              padding: "20px",
              width: "280px",
              color: "var(--text-main)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px" }}>
              {studentModal.avatar ? (
                <img
                  src={studentModal.avatar}
                  alt=""
                  style={{ width: 52, height: 52, borderRadius: "50%", objectFit: "cover" }}
                />
              ) : (
                <div style={{
                  width: 52, height: 52, borderRadius: "50%",
                  background: isDark ? "#313244" : "#e8eaf6",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <User size={26} color={isDark ? "#cdd6f4" : "#555"} />
                </div>
              )}
              <div>
                <div style={{ fontWeight: 700, fontSize: "15px" }}>{studentModal.user}</div>
                {studentModal.group_name && (
                  <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                    {t("field_group")}: {studentModal.group_name}
                  </div>
                )}
              </div>
            </div>

            <div style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "10px" }}>
              📋 {studentModal.title}
            </div>

            {studentModal.health_doc ? (
              <a
                href={studentModal.health_doc}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: "flex", alignItems: "center", gap: "6px",
                  color: "#0056b3", fontWeight: 600, fontSize: "14px",
                  textDecoration: "none", marginBottom: "14px",
                }}
              >
                <FileText size={16} />
                {t("tp_health_doc")}
              </a>
            ) : (
              <div style={{ color: "#e57373", fontSize: "13px", marginBottom: "14px" }}>
                ⚠️ {t("tp_no_doc")}
              </div>
            )}

            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={() => { changeStatus(studentModal.bookingId, "approved"); setStudentModal(null); }}
                style={{
                  flex: 1, background: "#4caf50", color: "#fff",
                  border: "none", borderRadius: "8px", padding: "8px",
                  cursor: "pointer", fontWeight: 600, fontSize: "13px",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "4px",
                }}
              >
                <Check size={14} /> {t("tp_approve")}
              </button>
              <button
                onClick={() => { changeStatus(studentModal.bookingId, "cancelled"); setStudentModal(null); }}
                style={{
                  flex: 1, background: "#f44336", color: "#fff",
                  border: "none", borderRadius: "8px", padding: "8px",
                  cursor: "pointer", fontWeight: 600, fontSize: "13px",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "4px",
                }}
              >
                <XCircle size={14} /> {t("tp_reject")}
              </button>
            </div>

            <button
              onClick={() => setStudentModal(null)}
              style={{
                width: "100%", marginTop: "8px", background: "transparent",
                border: `1px solid ${isDark ? "var(--border-color)" : "#ddd"}`,
                borderRadius: "8px", padding: "7px", cursor: "pointer",
                color: "var(--text-muted)", fontSize: "13px",
              }}
            >
              {t("cancel")}
            </button>
          </div>
        </div>
      )}

      {/* ── Мои секции ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "15px 0 10px" }}>
        <h3 style={{ margin: 0 }}>{t("tp_my_sections")}</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            background: showForm ? "#888" : "#0056b3",
            color: "#fff", border: "none", borderRadius: "8px",
            padding: "5px 10px", fontSize: "13px", cursor: "pointer",
            display: "flex", alignItems: "center", gap: "4px",
          }}
        >
          <PlusCircle size={14} /> {showForm ? t("cancel") : t("tp_add")}
        </button>
      </div>

      {showForm && (
        <div style={formBox}>
          <h4 style={{ margin: "0 0 10px", color: "var(--text-main)" }}>{t("tp_new_section")}</h4>
          <input className="input-field" placeholder={t("tp_section_name")} value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })} style={{ marginBottom: "8px" }} />
          <input className="input-field" placeholder={t("tp_section_place")} value={form.place}
            onChange={(e) => setForm({ ...form, place: e.target.value })} style={{ marginBottom: "8px" }} />
          <input className="input-field" placeholder={t("tp_section_desc")} value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })} style={{ marginBottom: "8px" }} />
          <div style={{ display: "flex", gap: "8px", marginBottom: "8px", alignItems: "center" }}>
            <label style={{ fontSize: "13px", color: "var(--text-muted)" }}>{t("tp_color")}:</label>
            <input type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })}
              style={{ width: "40px", height: "32px", border: "none", borderRadius: "6px", cursor: "pointer" }} />
            <input className="input-field" type="number" placeholder={t("tp_max_students")} value={form.max_students}
              onChange={(e) => setForm({ ...form, max_students: e.target.value })} style={{ flex: 1 }} />
          </div>
          <div style={{ marginBottom: "10px" }}>
            <label style={{ fontSize: "13px", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>
              {t("tp_section_photo")}:
            </label>
            <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} />
          </div>
          <button className="login-btn" onClick={createSection}>{t("tp_create_section")}</button>
        </div>
      )}

      {sections.length > 0 ? sections.map((s) => (
        <div key={s.id} style={card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <b>{s.title}</b>
              <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>📍 {s.place}</div>
              <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                👥 {s.students_count || 0} / {s.max_students}
              </div>
            </div>
            <button onClick={() => deleteSection(s.id)}
              style={{ background: "transparent", border: "none", cursor: "pointer", padding: "2px" }}>
              <Trash2 size={16} color="#f44" />
            </button>
          </div>
          <button className="login-btn"
            style={{ fontSize: "13px", padding: "6px 10px", marginTop: "6px" }}
            onClick={() => viewStudents(s.id)}>
            👥 {openSection === s.id ? t("tp_hide_students") : t("tp_show_students")}
          </button>

          {openSection === s.id && (
            <div style={subPanel}>
              <h4 style={{ marginTop: "5px", color: "var(--text-main)" }}>{t("tp_students")}:</h4>
              {students.length > 0 ? students.map((st, i) => (
                <div key={i} style={{ fontSize: "13px", padding: "3px 0", color: "var(--text-main)" }}>
                  ✅ {st.name} {st.group_name ? `(${st.group_name})` : ""}
                  {st.health_doc ? (
                    <a href={st.health_doc} target="_blank" rel="noreferrer"
                      style={{ color: "#0056b3", marginLeft: "6px", textDecoration: "underline" }}>
                      [{t("tp_health_doc")}]
                    </a>
                  ) : (
                    <span style={{ color: "#e57373", marginLeft: "6px" }}>{t("tp_no_doc")}</span>
                  )}
                </div>
              )) : (
                <p style={{ color: "var(--text-muted)" }}>{t("tp_no_students_yet")}</p>
              )}
            </div>
          )}
        </div>
      )) : (
        <p style={{ color: "var(--text-muted)" }}>{t("tp_no_sections")}</p>
      )}

      {/* ── Заявки студентов ── */}
      <h3 style={{ marginTop: "20px", color: "var(--text-main)" }}>{t("tp_student_requests")}</h3>
      {bookings.length > 0 ? bookings.map((b) => (
        <div key={b.bookingId} style={card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <b style={{ display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {b.title}
              </b>
              <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>📍 {b.place}</div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "4px", flexWrap: "wrap" }}>
                <span style={{ fontSize: "13px", fontWeight: 600 }}>👤 {b.user}</span>
                {b.group_name && (
                  <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>({b.group_name})</span>
                )}
                {b.health_doc ? (
                  <span style={{
                    fontSize: "11px", background: "#e8f5e9", color: "#388e3c",
                    borderRadius: "4px", padding: "1px 6px", fontWeight: 600,
                  }}>
                    ✓ {t("tp_health_doc")}
                  </span>
                ) : (
                  <span style={{
                    fontSize: "11px", background: "#fce4ec", color: "#c62828",
                    borderRadius: "4px", padding: "1px 6px", fontWeight: 600,
                  }}>
                    ✗ {t("tp_no_doc")}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => setStudentModal(b)}
              style={{
                background: isDark ? "var(--bg-input)" : "#f0f4ff",
                border: "none", borderRadius: "8px", padding: "7px 10px",
                cursor: "pointer", marginLeft: "8px", flexShrink: 0,
                color: "#0056b3", fontSize: "12px", fontWeight: 600,
                display: "flex", alignItems: "center", gap: "4px",
              }}
            >
              <User size={14} /> {t("nav_profile")}
            </button>
          </div>

          <div style={{ marginTop: "8px", display: "flex", gap: "6px" }}>
            <button
              onClick={() => changeStatus(b.bookingId, "approved")}
              style={{
                flex: 1, background: "#4caf50", color: "#fff",
                border: "none", borderRadius: "6px", padding: "6px",
                fontSize: "13px", cursor: "pointer", fontWeight: 600,
                display: "flex", alignItems: "center", justifyContent: "center", gap: "4px",
              }}
            >
              <Check size={14} /> {t("tp_approve")}
            </button>
            <button
              onClick={() => changeStatus(b.bookingId, "cancelled")}
              style={{
                flex: 1, background: "#f44336", color: "#fff",
                border: "none", borderRadius: "6px", padding: "6px",
                fontSize: "13px", cursor: "pointer", fontWeight: 600,
                display: "flex", alignItems: "center", justifyContent: "center", gap: "4px",
              }}
            >
              <XCircle size={14} /> {t("tp_reject")}
            </button>
          </div>
        </div>
      )) : (
        <p style={{ color: "var(--text-muted)" }}>{t("profile_no_bookings")}</p>
      )}
    </div>
  );
}

export default TeacherPanel;
