import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Send, ArrowLeft, Smile } from "lucide-react";
import Navbar from "./Navbar";
import "./App.css";

const EMOJIS = [
  "😀","😂","😊","😍","🥺","😎","😢","😤","🤔","👍",
  "👎","❤️","🔥","🎉","✅","⭐","💪","🙏","🏃","⚽",
  "🏋️","🤸","🏊","🎯","📚","⏰","📍","🤝","👏","💬",
];

function Chat() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const navigate = useNavigate();

  const [contacts, setContacts] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const messagesEndRef = useRef(null);
  const pollRef = useRef(null);

  useEffect(() => {
    if (!user.id) { navigate("/"); return; }
    const endpoint = user.role === "coach" ? "/api/users/students" : "/api/users/coaches";
    fetch(endpoint)
      .then((r) => r.json())
      .then(setContacts)
      .catch(() => setContacts([]));
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
        fetch(`/api/messages/read/${user.id}/${selected.id}`, { method: "PUT" }).catch(() => {});
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
                💬 {user.role === "coach" ? "Студенты" : "Преподаватели"}
              </h2>
              <p style={{ margin: "4px 0 0", fontSize: "12px", opacity: 0.8 }}>
                {contacts.length} контактов
              </p>
            </div>

            <div style={{ flex: 1, overflowY: "auto", paddingBottom: "80px" }}>
              {contacts.length === 0 ? (
                <p style={{ color: "#aaa", textAlign: "center", marginTop: "40px" }}>
                  Нет доступных контактов
                </p>
              ) : (
                contacts.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => setSelected(c)}
                    style={{
                      display: "flex", alignItems: "center", gap: "12px",
                      padding: "14px 20px", borderBottom: "1px solid #f0f0f0", cursor: "pointer",
                    }}
                  >
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
                    <div>
                      <div style={{ fontWeight: 600, fontSize: "15px" }}>{c.name}</div>
                      <div style={{ fontSize: "12px", color: "#888" }}>
                        {user.role === "coach" ? "Студент" : "Преподаватель"}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <Navbar />
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
            <div style={{
              display: "flex", alignItems: "center", gap: "10px",
              padding: "12px 16px", borderBottom: "1px solid #eee", background: "#fff",
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
              background: "#f0f4f8", display: "flex", flexDirection: "column", gap: "8px",
            }}>
              {messages.length === 0 ? (
                <p style={{ color: "#bbb", textAlign: "center", marginTop: "30px" }}>Начните переписку</p>
              ) : (
                messages.map((m) => {
                  const isMe = m.sender_id === user.id;
                  return (
                    <div key={m.id} style={{ display: "flex", flexDirection: "column", alignItems: isMe ? "flex-end" : "flex-start" }}>
                      <div style={{
                        background: isMe ? "linear-gradient(135deg, #0056b3, #0077cc)" : "#fff",
                        color: isMe ? "#fff" : "#222",
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
                padding: "8px 10px", background: "#fff", borderTop: "1px solid #eee",
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
              padding: "10px 12px", background: "#fff", borderTop: "1px solid #eee",
            }}>
              <button onClick={() => setShowEmoji(!showEmoji)}
                style={{ background: "none", border: "none", cursor: "pointer", padding: "4px", color: showEmoji ? "#0056b3" : "#888" }}>
                <Smile size={22} />
              </button>
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Введите сообщение..."
                style={{
                  flex: 1, border: "1px solid #e0e0e0", borderRadius: "20px",
                  padding: "8px 14px", fontSize: "14px", outline: "none", background: "#f5f5f5",
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
