# 🐴 Kid Wrangler

Kid Wrangler is a full-stack web application designed to help administrators efficiently manage students, classes, and check-in systems for educational programs like afterschool STEM centers. Built with SQLite, Node.js, and vanilla JavaScript, the app provides simple interfaces for login, student/class management, and data export.

---

## ✨ Features

- 🔐 **User Authentication** – Secure login and signup using hashed passwords and session cookies.
- 🧍 **Student Management** – Add, edit, and delete student profiles; assign them to classes.
- 📚 **Class Management** – Create and manage classes with teacher info, meeting times, and locations.
- ✅ **Check-In System** – Scan or enter student ID for attendance tracking; supports multiple classes per student.
- 📦 **Data Export** – Export class/student data as CSV or JSON.
- 📄 **Help Page** – Built-in FAQ and troubleshooting tips for users.

---

## 🛠 Tech Stack

- **Frontend:** HTML, CSS (KoHo font styling), vanilla JS
- **Backend:** Node.js, Express, SQLite
- **Authentication:** express-session, bcrypt
- **Other tools:** Font Awesome, localStorage, cookie/session handling

---

## 📁 Project Structure

```
.
├── client/
│   ├── login-signup.html
│   ├── check-in.html
│   ├── students.html
│   ├── classes.html
│   ├── add-student.html
│   ├── add-class.html
│   ├── profile.html
│   ├── export-admin.html
│   ├── help.html
│   ├── style.css
│   ├── app.js
│   ├── add-student.js
│   ├── add-class.js
│   ├── classes-app.js
│   ├── signin-signout.js
│   └── assets/
│       └── cowboy.png, user.png
├── server.js
├── database.sqlite
└── README.md
```

---

## 🚀 How to Run

1. **Clone the repo**
   ```bash
   git clone https://github.com/yourusername/kid-wrangler.git
   cd kid-wrangler
   ```

2. **Install dependencies**
   ```bash
   npm install express sqlite3 cors bcrypt express-session cookie-parser
   ```

3. **Start the server**
   ```bash
   node server.js
   ```

4. **Visit the app**
host html files through 
   ```
   http://localhost:5500/client/login-signup.html
   ```

---

## 🔐 Authentication

- Users must sign up and log in to access any functionality.
- Session-based authentication with cookie storage ensures secure access.

---

## 📤 Export Options

Go to `export-admin.html` to export student data by class or as a full list:
- 📄 CSV
- 🧾 JSON

Only students with valid IDs are included in exports.

---

## 🧪 Dev Notes

- Uses client-side validation for forms.
- Responsive design for most admin tasks.
- Default admin display name: `Admin` 

---

## 📬 Contact

Need help or want to contribute?

Email: [support@kidwrangler.com](mailto:support@kidwrangler.com)

---

Made with 💙 at the STEM Center
