const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = 8080;

// Middleware to parse JSON
app.use(express.json());

// Create or connect to SQLite database
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to SQLite database:', err.message);
  } else {
    console.log('Connected to SQLite database.');
  }
});

// Create tables if they don't exist
db.run(`
  CREATE TABLE IF NOT EXISTS parents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    p_name TEXT NOT NULL,
    p_email TEXT UNIQUE NOT NULL
  );
`, (err) => {
  if (err) {
    console.error('Error creating parents table:', err.message);
  } else {
    console.log('Parents table is ready.');
  }
});

db.run(`
  CREATE TABLE IF NOT EXISTS classes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    grade_range INTEGER NOT NULL
  );
`, (err) => {
  if (err) {
    console.error('Error creating classes table:', err.message);
  } else {
    console.log('Classes table is ready.');
  }
});

db.run(`
  CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    s_name TEXT NOT NULL,
    s_birthdate TEXT NOT NULL,
    class_id INTEGER NOT NULL,
    parent_id INTEGER NOT NULL,
    s_medical TEXT NOT NULL,
    FOREIGN KEY (parent_id) REFERENCES parents(id) ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
  )
`, (err) => {
  if (err) {
    console.error('Error creating students table:', err.message);
  } else {
    console.log('Students table is ready.');
  }
});

// Routes
app.get('/', (req, res) => {
  res.send('Welcome to the SQLite + Express server!');
});

// Route to get all students
app.get('/students', (req, res) => {
  db.all('SELECT * FROM students', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

// Route to get all parents
app.get('/parents', (req, res) => {
  db.all('SELECT * FROM parents', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

// Route to add a new student
app.post('/students', (req, res) => {
  const { s_name, s_birthdate, class_id, parent_id, s_medical } = req.body;

  if (!s_name || !s_birthdate || !class_id || !parent_id || !s_medical) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const sql = `
    INSERT INTO students (s_name, s_birthdate, class_id, parent_id, s_medical) 
    VALUES (?, ?, ?, ?, ?)
  `;
  const params = [s_name, s_birthdate, class_id, parent_id, s_medical];

  db.run(sql, params, function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(201).json({
        id: this.lastID,
        s_name,
        s_birthdate,
        class_id,
        parent_id,
        s_medical,
      });
    }
  });
});

// Route to add a new parent
app.post('/parents', (req, res) => {
  const { p_name, p_email } = req.body;

  if (!p_name || !p_email) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const sql = 'INSERT INTO parents (p_name, p_email) VALUES (?, ?)';
  const params = [p_name, p_email];

  db.run(sql, params, function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(201).json({
        id: this.lastID,
        p_name,
        p_email,
      });
    }
  });
});

// Route to add a new class
app.post('/classes', (req, res) => {
  const { name, grade_range } = req.body;

  if (!name || !grade_range) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const sql = 'INSERT INTO classes (name, grade_range) VALUES (?, ?)';
  const params = [name, grade_range];

  db.run(sql, params, function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(201).json({
        id: this.lastID,
        name,
        grade_range,
      });
    }
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Closing database connection.');
  db.close((err) => {
    if (err) {
      console.error('Error closing the database connection:', err.message);
    }
    process.exit(0);
  });
});


// testing kadd
