const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const cookieParser = require("cookie-parser");

const app = express();
const PORT = 8080;

app.use(express.json());
app.use(cookieParser());


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
  // Create the table (this part looks fine)
db.run(`
    CREATE TABLE IF NOT EXISTS students (
      id TEXT PRIMARY KEY,
      s_name TEXT NOT NULL,
      parent_name TEXT NOT NULL,
      parent_email TEXT NOT NULL,
      parent_phone TEXT NOT NULL
    );
  `, (err) => {
    if (err) console.error('Error creating students table:', err.message);
    else console.log('Students table is ready.');
  });

  db.run(`
    CREATE TABLE IF NOT EXISTS classes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      class_name TEXT NOT NULL,
      location TEXT NOT NULL,
      time TEXT NOT NULL,
      meeting_day TEXT NOT NULL,
      semester TEXT NOT NULL,
      teacher TEXT NOT NULL
    );
  `, (err) => {
    if (err) console.error('Error creating classes table:', err.message);
    else console.log('Classes table is ready.');
  });

  db.run(`
    CREATE TABLE IF NOT EXISTS class_students (
      class_id INTEGER NOT NULL,
      student_id TEXT NOT NULL,  
      PRIMARY KEY (class_id, student_id),
      FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
    );
  `, (err) => {
    if (err) console.error('Error creating class_students table:', err.message);
    else console.log('Class-Student relationship table is ready.');
  });
  

  db.run(`
    CREATE TABLE IF NOT EXISTS checkin (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        time TEXT NOT NULL,
        student_id TEXT NOT NULL,
        class_id INTEGER NOT NULL,  -- NEW COLUMN to track which class the check-in belongs to
        FOREIGN KEY (student_id) REFERENCES students(id),
        FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
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

// Add student logic 
app.post('/students', (req, res) => {
  const { student, class_ids } = req.body;

  const missingFields = [];

  if (!student.s_name) missingFields.push('Student Name');
  if (!student.parent_name) missingFields.push('Parent Name');
  if (!student.parent_email) missingFields.push('Parent Email');
  if (!student.parent_phone) missingFields.push('Parent Phone');
  if (!class_ids || class_ids.length === 0) missingFields.push('Classes');

  if (missingFields.length > 0) {
    return res.status(400).json({ error: `Missing required fields: ${missingFields.join(', ')}` });
  }

  db.get('SELECT COUNT(*) AS count FROM students', [], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });

    const studentCount = row.count + 1;
    const student_id = studentCount.toString().padStart(4, '0');

    const sqlStudent = `
      INSERT INTO students (id, s_name, parent_name, parent_email, parent_phone) 
      VALUES (?, ?, ?, ?, ?)
    `;
    const paramsStudent = [student_id, student.s_name, student.parent_name, student.parent_email, student.parent_phone];

    db.run(sqlStudent, paramsStudent, function (err) {
      if (err) {
        if (err.message.includes("UNIQUE constraint failed")) {
          return res.status(400).json({ error: "Parent email already exists" });
        }
        return res.status(500).json({ error: err.message });
      }

      const insertClassStudentSql = `INSERT INTO class_students (class_id, student_id) VALUES (?, ?)`;

      class_ids.forEach(class_id => {
        db.run(insertClassStudentSql, [class_id, student_id], function (err) {
          if (err) {
            return res.status(500).json({ error: err.message });
          }
        });
      });

      res.status(201).json({
        id: student_id,
        s_name: student.s_name,
        parent_name: student.parent_name,
        parent_email: student.parent_email,
        parent_phone: student.parent_phone,
        class_ids
      });
    });
  });
});

// get student logic 
app.get('/students', (req, res) => {
  const sql = `
    SELECT 
      students.id AS student_id,
      students.s_name,
      students.parent_name,
      students.parent_email,
      students.parent_phone,
      COALESCE(
        json_group_array(
          json_object('class_id', classes.id, 'class_name', classes.class_name)
        ), 
        '[]'
      ) AS classes
    FROM students
    LEFT JOIN class_students ON students.id = class_students.student_id
    LEFT JOIN classes ON class_students.class_id = classes.id
    GROUP BY students.id
  `;

  db.all(sql, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      rows.forEach(row => {
        try {
          row.classes = JSON.parse(row.classes); 
        } catch (error) {
          row.classes = [];
        }
      });
      res.json(rows);
    }
  });
});

//edit student logic
app.put('/students/:id', (req, res) => {
  const student_id = req.params.id;
  const { s_name, parent_name, parent_email, parent_phone, class_ids } = req.body;

  const sql = `
    UPDATE students 
    SET s_name = ?, parent_name = ?, parent_email = ?, parent_phone = ?
    WHERE id = ?
  `;
  const params = [s_name, parent_name, parent_email, parent_phone, student_id];

  db.run(sql, params, function (err) {
    if (err) return res.status(500).json({ error: err.message });

    // Update class relationships
    db.run(`DELETE FROM class_students WHERE student_id = ?`, [student_id], (err) => {
      if (err) return res.status(500).json({ error: err.message });

      const insertSql = `INSERT INTO class_students (class_id, student_id) VALUES (?, ?)`;
      const stmt = db.prepare(insertSql);
      class_ids.forEach(class_id => {
        stmt.run(class_id, student_id);
      });
      stmt.finalize();

      res.json({ message: 'Student updated successfully' });
    });
  });
});
// Delete student logic
app.delete('/students/:id', (req, res) => {
  const student_id = req.params.id;

  db.run(`DELETE FROM students WHERE id = ?`, [student_id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Student deleted successfully' });
  });
});


// get class logic 
app.get('/classes', (req, res) => {
  const sql = `
    SELECT 
      classes.id AS class_id,
      classes.class_name,
      classes.location,
      classes.time,
      classes.meeting_day,
      classes.semester,
      classes.teacher,
      COALESCE(
        json_group_array(
          json_object('id', students.id, 'name', students.s_name)
        ), 
        '[]'
      ) AS students
    FROM classes
    LEFT JOIN class_students ON classes.id = class_students.class_id
    LEFT JOIN students ON class_students.student_id = students.id
    GROUP BY classes.id
  `;

  db.all(sql, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      rows.forEach(row => {
        row.students = JSON.parse(row.students); // Parse JSON string to an array
      });
      res.json(rows);
    }
  });
});

// Add class logic 
app.post('/classes', (req, res) => {
  const { class_name, location, time, meeting_day, semester, teacher } = req.body;

  if (!class_name || !location || !time || !meeting_day || !semester || !teacher) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const sql = `
    INSERT INTO classes (class_name, location, time, meeting_day, semester, teacher)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  const params = [class_name, location, time, meeting_day, semester, teacher];

  db.run(sql, params, function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.status(201).json({ 
      class_id: this.lastID, 
      class_name, 
      location, 
      time, 
      meeting_day, 
      semester, 
      teacher 
    });
  });
});
// Edit class logic
app.put('/classes/:id', (req, res) => {
  const class_id = req.params.id;
  const { class_name, location, time, meeting_day, semester, teacher } = req.body;

  const sql = `
    UPDATE classes 
    SET class_name = ?, location = ?, time = ?, meeting_day = ?, semester = ?, teacher = ?
    WHERE id = ?
  `;
  const params = [class_name, location, time, meeting_day, semester, teacher, class_id];

  db.run(sql, params, function (err) {
    if (err) return res.status(500).json({ error: err.message });

    res.json({ message: 'Class updated successfully' });
  });
});
// Delete class logic
app.delete('/classes/:id', (req, res) => {
  const class_id = req.params.id;

  db.run(`DELETE FROM classes WHERE id = ?`, [class_id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Class deleted successfully' });
  });
});


// get class-student logic 
app.get('/class-students', (req, res) => {
  const sql = `
    SELECT 
      classes.id AS class_id,
      classes.class_name,
      classes.location,
      classes.time,
      classes.meeting_day,
      classes.semester,
      classes.teacher,
      COALESCE(
        json_group_array(
          json_object(
            'id', students.id, 
            'name', students.s_name,
            'parent_name', students.parent_name,
            'parent_email', students.parent_email,
            'parent_phone', students.parent_phone
          )
        ), 
        '[]'
      ) AS students
    FROM classes
    LEFT JOIN class_students ON classes.id = class_students.class_id
    LEFT JOIN students ON class_students.student_id = students.id
    GROUP BY classes.id
  `;

  db.all(sql, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      rows.forEach(row => {
        row.students = JSON.parse(row.students); // Convert JSON string to an array
      });
      res.json(rows);
    }
  });
});

// Add class-student logic (i dont think i need this)
app.post('/class-students', (req, res) => {
  const { class_id, student_ids } = req.body;

  if (!class_id || !Array.isArray(student_ids) || student_ids.length === 0) {
    return res.status(400).json({ error: 'Missing or invalid class_id or student_ids' });
  }

  const sql = `
    INSERT INTO class_students (class_id, student_id) 
    VALUES (?, ?)
  `;

  const stmt = db.prepare(sql);

  student_ids.forEach(student_id => {
    stmt.run(class_id, student_id, (err) => {
      if (err) {
        console.error(`Error enrolling student ${student_id} in class ${class_id}:`, err.message);
      }
    });
  });

  stmt.finalize();

  res.status(201).json({ message: "Students enrolled successfully", class_id, student_ids });
});

// get check-in logic
app.get('/check-in', (req, res) => {
  db.all('SELECT * FROM checkin', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});
// add check-in logic 
app.post('/check-in', (req, res) => {
  const { time, date, student_id } = req.body;
  if (!time || !date || !student_id) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Check if student exists
  db.get('SELECT * FROM students WHERE id = ?', [student_id], (err, student) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!student) {
      return res.status(404).json({ error: 'Student ID not found' });
    }

    // Find the student's classes that meet today
    const currentDay = new Date().toLocaleString('en-US', { weekday: 'long' }); // e.g., "Monday"
    db.all(`
      SELECT c.id AS class_id 
      FROM class_students cs
      JOIN classes c ON cs.class_id = c.id
      WHERE cs.student_id = ? AND c.meeting_day = ?
    `, [student_id, currentDay], (err, classes) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!classes.length) {
        return res.status(404).json({ error: 'No class scheduled for today' });
      }

      // Insert check-in records for each class
      const insertCheckIn = (class_id, callback) => {
        db.run(
          'INSERT INTO checkin (time, date, student_id, class_id) VALUES (?, ?, ?, ?)',
          [time, date, student_id, class_id],
          callback
        );
      };

      let completed = 0;
      let errors = [];

      classes.forEach(({ class_id }) => {
        insertCheckIn(class_id, (err) => {
          if (err) errors.push(err.message);
          completed++;
          if (completed === classes.length) {
            if (errors.length) {
              res.status(500).json({ error: errors });
            } else {
              res.status(201).json({ message: 'Check-in successful for all classes', checkedInClasses: classes });
            }
          }
        });
      });
    });
  });
});


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

process.on('SIGINT', () => {
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


