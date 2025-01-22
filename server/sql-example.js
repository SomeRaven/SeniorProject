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

// Create a table if it doesn't exist
db.run(`
  CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    s_name TEXT NOT NULL,
    s_birthdate TEXT NOT NULL,
    s_class TEXT NOT NULL,
    s_medical TEXT NOT NULL
  )
`, (err) => {
  if (err) {
    console.error('Error creating table:', err.message);
  } else {
    console.log('Users table is ready.');
  }
});

// Routes
app.get('/', (req, res) => {
  res.send('Welcome to the SQLite + Express server!');
});

// Route to get all users
app.get('/students', (req, res) => {
  db.all('SELECT * FROM students', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

// Route to add a new user
app.post('/students', (req, res) => {
  const { s_name, s_birthdate, s_class, s_medical } = req.body;
  const sql = 'INSERT INTO students (s_name, s_birthdate, s_class, s_medical) VALUES (?, ?, ?, ?)';
  const params = [s_name, s_birthdate, s_class, s_medical];

  db.run(sql, params, function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(201).json({
        id: this.lastID,
        s_name,
        s_birthdate,
        s_class,
        s_medical
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
