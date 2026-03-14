/**
 * КГУ СПОРТ — сервер FINALLY WORKING
 */

const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const Database = require("better-sqlite3");

const db = new Database("kgusport.db");
const app = express();
const PORT = 5000;
const BASE_URL = `http://localhost:${PORT}`;
const IMG_DIR = path.join(__dirname, "images");
if (!fs.existsSync(IMG_DIR)) fs.mkdirSync(IMG_DIR, { recursive: true });

app.use(cors());
app.use(express.json());
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
const upload = multer({ storage });

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

/* =========================================================
   Авторизация / Регистрация
========================================================= */
app.post("/api/login", (req, res) => {
  const { login, password } = req.body;
  const user = db.prepare("SELECT * FROM users WHERE login=? AND password=?").get(login, password);
  if (!user) return res.status(401).json({ success: false, message: "Неверный логин или пароль" });
  res.json({ success: true, user });
});

app.post("/api/register", (req, res) => {
  const { name, login, password, role, group_name } = req.body;
  if (!name || !login || !password || !role)
    return res.json({ success: false, message: "Не все поля заполнены" });
  try {
    db.prepare("INSERT INTO users(name,login,password,role,group_name) VALUES (?,?,?,?,?)")
      .run(name, login, password, role, group_name);
    res.json({ success: true });
  } catch {
    res.json({ success: false, message: "Такой логин уже существует" });
  }
});

/* =========================================================
   Профиль и документы
========================================================= */
app.put("/api/profile/:id", upload.single("avatar"), (req, res) => {
  const { name, group_name } = req.body;
  const avatar = req.file ? `${BASE_URL}/images/${req.file.filename}` : null;
  db.prepare(`
    UPDATE users SET 
      name = COALESCE(?, name),
      group_name = COALESCE(?, group_name),
      avatar = COALESCE(?, avatar)
    WHERE id=?`).run(name, group_name, avatar, req.params.id);
  const user = db.prepare("SELECT * FROM users WHERE id=?").get(req.params.id);
  res.json({ success: true, user });
});

// Загрузка / обновление медицинской справки студентом
app.post("/api/student/:id/healthdoc", upload.single("file"), (req, res) => {
  if (!req.file) return res.json({ success: false, message: "Файл не загружен" });
  const url = `${BASE_URL}/images/${req.file.filename}`;
  db.prepare("UPDATE users SET health_doc = ? WHERE id = ?").run(url, req.params.id);
  console.log("✅ Справка сохранена:", url);
  res.json({ success: true, health_doc: url });
});

/* =========================================================
   Секции
========================================================= */
app.get("/api/sections", (_, res) => {
  const rows = db.prepare(`
    SELECT s.*, u.name AS coach_name, u.avatar AS coach_avatar,
     (SELECT COUNT(*) FROM bookings b WHERE b.sectionId = s.id AND b.status='approved') AS students_count
     FROM sections s 
     LEFT JOIN users u ON u.id = s.coach_id`).all();
  res.json(rows);
});

app.get("/api/sections/:id", (req, res) => {
  const s = db.prepare(`
    SELECT s.*, u.name AS coach_name, u.avatar AS coach_avatar
      FROM sections s LEFT JOIN users u ON u.id=s.coach_id WHERE s.id=?`).get(req.params.id);
  if (!s) return res.status(404).json({ success: false });
  s.students_count = db.prepare(
    "SELECT COUNT(*) AS c FROM bookings WHERE sectionId=? AND status='approved'"
  ).get(req.params.id).c;
  res.json(s);
});

app.get("/api/sections/:id/enrolled", (req, res) => {
  const rows = db
    .prepare(
      `SELECT u.name, u.group_name, u.health_doc, b.status
         FROM bookings b
         JOIN users u ON u.name = b.user
        WHERE b.sectionId = ?
          AND b.status != 'cancelled'`
    )
    .all(req.params.id);
  res.json(rows);
});

/* =========================================================
   Бронирования
========================================================= */
app.post("/api/bookings", (req, res) => {
  const { sectionId, user, date, docType } = req.body;
  db.prepare(
    "INSERT INTO bookings(sectionId,user,date,docType,status) VALUES (?,?,?,?,?)"
  ).run(sectionId, user, date, docType || "auto", "pending");
  res.json({ success: true });
});

app.put("/api/bookings/:id/status", (req, res) => {
  const { status } = req.body;
  db.prepare("UPDATE bookings SET status=? WHERE bookingId=?").run(status, req.params.id);
  res.json({ success: true });
});

app.delete("/api/bookings/:id", (req, res) => {
  db.prepare("UPDATE bookings SET status='cancelled' WHERE bookingId=?").run(req.params.id);
  res.json({ success: true });
});

// Заявки преподавателя
app.get("/api/teacher/:id/bookings", (req, res) => {
  const id = Number(req.params.id);
  const sections = db.prepare("SELECT id FROM sections WHERE coach_id=?").all(id);
  if (!sections.length) return res.json([]);
  const ids = sections.map((s) => s.id);
  const query = `
    SELECT b.*, s.title, s.place
      FROM bookings b JOIN sections s ON s.id=b.sectionId
      WHERE b.sectionId IN (${ids.map(() => "?").join(",")})
      AND b.status='pending'
      ORDER BY b.bookingId DESC`;
  const rows = db.prepare(query).all(...ids);
  res.json(rows);
});

// Заявки студента одобренные/ожидающие
app.get("/api/student/:name/enrollments", (req, res) => {
  const rows = db.prepare(`
    SELECT b.bookingId, b.status, s.title, s.place, s.image, u.name AS coach 
      FROM bookings b 
      JOIN sections s ON s.id=b.sectionId
      JOIN users u ON u.id=s.coach_id
      WHERE b.user=? AND b.status!='cancelled'
      ORDER BY b.bookingId DESC`).all(req.params.name);
  res.json(rows);
});

/* =========================================================
   Сидинг
========================================================= */
function seedUsers() {
  if (db.prepare("SELECT COUNT(*) AS c FROM users").get().c) return;
  const add = db.prepare("INSERT INTO users(name,login,password,role) VALUES (?,?,?,?)");
  for (let i = 1; i <= 3; i++) add.run(`Тренер №${i}`, `coach${i}`, "123", "coach");
  add.run("Иван Иванов", "ivan", "123", "student");
  console.log("✅ Пользователи созданы");
}
seedUsers();

/* =========================================================
   Запуск
========================================================= */
app.listen(PORT, () => console.log(`🚀 Сервер запущен: ${BASE_URL}`));