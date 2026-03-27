import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import { useLang } from "./contexts/LangContext";
import { useTheme } from "./contexts/ThemeContext";
import "./App.css";

function Home() {
  const navigate = useNavigate();
  const { t } = useLang();
  const { isDark } = useTheme();
  const [sections, setSections] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [user, setUser] = useState(null);
  const [fetchError, setFetchError] = useState(false);
  const [homeTab, setHomeTab] = useState("all");
  const [myEnrollments, setMyEnrollments] = useState([]);
  const [enrollmentsLoaded, setEnrollmentsLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    const parsedUser = stored ? JSON.parse(stored) : { name: "Гость", role: null };
    setUser(parsedUser);

    fetch("/api/sections")
      .then((res) => res.json())
      .then(setSections)
      .catch(() => setFetchError(true));

    if (parsedUser?.role === "student" && parsedUser?.name) {
      const safe = encodeURIComponent(parsedUser.name);
      fetch(`/api/student/${safe}/enrollments`)
        .then((r) => r.json())
        .then((data) => {
          setMyEnrollments(data.filter((e) => e.status === "approved"));
          setEnrollmentsLoaded(true);
        })
        .catch(() => setEnrollmentsLoaded(true));
    } else {
      setEnrollmentsLoaded(true);
    }
  }, []);

  const PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect width='100' height='100' fill='%23e5e7eb'/%3E%3Ctext x='50%25' y='54%25' dominant-baseline='middle' text-anchor='middle' font-size='40' fill='%239ca3af'%3E🏟%3C/text%3E%3C/svg%3E";

  if (!user) return <p>{t("loading")}</p>;

  const isCoach = user.role === "coach";
  const isStudent = user.role === "student";
  const showInsiderTab = isCoach || isStudent;

  const filtered = sections.filter((s) =>
    s.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const mySections = isCoach
    ? sections.filter((s) => Number(s.coach_id) === user.id)
    : myEnrollments.map((e) => ({
        id: e.sectionId,
        title: e.title,
        place: e.place,
        image: e.image,
        coach_name: e.coach,
        coach_id: e.coach_id,
      }));

  const handleSectionClick = (sectionId, insider = false) => {
    navigate(`/section/${sectionId}${insider ? "?tab=insider" : ""}`);
  };

  const SectionCard = ({ section, insider = false }) => (
    <div
      key={section.id}
      onClick={() => handleSectionClick(section.id, insider)}
      className="sport-card"
      style={{
        position: "relative",
        overflow: "hidden",
        borderRadius: "20px",
        height: "120px",
        cursor: "pointer",
      }}
    >
      <img
        src={section.image || PLACEHOLDER}
        alt={section.title}
        onError={(e) => { e.target.src = PLACEHOLDER; }}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
      />
      <div style={{ position: "absolute", inset: 0, background: section.color || "#0056b3", opacity: 0.8 }} />
      <div
        style={{
          position: "relative", zIndex: 2, color: "#fff",
          padding: "15px", height: "100%",
          display: "flex", flexDirection: "column", justifyContent: "space-between",
        }}
      >
        <h3 style={{ margin: 0 }}>{section.title}</h3>
        {insider && (
          <span style={{
            position: "absolute", top: "10px", right: "12px",
            background: "rgba(255,255,255,0.25)", borderRadius: "8px",
            fontSize: "10px", padding: "2px 7px", fontWeight: 600,
          }}>
            📢 {t("section_tab_insider")}
          </span>
        )}
        <p style={{ margin: 0, fontSize: "12px", opacity: 0.9 }}>
          👨‍🏫 {section.coach_name || t("role_no_coach")}
        </p>
      </div>
    </div>
  );

  return (
    <div className="mobile-wrapper">
      <div className="mobile-screen" style={{ paddingTop: "60px", position: "relative" }}>
        <div
          style={{
            display: "flex", justifyContent: "space-between",
            padding: "0 20px", alignItems: "center", marginBottom: "15px",
          }}
        >
          <div>
            <h2 style={{ margin: 0 }}>{user.name}</h2>
            {user.role && (
              <p style={{ color: "#888", margin: 0, fontSize: "14px" }}>
                {user.role === "coach" ? t("role_coach") : t("role_student")}
              </p>
            )}
          </div>

          {user.avatar ? (
            <img
              src={user.avatar}
              alt="user avatar"
              style={{ width: "45px", height: "45px", borderRadius: "50%", objectFit: "cover", border: "2px solid #0056b3" }}
            />
          ) : (
            <div
              style={{
                width: "45px", height: "45px", borderRadius: "50%",
                background: "#ddd", display: "flex", alignItems: "center",
                justifyContent: "center", fontSize: "18px", color: "#777",
              }}
            >
              ?
            </div>
          )}
        </div>

        {showInsiderTab && (
          <div
            style={{
              display: "flex", margin: "0 20px 14px",
              borderRadius: "12px", overflow: "hidden",
              border: `1px solid ${isDark ? "var(--border-color)" : "#e0e0e0"}`,
            }}
          >
            {["all", "insider"].map((tabKey) => (
              <button
                key={tabKey}
                onClick={() => setHomeTab(tabKey)}
                style={{
                  flex: 1, padding: "10px 0", border: "none", cursor: "pointer",
                  fontWeight: 600, fontSize: "13px",
                  background: homeTab === tabKey ? "#0056b3" : (isDark ? "var(--bg-card)" : "#f9f9f9"),
                  color: homeTab === tabKey ? "#fff" : "var(--text-muted)",
                  transition: "all 0.2s",
                }}
              >
                {tabKey === "all" ? "Все секции" : "Мои секции"}
                {tabKey === "insider" && mySections.length > 0 && homeTab !== "insider" && (
                  <span style={{
                    display: "inline-block", background: "#ff5722", color: "#fff",
                    borderRadius: "10px", fontSize: "10px", padding: "0 5px", marginLeft: "5px",
                  }}>
                    {mySections.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        {homeTab === "all" && (
          <>
            <div style={{ padding: "0 20px" }}>
              <input
                placeholder={t("search_placeholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field"
              />
            </div>

            {fetchError && (
              <div style={{ margin: "0 20px 10px", background: "#fff0f0", borderRadius: "10px",
                padding: "10px 14px", fontSize: "13px", color: "#c00", border: "1px solid #fcc" }}>
                ⚠️ {t("err_sections_load")}
              </div>
            )}

            <div style={{ flex: 1, overflowY: "auto" }}>
              <div className="sections-grid" style={{ padding: "14px 14px 0" }}>
                {!fetchError && filtered.length === 0 && sections.length === 0 && (
                  <div style={{ gridColumn: "1/-1", textAlign: "center", color: "#aaa", marginTop: "20px" }}>
                    <div style={{ fontSize: "40px" }}>🏟️</div>
                    <p>{t("sections_empty")}</p>
                  </div>
                )}
                {filtered.length === 0 && sections.length > 0 && (
                  <div style={{ gridColumn: "1/-1", textAlign: "center", color: "#aaa" }}>
                    {t("sections_not_found")}
                  </div>
                )}
                {filtered.map((section) => (
                  <SectionCard key={section.id} section={section} insider={false} />
                ))}
              </div>
            </div>
          </>
        )}

        {homeTab === "insider" && (
          <div style={{ flex: 1, overflowY: "auto" }}>
            {mySections.length === 0 ? (
              <div style={{ textAlign: "center", color: "var(--text-muted)", padding: "40px 20px" }}>
                <div style={{ fontSize: "48px", marginBottom: "12px" }}>🔒</div>
                <p style={{ fontSize: "15px", fontWeight: 600, marginBottom: "6px" }}>
                  {isCoach ? "У вас пока нет секций" : "Вы пока не зачислены ни в одну секцию"}
                </p>
                <p style={{ fontSize: "13px" }}>
                  {isCoach ? "Здесь ваши секции — нажмите, чтобы открыть ленту объявлений" : "Здесь будут секции, в которых вы состоите"}
                </p>
              </div>
            ) : (
              <>
                <p style={{ fontSize: "12px", color: "var(--text-muted)", padding: "0 20px", marginBottom: "4px" }}>
                  {isCoach ? "Нажмите на секцию, чтобы открыть ленту объявлений" : "Ваши секции — нажмите, чтобы читать объявления"}
                </p>
                <div className="sections-grid" style={{ padding: "10px 14px 0" }}>
                  {mySections.map((section) => (
                    <SectionCard key={section.id} section={section} insider={true} />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        <Navbar />
      </div>
    </div>
  );
}

export default Home;
