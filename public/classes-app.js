document.addEventListener("DOMContentLoaded", function () {
    let currentClassSort = "class_name"; // Initialize with a default sorting criterion

    const logoutBtn = document.getElementById('logout-button');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            try {
                await fetch("/logout", {
                    method: "GET",
                    credentials: "include"
                });
            } catch (err) {
                console.warn("Logout request failed:", err);
            }

            localStorage.removeItem('userLoggedIn');
            console.log("✅ Logging out...");
            window.location.href = "login-signup.html";
        });
    } else {
        console.warn("❌ Logout button not found on this page.");
    }

    function fetchClasses() {
        fetch("/class-students", {
            credentials: "include"
        })
        .then(response => {
            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error("401");
                }
                return response.text().then(text => {
                    throw new Error(`Unexpected error: ${text}`);
                });
            }
            return response.json();
        })
        .then(classes => {
            allClasses = classes;
            console.log("Fetched classes:", classes);
            sortAndDisplayClasses(); // Sort and display upon fetching
        })
        .catch(error => {
            console.error("Error fetching classes:", error);
            if (error.message === "401") {
                alert("Your session has expired. Please log in again.");
                window.location.href = "login-signup.html";
            } else {
                alert("Something went wrong loading classes.");
            }
        });
        }

          
        document.getElementById('logout-button').addEventListener('click', function () {
            logout();
        });    
        
        async function logout() {
            try {
                await fetch("/logout", {
                    method: "GET",
                    credentials: "include"
                });
            } catch (err) {
                console.warn("Could not contact server for logout. Proceeding anyway.");
            }
        
            localStorage.removeItem('userLoggedIn');
            console.log("✅ Logging out...");
            window.location.href = "login-signup.html";
        }

    function displayClasses(classes) {
        const classContainer = document.getElementById("class-container");
        classContainer.innerHTML = ""; // Clear previous content

        classes.forEach(cls => {
            const studentRows = cls.students
            .filter(student => student.id !== null)
            .map(student => `
                <div class="student-row">
                    <p><strong>ID:</strong> </br>${student.id}</p>
                    <p><strong>Name:</strong> </br>${student.name}</p>
                    <p><strong>Parent Name:</strong> </br> ${student.parent_name}</p>
                    <p><strong>Parent Email:</strong></br> ${student.parent_email}</p>
                    <p><strong>Parent Phone:</strong> </br>${student.parent_phone}</p>
                    <button class="removeStudent" data-class-id="${cls.class_id}" data-student-id="${student.id}">Remove Student</button>
                </div>
            `).join('');


            classContainer.innerHTML += `
                <div class="class-item" data-class-id="${cls.class_id}">
                    <h2 class="class-name">${cls.class_name}</h2>
                    <p class="teacher">${cls.teacher}</p>
                    <p class="location">${cls.location}</p>
                    <p class="meeting-day">${cls.meeting_day}</p>
                    <p class="time">${cls.time}</p>
                    <p class="semester">${cls.semester}</p>
                    <h3>Students:</h3>
                    ${studentRows}
                    <button class="addStudent" data-class-id="${cls.class_id}">Add A Student</button>
                    <button class="editClassButton" data-class-id="${cls.class_id}">Edit Class</button>
                    <button class="deleteClassButton" data-class-id="${cls.class_id}">Delete Class</button>
                    <button class="submit-button" data-class-id="${cls.class_id}" style="display:none;">Submit</button>
                </div>
            `;
        });

        document.querySelectorAll(".editClassButton").forEach(button => {
            button.onclick = function () {
                const classId = this.dataset.classId;
                editClass(classId);
            };
        });
        document.querySelectorAll(".deleteClassButton").forEach(button => {
            button.onclick = function () {
                const classId = this.dataset.classId;
                if (confirm(`Are you sure you want to delete this class?`)) {
                    deleteClass(classId);
                }
            };
        });
        document.querySelectorAll(".addStudent").forEach(button => {
            button.onclick = function () {
                const classId = this.dataset.classId;
                addStudent(classId);
            };
        });
        document.querySelectorAll(".removeStudent").forEach(button => {
            button.onclick = function () {
                const classId = this.dataset.classId;
                const studentId = this.dataset.studentId;
                removeStudent(classId, studentId);
            };
        });
    }

    function sortAndDisplayClasses() {
        let sortedClasses = [...allClasses];
    
        sortedClasses.sort((a, b) => {
            if (currentClassSort === "class_name") return a.class_name.localeCompare(b.class_name);
            if (currentClassSort === "teacher") return a.teacher.localeCompare(b.teacher);
            if (currentClassSort === "semester") return a.semester.localeCompare(b.semester);
            if (currentClassSort === "meeting_day") return a.meeting_day.localeCompare(b.meeting_day);
            return 0;
        });
    
        displayClasses(sortedClasses);
    }

    // Event listener for sorting dropdown
    document.getElementById("class-sort-select").addEventListener("change", function (event) {
        currentClassSort = event.target.value; // Update the sort criterion
        sortAndDisplayClasses();
    });
    
    // Search functionality for classes
    function searchClasses() {
        const query = document.getElementById("class-search-bar").value.toLowerCase().trim();
        const filteredClasses = allClasses.filter(cls =>
            cls.class_name.toLowerCase().includes(query) ||
            cls.teacher.toLowerCase().includes(query) ||
            cls.location.toLowerCase().includes(query) ||
            cls.semester.toLowerCase().includes(query) ||
            cls.meeting_day.toLowerCase().includes(query)
        );
        displayClasses(filteredClasses);
    }

    document.getElementById("class-search-bar").addEventListener("input", searchClasses);

    function editClass(classId) {
        const classCard = document.querySelector(`.class-item[data-class-id='${classId}']`);
        if (!classCard) {
            console.log("Class card not found");
            return;
        }


        // Get current class data
        const classData = {
            name: classCard.querySelector('.class-name').textContent,
            teacher: classCard.querySelector('.teacher').textContent,
            location: classCard.querySelector('.location').textContent,
            meetingDay: classCard.querySelector('.meeting-day').textContent,
            time: classCard.querySelector('.time').textContent,
            semester: classCard.querySelector('.semester').textContent
        };

        // Replace text elements with input fields
        classCard.querySelector('.class-name').outerHTML = `
            <input class="class-name-input" value="${classData.name}">
        `;
        classCard.querySelector('.teacher').outerHTML = `
            <input class="teacher-input" value="${classData.teacher}">
        `;
        classCard.querySelector('.location').outerHTML = `
            <input class="location-input" value="${classData.location}">
        `;
        classCard.querySelector('.meeting-day').outerHTML = `
            <input class="meeting-day-input" value="${classData.meetingDay}">
        `;
        classCard.querySelector('.time').outerHTML = `
            <input class="time-input" value="${classData.time}">
        `;
        classCard.querySelector('.semester').outerHTML = `
            <input class="semester-input" value="${classData.semester}">
        `;

        const submitButton = classCard.querySelector('.submit-button');
        submitButton.style.display = 'block';


        // Hide edit and delete buttons
        classCard.querySelector('.editClassButton').style.display = 'none';
        classCard.querySelector('.deleteClassButton').style.display = 'none';

        submitButton.onclick = async function () {
            const updatedClass = {
                class_name: classCard.querySelector('.class-name-input').value,
                teacher: classCard.querySelector('.teacher-input').value,
                location: classCard.querySelector('.location-input').value,
                meeting_day: classCard.querySelector('.meeting-day-input').value,
                time: classCard.querySelector('.time-input').value,
                semester: classCard.querySelector('.semester-input').value
            };

            try {
                const response = await fetch(`/classes/${classId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updatedClass),
                    credentials: "include" // Include cookies in the request

                });

                if (!response.ok) throw new Error("Failed to update class");

                const result = await response.json();
                console.log(result.message);

                // Update memory and re-render
                const index = allClasses.findIndex(cls => cls.class_id === classId);
                if (index !== -1) {
                    allClasses[index] = { ...allClasses[index], ...updatedClass };
                }

                fetchClasses(); // Re-fetch and re-render the classes
            } catch (error) {
                console.error("Error updating class:", error);
                alert("Something went wrong while updating the class.");
            }
        };
    }
    

    function deleteClass(classId) {
        fetch(`/classes/${classId}`, {
            method: 'DELETE',
        })
        .then(response => response.json())
        .then(data => {
            console.log(data.message);
            fetchClasses(); // Refresh the list after deletion
        })
        .catch(error => console.error('Error deleting class:', error));
    }

    function addStudent(classId) {
        const studentId = prompt("Enter the Student ID to add:");
        if (!studentId) return;
    
        const trimmedId = studentId.trim();
        console.log("Adding student with ID:", trimmedId);
    
        fetch("/students", {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: "include" // Include cookies in the request
        }
        )
            .then(response => response.json())
            .then(students => {
                console.log("Fetched students:", students);
    
                const studentExists = students.some(student => String(student.student_id) === trimmedId);
                console.log("Student exists:", studentExists);
    
                if (!studentExists) {
                    alert("Student ID not found. Please enter a valid student ID.");
                    return;
                }
    
                // Proceed with adding the student
                fetch(`/class-students`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        class_id: classId,
                        student_ids: [trimmedId]
                    }),
                    credentials: "include" // Include cookies in the request

                })
                .then(response => response.json())
                .then(data => {
                    console.log("Student added:", data);
                    fetchClasses(); // Refresh class list
                })
                .catch(error => {
                    console.error("Error adding student:", error);
                });
            })
            .catch(error => {
                console.error("Error fetching students:", error);
            });
    }
    
    
    
    function removeStudent(classId, studentId) {
        fetch(`/class-students`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                class_id: classId,
                student_ids: [studentId]
            }),
            credentials: "include" // Include cookies in the request

        })
        .then(response => response.json())
        .then(data => {
            console.log("Student removed:", data);
            fetchClasses();
        })
        .catch(error => {
            console.error("Error removing student:", error);
        });
    }

    fetchClasses(); // Initial fetch
});
