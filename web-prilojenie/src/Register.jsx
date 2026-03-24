import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLang } from "./contexts/LangContext";
import "./App.css";

const CONSENT_LINK = "https://www.consultant.ru/document/cons_doc_LAW_61801/";

function Register() {
  const navigate = useNavigate();
  const { t } = useLang();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const [form, setForm] = useState({
    name: "",
    login: "",
    password: "",
    group: "",
    phone: "",
  });
  const [code, setCode] = useState("");
  const [sentCode, setSentCode] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const validatePhone = (p) => /^\+?\d{10,15}$/.test(p.replace(/[\s\-()]/g, ""));

  const sendCode = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.name.trim()) return setError(t("err_no_name"));
    if (!form.login.trim()) return setError(t("err_no_login"));
    if (form.login.trim().length < 3) return setError(t("err_login_short"));
    if (!form.password.trim()) return setError(t("err_no_pass"));
    if (form.password.trim().length < 6) return setError(t("err_pass_short"));
    if (!form.phone.trim()) return setError(t("err_no_phone"));
    if (!validatePhone(form.phone)) return setError(t("err_bad_phone"));
    if (!agreed) return setError(t("err_no_agree"));

    setLoading(true);
    try {
      const res = await fetch("/api/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: form.phone }),
      });
      const data = await res.json();
      if (data.success) {
        setSentCode(data._devCode || "");
        setStep(2);
      } else {
        setError(data.message || t("err_send_code"));
      }
    } catch {
      setError(t("err_server"));
    } finally {
      setLoading(false);
    }
  };

  const verifyAndRegister = async (e) => {
    e.preventDefault();
    setError("");
    if (!code.trim()) return setError(t("err_code_empty"));

    setLoading(true);
    try {
      const verifyRes = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: form.phone, code }),
      });
      const verifyData = await verifyRes.json();
      if (!verifyData.success) {
        setLoading(false);
        return setError(t("err_code_wrong"));
      }

      const regRes = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          login: form.login.trim(),
          password: form.password.trim(),
          group_name: form.group.trim() || null,
          role: "student",
        }),
      });
      const regData = await regRes.json();
      if (regData.success) {
        alert(t("reg_success"));
        navigate("/");
      } else {
        setError(regData.message || t("err_reg"));
      }
    } catch {
      setError(t("err_server"));
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "12px 14px",
    borderRadius: "12px",
    border: "1.5px solid #e5e5e5",
    fontSize: "14px",
    background: "#f9f9f9",
    marginBottom: "10px",
    boxSizing: "border-box",
    outline: "none",
  };

  return (
    <div className="mobile-wrapper">
      <div className="mobile-screen" style={{ overflowY: "auto" }}>
        <div className="header" style={{ paddingTop: "36px", textAlign: "center" }}>
          <h1 className="app-title" style={{ fontSize: "26px" }}>{t("reg_title")}</h1>
          <p className="app-subtitle">{t("reg_subtitle")}</p>

          <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginTop: "12px" }}>
            {[1, 2].map((s) => (
              <div key={s} style={{
                width: "32px", height: "4px", borderRadius: "2px",
                background: step >= s ? "#0056b3" : "#e5e5e5",
                transition: "background 0.3s",
              }} />
            ))}
          </div>
        </div>

        {step === 1 && (
          <form onSubmit={sendCode} style={{ padding: "20px" }}>
            <p style={{ fontSize: "13px", color: "#888", marginBottom: "14px", textAlign: "center" }}>
              {t("reg_step1")}
            </p>

            <input
              style={inputStyle}
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder={t("field_name")}
              maxLength={100}
            />
            <input
              style={inputStyle}
              name="login"
              value={form.login}
              onChange={handleChange}
              placeholder={t("field_login")}
              maxLength={50}
            />
            <input
              style={inputStyle}
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder={t("field_password")}
              maxLength={100}
            />
            <input
              style={inputStyle}
              name="group"
              value={form.group}
              onChange={handleChange}
              placeholder={t("field_group")}
              maxLength={30}
            />

            <div style={{ position: "relative", marginBottom: "10px" }}>
              <span style={{
                position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)",
                fontSize: "14px", color: "#888",
              }}>🇰🇬</span>
              <input
                style={{ ...inputStyle, paddingLeft: "40px", marginBottom: 0 }}
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder={t("field_phone")}
                maxLength={20}
                type="tel"
              />
            </div>

            <label style={{
              display: "flex", alignItems: "flex-start", gap: "10px",
              fontSize: "12px", color: "#555", cursor: "pointer", marginTop: "6px", marginBottom: "14px",
            }}>
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                style={{ marginTop: "2px", flexShrink: 0, accentColor: "#0056b3" }}
              />
              <span>
                {t("reg_agree")}{" "}
                <a href={CONSENT_LINK} target="_blank" rel="noreferrer" style={{ color: "#0056b3" }}>
                  {t("reg_law")}
                </a>
              </span>
            </label>

            {error && (
              <div style={{ background: "#fff0f0", border: "1px solid #fcc", borderRadius: "10px",
                padding: "10px 12px", fontSize: "13px", color: "#c00", marginBottom: "10px" }}>
                {error}
              </div>
            )}

            <button type="submit" className="login-btn" disabled={loading}
              style={{ opacity: loading ? 0.7 : 1 }}>
              {loading ? t("reg_sending") : t("reg_send_code")}
            </button>

            <button type="button" onClick={() => navigate("/")}
              style={{ background: "transparent", border: "none", color: "#888",
                fontSize: "13px", cursor: "pointer", marginTop: "8px", width: "100%" }}>
              {t("reg_back_login")}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={verifyAndRegister} style={{ padding: "20px" }}>
            <p style={{ fontSize: "13px", color: "#888", marginBottom: "14px", textAlign: "center" }}>
              {t("reg_step2")}
            </p>

            <div style={{
              background: "#f0f6ff", border: "1.5px solid #c7d9f5",
              borderRadius: "14px", padding: "16px", marginBottom: "16px", textAlign: "center",
            }}>
              <div style={{ fontSize: "28px", marginBottom: "6px" }}>📱</div>
              <p style={{ fontSize: "13px", color: "#444", margin: 0 }}>
                {t("reg_sms_sent")}
              </p>
              <p style={{ fontSize: "15px", fontWeight: 700, color: "#0056b3", margin: "4px 0 0" }}>
                {form.phone}
              </p>
              {sentCode && (
                <p style={{ fontSize: "11px", color: "#aaa", marginTop: "8px", margin: "8px 0 0" }}>
                  ({t("reg_demo")} <strong style={{ color: "#555" }}>{sentCode}</strong>)
                </p>
              )}
            </div>

            <div style={{ textAlign: "center", marginBottom: "16px" }}>
              <label style={{ fontSize: "13px", color: "#666", display: "block", marginBottom: "8px" }}>
                {t("reg_enter_code")}
              </label>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 4))}
                placeholder="• • • •"
                maxLength={4}
                style={{
                  width: "140px",
                  padding: "14px 10px",
                  borderRadius: "14px",
                  border: "2px solid #0056b3",
                  fontSize: "28px",
                  letterSpacing: "12px",
                  textAlign: "center",
                  background: "#f9f9f9",
                  outline: "none",
                  fontWeight: 700,
                }}
              />
            </div>

            {error && (
              <div style={{ background: "#fff0f0", border: "1px solid #fcc", borderRadius: "10px",
                padding: "10px 12px", fontSize: "13px", color: "#c00", marginBottom: "10px" }}>
                {error}
              </div>
            )}

            <button type="submit" className="login-btn" disabled={loading || code.length !== 4}
              style={{ opacity: (loading || code.length !== 4) ? 0.6 : 1 }}>
              {loading ? t("reg_checking") : t("reg_confirm")}
            </button>

            <button type="button" onClick={() => { setStep(1); setCode(""); setError(""); }}
              style={{ background: "transparent", border: "none", color: "#888",
                fontSize: "13px", cursor: "pointer", marginTop: "8px", width: "100%" }}>
              {t("reg_back_data")}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default Register;
