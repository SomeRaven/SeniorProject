const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = 8080;

// Middleware to parse JSON
app.use(express.json());
app.use(cors());

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
    id TEXT PRIMARY KEY,
    s_name TEXT NOT NULL,
    s_birthdate TEXT NOT NULL,
    class_id INTEGER NOT NULL,
    parent_id INTEGER NOT NULL,
    s_medical TEXT NOT NULL,
    FOREIGN KEY (parent_id) REFERENCES parents(id),
    FOREIGN KEY (class_id) REFERENCES classes(id)
  )
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
  )
`, (err) => {
  if (err) {
    console.error('Error creating checkin table:', err.message);
  } else {
    console.log('Checkin table is ready.');
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

// Route to get all check-ins
app.get('/check-in', (req, res) => {
  db.all('SELECT * FROM checkin', [], (err, rows) => {
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

  // Generate student ID with leading zeros
  db.get('SELECT COUNT(*) AS count FROM students', [], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    const studentCount = row.count + 1;
    const student_id = studentCount.toString().padStart(4, '0');

    const sql = `
      INSERT INTO students (id, s_name, s_birthdate, class_id, parent_id, s_medical) 
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const params = [student_id, s_name, s_birthdate, class_id, parent_id, s_medical];

    db.run(sql, params, function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.status(201).json({
          id: student_id,
          s_name,
          s_birthdate,
          class_id,
          parent_id,
          s_medical,
        });
      }
    });
  });
});

// Route to add a new check-in
app.post('/check-in', (req, res) => {
  const { time, date, student_id } = req.body;

  console.log('Received data:', { time, date, student_id });

  if (!time || !date || !student_id) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Check if the student ID exists
  db.get('SELECT * FROM students WHERE id = ?', [student_id], (err, student) => {
    if (err) {
      console.error('Error checking student ID:', err.message);
      return res.status(500).json({ error: err.message });
    }

    if (!student) {
      return res.status(404).json({ error: 'Student ID not found' });
    }

    const sql = `
      INSERT INTO checkin (time, date, student_id) 
      VALUES (?, ?, ?)
    `;
    const params = [time, date, student_id];

    db.run(sql, params, function (err) {
      if (err) {
        console.error('Error inserting check-in:', err.message);
        res.status(500).json({ error: err.message });
      } else {
        const checkinId = this.lastID;
        const joinSql = `
          SELECT checkin.id, checkin.time, checkin.date, students.s_name, students.id AS student_id
          FROM checkin 
          JOIN students ON checkin.student_id = students.id 
          WHERE checkin.id = ?
        `;
        db.get(joinSql, [checkinId], (err, row) => {
          if (err) {
            console.error('Error fetching check-in with student name:', err.message);
            res.status(500).json({ error: err.message });
          } else {
            console.log('Inserted check-in with student name and ID:', row);
            res.status(201).json(row);
          }
        });
      }
    });
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

app.put('/students/:id', (req, res) => {
  const { id } = req.params;
  const { s_name, s_birthdate, class_id, parent_id, s_medical } = req.body;
  const sql = `
    UPDATE students 
    SET s_name = ?, s_birthdate = ?, class_id = ?, parent_id = ?, s_medical = ? 
    WHERE id = ?
  `;
  const params = [s_name, s_birthdate, class_id, parent_id, s_medical, id]; 
  
  db.run(sql, params, function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ changes: this.changes });
    }
  });
});

app.put('/parents/:id', (req, res) => { 
  const { id } = req.params;
  const { p_name, p_email } = req.body;
  const sql = 'UPDATE parents SET p_name = ?, p_email = ? WHERE id = ?';
  const params = [p_name, p_email, id]; 
  
  db.run(sql, params, function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ changes: this.changes });
    }
  });
});

app.put('/classes/:id', (req, res) => { 
  const { id } = req.params;
  const { name, grade_range } = req.body;
  const sql = 'UPDATE classes SET name = ?, grade_range = ? WHERE id = ?';
  const params = [name, grade_range, id]; 
  
  db.run(sql, params, function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ changes: this.changes });
    }
  });
});

app.delete('/students/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM students WHERE id = ?';
  const params = [id];

  db.run(sql, params, function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ deleted: this.changes });
    }
  });
});

app.delete('/parents/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM parents WHERE id = ?';
  const params = [id];

  db.run(sql, params, function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ deleted: this.changes });
    }
  });
});

app.delete('/classes/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM classes WHERE id = ?';
  const params = [id];

  db.run(sql, params, function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ deleted: this.changes });
    }
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Dropping tables and closing database connection.');

  const dropTablesSql = `
    DROP TABLE IF EXISTS checkin;
    DROP TABLE IF EXISTS students;
    DROP TABLE IF EXISTS classes;
    DROP TABLE IF EXISTS parents;
  `;

  db.exec(dropTablesSql, (err) => {
    if (err) {
      console.error('Error dropping tables:', err.message);
    } else {
      console.log('Tables dropped successfully.');
    }

    db.close((err) => {
      if (err) {
        console.error('Error closing the database connection:', err.message);
      }
      process.exit(0);
    });
  });
});
