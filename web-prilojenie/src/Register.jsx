import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLang } from "./contexts/LangContext";
import "./App.css";

function Register() {
  const navigate = useNavigate();
  const { t } = useLang();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [fio, setFio] = useState({ last_name: "", first_name: "", middle_name: "" });
  const [form, setForm] = useState({ login: "", password: "", email: "" });
  const [code, setCode] = useState("");
  const [sentCode, setSentCode] = useState("");
  const [error, setError] = useState("");

  const handleFioChange = (e) => setFio((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const validateEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());

  const sendCode = async (e) => {
    e.preventDefault();
    setError("");

    if (!fio.last_name.trim()) return setError(t("reg_last_name") + " — обязательное поле");
    if (!fio.first_name.trim()) return setError(t("reg_first_name") + " — обязательное поле");
    if (!form.login.trim()) return setError(t("err_no_login"));
    if (form.login.trim().length < 3) return setError(t("err_login_short"));
    if (!form.password.trim()) return setError(t("err_no_pass"));
    if (form.password.trim().length < 6) return setError(t("err_pass_short"));
    if (!form.email.trim()) return setError(t("err_no_email"));
    if (!validateEmail(form.email)) return setError(t("err_bad_email"));
    if (!agreed) return setError(t("err_no_agree"));

    setLoading(true);
    try {
      const res = await fetch("/api/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email.trim() }),
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
        body: JSON.stringify({ email: form.email.trim(), code }),
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
          login: form.login.trim(),
          password: form.password.trim(),
          last_name: fio.last_name.trim(),
          first_name: fio.first_name.trim(),
          middle_name: fio.middle_name.trim(),
          email: form.email.trim(),
        }),
      });
      const regData = await regRes.json();
      if (regData.success) {
        setSubmitted(true);
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
    width: "100%", padding: "12px 14px", borderRadius: "12px",
    border: "1.5px solid #e5e5e5", fontSize: "14px", background: "#f9f9f9",
    marginBottom: "10px", boxSizing: "border-box", outline: "none",
  };

  if (submitted) {
    return (
      <div className="mobile-wrapper">
        <div className="mobile-screen" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "30px 24px", textAlign: "center" }}>
          <div style={{ fontSize: "56px", marginBottom: "16px" }}>✅</div>
          <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#111827", marginBottom: "8px" }}>
            {t("reg_pending_title")}
          </h2>
          <p style={{ fontSize: "14px", color: "#6b7280", lineHeight: "1.6", marginBottom: "24px" }}>
            {t("reg_pending_desc")}
          </p>
          <div style={{
            background: "#f0f6ff", border: "1.5px solid #c7d9f5",
            borderRadius: "14px", padding: "16px 20px", marginBottom: "24px", width: "100%",
          }}>
            <div style={{ fontSize: "13px", color: "#374151", marginBottom: "4px" }}>
              <b>{t("reg_last_name")}:</b> {fio.last_name}
            </div>
            <div style={{ fontSize: "13px", color: "#374151", marginBottom: "4px" }}>
              <b>{t("reg_first_name")}:</b> {fio.first_name}
            </div>
            {fio.middle_name && (
              <div style={{ fontSize: "13px", color: "#374151", marginBottom: "4px" }}>
                <b>{t("reg_middle_name")}:</b> {fio.middle_name}
              </div>
            )}
            <div style={{ fontSize: "13px", color: "#374151" }}>
              <b>{t("field_login")}:</b> {form.login}
            </div>
          </div>
          <button onClick={() => navigate("/")} className="login-btn">
            {t("reg_back_login")}
          </button>
        </div>
      </div>
    );
  }

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
                background: step >= s ? "#0056b3" : "#e5e5e5", transition: "background 0.3s",
              }} />
            ))}
          </div>
        </div>

        {step === 1 && (
          <form onSubmit={sendCode} style={{ padding: "20px" }}>
            <p style={{ fontSize: "13px", color: "#888", marginBottom: "14px", textAlign: "center" }}>
              {t("reg_step1")}
            </p>

            <div style={{
              background: "#f0f6ff", border: "1.5px solid #c7d9f5",
              borderRadius: "12px", padding: "14px 16px", marginBottom: "14px",
            }}>
              <p style={{ fontSize: "12px", fontWeight: 700, color: "#0056b3", margin: "0 0 10px" }}>
                👤 {t("reg_fio_section")}
              </p>
              <input
                style={{ ...inputStyle, marginBottom: "8px" }}
                name="last_name"
                value={fio.last_name}
                onChange={handleFioChange}
                placeholder={t("reg_last_name") + " *"}
                maxLength={60}
                autoComplete="family-name"
              />
              <input
                style={{ ...inputStyle, marginBottom: "8px" }}
                name="first_name"
                value={fio.first_name}
                onChange={handleFioChange}
                placeholder={t("reg_first_name") + " *"}
                maxLength={60}
                autoComplete="given-name"
              />
              <input
                style={{ ...inputStyle, marginBottom: 0 }}
                name="middle_name"
                value={fio.middle_name}
                onChange={handleFioChange}
                placeholder={t("reg_middle_name") + " (" + t("reg_optional") + ")"}
                maxLength={60}
                autoComplete="additional-name"
              />
            </div>

            <input style={inputStyle} name="login" value={form.login} onChange={handleChange}
              placeholder={t("field_login") + " *"} maxLength={50} autoComplete="username" />
            <input style={inputStyle} type="password" name="password" value={form.password}
              onChange={handleChange} placeholder={t("field_password") + " *"} maxLength={100} autoComplete="new-password" />
            <input style={inputStyle} type="email" name="email" value={form.email}
              onChange={handleChange} placeholder={t("field_email") + " *"} maxLength={120} autoComplete="email" />

            <label style={{
              display: "flex", alignItems: "flex-start", gap: "10px",
              fontSize: "12px", color: "#555", cursor: "pointer",
              marginTop: "6px", marginBottom: "14px", lineHeight: "1.5",
            }}>
              <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)}
                style={{ marginTop: "3px", flexShrink: 0, accentColor: "#0056b3", width: "16px", height: "16px" }} />
              <span>
                {t("reg_agree")}{" "}
                <a href="https://www.consultant.ru/document/cons_doc_LAW_61801/"
                  target="_blank" rel="noreferrer" style={{ color: "#0056b3", fontWeight: 600 }}>
                  {t("reg_law")}
                </a>
              </span>
            </label>

            <div style={{ fontSize: "12px", color: "#9ca3af", marginBottom: "10px", textAlign: "center" }}>
              {t("reg_ip_notice")}
            </div>

            {error && (
              <div style={{
                background: "#fff0f0", border: "1px solid #fcc", borderRadius: "10px",
                padding: "10px 12px", fontSize: "13px", color: "#c00", marginBottom: "10px",
              }}>
                {error}
              </div>
            )}

            <button type="submit" className="login-btn" disabled={loading} style={{ opacity: loading ? 0.7 : 1 }}>
              {loading ? t("reg_sending") : t("reg_send_code")}
            </button>
            <button type="button" onClick={() => navigate("/")}
              style={{ background: "transparent", border: "none", color: "#888", fontSize: "13px", cursor: "pointer", marginTop: "8px", width: "100%" }}>
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
              borderRadius: "14px", padding: "16px", marginBottom: "20px", textAlign: "center",
            }}>
              <div style={{ fontSize: "32px", marginBottom: "8px" }}>📧</div>
              <p style={{ fontSize: "13px", color: "#444", margin: "0 0 4px" }}>{t("reg_email_sent")}</p>
              <p style={{ fontSize: "15px", fontWeight: 700, color: "#0056b3", margin: 0 }}>{form.email}</p>
              {sentCode && (
                <div style={{
                  marginTop: "12px", background: "#fff", border: "1px dashed #c7d9f5",
                  borderRadius: "10px", padding: "10px 14px", display: "inline-block",
                }}>
                  <p style={{ fontSize: "11px", color: "#aaa", margin: "0 0 4px" }}>{t("reg_demo")}:</p>
                  <p style={{ fontSize: "26px", fontWeight: 800, color: "#0056b3", margin: 0, letterSpacing: "6px" }}>
                    {sentCode}
                  </p>
                </div>
              )}
            </div>

            <div style={{ textAlign: "center", marginBottom: "16px" }}>
              <label style={{ fontSize: "13px", color: "#666", display: "block", marginBottom: "8px" }}>
                {t("reg_enter_code")}
              </label>
              <input value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 4))}
                placeholder="• • • •" maxLength={4} inputMode="numeric"
                style={{
                  width: "140px", padding: "14px 10px", borderRadius: "14px",
                  border: "2px solid #0056b3", fontSize: "28px", letterSpacing: "12px",
                  textAlign: "center", background: "#f9f9f9", outline: "none", fontWeight: 700,
                }} />
            </div>

            {error && (
              <div style={{
                background: "#fff0f0", border: "1px solid #fcc", borderRadius: "10px",
                padding: "10px 12px", fontSize: "13px", color: "#c00", marginBottom: "10px",
              }}>
                {error}
              </div>
            )}

            <button type="submit" className="login-btn" disabled={loading || code.length !== 4}
              style={{ opacity: (loading || code.length !== 4) ? 0.6 : 1 }}>
              {loading ? t("reg_checking") : t("reg_confirm")}
            </button>
            <button type="button" onClick={() => { setStep(1); setCode(""); setError(""); }}
              style={{ background: "transparent", border: "none", color: "#888", fontSize: "13px", cursor: "pointer", marginTop: "8px", width: "100%" }}>
              {t("reg_back_data")}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default Register;
