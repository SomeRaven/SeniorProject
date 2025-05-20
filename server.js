const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const cookieParser = require("cookie-parser");

const app = express();
const PORT = 8080;

app.use(express.json());
app.use(cookieParser());
const bcrypt = require('bcrypt');
const saltRounds = 10;

app.use(cors({
  origin: true,
  credentials: true
}));

const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath));

const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);

app.use(session({
  store: new SQLiteStore({
    dir: '/tmp',  // ✅ must be /tmp on Render
    db: 'sessions.sqlite'
  }),
  secret: 'yourSecretKeyHere',
  resave: false,
  saveUninitialized: false,
  cookie: {
    sameSite: 'none',
    secure: true
  }
}));




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
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
    ); 
    `, (err) => {
        if (err) console.error('Error creating users table:', err.message);
        else console.log('Users table is ready.');
  });
});

// Register route
app.post('/register', async (req, res) => {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    const query = `INSERT INTO users (email, password) VALUES (?, ?)`;
    db.run(query, [email, hashedPassword], function (err) {
        if (err) return res.status(500).send("User already exists or error occurred.");
        res.status(201).send({ userId: this.lastID });
    });
});

app.get('/users', (req, res) => {
  db.all('SELECT id, email FROM users', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
}
);

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send("Email and password are required.");
  }

  db.get(`SELECT * FROM users WHERE email = ?`, [email], async (err, user) => {
    if (err) return res.status(500).send("Database error.");
    if (!user || !user.password) return res.status(401).send("Invalid credentials.");

    try {
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) return res.status(401).send("Invalid credentials.");

      req.session.userId = user.id;
      console.log("Session userId at check-in:", req.session.userId);
      res.status(200).json({ message: "Login successful" });
    } catch (compareError) {
      console.error("Bcrypt compare failed:", compareError);
      res.status(500).send("Error verifying password.");
    }
  });
});



function authRequired(req, res, next) {
  if (!req.session.userId) {
    const isApi = req.headers.accept?.includes("application/json") || req.url.startsWith("/api/");
    if (isApi) {
      return res.status(401).json({ error: "Not logged in" });
    } else {
      return res.redirect('/login-signup.html');
    }
  }
  next();
}



app.get('/session-check', (req, res) => {
  console.log("🔍 Incoming session-check...");
  console.log("Session ID:", req.sessionID);
  console.log("Session data:", req.session);

  if (req.session && req.session.userId) {
    res.status(200).json({ loggedIn: true, userId: req.session.userId });
  } else {
    res.status(200).json({ loggedIn: false });
  }
});


app.get('/me', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Not logged in' });
  }

  db.get('SELECT id, email FROM users WHERE id = ?', [req.session.userId], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(row);
  });
});


app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});


app.get('/', (req, res) => {
  res.send('Welcome to the Students and Check-in API!');
});

// Add student logic 
app.post('/students', authRequired,(req, res) => {
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
app.get('/students', authRequired, (req, res) => {
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
app.put('/students/:id', authRequired, (req, res) => {
  const student_id = req.params.id;
  const { student, class_ids } = req.body;
  const { s_name, parent_name, parent_email, parent_phone } = student;

  console.log(req.body);

  db.serialize(() => {
    db.run("BEGIN TRANSACTION");

    const updateSql = `
      UPDATE students 
      SET s_name = ?, parent_name = ?, parent_email = ?, parent_phone = ?
      WHERE id = ?
    `;
    const updateParams = [s_name, parent_name, parent_email, parent_phone, student_id];

    db.run(updateSql, updateParams, function (err) {
      if (err) {
        return db.run("ROLLBACK", () => {
          res.status(500).json({ error: err.message });
        });
      }

      db.run(`DELETE FROM class_students WHERE student_id = ?`, [student_id], (err) => {
        if (err) {
          return db.run("ROLLBACK", () => {
            res.status(500).json({ error: err.message });
          });
        }

        const insertSql = `INSERT INTO class_students (class_id, student_id) VALUES (?, ?)`;
        const stmt = db.prepare(insertSql);

        class_ids.forEach(entry => {
          const ids = typeof entry === 'string'
            ? entry.split(',').map(id => id.trim())
            : [entry]; // wrap number in array
        
          ids.forEach(class_id => {
            stmt.run(class_id, student_id, (err) => {
              if (err) {
                return db.run("ROLLBACK", () => {
                  res.status(500).json({ error: err.message });
                });
              }
            });
          });
        });
        
        stmt.finalize(() => {
          db.run("COMMIT", () => {
            res.json({ message: 'Student updated successfully' });
          });
        });
      });
    });
  });
});


// Delete student logic
app.delete('/students/:id', authRequired, (req, res) => {
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
app.post('/classes', authRequired, (req, res) => {
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
app.put('/classes/:id', authRequired, (req, res) => {
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
app.get('/class-students', authRequired, (req, res) => {
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
      json_object('id', students.id, 'name', students.s_name, 'parent_name', students.parent_name, 'parent_email', students.parent_email, 'parent_phone', students.parent_phone)
    ), 
    '[]'
  ) AS students
FROM classes
LEFT JOIN class_students ON classes.id = class_students.class_id
LEFT JOIN students ON class_students.student_id = students.id AND students.id IS NOT NULL
GROUP BY classes.id;

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
app.post('/class-students', authRequired, (req, res) => {
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
  stmt.finalize(() => {
    res.json({ message: 'Student(s) enrolled in class successfully' });
  }
  );
});

  // Remove student from class
  app.delete('/class-students', authRequired, (req, res) => {
    const { class_id, student_ids } = req.body;
    console.log(req.body);
  
    if (!class_id || !Array.isArray(student_ids) || student_ids.length === 0) {
      return res.status(400).json({ error: 'Missing or invalid class_id or student_ids' });
    }
  
    // Prepare SQL statement
    const sql = `DELETE FROM class_students WHERE class_id = ? AND student_id = ?`;
    const stmt = db.prepare(sql);
  
    student_ids.forEach(student_id => {
      stmt.run(class_id, student_id, (err) => {
        if (err) {
          console.error(`Error removing student ${student_id} from class ${class_id}:`, err.message);
          return res.status(500).json({ error: err.message });
        }
      });
    });
  
    stmt.finalize(() => {
      res.json({ message: 'Student(s) removed from class successfully' });
    });
  });
  

// get check-in logic
app.get('/check-in', authRequired, (req, res) => {
  db.all('SELECT * FROM checkin', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});
// add check-in logic 
app.post('/check-in', authRequired, (req, res) => {
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


