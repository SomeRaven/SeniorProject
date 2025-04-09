This is a web application that manages students, classes, and check-ins using an Express.js backend with a SQLite database. Below is an overview of the components and functionality of the application:

### Overview
The app provides endpoints to manage students, classes, and check-ins for the Utah Tech STEM Outreach Center. It allows the creation of students, classes, and their associations, as well as tracking student check-ins.

#### Backend (Express.js and SQLite)
1. **Student Management:**
   - `POST /students`: Add a new student with associated classes.
   - `GET /students`: Retrieve a list of all students along with their class information.

2. **Class Management:**
   - `POST /classes`: Add a new class.
   - `GET /classes`: Retrieve a list of all classes, including student enrollment details.

3. **Class-Student Association:**
   - `POST /class-students`: Link students to classes (this route isn't currently in use).
   - `GET /class-students`: Retrieve classes with student enrollment details.

4. **Check-in Management:**
   - `POST /check-in`: Log a student's check-in with the current time and date (logic is partially implemented).

#### SQLite Database:
The database consists of the following tables:
- **students**: Stores student information (ID, name, parent contact).
- **classes**: Stores class information (ID, name, teacher, location, schedule).
- **class_students**: Associates students with their enrolled classes.
- **checkin**: Logs the check-in records for students.

#### Frontend (HTML, CSS, and JavaScript)
1. **Dynamic Date and Time:**
   - Displays the current date and time on the check-in page, updating every second.

2. **Student Management:**
   - Displays a list of students and their associated classes, sortable by different criteria.
   - Includes a search feature to filter students by name, class, or parent details.

3. **Class Management:**
   - Displays all classes along with the students enrolled in each class.
   - Provides the ability to add students to classes dynamically.

4. **Check-in Feature:**
   - Allows students to check in with a real-time clock, sending data to the server to log the check-in.

5. **Form Handling:**
   - Includes forms to add students and assign them to classes, dynamically populated with class data from the server.

6. **UI Enhancements:**
   - The application includes animations, such as a checkmark animation upon successful check-in.

#### Key Technologies:
- **Backend**: Express.js, SQLite, CORS, Cookie Parsing
- **Frontend**: HTML, CSS, JavaScript (Fetch API for dynamic data handling)
- **Database**: SQLite for storing students, classes, and check-ins.

#### Features to Implement:
- Finish the check-in functionality.
- Finalize student and class search/filtering logic.

This app provides a simple yet effective way to manage students, classes, and track their attendance via check-ins, with a user-friendly interface and dynamic data interactions.
# SeniorProject
Student management software for the STEM Outreach Center
- [X] Check in check out
- [X] display information about students
- [X] In depth data
- [ ] Admin, Staff, Parent Profiles
- [X] Student look up
- [ ] Exporting data
- [ ] Exporting data using theses user stories
      - [ ] "as the director, I want to pull gender data going back 5 years"
      - [ ] "as a staff member, I want to pull my class data"
      - [ ] "as an admin, I want to export check in data"
<<<<<<< HEAD
- [ ] Semester by semester data (only want this semesters student data displayed but keep old data.) 
=======
<<<<<<< HEAD
- [ ] Semester by semester data (only want this semesters student data displayed but keep old data.) 
=======
      - [ ] "as a really cool iPad, I want to be able to check students in" 
- [ ] Semester by semester data (only want this semesters student data displayed but keep old data.)
- [x] Data Rebase
- [x] Fix frontend to match data rebase
>>>>>>> c821bc6b851edc9271cba51790bf645556d2eeef
>>>>>>> 60f2c2888dfa7afd8999aa01f03a04ed5bb6f2d8
