import React, { useEffect, useState } from "react";
import Navbar from "./Navbar";
import TeacherPanel from "./TeacherPanel";
import { useNavigate } from "react-router-dom";
import "./App.css";

function Profile() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [avatarPreview, setAvatarPreview] = useState(user.avatar || null);
  const [newAvatar, setNewAvatar] = useState(null);
  const [docFile, setDocFile] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");

  useEffect(() => {
    if (user.role === "student") {
      const safe = encodeURIComponent(user.name);
      fetch(`/api/student/${safe}/enrollments`)
        .then((r) => r.json())
        .then(setEnrollments)
        .catch(() => setEnrollments([]));
    }
  }, [user.name]);

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  const updateAvatar = () => {
    if (!newAvatar) return alert("Выберите файл");
    const fd = new FormData();
    fd.append("avatar", newAvatar);
    fetch(`/api/profile/${user.id}`, { method: "PUT", body: fd })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setAvatarPreview(d.user.avatar);
          const updated = { ...user, avatar: d.user.avatar };
          localStorage.setItem("user", JSON.stringify(updated));
          alert("Фото обновлено!");
        }
      })
      .catch(() => alert("Ошибка при загрузке фото"));
  };

  const uploadDoc = () => {
    if (!docFile) return alert("Файл не выбран");
    const fd = new FormData();
    fd.append("file", docFile);
    fetch(`/api/student/${user.id}/healthdoc`, {
      method: "POST",
      body: fd,
    })
      .then((r) => r.json())
      .then((d) => d.success && alert("Справка загружена"))
      .catch(() => alert("Ошибка"));
  };

  const cancelBooking = (id) => {
    if (!window.confirm("Отменить заявку?")) return;
    fetch(`/api/bookings/${id}`, { method: "DELETE" })
      .then((r) => r.json())
      .then((d) => d.success && setEnrollments((prev) => prev.filter((x) => x.bookingId !== id)));
  };

  const changePassword = () => {
    if (!oldPass || !newPass) return alert("Введите старый и новый пароли");
    fetch(`/api/profile/${user.id}/password`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ oldPassword: oldPass, newPassword: newPass }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          alert("Пароль обновлён");
          setOldPass("");
          setNewPass("");
        } else alert(d.message || "Ошибка смены пароля");
      })
      .catch(() => alert("Ошибка сервера"));
  };

  if (!user.id)
    return (
      <div className="mobile-wrapper">
        <div className="mobile-screen" style={{ textAlign: "center" }}>
          <h3>Не авторизован</h3>
          <button className="login-btn" onClick={() => navigate("/")}>Войти</button>
        </div>
      </div>
    );

  // === Преподаватель ===
  if (user.role === "coach")
    return (
      <div className="mobile-wrapper">
        <div
          className="mobile-screen"
          style={{
            padding: "20px 20px 100px",
            overflowY: "auto",
            position: "relative",
          }}
        >
          <h2 style={{ textAlign: "center" }}>Профиль преподавателя</h2>
          {avatarPreview && (
            <img
              src={avatarPreview}
              alt="avatar"
              style={{
                width: 90,
                height: 90,
                borderRadius: "50%",
                margin: "0 auto 8px",
                display: "block",
              }}
            />
          )}
          <input type="file" onChange={(e) => setNewAvatar(e.target.files[0])} />
          <button className="login-btn" onClick={updateAvatar}>Обновить фото</button>
          <TeacherPanel />
          <button
            className="login-btn"
            style={{ background: "#333", marginTop: 15 }}
            onClick={logout}
          >
            Выйти
          </button>
          <Navbar />
        </div>
      </div>
    );

  // === Студент ===
  return (
    <div className="mobile-wrapper">
      <div
        className="mobile-screen"
        style={{
          padding: "20px 20px 100px",
          overflowY: "auto", // 👈 добавили прокрутку
          position: "relative",
        }}
      >
        <h2 style={{ textAlign: "center" }}>Профиль студента</h2>

        {avatarPreview && (
          <img
            src={avatarPreview}
            alt="avatar"
            style={{
              width: 90,
              height: 90,
              borderRadius: "50%",
              margin: "0 auto 8px",
              display: "block",
            }}
          />
        )}

        <input type="file" onChange={(e) => setNewAvatar(e.target.files[0])} />
        <button className="login-btn" onClick={updateAvatar}>Обновить фото</button>

        <h3>Мед. справка</h3>
        <input type="file" onChange={(e) => setDocFile(e.target.files[0])} />
        <button className="login-btn" onClick={uploadDoc}>Загрузить справку</button>

        <h3>Мои заявки</h3>
        {enrollments.length ? (
          enrollments.map((s) => (
            <div key={s.bookingId}
              style={{
                background: "#fff",
                borderRadius: 10,
                padding: 10,
                marginBottom: 10,
              }}>
              <b>{s.title}</b>
              <br />📍 {s.place}
              <br />👨‍🏫 {s.coach}
              <br />
              <span style={{ color: "#888", fontSize: 12 }}>
                Статус: {s.status}
              </span>
              <br />
              <button
                className="login-btn"
                style={{ background: "#f44336", marginTop: 5 }}
                onClick={() => cancelBooking(s.bookingId)}>
                Отменить заявку
              </button>
            </div>
          ))
        ) : (
          <p style={{ color: "#888" }}>Нет заявок</p>
        )}

        {/* ==== Блок смены пароля ==== */}
        <details
          style={{
            marginTop: 20,
            background: "#f5f5f5",
            borderRadius: 10,
            padding: "8px 12px",
          }}
        >
          <summary style={{ cursor: "pointer", fontWeight: 600 }}>
            Сменить пароль ▾
          </summary>
          <div style={{ marginTop: 10 }}>
            <input
              type="password"
              className="input-field"
              placeholder="Старый пароль"
              value={oldPass}
              onChange={(e) => setOldPass(e.target.value)}
            />
            <input
              type="password"
              className="input-field"
              placeholder="Новый пароль"
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
            />
            <button className="login-btn" onClick={changePassword}>
              Обновить пароль
            </button>
          </div>
        </details>

        <button
          className="login-btn"
          style={{ background: "#333", marginTop: 15 }}
          onClick={logout}
        >
          Выйти
        </button>

        <Navbar />
      </div>
    </div>
  );
}

export default Profile;