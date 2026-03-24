import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Send, ArrowLeft, Smile } from "lucide-react";
import Navbar from "./Navbar";
import { useLang } from "./contexts/LangContext";
import { useTheme } from "./contexts/ThemeContext";
import "./App.css";

const EMOJIS = [
  "😀","😂","😊","😍","🥺","😎","😢","😤","🤔","👍",
  "👎","❤️","🔥","🎉","✅","⭐","💪","🙏","🏃","⚽",
  "🏋️","🤸","🏊","🎯","📚","⏰","📍","🤝","👏","💬",
];

function Chat() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLang();
  const { isDark } = useTheme();

  const [contacts, setContacts] = useState([]);
  const [previews, setPreviews] = useState({});
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const messagesEndRef = useRef(null);
  const pollRef = useRef(null);
  const previewPollRef = useRef(null);

  const loadPreviews = () => {
    fetch(`/api/messages/previews/${user.id}`)
      .then((r) => r.json())
      .then((data) => {
        const map = {};
        data.forEach((p) => { map[p.otherId] = p; });
        setPreviews(map);
      })
      .catch(() => {});
  };

  useEffect(() => {
    if (!user.id) { navigate("/"); return; }
    const endpoint = user.role === "coach" ? "/api/users/students" : "/api/users/coaches";
    fetch(endpoint)
      .then((r) => r.json())
      .then((list) => {
        setContacts(list);
        const targetId = location.state?.contactId;
        if (targetId) {
          const found = list.find((c) => c.id === targetId);
          if (found) setSelected(found);
        }
      })
      .catch(() => setContacts([]));
    loadPreviews();
    previewPollRef.current = setInterval(loadPreviews, 4000);
    return () => clearInterval(previewPollRef.current);
  }, []);

  useEffect(() => {
    if (!selected) return;
    loadMessages();
    pollRef.current = setInterval(loadMessages, 3000);
    return () => clearInterval(pollRef.current);
  }, [selected]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadMessages = () => {
    if (!selected) return;
    fetch(`/api/messages/${user.id}/${selected.id}`)
      .then((r) => r.json())
      .then((msgs) => {
        setMessages(msgs);
        fetch(`/api/messages/read/${user.id}/${selected.id}`, { method: "PUT" })
          .then(() => loadPreviews())
          .catch(() => {});
      })
      .catch(() => {});
  };

  const sendMessage = () => {
    const trimmed = text.trim();
    if (!trimmed || !selected) return;
    fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sender_id: user.id, receiver_id: selected.id, text: trimmed }),
    })
      .then((r) => r.json())
      .then(() => {
        setText("");
        setShowEmoji(false);
        loadMessages();
      })
      .catch(() => {});
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (ts) => {
    if (!ts) return "";
    const d = new Date(ts);
    return d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
  };

  if (!user.id) return null;

  return (
    <div className="mobile-wrapper">
      <div className="mobile-screen" style={{ position: "relative" }}>
        {!selected ? (
          <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
            <div style={{
              background: "linear-gradient(135deg, #0056b3, #0077cc)",
              padding: "24px 20px 18px",
              color: "#fff",
            }}>
              <h2 style={{ margin: 0, fontSize: "20px", fontWeight: 800 }}>
                💬 {user.role === "coach" ? t("chat_students") : t("chat_coaches")}
              </h2>
              <p style={{ margin: "4px 0 0", fontSize: "12px", opacity: 0.8 }}>
                {contacts.length} {t("chat_contacts")}
              </p>
            </div>

            <div style={{ flex: 1, overflowY: "auto", paddingBottom: "80px" }}>
              {contacts.length === 0 ? (
                <p style={{ color: "#aaa", textAlign: "center", marginTop: "40px" }}>
                  {t("chat_no_contacts")}
                </p>
              ) : (
                contacts.map((c) => {
                  const prev = previews[c.id];
                  const hasUnread = prev && prev.unread > 0;
                  return (
                  <div
                    key={c.id}
                    onClick={() => setSelected(c)}
                    style={{
                      display: "flex", alignItems: "center", gap: "12px",
                      padding: "14px 20px",
                      borderBottom: `1px solid ${isDark ? "var(--border-color)" : "#f0f0f0"}`,
                      cursor: "pointer",
                      background: hasUnread
                        ? (isDark ? "rgba(0,119,204,0.18)" : "#edf4ff")
                        : "transparent",
                      transition: "background 0.2s",
                    }}
                  >
                    <div style={{ position: "relative", flexShrink: 0 }}>
                      {c.avatar ? (
                        <img src={c.avatar} alt={c.name}
                          style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover" }} />
                      ) : (
                        <div style={{
                          width: 44, height: 44, borderRadius: "50%",
                          background: "linear-gradient(135deg, #0056b3, #0077cc)",
                          color: "#fff", display: "flex", alignItems: "center",
                          justifyContent: "center", fontWeight: "bold", fontSize: "18px",
                        }}>
                          {c.name?.[0]?.toUpperCase()}
                        </div>
                      )}
                      {hasUnread && (
                        <div style={{
                          position: "absolute", top: -2, right: -2,
                          background: "#e74c3c", color: "#fff",
                          borderRadius: "50%", minWidth: 18, height: 18,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: "10px", fontWeight: 700, padding: "0 3px",
                          boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
                        }}>
                          {prev.unread > 9 ? "9+" : prev.unread}
                        </div>
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: hasUnread ? 700 : 600, fontSize: "15px" }}>{c.name}</div>
                      {prev?.lastText ? (
                        <div style={{
                          fontSize: "12px",
                          color: hasUnread ? (isDark ? "#90b8e8" : "#0056b3") : "#888",
                          fontWeight: hasUnread ? 600 : 400,
                          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                          maxWidth: "180px",
                        }}>
                          {prev.lastText}
                        </div>
                      ) : (
                        <div style={{ fontSize: "12px", color: "#888" }}>
                          {user.role === "coach" ? t("chat_student_label") : t("chat_coach_label")}
                        </div>
                      )}
                    </div>
                  </div>
                  );
                })
              )}
            </div>
            <Navbar />
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
            <div style={{
              display: "flex", alignItems: "center", gap: "10px",
              padding: "12px 16px",
              borderBottom: `1px solid ${isDark ? "var(--border-color)" : "#eee"}`,
              background: isDark ? "var(--bg-card)" : "#fff",
            }}>
              <button
                onClick={() => { setSelected(null); setMessages([]); setShowEmoji(false); }}
                style={{ background: "transparent", border: "none", cursor: "pointer", padding: 0 }}
              >
                <ArrowLeft size={22} color="#333" />
              </button>
              {selected.avatar ? (
                <img src={selected.avatar} alt={selected.name}
                  style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover" }} />
              ) : (
                <div style={{
                  width: 36, height: 36, borderRadius: "50%",
                  background: "linear-gradient(135deg, #0056b3, #0077cc)",
                  color: "#fff", display: "flex", alignItems: "center",
                  justifyContent: "center", fontWeight: "bold",
                }}>
                  {selected.name?.[0]?.toUpperCase()}
                </div>
              )}
              <div style={{ fontWeight: 600, fontSize: "15px" }}>{selected.name}</div>
            </div>

            <div style={{
              flex: 1, overflowY: "auto", padding: "12px 14px",
              background: isDark ? "var(--bg-body)" : "#f0f4f8",
              display: "flex", flexDirection: "column", gap: "8px",
            }}>
              {messages.length === 0 ? (
                <p style={{ color: "#bbb", textAlign: "center", marginTop: "30px" }}>{t("chat_start")}</p>
              ) : (
                messages.map((m) => {
                  const isMe = m.sender_id === user.id;
                  const senderName = isMe ? (t("chat_you") || "Вы") : selected.name;
                  return (
                    <div key={m.id} style={{ display: "flex", flexDirection: "column", alignItems: isMe ? "flex-end" : "flex-start" }}>
                      <span style={{
                        fontSize: "11px",
                        fontWeight: 600,
                        color: isMe ? "#0077cc" : "#e07b00",
                        marginBottom: "2px",
                        paddingLeft: isMe ? 0 : "4px",
                        paddingRight: isMe ? "4px" : 0,
                      }}>
                        {senderName}
                      </span>
                      <div style={{
                        background: isMe ? "linear-gradient(135deg, #0056b3, #0077cc)" : (isDark ? "var(--bg-card)" : "#fff"),
                        color: isMe ? "#fff" : "var(--text-main)",
                        borderRadius: isMe ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                        padding: "9px 13px",
                        maxWidth: "75%",
                        boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
                        wordBreak: "break-word",
                        fontSize: "14px",
                      }}>
                        {m.text}
                      </div>
                      <span style={{ fontSize: "10px", color: "#aaa", marginTop: "2px" }}>
                        {formatTime(m.created_at)}
                      </span>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {showEmoji && (
              <div style={{
                display: "flex", flexWrap: "wrap", gap: "2px",
                padding: "8px 10px",
                background: isDark ? "var(--bg-card)" : "#fff",
                borderTop: `1px solid ${isDark ? "var(--border-color)" : "#eee"}`,
              }}>
                {EMOJIS.map((e) => (
                  <button key={e} onClick={() => setText((p) => p + e)}
                    style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", padding: "3px", lineHeight: 1 }}>
                    {e}
                  </button>
                ))}
              </div>
            )}

            <div style={{
              display: "flex", alignItems: "center", gap: "8px",
              padding: "10px 12px",
              background: isDark ? "var(--bg-card)" : "#fff",
              borderTop: `1px solid ${isDark ? "var(--border-color)" : "#eee"}`,
            }}>
              <button onClick={() => setShowEmoji(!showEmoji)}
                style={{ background: "none", border: "none", cursor: "pointer", padding: "4px", color: showEmoji ? "#0056b3" : "var(--text-muted)" }}>
                <Smile size={22} />
              </button>
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKey}
                placeholder={t("field_message")}
                style={{
                  flex: 1,
                  border: `1px solid ${isDark ? "var(--border-color)" : "#e0e0e0"}`,
                  borderRadius: "20px",
                  padding: "8px 14px", fontSize: "14px", outline: "none",
                  background: isDark ? "var(--bg-input)" : "#f5f5f5",
                  color: "var(--text-main)",
                }}
              />
              <button onClick={sendMessage}
                style={{
                  background: "linear-gradient(135deg, #0056b3, #0077cc)",
                  border: "none", borderRadius: "50%", width: "38px", height: "38px",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", flexShrink: 0,
                }}>
                <Send size={16} color="#fff" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Chat;
