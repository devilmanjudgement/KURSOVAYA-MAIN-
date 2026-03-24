import React, { useEffect, useState } from "react";
import Navbar from "./Navbar";
import TeacherPanel from "./TeacherPanel";
import { useNavigate } from "react-router-dom";
import { User, MessageCircle } from "lucide-react";
import { useLang } from "./contexts/LangContext";
import { useTheme } from "./contexts/ThemeContext";
import "./App.css";

function Profile() {
  const navigate = useNavigate();
  const { t } = useLang();
  const { isDark } = useTheme();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [avatarPreview, setAvatarPreview] = useState(user.avatar || null);
  const [newAvatar, setNewAvatar] = useState(null);
  const [docFile, setDocFile] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [coachModal, setCoachModal] = useState(null);
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [newName, setNewName] = useState(user.name || "");

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
    if (!newAvatar) return alert(t("err_no_file"));
    const fd = new FormData();
    fd.append("avatar", newAvatar);
    fetch(`/api/profile/${user.id}`, { method: "PUT", body: fd })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setAvatarPreview(d.user.avatar);
          const updated = { ...user, avatar: d.user.avatar };
          localStorage.setItem("user", JSON.stringify(updated));
          alert(t("profile_photo_updated"));
        }
      })
      .catch(() => alert(t("err_photo_upload")));
  };

  const uploadDoc = () => {
    if (!docFile) return alert(t("err_file_none"));
    const fd = new FormData();
    fd.append("file", docFile);
    fetch(`/api/student/${user.id}/healthdoc`, {
      method: "POST",
      body: fd,
    })
      .then((r) => r.json())
      .then((d) => d.success && alert(t("profile_doc_uploaded")))
      .catch(() => alert(t("err_server_short")));
  };

  const cancelBooking = (id) => {
    if (!window.confirm(t("err_cancel_booking"))) return;
    fetch(`/api/bookings/${id}`, { method: "DELETE" })
      .then((r) => r.json())
      .then((d) => d.success && setEnrollments((prev) => prev.filter((x) => x.bookingId !== id)));
  };

  const updateName = () => {
    if (!newName.trim()) return alert(t("profile_enter_name"));
    const fd = new FormData();
    fd.append("name", newName.trim());
    fetch(`/api/profile/${user.id}`, { method: "PUT", body: fd })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          const updated = { ...user, name: d.user.name };
          localStorage.setItem("user", JSON.stringify(updated));
          alert(t("profile_name_updated"));
        }
      })
      .catch(() => alert(t("err_server_short")));
  };

  const statusLabel = (status) => {
    if (status === "approved") return t("adm_status_approved");
    if (status === "cancelled") return t("adm_status_cancelled");
    return t("adm_status_pending");
  };

  const changePassword = () => {
    if (!oldPass || !newPass) return alert(t("err_pass_fields"));
    fetch(`/api/profile/${user.id}/password`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ oldPassword: oldPass, newPassword: newPass }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          alert(t("profile_pass_updated"));
          setOldPass("");
          setNewPass("");
        } else alert(d.message || t("err_pass_change"));
      })
      .catch(() => alert(t("err_server_short")));
  };

  if (!user.id)
    return (
      <div className="mobile-wrapper">
        <div className="mobile-screen" style={{ textAlign: "center" }}>
          <h3>{t("profile_not_auth")}</h3>
          <button className="login-btn" onClick={() => navigate("/")}>{t("sign_in")}</button>
        </div>
      </div>
    );

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
          <h2 style={{ textAlign: "center" }}>{t("profile_coach")}</h2>
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
          <button className="login-btn" onClick={updateAvatar}>{t("profile_update_photo")}</button>

          <details
            style={{
              marginBottom: 16,
              background: isDark ? "var(--bg-card)" : "#f5f5f5",
              borderRadius: 10,
              padding: "8px 12px",
            }}
          >
            <summary style={{ cursor: "pointer", fontWeight: 600 }}>
              {t("profile_change_name")}
            </summary>
            <div style={{ marginTop: 10 }}>
              <input
                className="input-field"
                placeholder={t("profile_new_name_placeholder")}
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
              <button className="login-btn" onClick={updateName}>
                {t("profile_save_name")}
              </button>
            </div>
          </details>

          <TeacherPanel />
          <button
            className="login-btn"
            style={{ background: "#333", marginTop: 15 }}
            onClick={logout}
          >
            {t("logout")}
          </button>
          <Navbar />
        </div>
      </div>
    );

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
        <h2 style={{ textAlign: "center" }}>{t("profile_student")}</h2>

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
        <button className="login-btn" onClick={updateAvatar}>{t("profile_update_photo")}</button>

        <h3>{t("profile_healthdoc")}</h3>
        <input type="file" onChange={(e) => setDocFile(e.target.files[0])} />
        <button className="login-btn" onClick={uploadDoc}>{t("profile_upload_doc")}</button>

        {coachModal && (
          <div
            onClick={() => setCoachModal(null)}
            style={{
              position: "fixed", inset: 0, zIndex: 200,
              background: "rgba(0,0,0,0.55)",
              display: "flex", alignItems: "center", justifyContent: "center",
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
                {coachModal.coach_avatar ? (
                  <img
                    src={coachModal.coach_avatar}
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
                  <div style={{ fontWeight: 700, fontSize: "15px" }}>{coachModal.coach}</div>
                  <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>📋 {coachModal.title}</div>
                </div>
              </div>

              <button
                onClick={() => { setCoachModal(null); navigate("/chat", { state: { contactId: coachModal.coach_id } }); }}
                style={{
                  width: "100%", background: "#0056b3", color: "#fff",
                  border: "none", borderRadius: "8px", padding: "10px",
                  cursor: "pointer", fontWeight: 600, fontSize: "14px",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                  marginBottom: "8px",
                }}
              >
                <MessageCircle size={16} /> {t("tp_write_message")}
              </button>

              <button
                onClick={() => setCoachModal(null)}
                style={{
                  width: "100%", background: "transparent",
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

        <h3>{t("profile_my_sections")}</h3>
        {enrollments.filter((s) => s.status === "approved").length ? (
          enrollments.filter((s) => s.status === "approved").map((s) => (
            <div
              key={s.bookingId}
              onClick={() => setCoachModal(s)}
              style={{
                background: isDark ? "var(--bg-card)" : "#fff",
                borderRadius: 10,
                padding: 10,
                marginBottom: 10,
                borderLeft: "4px solid #4caf50",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}>
              <div>
                <b>{s.title}</b>
                <br />📍 {s.place}
                <br />👨‍🏫 {s.coach}
              </div>
              <User size={16} color="#0056b3" style={{ flexShrink: 0, marginLeft: 8 }} />
            </div>
          ))
        ) : (
          <p style={{ color: "#888" }}>{t("profile_no_sections")}</p>
        )}

        <h3>{t("profile_my_bookings")}</h3>
        {enrollments.filter((s) => s.status === "pending").length ? (
          enrollments.filter((s) => s.status === "pending").map((s) => (
            <div key={s.bookingId}
              style={{
                background: isDark ? "var(--bg-card)" : "#fff",
                borderRadius: 10,
                padding: 10,
                marginBottom: 10,
                borderLeft: "4px solid #ff9800",
              }}>
              <b>{s.title}</b>
              <br />📍 {s.place}
              <br />👨‍🏫 {s.coach}
              <br />
              <span style={{ color: "#888", fontSize: 12 }}>
                {t("profile_booking_status")} {statusLabel(s.status)}
              </span>
              <br />
              <button
                className="login-btn"
                style={{ background: "#f44336", marginTop: 5 }}
                onClick={() => cancelBooking(s.bookingId)}>
                {t("profile_cancel_booking")}
              </button>
            </div>
          ))
        ) : (
          <p style={{ color: "#888" }}>{t("profile_no_bookings")}</p>
        )}

        <details
          style={{
            marginTop: 20,
            background: isDark ? "var(--bg-card)" : "#f5f5f5",
            borderRadius: 10,
            padding: "8px 12px",
          }}
        >
          <summary style={{ cursor: "pointer", fontWeight: 600 }}>
            {t("profile_change_pass")}
          </summary>
          <div style={{ marginTop: 10 }}>
            <input
              type="password"
              className="input-field"
              placeholder={t("field_old_pass")}
              value={oldPass}
              onChange={(e) => setOldPass(e.target.value)}
            />
            <input
              type="password"
              className="input-field"
              placeholder={t("field_new_pass")}
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
            />
            <button className="login-btn" onClick={changePassword}>
              {t("profile_update_pass")}
            </button>
          </div>
        </details>

        <button
          className="login-btn"
          style={{ background: "#333", marginTop: 15 }}
          onClick={logout}
        >
          {t("logout")}
        </button>

        <Navbar />
      </div>
    </div>
  );
}

export default Profile;
