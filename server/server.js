const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = 8080;

app.use(express.json());
app.use(cors());

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to SQLite database:', err.message);
  } else {
    console.log('Connected to SQLite database.');
  }
});

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS students (
      id TEXT PRIMARY KEY,
      s_name TEXT NOT NULL,
      class_name TEXT NOT NULL,
      parent_name TEXT NOT NULL,
      parent_email TEXT UNIQUE NOT NULL,
      parent_phone TEXT NOT NULL
    );
  `, (err) => {
    if (err) {
      console.error('Error creating students table:', err.message);
    } else {
      console.log('Students table is ready.');
    }
  });

  db.run(`
    CREATE TABLE IF NOT EXISTS checkin (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      student_id TEXT NOT NULL,
      FOREIGN KEY (student_id) REFERENCES students(id)
    );
  `, (err) => {
    if (err) {
      console.error('Error creating checkin table:', err.message);
    } else {
      console.log('Checkin table is ready.');
    }
  });
});

app.get('/', (req, res) => {
  res.send('Welcome to the Students and Check-in API!');
});

app.get('/students', (req, res) => {
  db.all('SELECT * FROM students', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

app.post('/students', (req, res) => {
  const { s_name, class_name, parent_name, parent_email, parent_phone } = req.body;
  
  if (!s_name || !class_name || !parent_name || !parent_email || !parent_phone) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  db.get('SELECT COUNT(*) AS count FROM students', [], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    const studentCount = row.count + 1;
    const student_id = studentCount.toString().padStart(4, '0');

    const sql = `
      INSERT INTO students (id, s_name, class_name, parent_name, parent_email, parent_phone) 
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const params = [student_id, s_name, class_name, parent_name, parent_email, parent_phone];

    db.run(sql, params, function (err) {
      if (err) {
        if (err.message.includes("UNIQUE constraint failed")) {
          return res.status(400).json({ error: "Parent email already exists" });
        }
        return res.status(500).json({ error: err.message });
      }

      res.status(201).json({ id: student_id, s_name, class_name, parent_name, parent_email, parent_phone });
    });
  });
});

app.get('/check-in', (req, res) => {
  db.all('SELECT * FROM checkin', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

app.post('/check-in', (req, res) => {
  const { time, date, student_id } = req.body;
  if (!time || !date || !student_id) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  db.get('SELECT * FROM students WHERE id = ?', [student_id], (err, student) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!student) {
      return res.status(404).json({ error: 'Student ID not found' });
    }

    const sql = 'INSERT INTO checkin (time, date, student_id) VALUES (?, ?, ?)';
    const params = [time, date, student_id];

    db.run(sql, params, function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.status(201).json({ id: this.lastID, time, date, student_id });
      }
    });
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

process.on('SIGINT', () => {
  db.serialize(() => {
    db.run('DROP TABLE IF EXISTS students', (err) => {
      if (err) {
        console.error('Error dropping students table:', err.message);
      } else {
        console.log('Students table dropped.');
      }
    });

    db.run('DROP TABLE IF EXISTS checkin', (err) => {
      if (err) {
        console.error('Error dropping checkin table:', err.message);
      } else {
        console.log('Checkin table dropped.');
      }
    });
  });

  db.close((err) => {
    if (err) {
      console.error('Error closing SQLite database:', err.message);
    } else {
      console.log('SQLite database connection closed.');
    }
  });
  console.log('Closing database connection.');
  process.exit(0);
});
