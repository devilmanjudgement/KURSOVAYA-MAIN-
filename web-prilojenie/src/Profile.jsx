import React, { useEffect, useState } from "react";
import Navbar from "./Navbar";
import TeacherPanel from "./TeacherPanel";
import { useNavigate } from "react-router-dom";
import { User, MessageCircle, CheckCircle, FileText, Camera, Lock, LogOut } from "lucide-react";
import { useLang } from "./contexts/LangContext";
import { useTheme } from "./contexts/ThemeContext";
import "./App.css";

const AVATAR_PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='90' height='90'%3E%3Crect width='90' height='90' rx='45' fill='%23e5e7eb'/%3E%3Ctext x='45' y='58' font-size='40' text-anchor='middle'%3E👤%3C/text%3E%3C/svg%3E";

function Section({ title, icon, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  const { isDark } = useTheme();
  return (
    <div style={{
      background: isDark ? "var(--bg-card)" : "#fff",
      borderRadius: "14px",
      marginBottom: "12px",
      overflow: "hidden",
      boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
    }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          width: "100%", display: "flex", alignItems: "center", gap: "10px",
          padding: "14px 16px", background: "none", border: "none",
          cursor: "pointer", textAlign: "left",
        }}
      >
        <span style={{ color: "#0056b3" }}>{icon}</span>
        <span style={{ flex: 1, fontWeight: 700, fontSize: "14px", color: "var(--text-main)" }}>{title}</span>
        <span style={{ color: "var(--text-muted)", fontSize: "16px" }}>{open ? "▴" : "▾"}</span>
      </button>
      {open && <div style={{ padding: "0 16px 16px" }}>{children}</div>}
    </div>
  );
}

function Profile() {
  const navigate = useNavigate();
  const { t } = useLang();
  const { isDark } = useTheme();
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("user") || "{}"));

  const [avatarPreview, setAvatarPreview] = useState(user.avatar || null);
  const [newAvatarFile, setNewAvatarFile] = useState(null);
  const [avatarLoading, setAvatarLoading] = useState(false);

  const [docFile, setDocFile] = useState(null);
  const [docLoading, setDocLoading] = useState(false);
  const [currentDoc, setCurrentDoc] = useState(user.health_doc || null);

  const [enrollments, setEnrollments] = useState([]);
  const [coachModal, setCoachModal] = useState(null);

  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [passLoading, setPassLoading] = useState(false);
  const [passMsg, setPassMsg] = useState("");

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

  const logout = () => { localStorage.clear(); navigate("/"); };

  const refreshUser = (updated) => {
    const merged = { ...user, ...updated };
    localStorage.setItem("user", JSON.stringify(merged));
    setUser(merged);
  };

  const updateAvatar = async () => {
    if (!newAvatarFile) return;
    setAvatarLoading(true);
    const fd = new FormData();
    fd.append("avatar", newAvatarFile);
    try {
      const d = await fetch(`/api/profile/${user.id}`, { method: "PUT", body: fd }).then((r) => r.json());
      if (d.success) {
        setAvatarPreview(d.user.avatar);
        refreshUser({ avatar: d.user.avatar });
        setNewAvatarFile(null);
        alert(t("profile_photo_updated"));
      }
    } catch { alert(t("err_photo_upload")); }
    finally { setAvatarLoading(false); }
  };

  const uploadDoc = async () => {
    if (!docFile) return alert(t("err_file_none"));
    setDocLoading(true);
    const fd = new FormData();
    fd.append("file", docFile);
    try {
      const d = await fetch(`/api/student/${user.id}/healthdoc`, { method: "POST", body: fd }).then((r) => r.json());
      if (d.success) {
        setCurrentDoc(d.health_doc);
        refreshUser({ health_doc: d.health_doc });
        setDocFile(null);
        alert(t("profile_doc_uploaded"));
      } else {
        alert(d.message || t("err_server_short"));
      }
    } catch { alert(t("err_server_short")); }
    finally { setDocLoading(false); }
  };

  const cancelBooking = (id) => {
    if (!window.confirm(t("err_cancel_booking"))) return;
    fetch(`/api/bookings/${id}`, { method: "DELETE" })
      .then((r) => r.json())
      .then((d) => d.success && setEnrollments((prev) => prev.filter((x) => x.bookingId !== id)));
  };

  const updateName = async () => {
    if (!newName.trim()) return alert(t("profile_enter_name"));
    const fd = new FormData();
    fd.append("name", newName.trim());
    const d = await fetch(`/api/profile/${user.id}`, { method: "PUT", body: fd }).then((r) => r.json());
    if (d.success) { refreshUser({ name: d.user.name }); alert(t("profile_name_updated")); }
    else alert(t("err_server_short"));
  };

  const changePassword = async () => {
    setPassMsg("");
    if (!oldPass || !newPass) return setPassMsg(t("err_pass_fields"));
    if (newPass.length < 6) return setPassMsg(t("err_pass_short"));
    setPassLoading(true);
    try {
      const d = await fetch(`/api/profile/${user.id}/password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldPassword: oldPass, newPassword: newPass }),
      }).then((r) => r.json());
      if (d.success) {
        setPassMsg(t("profile_pass_updated"));
        setOldPass(""); setNewPass("");
      } else {
        setPassMsg(d.message || t("err_pass_change"));
      }
    } catch { setPassMsg(t("err_server_short")); }
    finally { setPassLoading(false); }
  };

  const statusLabel = (s) =>
    s === "approved" ? t("adm_status_approved") : s === "cancelled" ? t("adm_status_cancelled") : t("adm_status_pending");

  if (!user.id)
    return (
      <div className="mobile-wrapper">
        <div className="mobile-screen" style={{ textAlign: "center", padding: "40px 20px" }}>
          <h3>{t("profile_not_auth")}</h3>
          <button className="login-btn" onClick={() => navigate("/")}>{t("sign_in")}</button>
        </div>
      </div>
    );

  if (user.role === "coach")
    return (
      <div className="mobile-wrapper">
        <div className="mobile-screen" style={{ padding: "20px 16px 100px", overflowY: "auto" }}>
          <h2 style={{ textAlign: "center", marginBottom: "16px" }}>{t("profile_coach")}</h2>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "16px" }}>
            <img
              src={avatarPreview || AVATAR_PLACEHOLDER}
              alt="avatar"
              onError={(e) => { e.target.src = AVATAR_PLACEHOLDER; }}
              style={{ width: 90, height: 90, borderRadius: "50%", objectFit: "cover", marginBottom: "10px" }}
            />
            <label style={{
              background: "#0056b3", color: "#fff", borderRadius: "8px",
              padding: "7px 16px", fontSize: "13px", cursor: "pointer", fontWeight: 600,
            }}>
              <Camera size={13} style={{ marginRight: 5 }} />
              {t("profile_update_photo")}
              <input type="file" accept="image/*" style={{ display: "none" }}
                onChange={(e) => { setNewAvatarFile(e.target.files[0]); setAvatarPreview(URL.createObjectURL(e.target.files[0])); }} />
            </label>
            {newAvatarFile && (
              <button className="login-btn" style={{ marginTop: 8, padding: "7px 16px", fontSize: "13px" }}
                onClick={updateAvatar} disabled={avatarLoading}>
                {avatarLoading ? "..." : "💾 Сохранить фото"}
              </button>
            )}
          </div>

          <Section title={t("profile_change_name")} icon={<User size={16} />}>
            <input className="input-field" placeholder={t("profile_new_name_placeholder")}
              value={newName} onChange={(e) => setNewName(e.target.value)} />
            <button className="login-btn" style={{ marginTop: 6 }} onClick={updateName}>
              {t("profile_save_name")}
            </button>
          </Section>

          <Section title={t("profile_change_pass")} icon={<Lock size={16} />}>
            <input type="password" className="input-field" placeholder={t("field_old_pass")}
              value={oldPass} onChange={(e) => setOldPass(e.target.value)} />
            <input type="password" className="input-field" placeholder={t("field_new_pass")}
              value={newPass} onChange={(e) => setNewPass(e.target.value)} />
            {passMsg && <p style={{ fontSize: "13px", color: passMsg === t("profile_pass_updated") ? "#16a34a" : "#dc2626", margin: "4px 0" }}>{passMsg}</p>}
            <button className="login-btn" style={{ marginTop: 6 }} onClick={changePassword} disabled={passLoading}>
              {passLoading ? "..." : t("profile_update_pass")}
            </button>
          </Section>

          <TeacherPanel />

          <button className="login-btn" style={{ background: "#374151", marginTop: 15, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }} onClick={logout}>
            <LogOut size={15} /> {t("logout")}
          </button>
          <Navbar />
        </div>
      </div>
    );

  const approved = enrollments.filter((s) => s.status === "approved");
  const pending = enrollments.filter((s) => s.status === "pending");

  return (
    <div className="mobile-wrapper">
      <div className="mobile-screen" style={{ padding: "20px 16px 100px", overflowY: "auto" }}>

        <div style={{
          background: "linear-gradient(135deg, #0056b3 0%, #1a73e8 100%)",
          borderRadius: "18px", padding: "20px", marginBottom: "16px",
          display: "flex", alignItems: "center", gap: "14px", color: "#fff",
        }}>
          <div style={{ position: "relative" }}>
            <img
              src={avatarPreview || AVATAR_PLACEHOLDER}
              alt="avatar"
              onError={(e) => { e.target.src = AVATAR_PLACEHOLDER; }}
              style={{ width: 72, height: 72, borderRadius: "50%", objectFit: "cover", border: "3px solid rgba(255,255,255,0.5)" }}
            />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 800, fontSize: "16px", lineHeight: 1.2, marginBottom: "4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {user.name}
            </div>
            {user.group_name && (
              <div style={{ fontSize: "12px", opacity: 0.85 }}>
                {t("profile_group_label")}: {user.group_name}
              </div>
            )}
            <div style={{ fontSize: "11px", opacity: 0.7, marginTop: "2px" }}>
              {t("profile_student").replace("Профиль ", "")}
            </div>
          </div>
        </div>

        <Section title={t("profile_photo_section")} icon={<Camera size={16} />} defaultOpen>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "10px" }}>
            <img
              src={avatarPreview || AVATAR_PLACEHOLDER}
              alt="avatar"
              onError={(e) => { e.target.src = AVATAR_PLACEHOLDER; }}
              style={{ width: 56, height: 56, borderRadius: "50%", objectFit: "cover" }}
            />
            <label style={{
              background: "#0056b3", color: "#fff", borderRadius: "8px",
              padding: "8px 14px", fontSize: "13px", cursor: "pointer", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 5,
            }}>
              <Camera size={13} /> {t("profile_update_photo")}
              <input type="file" accept="image/*" style={{ display: "none" }}
                onChange={(e) => { setNewAvatarFile(e.target.files[0]); setAvatarPreview(URL.createObjectURL(e.target.files[0])); }} />
            </label>
          </div>
          {newAvatarFile && (
            <button className="login-btn" style={{ padding: "8px 16px", fontSize: "13px" }}
              onClick={updateAvatar} disabled={avatarLoading}>
              {avatarLoading ? "..." : `💾 ${t("profile_update_photo")}`}
            </button>
          )}
        </Section>

        <Section title={t("profile_healthdoc")} icon={<FileText size={16} />} defaultOpen>
          <div style={{
            display: "flex", alignItems: "center", gap: "8px",
            padding: "10px 12px", borderRadius: "10px",
            background: currentDoc ? "#f0fdf4" : (isDark ? "var(--bg-card)" : "#f9f9f9"),
            border: `1px solid ${currentDoc ? "#bbf7d0" : (isDark ? "var(--border-color)" : "#e5e7eb")}`,
            marginBottom: "10px",
          }}>
            {currentDoc ? (
              <>
                <CheckCircle size={18} color="#16a34a" />
                <span style={{ fontSize: "13px", color: "#15803d", fontWeight: 600 }}>{t("profile_doc_current")}</span>
                <a href={currentDoc} target="_blank" rel="noreferrer"
                  style={{ marginLeft: "auto", fontSize: "12px", color: "#0056b3" }}>
                  {t("profile_doc_replace").replace("Заменить", "").replace("Replace", "").trim()} →
                </a>
              </>
            ) : (
              <>
                <FileText size={18} color="#9ca3af" />
                <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>{t("profile_doc_none")}</span>
              </>
            )}
          </div>

          <p style={{ fontSize: "11px", color: "var(--text-muted)", margin: "0 0 8px" }}>
            📎 {t("profile_doc_format")}
          </p>

          <label style={{
            display: "inline-flex", alignItems: "center", gap: "6px",
            background: isDark ? "#1e293b" : "#f3f4f6",
            border: `1.5px dashed ${isDark ? "var(--border-color)" : "#d1d5db"}`,
            borderRadius: "10px", padding: "10px 14px", cursor: "pointer",
            fontSize: "13px", color: "var(--text-muted)", width: "100%", boxSizing: "border-box",
          }}>
            <FileText size={14} />
            {docFile ? docFile.name : t("profile_upload_doc")}
            <input type="file" accept=".png,.pdf,image/png,application/pdf" style={{ display: "none" }}
              onChange={(e) => setDocFile(e.target.files[0])} />
          </label>

          {docFile && (
            <button className="login-btn" style={{ marginTop: "8px", padding: "9px 16px", fontSize: "13px" }}
              onClick={uploadDoc} disabled={docLoading}>
              {docLoading ? "..." : `📤 ${t("profile_upload_doc")}`}
            </button>
          )}
        </Section>

        <Section title={`${t("profile_my_sections")} ${approved.length ? `(${approved.length})` : ""}`} icon={<CheckCircle size={16} />} defaultOpen>
          {approved.length ? approved.map((s) => (
            <div key={s.bookingId} onClick={() => setCoachModal(s)}
              style={{
                background: isDark ? "rgba(255,255,255,0.05)" : "#f9fafb",
                borderRadius: "10px", padding: "10px 12px", marginBottom: "8px",
                borderLeft: "4px solid #4caf50", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: "14px" }}>{s.title}</div>
                <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>📍 {s.place}</div>
                <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>👨‍🏫 {s.coach}</div>
              </div>
              <User size={16} color="#0056b3" style={{ flexShrink: 0, marginLeft: 8 }} />
            </div>
          )) : <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>{t("profile_no_sections")}</p>}
        </Section>

        {pending.length > 0 && (
          <Section title={`${t("profile_my_bookings")} (${pending.length})`} icon={<FileText size={16} />} defaultOpen>
            {pending.map((s) => (
              <div key={s.bookingId}
                style={{
                  background: isDark ? "rgba(255,255,255,0.05)" : "#fffbeb",
                  borderRadius: "10px", padding: "10px 12px", marginBottom: "8px",
                  borderLeft: "4px solid #f59e0b",
                }}>
                <div style={{ fontWeight: 600, fontSize: "14px" }}>{s.title}</div>
                <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>📍 {s.place} · 👨‍🏫 {s.coach}</div>
                <div style={{ fontSize: "12px", color: "#f59e0b", marginTop: "3px" }}>
                  {t("profile_booking_status")} {statusLabel(s.status)}
                </div>
                <button className="login-btn"
                  style={{ background: "#f44336", marginTop: 8, padding: "6px 14px", fontSize: "12px" }}
                  onClick={() => cancelBooking(s.bookingId)}>
                  {t("profile_cancel_booking")}
                </button>
              </div>
            ))}
          </Section>
        )}

        <Section title={t("profile_change_pass")} icon={<Lock size={16} />}>
          <input type="password" className="input-field" placeholder={t("field_old_pass")}
            value={oldPass} onChange={(e) => setOldPass(e.target.value)} />
          <input type="password" className="input-field" placeholder={t("field_new_pass")}
            value={newPass} onChange={(e) => setNewPass(e.target.value)} />
          {passMsg && (
            <p style={{ fontSize: "13px", margin: "4px 0", color: passMsg === t("profile_pass_updated") ? "#16a34a" : "#dc2626" }}>
              {passMsg}
            </p>
          )}
          <button className="login-btn" style={{ marginTop: 6 }} onClick={changePassword} disabled={passLoading}>
            {passLoading ? "..." : t("profile_update_pass")}
          </button>
        </Section>

        <button className="login-btn"
          style={{ background: "#374151", marginTop: 8, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
          onClick={logout}>
          <LogOut size={15} /> {t("logout")}
        </button>

        {coachModal && (
          <div onClick={() => setCoachModal(null)}
            style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div onClick={(e) => e.stopPropagation()}
              style={{
                background: isDark ? "var(--bg-card)" : "#fff", borderRadius: "18px",
                padding: "20px", width: "280px", color: "var(--text-main)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
              }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px" }}>
                {coachModal.coach_avatar ? (
                  <img src={coachModal.coach_avatar} alt="" style={{ width: 52, height: 52, borderRadius: "50%", objectFit: "cover" }} />
                ) : (
                  <div style={{ width: 52, height: 52, borderRadius: "50%", background: isDark ? "#313244" : "#e8eaf6", display: "flex", alignItems: "center", justifyContent: "center" }}>
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
                  width: "100%", background: "#0056b3", color: "#fff", border: "none",
                  borderRadius: "8px", padding: "10px", cursor: "pointer", fontWeight: 600,
                  fontSize: "14px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", marginBottom: "8px",
                }}>
                <MessageCircle size={16} /> {t("tp_write_message")}
              </button>
              <button onClick={() => setCoachModal(null)}
                style={{
                  width: "100%", background: "transparent",
                  border: `1px solid ${isDark ? "var(--border-color)" : "#ddd"}`,
                  borderRadius: "8px", padding: "7px", cursor: "pointer",
                  color: "var(--text-muted)", fontSize: "13px",
                }}>
                {t("cancel")}
              </button>
            </div>
          </div>
        )}

        <Navbar />
      </div>
    </div>
  );
}

export default Profile;
