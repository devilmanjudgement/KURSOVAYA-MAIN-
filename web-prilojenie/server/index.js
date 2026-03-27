/**
 * КГУ СПОРТ — сервер
 * Защита: параметризованные запросы, rate-limiting, security headers, input sanitization
 */

const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const Database = require("better-sqlite3");

const db = new Database("kgusport.db");
const app = express();
const PORT = 3001;
const BASE_URL = `http://localhost:${PORT}`;
const IMG_DIR = path.join(__dirname, "images");
if (!fs.existsSync(IMG_DIR)) fs.mkdirSync(IMG_DIR, { recursive: true });

/* =========================================================
   БЕЗОПАСНОСТЬ: Security Headers
========================================================= */
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
});

/* =========================================================
   БЕЗОПАСНОСТЬ: Rate Limiting (in-memory)
========================================================= */
const rateLimitMap = new Map();

function rateLimit(windowMs = 60_000, max = 30) {
  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress || "unknown";
    const key = `${ip}:${req.path}`;
    const now = Date.now();
    const entry = rateLimitMap.get(key) || { count: 0, start: now };

    if (now - entry.start > windowMs) {
      entry.count = 1;
      entry.start = now;
    } else {
      entry.count++;
    }
    rateLimitMap.set(key, entry);

    if (entry.count > max) {
      secLog("WARN", ip, `Rate limit exceeded: ${req.path}`);
      return res.status(429).json({ success: false, message: "Слишком много запросов. Попробуйте позже." });
    }
    next();
  };
}

setInterval(() => {
  const now = Date.now();
  for (const [key, val] of rateLimitMap.entries()) {
    if (now - val.start > 120_000) rateLimitMap.delete(key);
  }
}, 60_000);

/* =========================================================
   SSE клиенты (уведомления реального времени)
========================================================= */
const sseClients = new Map();

/* =========================================================
   БЕЗОПАСНОСТЬ: Журнал безопасности
========================================================= */
const securityLogs = [];
function secLog(level, ip, message) {
  const entry = { ts: new Date().toISOString(), level, ip, message };
  securityLogs.unshift(entry);
  if (securityLogs.length > 200) securityLogs.pop();
  if (level !== "INFO") console.log(`[${level}] ${ip} — ${message}`);
}

/* =========================================================
   БЕЗОПАСНОСТЬ: Санитизация ввода
========================================================= */
function sanitize(str) {
  if (typeof str !== "string") return str;
  return str.replace(/[<>'"`;\\]/g, "").trim().slice(0, 500);
}

/* =========================================================
   Middleware
========================================================= */
app.use(cors());
app.use(express.json({ limit: "2mb" }));
app.use("/images", express.static(IMG_DIR));

/* ---------- Multer ---------- */
const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, IMG_DIR),
  filename: (_, file, cb) => {
    const unique = Date.now() + "_" + Math.round(Math.random() * 1e5);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "_" + unique + ext);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_, file, cb) => {
    const ok = /image\/(jpeg|png|gif|webp)/.test(file.mimetype) || /application\/pdf/.test(file.mimetype);
    cb(null, ok);
  },
});

const csvUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

function parseRegistryCSV(text) {
  const clean = text.replace(/^\uFEFF/, "");
  const lines = clean.split(/\r?\n/).filter((l) => l.trim());
  if (!lines.length) return [];
  const sep = lines[0].includes(";") ? ";" : ",";
  const strip = (s) => s.trim().replace(/^["']|["']$/g, "");
  const first = strip(lines[0].split(sep)[0]);
  const startRow = /^\d/.test(first) ? 0 : 1;
  const results = [];
  for (let i = startRow; i < lines.length; i++) {
    const cols = lines[i].split(sep).map(strip);
    if (cols[0]) {
      results.push({
        student_id: cols[0],
        first_name: cols[1] || "",
        last_name: cols[2] || "",
        middle_name: cols[3] || "",
        group_name: cols[4] || "",
      });
    }
  }
  return results;
}

/* =========================================================
   Таблицы
========================================================= */
db.prepare(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  login TEXT UNIQUE,
  password TEXT,
  role TEXT,
  group_name TEXT,
  avatar TEXT,
  health_doc TEXT
)
`).run();

db.prepare(`
CREATE TABLE IF NOT EXISTS sections (
  id TEXT PRIMARY KEY,
  title TEXT,
  coach_id INTEGER,
  place TEXT,
  color TEXT,
  image TEXT,
  description TEXT,
  max_students INTEGER DEFAULT 20,
  FOREIGN KEY (coach_id) REFERENCES users(id)
)
`).run();

db.prepare(`
CREATE TABLE IF NOT EXISTS bookings (
  bookingId INTEGER PRIMARY KEY AUTOINCREMENT,
  sectionId TEXT,
  user TEXT,
  date TEXT,
  docType TEXT,
  status TEXT DEFAULT 'pending'
)
`).run();

db.prepare(`
CREATE TABLE IF NOT EXISTS schedule (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  day_of_week TEXT,
  time TEXT,
  section_id TEXT,
  coach_id INTEGER,
  FOREIGN KEY (section_id) REFERENCES sections(id)
)
`).run();

db.prepare(`
CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sender_id INTEGER,
  receiver_id INTEGER,
  text TEXT,
  read INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sender_id) REFERENCES users(id),
  FOREIGN KEY (receiver_id) REFERENCES users(id)
)
`).run();

try { db.prepare("ALTER TABLE messages ADD COLUMN read INTEGER DEFAULT 0").run(); } catch (_) {}

db.prepare(`
CREATE TABLE IF NOT EXISTS attendance (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_name TEXT,
  section_id TEXT,
  section_title TEXT,
  coach_id INTEGER,
  date TEXT,
  present INTEGER DEFAULT 1
)
`).run();

db.prepare(`
CREATE TABLE IF NOT EXISTS student_registry (
  student_id TEXT PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  middle_name TEXT DEFAULT '',
  group_name TEXT DEFAULT ''
)
`).run();

try { db.prepare("ALTER TABLE users ADD COLUMN student_id TEXT").run(); } catch (_) {}

db.prepare(`
CREATE TABLE IF NOT EXISTS pending_registrations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  login TEXT,
  password TEXT,
  last_name TEXT NOT NULL,
  first_name TEXT NOT NULL,
  middle_name TEXT DEFAULT '',
  email TEXT,
  ip TEXT,
  status TEXT DEFAULT 'pending',
  rejection_reason TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
`).run();

db.prepare(`
CREATE TABLE IF NOT EXISTS section_posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  section_id TEXT,
  coach_id INTEGER,
  text TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (section_id) REFERENCES sections(id)
)
`).run();

/* =========================================================
   Авторизация / Регистрация
========================================================= */

const regIpMap = new Map();
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of regIpMap.entries()) {
    if (now - v.start > 24 * 60 * 60 * 1000) regIpMap.delete(k);
  }
}, 60 * 60 * 1000);

function checkRegIpLimit(ip) {
  const now = Date.now();
  const entry = regIpMap.get(ip) || { count: 0, start: now };
  if (now - entry.start > 24 * 60 * 60 * 1000) {
    entry.count = 1;
    entry.start = now;
  } else {
    entry.count++;
  }
  regIpMap.set(ip, entry);
  return entry.count <= 3;
}

app.post("/api/login", rateLimit(60_000, 10), (req, res) => {
  const login = sanitize(req.body.login || "");
  const password = sanitize(req.body.password || "");
  if (!login || !password) return res.status(400).json({ success: false, message: "Не все поля заполнены" });

  const ip = req.ip || "unknown";
  const user = db.prepare("SELECT * FROM users WHERE login=? AND password=?").get(login, password);
  if (!user) {
    secLog("WARN", ip, `Failed login attempt: ${login}`);
    return res.status(401).json({ success: false, message: "Неверный логин или пароль" });
  }
  secLog("INFO", ip, `Login OK: ${login} (${user.role})`);
  const { password: _pw, ...safeUser } = user;
  res.json({ success: true, user: safeUser });
});

app.post("/api/register", rateLimit(60_000, 10), (req, res) => {
  const ip = req.ip || "unknown";

  if (!checkRegIpLimit(ip)) {
    secLog("WARN", ip, "Registration IP limit exceeded (3 per 24h)");
    return res.status(429).json({ success: false, message: "Вы уже отправили 3 заявки на регистрацию за 24 часа. Попробуйте завтра." });
  }

  const login = sanitize(req.body.login || "");
  const password = sanitize(req.body.password || "");
  const last_name = sanitize(req.body.last_name || "");
  const first_name = sanitize(req.body.first_name || "");
  const middle_name = sanitize(req.body.middle_name || "");
  const email = sanitize(req.body.email || "").toLowerCase().trim();

  if (!login || !password || !last_name || !first_name) {
    return res.json({ success: false, message: "Заполните все обязательные поля (Фамилия, Имя, логин, пароль)" });
  }
  if (login.length < 3) return res.json({ success: false, message: "Логин — минимум 3 символа" });
  if (password.length < 6) return res.json({ success: false, message: "Пароль — минимум 6 символов" });

  const dupUser = db.prepare("SELECT id FROM users WHERE login=?").get(login);
  if (dupUser) return res.json({ success: false, message: "Такой логин уже занят" });

  const dupPending = db.prepare("SELECT id FROM pending_registrations WHERE login=? AND status='pending'").get(login);
  if (dupPending) return res.json({ success: false, message: "Заявка с таким логином уже ожидает рассмотрения" });

  db.prepare(
    "INSERT INTO pending_registrations(login,password,last_name,first_name,middle_name,email,ip) VALUES(?,?,?,?,?,?,?)"
  ).run(login, password, last_name, first_name, middle_name, email, ip);

  secLog("INFO", ip, `New pending registration: ${login} (${last_name} ${first_name})`);
  res.json({ success: true, pending: true });
});

/* =========================================================
   Email-верификация (заглушка)
========================================================= */
const emailCodes = new Map();

app.post("/api/auth/send-code", rateLimit(60_000, 5), (req, res) => {
  const email = sanitize(req.body.email || "").toLowerCase().trim();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.json({ success: false, message: "Некорректный адрес электронной почты" });
  }

  const code = String(Math.floor(1000 + Math.random() * 9000));
  emailCodes.set(email, { code, expires: Date.now() + 10 * 60_000 });

  secLog("INFO", req.ip, `Email code sent to ${email.split("@")[0].slice(0, 3)}***@${email.split("@")[1]}`);
  console.log(`📧 Код подтверждения для ${email}: ${code}`);

  res.json({ success: true, _devCode: code });
});

app.post("/api/auth/verify-code", rateLimit(60_000, 10), (req, res) => {
  const email = sanitize(req.body.email || "").toLowerCase().trim();
  const code = sanitize(req.body.code || "");
  const entry = emailCodes.get(email);

  if (!entry) {
    secLog("WARN", req.ip, `Code verify failed: no code for ${email}`);
    return res.json({ success: false, message: "Код не найден. Запросите новый" });
  }
  if (Date.now() > entry.expires) {
    emailCodes.delete(email);
    return res.json({ success: false, message: "Код истёк. Запросите новый" });
  }
  if (entry.code !== code) {
    secLog("WARN", req.ip, `Wrong code for ${email}`);
    return res.json({ success: false, message: "Неверный код" });
  }

  emailCodes.delete(email);
  res.json({ success: true });
});

/* =========================================================
   Профиль и документы
========================================================= */
app.put("/api/profile/:id", upload.single("avatar"), (req, res) => {
  const name = sanitize(req.body.name || "");
  const group_name = sanitize(req.body.group_name || "");
  const avatar = req.file ? `/images/${req.file.filename}` : null;
  db.prepare(`UPDATE users SET name=COALESCE(?,name), group_name=COALESCE(?,group_name), avatar=COALESCE(?,avatar) WHERE id=?`)
    .run(name || null, group_name || null, avatar, req.params.id);
  const raw = db.prepare("SELECT * FROM users WHERE id=?").get(req.params.id);
  const { password: _pw, ...user } = raw;
  res.json({ success: true, user });
});

app.put("/api/profile/:id/password", (req, res) => {
  const oldPassword = sanitize(req.body.oldPassword || "");
  const newPassword = sanitize(req.body.newPassword || "");
  const user = db.prepare("SELECT * FROM users WHERE id=?").get(req.params.id);
  if (!user) return res.json({ success: false, message: "Пользователь не найден" });
  if (user.password !== oldPassword) return res.json({ success: false, message: "Неверный старый пароль" });
  if (newPassword.length < 6) return res.json({ success: false, message: "Новый пароль — минимум 6 символов" });
  db.prepare("UPDATE users SET password=? WHERE id=?").run(newPassword, req.params.id);
  res.json({ success: true });
});

const healthDocUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_, file, cb) => {
    const ok = file.mimetype === "image/png" || file.mimetype === "application/pdf";
    cb(null, ok);
  },
});

app.post("/api/student/:id/healthdoc", healthDocUpload.single("file"), (req, res) => {
  if (!req.file) return res.json({ success: false, message: "Принимаются только PNG и PDF" });
  const url = `/images/${req.file.filename}`;
  db.prepare("UPDATE users SET health_doc=? WHERE id=?").run(url, req.params.id);
  res.json({ success: true, health_doc: url });
});

/* =========================================================
   Секции
========================================================= */
app.get("/api/sections", (_, res) => {
  const rows = db.prepare(`
    SELECT s.*, u.name AS coach_name, u.avatar AS coach_avatar,
      (SELECT COUNT(*) FROM bookings b WHERE b.sectionId=s.id AND b.status='approved') AS students_count
    FROM sections s LEFT JOIN users u ON u.id=s.coach_id`).all();
  res.json(rows);
});

app.get("/api/sections/:id", (req, res) => {
  const s = db.prepare(`
    SELECT s.*, u.name AS coach_name, u.avatar AS coach_avatar
    FROM sections s LEFT JOIN users u ON u.id=s.coach_id WHERE s.id=?`).get(req.params.id);
  if (!s) return res.status(404).json({ success: false });
  s.students_count = db.prepare("SELECT COUNT(*) AS c FROM bookings WHERE sectionId=? AND status='approved'").get(req.params.id).c;
  res.json(s);
});

app.get("/api/sections/:id/enrolled", (req, res) => {
  const rows = db.prepare(`
    SELECT u.id, u.name, u.group_name, u.health_doc, u.avatar, MAX(b.status) AS status
    FROM bookings b
    JOIN users u ON u.name = b.user
    WHERE b.sectionId=? AND b.status!='cancelled'
    GROUP BY u.id, u.name, u.group_name, u.health_doc, u.avatar`).all(req.params.id);
  res.json(rows);
});

app.post("/api/sections", upload.single("image"), (req, res) => {
  const title = sanitize(req.body.title || "");
  const place = sanitize(req.body.place || "");
  const color = sanitize(req.body.color || "#0056b3");
  const description = sanitize(req.body.description || "");
  const coach_id = Number(req.body.coach_id);
  const max_students = Number(req.body.max_students) || 20;
  if (!title || !coach_id) return res.json({ success: false, message: "Заполните обязательные поля" });
  const id = "sec_" + Date.now();
  const image = req.file ? `/images/${req.file.filename}` : null;
  db.prepare("INSERT INTO sections(id,title,coach_id,place,color,image,description,max_students) VALUES (?,?,?,?,?,?,?,?)")
    .run(id, title, coach_id, place, color, image, description, max_students);
  res.json({ success: true, id });
});

app.put("/api/sections/:id", upload.single("image"), (req, res) => {
  const title = sanitize(req.body.title || "");
  const place = sanitize(req.body.place || "");
  const color = sanitize(req.body.color || "");
  const description = sanitize(req.body.description || "");
  const max_students = req.body.max_students ? Number(req.body.max_students) : null;
  const image = req.file ? `/images/${req.file.filename}` : null;
  db.prepare(`UPDATE sections SET
    title=COALESCE(?,title), place=COALESCE(?,place), color=COALESCE(?,color),
    description=COALESCE(?,description), max_students=COALESCE(?,max_students), image=COALESCE(?,image)
    WHERE id=?`).run(title || null, place || null, color || null, description || null, max_students, image, req.params.id);
  res.json({ success: true });
});

app.delete("/api/sections/:id", (req, res) => {
  try {
    const deleteSection = db.transaction(() => {
      db.prepare("DELETE FROM bookings WHERE sectionId=?").run(req.params.id);
      db.prepare("DELETE FROM schedule WHERE section_id=?").run(req.params.id);
      db.prepare("DELETE FROM attendance WHERE section_id=?").run(req.params.id);
      db.prepare("DELETE FROM sections WHERE id=?").run(req.params.id);
    });
    deleteSection();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: "Не удалось удалить секцию" });
  }
});

/* =========================================================
   Объявления секций («Для своих»)
========================================================= */
app.get("/api/sections/:id/posts", (req, res) => {
  const rows = db.prepare(
    "SELECT * FROM section_posts WHERE section_id=? ORDER BY created_at DESC"
  ).all(req.params.id);
  res.json(rows);
});

app.post("/api/sections/:id/posts", (req, res) => {
  const text = sanitize(req.body.text || "");
  const coach_id = Number(req.body.coach_id);
  if (!text) return res.json({ success: false, message: "Введите текст" });
  const section = db.prepare("SELECT coach_id FROM sections WHERE id=?").get(req.params.id);
  if (!section || section.coach_id !== coach_id) return res.json({ success: false, message: "Нет доступа" });
  db.prepare("INSERT INTO section_posts(section_id, coach_id, text) VALUES(?,?,?)").run(req.params.id, coach_id, text);
  res.json({ success: true });
});

app.delete("/api/sections/:id/posts/:postId", (req, res) => {
  const coach_id = Number(req.query.coach_id);
  const section = db.prepare("SELECT coach_id FROM sections WHERE id=?").get(req.params.id);
  if (!section || section.coach_id !== coach_id) return res.json({ success: false });
  db.prepare("DELETE FROM section_posts WHERE id=? AND section_id=?").run(req.params.postId, req.params.id);
  res.json({ success: true });
});

/* =========================================================
   Бронирования
========================================================= */
app.post("/api/bookings", (req, res) => {
  const sectionId = sanitize(req.body.sectionId || "");
  const user = sanitize(req.body.user || "");
  const date = sanitize(req.body.date || "");
  const docType = sanitize(req.body.docType || "") || "auto";

  if (!sectionId || !user || !date)
    return res.json({ success: false, message: "Не все поля заполнены" });

  const section = db.prepare("SELECT id, max_students FROM sections WHERE id=?").get(sectionId);
  if (!section) return res.json({ success: false, message: "Секция не найдена" });

  const existing = db.prepare(
    "SELECT bookingId FROM bookings WHERE sectionId=? AND user=? AND status!='cancelled'"
  ).get(sectionId, user);
  if (existing) return res.json({ success: false, message: "Вы уже записаны в эту секцию" });

  const filled = db.prepare(
    "SELECT COUNT(*) AS c FROM bookings WHERE sectionId=? AND status='approved'"
  ).get(sectionId).c;
  if (filled >= section.max_students)
    return res.json({ success: false, message: "В секции нет свободных мест" });

  const result = db.prepare("INSERT INTO bookings(sectionId,user,date,docType,status) VALUES (?,?,?,?,?)")
    .run(sectionId, user, date, docType, "pending");
  res.json({ success: true, id: result.lastInsertRowid });
});

app.put("/api/bookings/:id/status", (req, res) => {
  const status = sanitize(req.body.status || "");
  if (!["pending", "approved", "cancelled"].includes(status))
    return res.json({ success: false, message: "Недопустимый статус" });

  const booking = db.prepare(`
    SELECT b.user, s.title AS sectionTitle
    FROM bookings b JOIN sections s ON s.id=b.sectionId
    WHERE b.bookingId=?`).get(req.params.id);

  db.prepare("UPDATE bookings SET status=? WHERE bookingId=?").run(status, req.params.id);

  if (booking) {
    const student = db.prepare("SELECT id FROM users WHERE name=?").get(booking.user);
    if (student) {
      const client = sseClients.get(student.id);
      if (client) {
        const payload = JSON.stringify({ type: "booking_update", status, sectionTitle: booking.sectionTitle });
        client.write(`data: ${payload}\n\n`);
      }
    }
  }

  res.json({ success: true });
});

app.delete("/api/bookings/:id", (req, res) => {
  db.prepare("UPDATE bookings SET status='cancelled' WHERE bookingId=?").run(req.params.id);
  res.json({ success: true });
});

app.get("/api/teacher/:id/bookings", (req, res) => {
  const id = Number(req.params.id);
  const sections = db.prepare("SELECT id FROM sections WHERE coach_id=?").all(id);
  if (!sections.length) return res.json([]);
  const ids = sections.map((s) => s.id);
  const rows = db.prepare(`
    SELECT b.*, s.title, s.place,
           u.id AS student_id, u.group_name, u.health_doc, u.avatar
    FROM bookings b
    JOIN sections s ON s.id=b.sectionId
    LEFT JOIN users u ON u.name=b.user
    WHERE b.sectionId IN (${ids.map(() => "?").join(",")}) AND b.status='pending'
    ORDER BY b.bookingId DESC`).all(...ids);

  res.json(rows);
});

app.get("/api/student/:name/enrollments", (req, res) => {
  const rows = db.prepare(`
    SELECT b.bookingId, b.sectionId, b.status, s.title, s.place, s.image, u.name AS coach, u.id AS coach_id, u.avatar AS coach_avatar
    FROM bookings b
    JOIN sections s ON s.id=b.sectionId
    JOIN users u ON u.id=s.coach_id
    WHERE b.user=? AND b.status!='cancelled'
    ORDER BY b.bookingId DESC`).all(req.params.name);
  res.json(rows);
});

/* =========================================================
   Посещаемость
========================================================= */
app.get("/api/attendance/student/:name", (req, res) => {
  const rows = db.prepare(`
    SELECT a.*, s.title AS section_title
    FROM attendance a
    LEFT JOIN sections s ON s.id=a.section_id
    WHERE a.student_name=?
    ORDER BY a.date DESC`).all(req.params.name);
  res.json(rows);
});

app.get("/api/attendance/coach/:id", (req, res) => {
  const rows = db.prepare(`
    SELECT a.*
    FROM attendance a
    WHERE a.coach_id=?
    ORDER BY a.date DESC`).all(Number(req.params.id));
  res.json(rows);
});

app.post("/api/attendance", (req, res) => {
  const { student_name, section_id, section_title, coach_id, date, present } = req.body;
  if (!student_name || !section_id || !date) return res.json({ success: false, message: "Не все поля заполнены" });
  const result = db.prepare(
    "INSERT INTO attendance(student_name,section_id,section_title,coach_id,date,present) VALUES (?,?,?,?,?,?)"
  ).run(
    sanitize(student_name), sanitize(section_id),
    sanitize(section_title || ""), Number(coach_id) || null,
    sanitize(date), present ? 1 : 0
  );
  res.json({ success: true, id: result.lastInsertRowid });
});

app.delete("/api/attendance/:id", (req, res) => {
  db.prepare("DELETE FROM attendance WHERE id=?").run(req.params.id);
  res.json({ success: true });
});

/* =========================================================
   Расписание
========================================================= */
app.get("/api/schedule", (_, res) => {
  const rows = db.prepare(`
    SELECT sc.*, s.title, s.place, s.color, s.coach_id, u.name AS coach_name
    FROM schedule sc
    JOIN sections s ON s.id=sc.section_id
    LEFT JOIN users u ON u.id=s.coach_id
    ORDER BY sc.id`).all();
  res.json(rows);
});

app.post("/api/schedule", (req, res) => {
  const day_of_week = sanitize(req.body.day_of_week || "");
  const time = sanitize(req.body.time || "");
  const section_id = sanitize(req.body.section_id || "");
  if (!day_of_week || !time || !section_id) return res.json({ success: false, message: "Заполните все поля" });
  const sec = db.prepare("SELECT coach_id FROM sections WHERE id=?").get(section_id);
  const result = db.prepare("INSERT INTO schedule(day_of_week,time,section_id,coach_id) VALUES (?,?,?,?)")
    .run(day_of_week, time, section_id, sec?.coach_id || null);
  res.json({ success: true, id: result.lastInsertRowid });
});

app.put("/api/schedule/:id", (req, res) => {
  db.prepare("UPDATE schedule SET day_of_week=?, time=?, section_id=? WHERE id=?")
    .run(sanitize(req.body.day_of_week), sanitize(req.body.time), sanitize(req.body.section_id), req.params.id);
  res.json({ success: true });
});

app.delete("/api/schedule/:id", (req, res) => {
  db.prepare("DELETE FROM schedule WHERE id=?").run(req.params.id);
  res.json({ success: true });
});

/* =========================================================
   SSE — уведомления реального времени
========================================================= */
app.get("/api/events/:userId", (req, res) => {
  const userId = Number(req.params.userId);
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    "Connection": "keep-alive",
    "X-Accel-Buffering": "no",
  });
  res.write(`data: ${JSON.stringify({ type: "connected" })}\n\n`);
  sseClients.set(userId, res);
  req.on("close", () => sseClients.delete(userId));
});

/* =========================================================
   Мессенджер — порядок важен: /unread до /:userId/:otherId
========================================================= */
app.get("/api/users/coaches", (_, res) => {
  res.json(db.prepare("SELECT id, name, avatar FROM users WHERE role='coach'").all());
});

app.get("/api/users/students", (_, res) => {
  res.json(db.prepare("SELECT id, name, avatar FROM users WHERE role='student'").all());
});

app.get("/api/messages/unread/:userId", (req, res) => {
  const row = db.prepare("SELECT COUNT(*) AS count FROM messages WHERE receiver_id=? AND read=0").get(req.params.userId);
  res.json({ count: row.count });
});

app.get("/api/messages/previews/:userId", (req, res) => {
  const uid = Number(req.params.userId);
  const msgs = db.prepare(`
    SELECT id, sender_id, receiver_id, text, created_at, read
    FROM messages
    WHERE sender_id=? OR receiver_id=?
    ORDER BY created_at DESC`).all(uid, uid);

  const previews = {};
  for (const m of msgs) {
    const otherId = m.sender_id === uid ? m.receiver_id : m.sender_id;
    if (!previews[otherId]) {
      previews[otherId] = { otherId, lastText: m.text, lastTime: m.created_at, unread: 0 };
    }
    if (m.receiver_id === uid && m.read === 0) {
      previews[otherId].unread++;
    }
  }
  res.json(Object.values(previews));
});

app.put("/api/messages/read/:userId/:senderId", (req, res) => {
  db.prepare("UPDATE messages SET read=1 WHERE receiver_id=? AND sender_id=?")
    .run(req.params.userId, req.params.senderId);
  res.json({ success: true });
});

app.get("/api/messages/:userId/:otherId", (req, res) => {
  const { userId, otherId } = req.params;
  const rows = db.prepare(`
    SELECT m.*, u.name AS sender_name, u.avatar AS sender_avatar
    FROM messages m JOIN users u ON u.id=m.sender_id
    WHERE (m.sender_id=? AND m.receiver_id=?) OR (m.sender_id=? AND m.receiver_id=?)
    ORDER BY m.created_at ASC`).all(userId, otherId, otherId, userId);
  res.json(rows);
});

app.post("/api/messages", (req, res) => {
  const { sender_id, receiver_id, text } = req.body;
  if (!sender_id || !receiver_id || !text)
    return res.json({ success: false, message: "Не все поля заполнены" });
  const safeText = sanitize(text).slice(0, 2000);
  const result = db.prepare("INSERT INTO messages(sender_id,receiver_id,text,read) VALUES (?,?,?,0)")
    .run(Number(sender_id), Number(receiver_id), safeText);
  res.json({ success: true, id: result.lastInsertRowid });
});

/* =========================================================
   Панель администратора
========================================================= */
function requireAdmin(req, res, next) {
  const userId = req.headers["x-admin-id"];
  if (!userId) return res.status(403).json({ success: false, message: "Нет доступа" });
  const user = db.prepare("SELECT * FROM users WHERE id=? AND role='admin'").get(userId);
  if (!user) {
    secLog("WARN", req.ip, `Unauthorized admin access attempt, user_id=${userId}`);
    return res.status(403).json({ success: false, message: "Нет доступа" });
  }
  next();
}

app.get("/api/admin/stats", requireAdmin, (req, res) => {
  const totalUsers = db.prepare("SELECT COUNT(*) AS c FROM users").get().c;
  const students = db.prepare("SELECT COUNT(*) AS c FROM users WHERE role='student'").get().c;
  const coaches = db.prepare("SELECT COUNT(*) AS c FROM users WHERE role='coach'").get().c;
  const sections = db.prepare("SELECT COUNT(*) AS c FROM sections").get().c;
  const bookings = db.prepare("SELECT COUNT(*) AS c FROM bookings").get().c;
  const messages = db.prepare("SELECT COUNT(*) AS c FROM messages").get().c;
  const pending = db.prepare("SELECT COUNT(*) AS c FROM bookings WHERE status='pending'").get().c;
  const approved = db.prepare("SELECT COUNT(*) AS c FROM bookings WHERE status='approved'").get().c;
  const cancelled = db.prepare("SELECT COUNT(*) AS c FROM bookings WHERE status='cancelled'").get().c;
  const scheduleEntries = db.prepare("SELECT COUNT(*) AS c FROM schedule").get().c;
  res.json({ totalUsers, students, coaches, sections, bookings, messages, pending, approved, cancelled, scheduleEntries });
});

app.get("/api/admin/users", requireAdmin, (req, res) => {
  const rows = db.prepare("SELECT id, name, login, role, group_name, avatar FROM users ORDER BY id").all();
  res.json(rows);
});

app.delete("/api/admin/users/:id", requireAdmin, (req, res) => {
  const target = db.prepare("SELECT role, name FROM users WHERE id=?").get(req.params.id);
  if (!target) return res.json({ success: false, message: "Пользователь не найден" });
  if (target.role === "admin") return res.json({ success: false, message: "Нельзя удалить администратора" });
  try {
    const deleteUser = db.transaction(() => {
      db.prepare("DELETE FROM messages WHERE sender_id=? OR receiver_id=?").run(req.params.id, req.params.id);
      db.prepare("UPDATE bookings SET status='cancelled' WHERE user=?").run(target.name);
      db.prepare("DELETE FROM attendance WHERE student_name=? OR coach_id=?").run(target.name, req.params.id);
      db.prepare("DELETE FROM users WHERE id=?").run(req.params.id);
    });
    deleteUser();
    secLog("WARN", req.ip, `Admin deleted user id=${req.params.id}`);
    res.json({ success: true });
  } catch (err) {
    secLog("WARN", req.ip, `Failed to delete user id=${req.params.id}: ${err.message}`);
    res.status(500).json({ success: false, message: "Не удалось удалить пользователя" });
  }
});

app.get("/api/admin/bookings", requireAdmin, (req, res) => {
  const rows = db.prepare(`
    SELECT b.bookingId, b.sectionId, b.user, b.date, b.status, b.docType,
           s.title AS sectionTitle
    FROM bookings b
    LEFT JOIN sections s ON s.id = b.sectionId
    ORDER BY b.bookingId DESC
  `).all();
  res.json(rows);
});

app.delete("/api/admin/bookings/:id", requireAdmin, (req, res) => {
  db.prepare("DELETE FROM bookings WHERE bookingId=?").run(req.params.id);
  res.json({ success: true });
});

app.get("/api/admin/logs", requireAdmin, (req, res) => {
  res.json(securityLogs);
});

/* =========================================================
   Заявки на регистрацию (admin)
========================================================= */
app.get("/api/admin/pending-registrations", requireAdmin, (req, res) => {
  const rows = db.prepare(
    "SELECT id, login, last_name, first_name, middle_name, email, ip, status, rejection_reason, created_at FROM pending_registrations ORDER BY created_at DESC"
  ).all();
  res.json(rows);
});

app.post("/api/admin/pending-registrations/:id/approve", requireAdmin, (req, res) => {
  const pr = db.prepare("SELECT * FROM pending_registrations WHERE id=?").get(req.params.id);
  if (!pr) return res.json({ success: false, message: "Заявка не найдена" });
  if (pr.status !== "pending") return res.json({ success: false, message: "Заявка уже обработана" });

  const dupUser = db.prepare("SELECT id FROM users WHERE login=?").get(pr.login);
  if (dupUser) {
    db.prepare("UPDATE pending_registrations SET status='rejected', rejection_reason=? WHERE id=?")
      .run("Логин уже занят другим пользователем", pr.id);
    return res.json({ success: false, message: "Логин уже занят другим пользователем" });
  }

  const name = [pr.last_name, pr.first_name, pr.middle_name].filter(Boolean).join(" ");
  try {
    db.transaction(() => {
      db.prepare("INSERT INTO users(name,login,password,role) VALUES (?,?,?,?)").run(name, pr.login, pr.password, "student");
      db.prepare("UPDATE pending_registrations SET status='approved' WHERE id=?").run(pr.id);
    })();
    secLog("INFO", req.ip, `Admin approved registration: ${pr.login}`);
    res.json({ success: true });
  } catch (e) {
    res.json({ success: false, message: "Ошибка при создании аккаунта: " + e.message });
  }
});

app.post("/api/admin/pending-registrations/:id/reject", requireAdmin, (req, res) => {
  const reason = sanitize(req.body.reason || "Заявка отклонена администратором");
  const pr = db.prepare("SELECT id, login, status FROM pending_registrations WHERE id=?").get(req.params.id);
  if (!pr) return res.json({ success: false, message: "Заявка не найдена" });
  if (pr.status !== "pending") return res.json({ success: false, message: "Заявка уже обработана" });

  db.prepare("UPDATE pending_registrations SET status='rejected', rejection_reason=? WHERE id=?").run(reason, pr.id);
  secLog("INFO", req.ip, `Admin rejected registration: ${pr.login}, reason: ${reason}`);
  res.json({ success: true });
});

/* =========================================================
   Сидинг: admin + 3 тренера + 5 студентов
========================================================= */
function seedUsers() {
  const count = db.prepare("SELECT COUNT(*) AS c FROM users").get().c;
  if (count > 0) {
    const adminExists = db.prepare("SELECT id FROM users WHERE role='admin'").get();
    if (!adminExists) {
      db.prepare("INSERT INTO users(name,login,password,role,group_name) VALUES (?,?,?,?,?)")
        .run("Администратор", "admin", "admin123", "admin", null);
      console.log("✅ Администратор добавлен в существующую БД");
    }
    return;
  }

  const add = db.prepare("INSERT INTO users(name,login,password,role,group_name) VALUES (?,?,?,?,?)");

  add.run("Администратор", "admin", "admin123", "admin", null);

  add.run("Иванова Марина Сергеевна", "coach1", "sport123", "coach", null);
  add.run("Петров Алексей Владимирович", "coach2", "sport123", "coach", null);
  add.run("Сидорова Елена Николаевна", "coach3", "sport123", "coach", null);

  console.log("✅ БД инициализирована: admin + 3 тренера");
}
seedUsers();

/* =========================================================
   Реестр студентов
========================================================= */
app.get("/api/registry/check/:studentId", (req, res) => {
  const row = db.prepare("SELECT * FROM student_registry WHERE student_id=?").get(req.params.studentId);
  if (!row) return res.json({ found: false });
  const dup = db.prepare("SELECT id FROM users WHERE student_id=?").get(req.params.studentId);
  res.json({ found: true, data: row, alreadyRegistered: !!dup });
});

app.get("/api/admin/registry", (req, res) => {
  const adminId = Number(req.headers["x-admin-id"]);
  const admin = db.prepare("SELECT role FROM users WHERE id=?").get(adminId);
  if (!admin || admin.role !== "admin") return res.status(403).json({ success: false });
  const rows = db.prepare(
    "SELECT sr.*, u.login FROM student_registry sr LEFT JOIN users u ON u.student_id=sr.student_id ORDER BY sr.last_name, sr.first_name"
  ).all();
  res.json(rows);
});

app.post("/api/admin/registry/upload", csvUpload.single("file"), (req, res) => {
  const adminId = Number(req.headers["x-admin-id"]);
  const admin = db.prepare("SELECT role FROM users WHERE id=?").get(adminId);
  if (!admin || admin.role !== "admin") return res.status(403).json({ success: false });
  if (!req.file) return res.json({ success: false, message: "Файл не загружен" });
  const text = req.file.buffer.toString("utf-8");
  const rows = parseRegistryCSV(text);
  if (!rows.length) return res.json({ success: false, message: "Нет данных в файле" });
  const ins = db.prepare(
    "INSERT OR REPLACE INTO student_registry(student_id,first_name,last_name,middle_name,group_name) VALUES(?,?,?,?,?)"
  );
  db.transaction((list) => {
    for (const r of list) ins.run(r.student_id, r.first_name, r.last_name, r.middle_name, r.group_name);
  })(rows);
  res.json({ success: true, imported: rows.length });
});

app.delete("/api/admin/registry/:studentId", (req, res) => {
  const adminId = Number(req.headers["x-admin-id"]);
  const admin = db.prepare("SELECT role FROM users WHERE id=?").get(adminId);
  if (!admin || admin.role !== "admin") return res.status(403).json({ success: false });
  db.prepare("DELETE FROM student_registry WHERE student_id=?").run(req.params.studentId);
  res.json({ success: true });
});

app.listen(PORT, () => console.log(`🚀 Сервер: ${BASE_URL}`));
