require("dotenv").config();
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const bcrypt = require("bcrypt");

const dbPath = path.resolve(process.env.DB_FILE);
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error("DB Connection Error:", err.message);
  else console.log("Connected to SQLite database.");
});

db.serialize(async() => {
  db.run("PRAGMA foreign_keys = ON;");
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT, -- MySQL: INT AUTO_INCREMENT PRIMARY KEY
      name TEXT NOT NULL,
      email_address TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL
    ) ; 
  `);
  // テスト用のアカウントを作成する-------
  const hashedPassword = await bcrypt.hash("ichiro", 10);
  db.run(`
    INSERT OR IGNORE INTO users
    (name, email_address, password_hash)
    VALUES
      ('一郎', 'ichiro@gmail.com', '${hashedPassword}'),
      ('A', 'A@example.com', '${await bcrypt.hash("AAA", 10)}'),
      ('B', 'B@example.com', '${await bcrypt.hash("BBB", 10)}'),
      ('C', 'C@example.com', '${await bcrypt.hash("CCC", 10)}'),
      ('D', 'D@example.com', '${await bcrypt.hash("DDD", 10)}'),
      ('E', 'E@example.com', '${await bcrypt.hash("EEE", 10)}'),
      ('F', 'F@example.com', '${await bcrypt.hash("FFF", 10)}'),
      ('G', 'G@example.com', '${await bcrypt.hash("GGG", 10)}'),
      ('H', 'H@example.com', '${await bcrypt.hash("HHH", 10)}'),
      ('I', 'I@example.com', '${await bcrypt.hash("III", 10)}'),
      ('J', 'J@example.com', '${await bcrypt.hash("JJJ", 10)}')
  `)
  //-------------------
  db.run(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      content TEXT,
      deadline TEXT,
      is_completed INTEGER DEFAULT 0, -- 0=false, 1=true
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS schedules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      content TEXT,
      start_datetime TEXT NOT NULL,
      end_datetime TEXT NOT NULL,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS mails(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      email_id TEXT NOT NULL,
      summary TEXT,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE (user_id, email_id)
    ); 
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS oauth_tokens(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      token TEXT NOT NULL,
      refresh_token TEXT NOT NULL,
      deadline TEXT,
      mail_address UNIQUE NOT NULL,
      provider TEXT NOT NULL,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);
})

module.exports = db;