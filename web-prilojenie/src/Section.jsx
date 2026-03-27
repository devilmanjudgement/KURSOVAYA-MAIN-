import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, User, Trash2, Send } from "lucide-react";
import { useLang } from "./contexts/LangContext";
import { useTheme } from "./contexts/ThemeContext";
import "./App.css";

const PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='70' height='70'%3E%3Crect width='70' height='70' rx='10' fill='%23e5e7eb'/%3E%3Ctext x='35' y='44' font-size='28' text-anchor='middle'%3E🏅%3C/text%3E%3C/svg%3E";

function Section() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLang();
  const { isDark } = useTheme();

  const [section, setSection] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [tab, setTab] = useState("info");
  const [posts, setPosts] = useState([]);
  const [postText, setPostText] = useState("");
  const [isApprovedMember, setIsApprovedMember] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    const parsedUser = stored ? JSON.parse(stored) : null;
    if (parsedUser) setUser(parsedUser);

    fetch("/api/sections/" + id)
      .then((r) => { if (!r.ok) throw new Error("not found"); return r.json(); })
      .then((data) => {
        setSection(data);
        setLoading(false);
        if (parsedUser?.role === "student") {
          const safe = encodeURIComponent(parsedUser.name);
          fetch(`/api/student/${safe}/enrollments`)
            .then((r) => r.json())
            .then((enrollments) => {
              const found = enrollments.find((e) => e.sectionId === id && e.status === "approved");
              if (found) setIsApprovedMember(true);
            })
            .catch(() => {});
        }
      })
      .catch(() => { setFetchError(true); setLoading(false); });
  }, [id]);

  const loadPosts = () => {
    fetch(`/api/sections/${id}/posts`)
      .then((r) => r.json())
      .then(setPosts)
      .catch(() => {});
  };

  useEffect(() => {
    if (tab === "insider") loadPosts();
  }, [tab]);

  const publishPost = () => {
    if (!postText.trim()) return;
    fetch(`/api/sections/${id}/posts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ coach_id: user.id, text: postText.trim() }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) { setPostText(""); loadPosts(); }
      })
      .catch(() => {});
  };

  const deletePost = (postId) => {
    fetch(`/api/sections/${id}/posts/${postId}?coach_id=${user.id}`, { method: "DELETE" })
      .then(() => loadPosts())
      .catch(() => {});
  };

  const handleBooking = () => {
    if (!user || user.role !== "student") {
      alert(t("err_booking_only_students"));
      return;
    }
    const today = new Date();
    const isoDate = today.getFullYear() + "-" +
      String(today.getMonth() + 1).padStart(2, "0") + "-" +
      String(today.getDate()).padStart(2, "0");

    fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sectionId: id, user: user.name, date: isoDate, docType: "auto" }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) { alert(t("section_booked")); navigate("/home"); }
        else alert(data.message || t("err_booking_fail"));
      })
      .catch(() => alert(t("err_server_unavail")));
  };

  const formatDate = (ts) => {
    if (!ts) return "";
    return new Date(ts).toLocaleString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  if (loading)
    return (
      <div className="mobile-wrapper">
        <div className="mobile-screen" style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
          <p style={{ color: "#aaa" }}>{t("loading")}</p>
        </div>
      </div>
    );

  if (fetchError || !section)
    return (
      <div className="mobile-wrapper">
        <div className="mobile-screen" style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", padding: "40px" }}>
          <div style={{ fontSize: "48px", marginBottom: "12px" }}>😕</div>
          <h3 style={{ color: "#555", marginBottom: "8px" }}>{t("err_section_not_found")}</h3>
          <p style={{ color: "#aaa", fontSize: "13px", marginBottom: "20px" }}>{t("err_section_deleted")}</p>
          <button className="login-btn" style={{ width: "auto", padding: "10px 24px" }} onClick={() => navigate(-1)}>
            {t("go_back")}
          </button>
        </div>
      </div>
    );

  const isCoach = user?.role === "coach" && Number(section.coach_id) === user?.id;
  const showInsiderTab = isCoach || isApprovedMember;

  return (
    <div className="mobile-wrapper">
      <div className="mobile-screen" style={{ paddingTop: "20px", overflowY: "auto" }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: "15px" }}>
          <button
            onClick={() => navigate(-1)}
            style={{ background: "none", border: "none", cursor: "pointer", padding: "10px" }}
          >
            <ArrowLeft size={24} color={isDark ? "#ccc" : "#333"} />
          </button>
          <h2 style={{ flex: 1, textAlign: "center" }}>{t("section_title")}</h2>
        </div>

        <div
          style={{
            background: section.color || "#0056b3",
            borderRadius: "20px",
            color: "#fff",
            padding: "20px",
            margin: "0 15px 16px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <h1 style={{ margin: 0 }}>{section.title}</h1>
            <img
              src={section.image || PLACEHOLDER}
              alt={section.title}
              onError={(e) => { e.target.src = PLACEHOLDER; }}
              style={{ width: "70px", height: "70px", borderRadius: "12px", objectFit: "cover" }}
            />
          </div>
          <div style={{ fontSize: "14px", marginTop: "10px" }}>
            <MapPin size={14} /> {section.place}
            <br />
            <User size={14} /> {t("section_coach")} {section.coach_name || t("role_no_coach")}
          </div>
        </div>

        {showInsiderTab && (
          <div style={{ display: "flex", margin: "0 15px 16px", borderRadius: "12px", overflow: "hidden", border: `1px solid ${isDark ? "var(--border-color)" : "#e0e0e0"}` }}>
            {["info", "insider"].map((tabKey) => (
              <button
                key={tabKey}
                onClick={() => setTab(tabKey)}
                style={{
                  flex: 1, padding: "10px 0", border: "none", cursor: "pointer",
                  fontWeight: 600, fontSize: "13px",
                  background: tab === tabKey ? (section.color || "#0056b3") : (isDark ? "var(--bg-card)" : "#f9f9f9"),
                  color: tab === tabKey ? "#fff" : "var(--text-muted)",
                  transition: "all 0.2s",
                }}
              >
                {tabKey === "info" ? t("section_tab_info") : t("section_tab_insider")}
                {tabKey === "insider" && posts.length > 0 && tab !== "insider" && (
                  <span style={{
                    display: "inline-block", background: "#ff5722", color: "#fff",
                    borderRadius: "10px", fontSize: "10px", padding: "0 5px", marginLeft: "5px",
                  }}>
                    {posts.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        {tab === "info" && (
          <div style={{ padding: "0 20px" }}>
            <p><b>{t("section_description")}</b> {section.description || t("section_no_desc")}</p>
            <p>
              <b>{t("section_spots")}</b> {section.students_count || 0} / {section.max_students || 20}
            </p>

            <div
              style={{
                marginTop: "15px",
                background: isDark ? "var(--bg-card)" : "#f5f5f5",
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
                  style={{ width: "60px", height: "60px", borderRadius: "50%", objectFit: "cover" }}
                  onError={(e) => { e.target.src = PLACEHOLDER; }}
                />
              ) : (
                <div style={{ width: "60px", height: "60px", borderRadius: "50%", background: "#ddd" }} />
              )}
              <div>
                <p style={{ margin: 0, fontWeight: 600 }}>{t("section_coach")}</p>
                <p style={{ margin: 0 }}>{section.coach_name || t("role_no_coach")}</p>
              </div>
            </div>

            {user?.role === "student" && (
              <button className="login-btn" style={{ margin: "20px 0" }} onClick={handleBooking}>
                {t("section_book")}
              </button>
            )}
          </div>
        )}

        {tab === "insider" && (
          <div style={{ padding: "0 15px 80px" }}>
            <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "12px" }}>
              {t("section_insider_hint")}
            </p>

            {isCoach && (
              <div style={{
                background: isDark ? "var(--bg-card)" : "#f0f4ff",
                borderRadius: "12px",
                padding: "12px",
                marginBottom: "16px",
              }}>
                <textarea
                  value={postText}
                  onChange={(e) => setPostText(e.target.value)}
                  placeholder={t("section_post_placeholder")}
                  rows={3}
                  style={{
                    width: "100%", borderRadius: "8px", border: `1px solid ${isDark ? "var(--border-color)" : "#dce6ff"}`,
                    padding: "10px", fontSize: "14px", resize: "none", boxSizing: "border-box",
                    background: isDark ? "var(--bg-input)" : "#fff", color: "var(--text-main)",
                  }}
                />
                <button
                  onClick={publishPost}
                  style={{
                    marginTop: "8px", background: section.color || "#0056b3", color: "#fff",
                    border: "none", borderRadius: "8px", padding: "9px 18px",
                    cursor: "pointer", fontWeight: 600, fontSize: "13px",
                    display: "flex", alignItems: "center", gap: "6px",
                  }}
                >
                  <Send size={14} /> {t("section_post_publish")}
                </button>
              </div>
            )}

            {posts.length === 0 ? (
              <p style={{ color: "var(--text-muted)", textAlign: "center", marginTop: "24px" }}>
                {t("section_no_posts")}
              </p>
            ) : (
              posts.map((p) => (
                <div
                  key={p.id}
                  style={{
                    background: isDark ? "var(--bg-card)" : "#fff",
                    borderRadius: "12px",
                    padding: "12px 14px",
                    marginBottom: "10px",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.07)",
                    borderLeft: `4px solid ${section.color || "#0056b3"}`,
                  }}
                >
                  <div style={{ fontSize: "14px", color: "var(--text-main)", whiteSpace: "pre-wrap", marginBottom: "8px" }}>
                    {p.text}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                      📅 {formatDate(p.created_at)}
                    </span>
                    {isCoach && (
                      <button
                        onClick={() => deletePost(p.id)}
                        style={{ background: "none", border: "none", cursor: "pointer", padding: "2px 4px" }}
                      >
                        <Trash2 size={14} color="#f44336" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Section;
