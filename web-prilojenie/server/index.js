/**
 * КГУ СПОРТ — сервер
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

try {
  db.prepare("ALTER TABLE messages ADD COLUMN read INTEGER DEFAULT 0").run();
} catch (_) {}

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
  if (!name || !login || !password)
    return res.json({ success: false, message: "Не все поля заполнены" });
  if (role === "coach")
    return res.json({ success: false, message: "Регистрация преподавателей недоступна" });
  try {
    db.prepare("INSERT INTO users(name,login,password,role,group_name) VALUES (?,?,?,?,?)")
      .run(name, login, password, "student", group_name || null);
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

app.put("/api/profile/:id/password", (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = db.prepare("SELECT * FROM users WHERE id=?").get(req.params.id);
  if (!user) return res.json({ success: false, message: "Пользователь не найден" });
  if (user.password !== oldPassword) return res.json({ success: false, message: "Неверный старый пароль" });
  db.prepare("UPDATE users SET password=? WHERE id=?").run(newPassword, req.params.id);
  res.json({ success: true });
});

app.post("/api/student/:id/healthdoc", upload.single("file"), (req, res) => {
  if (!req.file) return res.json({ success: false, message: "Файл не загружен" });
  const url = `${BASE_URL}/images/${req.file.filename}`;
  db.prepare("UPDATE users SET health_doc = ? WHERE id = ?").run(url, req.params.id);
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
  const rows = db.prepare(`
    SELECT u.id, u.name, u.group_name, u.health_doc, MAX(b.status) AS status
      FROM bookings b
      JOIN users u ON u.name = b.user
      WHERE b.sectionId = ?
        AND b.status != 'cancelled'
      GROUP BY u.id, u.name, u.group_name, u.health_doc
  `).all(req.params.id);
  res.json(rows);
});

app.post("/api/sections", upload.single("image"), (req, res) => {
  const { title, place, color, description, max_students, coach_id } = req.body;
  if (!title || !coach_id) return res.json({ success: false, message: "Заполните обязательные поля" });
  const id = "sec_" + Date.now();
  const image = req.file ? `${BASE_URL}/images/${req.file.filename}` : null;
  db.prepare(
    "INSERT INTO sections(id,title,coach_id,place,color,image,description,max_students) VALUES (?,?,?,?,?,?,?,?)"
  ).run(id, title, Number(coach_id), place || "", color || "#0056b3", image, description || "", Number(max_students) || 20);
  res.json({ success: true, id });
});

app.put("/api/sections/:id", upload.single("image"), (req, res) => {
  const { title, place, color, description, max_students } = req.body;
  const image = req.file ? `${BASE_URL}/images/${req.file.filename}` : null;
  db.prepare(`
    UPDATE sections SET
      title = COALESCE(?, title),
      place = COALESCE(?, place),
      color = COALESCE(?, color),
      description = COALESCE(?, description),
      max_students = COALESCE(?, max_students),
      image = COALESCE(?, image)
    WHERE id=?`).run(title, place, color, description, max_students ? Number(max_students) : null, image, req.params.id);
  res.json({ success: true });
});

app.delete("/api/sections/:id", (req, res) => {
  db.prepare("DELETE FROM sections WHERE id=?").run(req.params.id);
  res.json({ success: true });
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
   Расписание
========================================================= */
app.get("/api/schedule", (_, res) => {
  const rows = db.prepare(`
    SELECT sc.*, s.title, s.place, s.color, s.coach_id, u.name AS coach_name
      FROM schedule sc
      JOIN sections s ON s.id = sc.section_id
      LEFT JOIN users u ON u.id = s.coach_id
    ORDER BY sc.id`).all();
  res.json(rows);
});

app.post("/api/schedule", (req, res) => {
  const { day_of_week, time, section_id } = req.body;
  if (!day_of_week || !time || !section_id) return res.json({ success: false, message: "Заполните все поля" });
  const sec = db.prepare("SELECT coach_id FROM sections WHERE id=?").get(section_id);
  const coach_id = sec ? sec.coach_id : null;
  const result = db.prepare(
    "INSERT INTO schedule(day_of_week,time,section_id,coach_id) VALUES (?,?,?,?)"
  ).run(day_of_week, time, section_id, coach_id);
  res.json({ success: true, id: result.lastInsertRowid });
});

app.put("/api/schedule/:id", (req, res) => {
  const { day_of_week, time, section_id } = req.body;
  db.prepare(
    "UPDATE schedule SET day_of_week=?, time=?, section_id=? WHERE id=?"
  ).run(day_of_week, time, section_id, req.params.id);
  res.json({ success: true });
});

app.delete("/api/schedule/:id", (req, res) => {
  db.prepare("DELETE FROM schedule WHERE id=?").run(req.params.id);
  res.json({ success: true });
});

/* =========================================================
   Мессенджер
========================================================= */
app.get("/api/users/coaches", (_, res) => {
  const rows = db.prepare("SELECT id, name, avatar FROM users WHERE role='coach'").all();
  res.json(rows);
});

app.get("/api/users/students", (_, res) => {
  const rows = db.prepare("SELECT id, name, avatar FROM users WHERE role='student'").all();
  res.json(rows);
});

app.get("/api/messages/unread/:userId", (req, res) => {
  const { userId } = req.params;
  const row = db.prepare(
    "SELECT COUNT(*) AS count FROM messages WHERE receiver_id=? AND read=0"
  ).get(userId);
  res.json({ count: row.count });
});

app.put("/api/messages/read/:userId/:senderId", (req, res) => {
  const { userId, senderId } = req.params;
  db.prepare(
    "UPDATE messages SET read=1 WHERE receiver_id=? AND sender_id=?"
  ).run(userId, senderId);
  res.json({ success: true });
});

app.get("/api/messages/:userId/:otherId", (req, res) => {
  const { userId, otherId } = req.params;
  const rows = db.prepare(`
    SELECT m.*, u.name AS sender_name, u.avatar AS sender_avatar
      FROM messages m
      JOIN users u ON u.id = m.sender_id
      WHERE (m.sender_id=? AND m.receiver_id=?)
         OR (m.sender_id=? AND m.receiver_id=?)
      ORDER BY m.created_at ASC`).all(userId, otherId, otherId, userId);
  res.json(rows);
});

app.post("/api/messages", (req, res) => {
  const { sender_id, receiver_id, text } = req.body;
  if (!sender_id || !receiver_id || !text) return res.json({ success: false });
  const result = db.prepare(
    "INSERT INTO messages(sender_id,receiver_id,text,read) VALUES (?,?,?,0)"
  ).run(Number(sender_id), Number(receiver_id), text);
  res.json({ success: true, id: result.lastInsertRowid });
});

/* =========================================================
   Сидинг: 3 тренера + 5 студентов
========================================================= */
function seedUsers() {
  const count = db.prepare("SELECT COUNT(*) AS c FROM users").get().c;
  if (count > 0) return;

  const add = db.prepare("INSERT INTO users(name,login,password,role,group_name) VALUES (?,?,?,?,?)");

  add.run("Иванова Марина Сергеевна", "coach1", "sport123", "coach", null);
  add.run("Петров Алексей Владимирович", "coach2", "sport123", "coach", null);
  add.run("Сидорова Елена Николаевна", "coach3", "sport123", "coach", null);

  add.run("Иванов Иван Иванович", "student1", "pass123", "student", "гК-31");
  add.run("Петрова Анна Сергеевна", "student2", "pass123", "student", "гК-32");
  add.run("Кузнецов Дмитрий Олегович", "student3", "pass123", "student", "гК-31");
  add.run("Морозова Елена Андреевна", "student4", "pass123", "student", "гК-33");
  add.run("Волков Алексей Игоревич", "student5", "pass123", "student", "гК-32");

  console.log("✅ Пользователи созданы (3 тренера + 5 студентов)");
}
seedUsers();

/* =========================================================
   Запуск
========================================================= */
app.listen(PORT, () => console.log(`🚀 Сервер запущен: ${BASE_URL}`));
