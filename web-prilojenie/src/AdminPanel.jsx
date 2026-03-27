import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLang } from "./contexts/LangContext";

function AdminPanel() {
  const navigate = useNavigate();
  const { t } = useLang();

  const TABS = [t("adm_tab_stats"), t("adm_tab_users"), t("adm_tab_sections"), t("adm_tab_bookings"), t("adm_tab_logs"), t("adm_registry")];

  const [tab, setTab] = useState(0);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [sections, setSections] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [logs, setLogs] = useState([]);
  const [registry, setRegistry] = useState([]);
  const [regSearch, setRegSearch] = useState("");
  const [regUploading, setRegUploading] = useState(false);
  const [regUploadMsg, setRegUploadMsg] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    if (!user.id || user.role !== "admin") {
      navigate("/");
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, []);

  const adminHeaders = { "x-admin-id": String(user.id) };

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [s, u, sec, b, l, reg] = await Promise.all([
        fetch("/api/admin/stats", { headers: adminHeaders }).then((r) => r.json()),
        fetch("/api/admin/users", { headers: adminHeaders }).then((r) => r.json()),
        fetch("/api/sections").then((r) => r.json()),
        fetch("/api/admin/bookings", { headers: adminHeaders }).then((r) => r.json()),
        fetch("/api/admin/logs", { headers: adminHeaders }).then((r) => r.json()),
        fetch("/api/admin/registry", { headers: adminHeaders }).then((r) => r.json()),
      ]);
      setStats(s);
      setUsers(u);
      setSections(sec);
      setBookings(b);
      setLogs(l);
      setRegistry(Array.isArray(reg) ? reg : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchRegistry = async () => {
    const reg = await fetch("/api/admin/registry", { headers: adminHeaders }).then((r) => r.json());
    setRegistry(Array.isArray(reg) ? reg : []);
  };

  const deleteRegistryEntry = async (studentId) => {
    if (!confirm(`Удалить запись ${studentId} из реестра?`)) return;
    await fetch(`/api/admin/registry/${encodeURIComponent(studentId)}`, { method: "DELETE", headers: adminHeaders });
    fetchRegistry();
  };

  const handleRegistryUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setRegUploading(true);
    setRegUploadMsg("");
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch("/api/admin/registry/upload", { method: "POST", headers: adminHeaders, body: fd });
      const data = await res.json();
      if (data.success) {
        setRegUploadMsg(`✅ ${t("adm_reg_upload_ok")}: ${data.imported}`);
        fetchRegistry();
      } else {
        setRegUploadMsg(`❌ ${data.message || t("adm_reg_upload_err")}`);
      }
    } catch {
      setRegUploadMsg(`❌ ${t("adm_reg_upload_err")}`);
    } finally {
      setRegUploading(false);
      e.target.value = "";
    }
  };

  const deleteUser = async (id) => {
    if (!confirm(t("adm_delete_user"))) return;
    await fetch(`/api/admin/users/${id}`, { method: "DELETE", headers: adminHeaders });
    setUsers((u) => u.filter((x) => x.id !== id));
  };

  const deleteSection = async (id) => {
    if (!confirm(t("adm_delete_section"))) return;
    await fetch(`/api/sections/${id}`, { method: "DELETE" });
    setSections((s) => s.filter((x) => x.id !== id));
  };

  const deleteBooking = async (id) => {
    if (!confirm(t("adm_delete_booking"))) return;
    await fetch(`/api/admin/bookings/${id}`, { method: "DELETE", headers: adminHeaders });
    setBookings((b) => b.filter((x) => x.bookingId !== id));
  };

  const logout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  const badge = (role) => {
    const map = { admin: ["#7c3aed", "#ede9fe"], coach: ["#0056b3", "#e8f0fe"], student: ["#15803d", "#dcfce7"] };
    const labels = { admin: t("adm_role_admin"), coach: t("adm_role_coach"), student: t("adm_role_student") };
    const [bg, light] = map[role] || ["#666", "#eee"];
    return (
      <span style={{ background: light, color: bg, borderRadius: "6px", padding: "2px 8px", fontSize: "11px", fontWeight: 700 }}>
        {labels[role] || role}
      </span>
    );
  };

  const statusColor = { pending: "#f59e0b", approved: "#16a34a", cancelled: "#dc2626" };
  const statusLabel = () => ({
    pending: t("adm_status_pending"),
    approved: t("adm_status_approved"),
    cancelled: t("adm_status_cancelled"),
  });

  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.login?.toLowerCase().includes(search.toLowerCase())
  );

  const card = (content, style = {}) => (
    <div style={{
      background: "#fff", borderRadius: "12px", padding: "16px",
      boxShadow: "0 1px 4px rgba(0,0,0,0.08)", marginBottom: "10px", ...style,
    }}>
      {content}
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9", fontFamily: "Inter, system-ui, sans-serif" }}>
      <div style={{
        background: "#0056b3", color: "#fff", padding: "16px 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "24px" }}>🏛️</span>
          <div>
            <div style={{ fontWeight: 800, fontSize: "18px", letterSpacing: "0.3px" }}>КГУ СПОРТ</div>
            <div style={{ fontSize: "12px", opacity: 0.8 }}>{t("adm_panel")}</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <span style={{ fontSize: "13px", opacity: 0.85 }}>👤 {user.name || t("adm_role_admin")}</span>
          <button onClick={logout} style={{
            background: "rgba(255,255,255,0.2)", border: "none", color: "#fff",
            borderRadius: "8px", padding: "6px 14px", cursor: "pointer", fontSize: "13px",
          }}>
            {t("logout")}
          </button>
        </div>
      </div>

      <div style={{
        background: "#fff", display: "flex", gap: "2px", padding: "0 24px",
        borderBottom: "1.5px solid #e5e7eb", overflowX: "auto",
      }}>
        {TABS.map((tabLabel, i) => (
          <button key={i} onClick={() => setTab(i)} style={{
            background: "transparent", border: "none", padding: "14px 18px",
            cursor: "pointer", fontSize: "14px", fontWeight: tab === i ? 700 : 400,
            color: tab === i ? "#0056b3" : "#6b7280",
            borderBottom: tab === i ? "2.5px solid #0056b3" : "2.5px solid transparent",
            whiteSpace: "nowrap",
          }}>
            {tabLabel}
          </button>
        ))}
      </div>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px 24px" }}>
        {loading && (
          <div style={{ textAlign: "center", padding: "40px", color: "#6b7280" }}>{t("loading")}</div>
        )}

        {!loading && tab === 0 && stats && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "14px", marginBottom: "20px" }}>
              {[
                { label: t("adm_total_users"), value: stats.totalUsers, icon: "👥", color: "#0056b3" },
                { label: t("adm_students"), value: stats.students, icon: "🎓", color: "#15803d" },
                { label: t("adm_coaches"), value: stats.coaches, icon: "🏅", color: "#7c3aed" },
                { label: t("adm_sections"), value: stats.sections, icon: "🏟️", color: "#d97706" },
                { label: t("adm_bookings"), value: stats.bookings, icon: "📋", color: "#0891b2" },
                { label: t("adm_messages"), value: stats.messages, icon: "💬", color: "#e11d48" },
              ].map((s) => (
                <div key={s.label} style={{
                  background: "#fff", borderRadius: "12px", padding: "18px",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
                  borderLeft: `4px solid ${s.color}`,
                }}>
                  <div style={{ fontSize: "26px", marginBottom: "6px" }}>{s.icon}</div>
                  <div style={{ fontSize: "28px", fontWeight: 800, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "2px" }}>{s.label}</div>
                </div>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              {card(
                <>
                  <div style={{ fontWeight: 700, marginBottom: "12px", color: "#374151" }}>{t("adm_booking_statuses")}</div>
                  {[
                    { label: t("adm_pending"), val: stats.pending, color: "#f59e0b" },
                    { label: t("adm_approved"), val: stats.approved, color: "#16a34a" },
                    { label: t("adm_cancelled"), val: stats.cancelled, color: "#dc2626" },
                  ].map((r) => (
                    <div key={r.label} style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                      <span style={{ fontSize: "13px", color: "#6b7280" }}>{r.label}</span>
                      <span style={{ fontWeight: 700, color: r.color }}>{r.val}</span>
                    </div>
                  ))}
                </>
              )}
              {card(
                <>
                  <div style={{ fontWeight: 700, marginBottom: "12px", color: "#374151" }}>{t("adm_schedule")}</div>
                  <div style={{ fontSize: "13px", color: "#6b7280" }}>{t("adm_schedule_entries")}</div>
                  <div style={{ fontSize: "32px", fontWeight: 800, color: "#0056b3", marginTop: "6px" }}>{stats.scheduleEntries}</div>
                </>
              )}
            </div>
          </>
        )}

        {!loading && tab === 1 && (
          <>
            <div style={{ display: "flex", gap: "12px", marginBottom: "16px", alignItems: "center" }}>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("adm_search")}
                style={{
                  flex: 1, padding: "10px 14px", borderRadius: "10px",
                  border: "1.5px solid #e5e7eb", fontSize: "14px", outline: "none",
                }}
              />
              <span style={{ fontSize: "13px", color: "#6b7280" }}>{filteredUsers.length} {t("adm_people")}</span>
            </div>

            <div style={{ background: "#fff", borderRadius: "12px", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f8fafc" }}>
                    {[t("adm_col_id"), t("adm_col_name"), t("adm_col_login"), t("adm_col_role"), t("adm_col_group"), ""].map((h) => (
                      <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: "12px",
                        fontWeight: 700, color: "#6b7280", textTransform: "uppercase",
                        borderBottom: "1px solid #e5e7eb" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr key={u.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                      <td style={{ padding: "12px 16px", fontSize: "13px", color: "#9ca3af" }}>{u.id}</td>
                      <td style={{ padding: "12px 16px", fontSize: "14px", fontWeight: 600, color: "#111827" }}>
                        {u.avatar && <img src={u.avatar} alt="" style={{ width: 24, height: 24, borderRadius: "50%", marginRight: 8, verticalAlign: "middle" }} />}
                        {u.name}
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: "13px", color: "#6b7280" }}>{u.login}</td>
                      <td style={{ padding: "12px 16px" }}>{badge(u.role)}</td>
                      <td style={{ padding: "12px 16px", fontSize: "13px", color: "#6b7280" }}>{u.group_name || "—"}</td>
                      <td style={{ padding: "12px 16px" }}>
                        {u.role !== "admin" && (
                          <button onClick={() => deleteUser(u.id)} style={{
                            background: "#fff0f0", border: "1px solid #fca5a5", color: "#dc2626",
                            borderRadius: "6px", padding: "4px 10px", fontSize: "12px", cursor: "pointer",
                          }}>
                            {t("delete")}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {!loading && tab === 2 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "14px" }}>
            {sections.map((s) => (
              <div key={s.id} style={{
                background: "#fff", borderRadius: "12px", overflow: "hidden",
                boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
                borderTop: `4px solid ${s.color || "#0056b3"}`,
              }}>
                {s.image && <img src={s.image} alt={s.title} style={{ width: "100%", height: "120px", objectFit: "cover" }} />}
                <div style={{ padding: "14px" }}>
                  <div style={{ fontWeight: 700, fontSize: "15px", color: "#111827", marginBottom: "4px" }}>{s.title}</div>
                  <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>📍 {s.place || "—"}</div>
                  <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "10px" }}>🏅 {s.coach_name || "—"}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "12px", color: "#6b7280" }}>
                      👥 {s.students_count || 0} / {s.max_students}
                    </span>
                    <button onClick={() => deleteSection(s.id)} style={{
                      background: "#fff0f0", border: "1px solid #fca5a5", color: "#dc2626",
                      borderRadius: "6px", padding: "4px 10px", fontSize: "12px", cursor: "pointer",
                    }}>
                      {t("delete")}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && tab === 3 && (
          <div style={{ background: "#fff", borderRadius: "12px", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  {["#", t("adm_col_student"), t("adm_col_section"), t("adm_col_date"), t("adm_col_status"), ""].map((h) => (
                    <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: "12px",
                      fontWeight: 700, color: "#6b7280", textTransform: "uppercase",
                      borderBottom: "1px solid #e5e7eb" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.bookingId} style={{ borderBottom: "1px solid #f3f4f6" }}>
                    <td style={{ padding: "12px 16px", fontSize: "13px", color: "#9ca3af" }}>{b.bookingId}</td>
                    <td style={{ padding: "12px 16px", fontSize: "14px", color: "#111827" }}>{b.user}</td>
                    <td style={{ padding: "12px 16px", fontSize: "13px", color: "#6b7280" }}>{b.sectionTitle || b.sectionId}</td>
                    <td style={{ padding: "12px 16px", fontSize: "13px", color: "#6b7280" }}>{b.date || "—"}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{
                        background: statusColor[b.status] + "22",
                        color: statusColor[b.status],
                        borderRadius: "6px", padding: "2px 8px", fontSize: "12px", fontWeight: 700,
                      }}>
                        {statusLabel()[b.status] || b.status}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <button onClick={() => deleteBooking(b.bookingId)} style={{
                        background: "#fff0f0", border: "1px solid #fca5a5", color: "#dc2626",
                        borderRadius: "6px", padding: "4px 10px", fontSize: "12px", cursor: "pointer",
                      }}>
                        {t("delete")}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && tab === 4 && (
          <div style={{ background: "#111827", borderRadius: "12px", padding: "16px", boxShadow: "0 1px 4px rgba(0,0,0,0.2)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <span style={{ color: "#9ca3af", fontSize: "13px", fontWeight: 700 }}>{t("adm_security_log")}</span>
              <button onClick={fetchAll} style={{
                background: "#1f2937", border: "1px solid #374151", color: "#9ca3af",
                borderRadius: "6px", padding: "4px 10px", fontSize: "12px", cursor: "pointer",
              }}>
                {t("adm_refresh")}
              </button>
            </div>
            <div style={{ fontFamily: "monospace", fontSize: "12px", maxHeight: "500px", overflowY: "auto" }}>
              {logs.length === 0 ? (
                <span style={{ color: "#6b7280" }}>{t("adm_no_logs")}</span>
              ) : logs.map((l, i) => (
                <div key={i} style={{
                  padding: "5px 8px", borderRadius: "6px", marginBottom: "3px",
                  background: l.level === "WARN" ? "#7c2d1222" : l.level === "ERROR" ? "#7f1d1d33" : "#1f2937",
                  color: l.level === "WARN" ? "#fbbf24" : l.level === "ERROR" ? "#f87171" : "#6ee7b7",
                }}>
                  <span style={{ color: "#6b7280", marginRight: "10px" }}>{l.ts}</span>
                  <span style={{ marginRight: "8px", fontWeight: 700 }}>[{l.level}]</span>
                  {l.ip && <span style={{ color: "#818cf8", marginRight: "8px" }}>{l.ip}</span>}
                  {l.message}
                </div>
              ))}
            </div>
          </div>
        )}
        {!loading && tab === 5 && (
          <>
            <div style={{
              background: "#fff", borderRadius: "12px", padding: "20px",
              boxShadow: "0 1px 4px rgba(0,0,0,0.07)", marginBottom: "16px",
            }}>
              <div style={{ fontWeight: 700, fontSize: "15px", color: "#111827", marginBottom: "6px" }}>
                {t("adm_reg_upload_title")}
              </div>
              <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "14px" }}>
                📋 {t("adm_reg_upload_hint")}
              </div>
              <label style={{
                display: "inline-block", background: "#0056b3", color: "#fff",
                borderRadius: "8px", padding: "9px 20px", fontSize: "13px", fontWeight: 600,
                cursor: regUploading ? "not-allowed" : "pointer", opacity: regUploading ? 0.7 : 1,
              }}>
                {regUploading ? "⏳ Загружаем..." : `📤 ${t("adm_reg_upload_btn")}`}
                <input
                  type="file" accept=".csv,text/csv"
                  style={{ display: "none" }}
                  onChange={handleRegistryUpload}
                  disabled={regUploading}
                />
              </label>
              {regUploadMsg && (
                <div style={{
                  marginTop: "10px", fontSize: "13px",
                  color: regUploadMsg.startsWith("✅") ? "#15803d" : "#dc2626",
                }}>
                  {regUploadMsg}
                </div>
              )}
              <div style={{ marginTop: "12px", fontSize: "13px", color: "#6b7280" }}>
                {t("adm_reg_count")}: <b style={{ color: "#111827" }}>{registry.length}</b>
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px", marginBottom: "12px" }}>
              <input
                value={regSearch}
                onChange={(e) => setRegSearch(e.target.value)}
                placeholder={t("adm_search")}
                style={{
                  flex: 1, padding: "10px 14px", borderRadius: "10px",
                  border: "1.5px solid #e5e7eb", fontSize: "14px", outline: "none",
                }}
              />
            </div>

            {registry.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px", color: "#6b7280" }}>
                {t("adm_reg_empty")}
              </div>
            ) : (
              <div style={{ background: "#fff", borderRadius: "12px", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#f8fafc" }}>
                      {[t("adm_reg_col_id"), t("adm_reg_col_name"), t("adm_reg_col_group"), t("adm_reg_col_login"), ""].map((h) => (
                        <th key={h} style={{
                          padding: "12px 16px", textAlign: "left", fontSize: "12px",
                          fontWeight: 700, color: "#6b7280", textTransform: "uppercase",
                          borderBottom: "1px solid #e5e7eb",
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {registry
                      .filter((r) => {
                        const q = regSearch.toLowerCase();
                        return !q || r.student_id?.toLowerCase().includes(q) ||
                          r.last_name?.toLowerCase().includes(q) ||
                          r.first_name?.toLowerCase().includes(q) ||
                          r.group_name?.toLowerCase().includes(q);
                      })
                      .map((r) => {
                        const fio = [r.last_name, r.first_name, r.middle_name].filter(Boolean).join(" ");
                        return (
                          <tr key={r.student_id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                            <td style={{ padding: "10px 16px", fontSize: "13px", color: "#374151", fontWeight: 600 }}>
                              {r.student_id}
                            </td>
                            <td style={{ padding: "10px 16px", fontSize: "13px", color: "#111827" }}>{fio}</td>
                            <td style={{ padding: "10px 16px", fontSize: "13px", color: "#6b7280" }}>{r.group_name || "—"}</td>
                            <td style={{ padding: "10px 16px", fontSize: "12px" }}>
                              {r.login ? (
                                <span style={{ background: "#dcfce7", color: "#15803d", borderRadius: "6px", padding: "2px 8px", fontWeight: 600 }}>
                                  {t("adm_reg_registered")}
                                </span>
                              ) : (
                                <span style={{ background: "#f3f4f6", color: "#9ca3af", borderRadius: "6px", padding: "2px 8px" }}>
                                  {t("adm_reg_not_registered")}
                                </span>
                              )}
                            </td>
                            <td style={{ padding: "10px 16px" }}>
                              <button
                                onClick={() => deleteRegistryEntry(r.student_id)}
                                style={{
                                  background: "#fff0f0", border: "1px solid #fca5a5", color: "#dc2626",
                                  borderRadius: "6px", padding: "4px 10px", fontSize: "12px", cursor: "pointer",
                                }}
                              >
                                {t("delete")}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
}

export default AdminPanel;
