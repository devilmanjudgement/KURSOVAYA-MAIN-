import React, { useEffect, useState } from "react";
import Navbar from "./Navbar";
import TeacherPanel from "./TeacherPanel";
import { useNavigate } from "react-router-dom";
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

        <h3>{t("profile_my_bookings")}</h3>
        {enrollments.length ? (
          enrollments.map((s) => (
            <div key={s.bookingId}
              style={{
                background: isDark ? "var(--bg-card)" : "#fff",
                borderRadius: 10,
                padding: 10,
                marginBottom: 10,
              }}>
              <b>{s.title}</b>
              <br />📍 {s.place}
              <br />👨‍🏫 {s.coach}
              <br />
              <span style={{ color: "#888", fontSize: 12 }}>
                {t("profile_booking_status")} {statusLabel(s.status)}
              </span>
              <br />
              {s.status !== "approved" && (
                <button
                  className="login-btn"
                  style={{ background: "#f44336", marginTop: 5 }}
                  onClick={() => cancelBooking(s.bookingId)}>
                  {t("profile_cancel_booking")}
                </button>
              )}
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
