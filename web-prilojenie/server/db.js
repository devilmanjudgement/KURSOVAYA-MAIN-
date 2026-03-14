const Database = require('better-sqlite3');
const db = new Database('kgusport.db');

/* ================= Таблицы ================= */
db.prepare(`
CREATE TABLE IF NOT EXISTS sections (
  id TEXT PRIMARY KEY,
  title TEXT,
  color TEXT,
  textColor TEXT,
  coach TEXT,
  place TEXT,
  image TEXT,
  description TEXT,
  max_students INTEGER DEFAULT 20
)
`).run();

db.prepare(`
CREATE TABLE IF NOT EXISTS schedule (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  day_of_week TEXT,
  time TEXT,
  section_id TEXT,
  FOREIGN KEY (section_id) REFERENCES sections(id)
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
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  login TEXT UNIQUE,
  password TEXT,
  role TEXT,
  group_name TEXT,
  avatar TEXT,
  health_doc TEXT,
  description TEXT
)
`).run();

db.prepare(`
CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  coach TEXT,
  message TEXT,
  read INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
`).run();

module.exports = db;