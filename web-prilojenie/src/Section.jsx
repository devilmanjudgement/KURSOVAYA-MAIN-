import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, User } from "lucide-react";
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

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));

    fetch("/api/sections/" + id)
      .then((r) => { if (!r.ok) throw new Error("not found"); return r.json(); })
      .then((data) => { setSection(data); setLoading(false); })
      .catch(() => { setFetchError(true); setLoading(false); });
  }, [id]);

  const handleBooking = () => {
    if (!user || user.role !== "student") {
      alert(t("err_booking_only_students"));
      return;
    }

    const payload = {
      sectionId: id,
      user: user.name,
      date: new Date().toLocaleDateString(),
      docType: "auto",
    };

    fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          alert(t("section_booked"));
          navigate("/home");
        } else alert(t("err_booking_fail"));
      })
      .catch(() => alert(t("err_server_unavail")));
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

  return (
    <div className="mobile-wrapper">
      <div className="mobile-screen" style={{ paddingTop: "20px" }}>
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
            margin: "0 15px 20px",
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
        </div>

        {user?.role === "student" && (
          <button className="login-btn" style={{ margin: "20px" }} onClick={handleBooking}>
            {t("section_book")}
          </button>
        )}
      </div>
    </div>
  );
}

export default Section;
