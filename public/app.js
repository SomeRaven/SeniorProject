document.addEventListener("DOMContentLoaded", function () {

    const logoutBtn = document.getElementById('logout-button');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            try {
                await fetch("logout", {
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

    function updateDateTime() {
        const now = new Date();
        const dateElement = document.querySelector("#check-in h2:nth-of-type(1)");
        const timeElement = document.querySelector("#check-in h2:nth-of-type(2)");

        if (dateElement) {
            dateElement.textContent = now.toLocaleDateString();
        }
        if (timeElement) {
            timeElement.textContent = now.toLocaleTimeString();
        }
    }

    updateDateTime();
    setInterval(updateDateTime, 1000); 

    const navLinks = document.querySelectorAll(".nav-item");
    navLinks.forEach(link => {
        if (link.href === window.location.href) {
            link.classList.add("current-page");
        }
    });

    // Check-In function
    function checkIn() {
        const now = new Date();
        const studentId = document.querySelector("#student-number").value;
    
        if (!studentId) {
            showErrorMessage("Please enter a student ID.");
            return;
        }
    
        const data = {
            student_id: studentId,
            date: now.toLocaleDateString(),
            time: now.toLocaleTimeString()
        };
    
        console.log("The check-in data:", data);
    
        fetch("/check-in", {
            method: "POST",
            body: JSON.stringify(data),
            headers: { "Content-Type": "application/json" },
            credentials: "include",
        })
        .then(response => {
            if (!response.ok) return response.json().then(err => { throw new Error(err.error || "Check-in failed"); });
            return response.json();
        })
        .then(responseData => {
            console.log('Check-in successful:', responseData);
            showCheckmarkAnimation();
        })
        .catch(error => {
            console.error('Error:', error);
            showErrorMessage(error.message);
        });
    }
    

    function showErrorMessage(message) {
        const errorElement = document.getElementById("error-message");
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = "block";
            errorElement.style.fontSize = "2rem";
            setTimeout(() => errorElement.style.display = "none", 3000);
        }
    }

    const checkInButton = document.getElementById("check-in-button");
    if (checkInButton) checkInButton.onclick = checkIn;

    function showCheckmarkAnimation() {
        const checkmark = document.getElementById("checkmark-icon");
        checkmark.classList.add("checkmark-animation");
        setTimeout(() => checkmark.classList.remove("checkmark-animation"), 600);
    }

    

    let allStudents = [];
    let currentSort = "id";

    fetch("/students", {
        credentials: "include"
      })
        .then(response => {
          if (!response.ok) throw new Error(`Status: ${response.status}`);
          return response.json();
        })
        .then(students => {
          allStudents = students;
          console.log("Fetched students:", students);
          sortAndDisplayStudents();
        })
        .catch(error => {
          console.error("Error fetching students:", error);
          if (String(error).includes("401")) {
            alert("Session expired. Please log in again.");
            window.location.href = "login-signup.html";
          }
        });
      

    function displayStudents(students) {
        const container = document.getElementById('student-row');
        container.innerHTML = ""; 
    
        students.forEach(student => {
            const classNames = Array.isArray(student.classes) 
                ? student.classes.map(cls => cls.class_name).join(', ') 
                : "No classes assigned";
    
                container.innerHTML += `
                <div class="student-column" data-student-id="${student.student_id}">
                    <i class="fa-solid fa-circle-user fa-5x" style="color: #d8dadf;"></i>
                    <h3 class="koho-light student-id">${student.student_id}</h3>
                    <h3 class="koho-light student-name">${student.s_name.replace(' ', '</br>')}</h3>
                    <h3 class="koho-light student-class">${classNames}</h3>
                    <h3 class="koho-light parent-name">${student.parent_name.replace(' ', '</br>')}</h3>
                    <h3 class="koho-light parent-email">${student.parent_email.replace('@', '</br>@')}</h3>
                    <h3 class="koho-light parent-phone">${student.parent_phone.replace(/^(\d{3})/, '$1</br>')}</h3>
                    
                    <!-- Wrap Edit and Delete buttons inside a div -->
                    <div class="button-container">
                        <button class="koho-light edit-button" data-student-id="${student.student_id}">Edit</button>
                        <button class="koho-light delete-button" data-student-id="${student.student_id}">Delete</button>
                    </div>
                    
                    <input type="hidden" class="student-name" value="${student.s_name}">
                    <input type="hidden" class="parent-name" value="${student.parent_name}">
                    <input type="hidden" class="parent-email" value="${student.parent_email}">
                    <input type="hidden" class="parent-phone" value="${student.parent_phone}">
                    <button type="hidden" class="koho-light submit-button" data-student-id="${student.student_id}">Submit</button>
                </div>
            `;
            
        });
    
        document.querySelectorAll(".edit-button").forEach(button => {
            button.onclick = function () {
                const studentId = this.dataset.studentId;
                console.log("Clicked edit for:", studentId);
                console.log("Parent element:", this.parentElement);
                console.log("Student data:", allStudents.find(s => s.student_id === studentId));
                editStudent(studentId);
            };
        });
        document.querySelectorAll(".delete-button").forEach(button => {
            button.onclick = function () {
                const studentId = this.dataset.studentId;
                if (confirm(`Are you sure you want to delete student ${studentId}?`)) {
                    deleteStudent(studentId);
                }
            };
        });
        
    }
    
    function editStudent(studentId) {
        const studentCard = [...document.querySelectorAll('.student-column')]
            .find(card => card.querySelector('.edit-button').dataset.studentId === studentId);
    
        if (!studentCard) return;
    
        // Get current values from hidden inputs
        const student = {
            name: studentCard.querySelector('input.student-name').value,
            parentName: studentCard.querySelector('input.parent-name').value,
            parentEmail: studentCard.querySelector('input.parent-email').value,
            parentPhone: studentCard.querySelector('input.parent-phone').value
        };
    
        // Replace text elements with input fields
        studentCard.querySelector('.student-name').outerHTML = `
            <input class="student-name-input koho-light" value="${student.name}">
        `;
        studentCard.querySelector('.parent-name').outerHTML = `
            <input class="parent-name-input koho-light" value="${student.parentName}">
        `;
        studentCard.querySelector('.parent-email').outerHTML = `
            <input class="parent-email-input koho-light" value="${student.parentEmail}">
        `;
        studentCard.querySelector('.parent-phone').outerHTML = `
            <input class="parent-phone-input koho-light" value="${student.parentPhone}">
        `;
    
        const submitButton = studentCard.querySelector('.submit-button');
        submitButton.type = 'button';
        submitButton.style.display = 'inline-block';
    
        const editButton = studentCard.querySelector('.edit-button');
        editButton.style.display = 'none';
    
        const buttonContainer = studentCard.querySelector('.button-container');
        buttonContainer.style.display = 'none'; // Hide the entire button container (Edit + Delete buttons)
    
        // Now studentCard is defined and you can use it within the async block
        submitButton.onclick = async function () {
            try {
                const class_ids = await getClassIdsForStudent(studentId);
    
                const updatedStudent = {
                    student: {
                        s_name: studentCard.querySelector('.student-name-input').value,
                        parent_name: studentCard.querySelector('.parent-name-input').value,
                        parent_email: studentCard.querySelector('.parent-email-input').value,
                        parent_phone: studentCard.querySelector('.parent-phone-input').value
                    },
                    class_ids
                };
    
                const response = await fetch(`/students/${studentId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(updatedStudent),
                    credentials: "include" // Include cookies in the request

                });
    
                if (!response.ok) throw new Error("Failed to update student");
    
                const result = await response.json();
                console.log(result.message);
    
                // Update memory and re-render
                const index = allStudents.findIndex(s => s.student_id === studentId);
                if (index !== -1) {
                    allStudents[index] = { ...allStudents[index], ...updatedStudent.student };
                }
    
                displayStudents(allStudents); // re-render with fresh data
    
                // After editing, show the button container again
                const updatedStudentCard = document.querySelector(`.student-column[data-student-id='${studentId}']`);
                const updatedButtonContainer = updatedStudentCard.querySelector('.button-container');
                updatedButtonContainer.style.display = 'block'; // Show the button container again
    
            } catch (err) {
                console.error("Error updating student:", err);
                alert("Something went wrong while updating the student.");
            }
        };
    }

    async function deleteStudent(studentId) {
        // Delete the student from the server
        const deleteResponse = await fetch(`/students/${studentId}`, {
            method: "DELETE",
            credentials: "include" // Include cookies in the request

        });
    
        if (!deleteResponse.ok) throw new Error("Failed to delete student");
    
        const data = await deleteResponse.json();
        console.log(data.message);
    
        // Remove from local array and update UI
        allStudents = allStudents.filter(s => s.student_id !== studentId);
        displayStudents(allStudents);
    }
    
    
    
    
    
    
    async function getClassIdsForStudent(studentId) {
        try {
            const response = await fetch('/classes');
            const classes = await response.json();
    
            const studentClasses = classes.filter(cls =>
                cls.students.some(student => String(student.id) === String(studentId))
            );
    
            return studentClasses.map(cls => cls.class_id);
        } catch (error) {
            console.error("Error fetching classes for student:", error);
            return [];
        }
    }
    
    
                
    
    function sortAndDisplayStudents() {
        let sortedStudents = [...allStudents];
        sortedStudents.sort((a, b) => {
            if (currentSort === "") return (a.id || "").localeCompare(b.id || "");
            if (currentSort === "class") return (a.class_name || "").localeCompare(b.class_name || "");
            return 0;
        });
        displayStudents(sortedStudents);
    }

    document.getElementById("sort-select").addEventListener("change", function (event) {
        currentSort = event.target.value;
        sortAndDisplayStudents();
    });
    

    function searchStudents() {
        const query = document.getElementById("search-bar").value.toLowerCase().trim();
        const filteredStudents = allStudents.filter(student =>
            student.s_name.toLowerCase().includes(query) ||
            (student.class_name && student.class_name.toLowerCase().includes(query)) ||
            student.parent_name.toLowerCase().includes(query) ||
            student.parent_email.toLowerCase().includes(query) ||
            student.parent_phone.includes(query)
        );
        displayStudents(filteredStudents);
    }
    
    document.getElementById("search-bar").addEventListener("input", searchStudents);
    
    async function loadCurrentUser() {
        try {
            const res = await fetch('/me', {
                method: 'GET',
                credentials: 'include'
            });
            if (!res.ok) throw new Error("Failed to fetch user");
    
            const user = await res.json();
    
            const sidebarName = document.getElementById("user-name");
            const profileEmail = document.getElementById("email");
            const profileName = document.getElementById("name");
    
            if (sidebarName) sidebarName.textContent = user.email.split("@")[0];
            if (profileEmail) profileEmail.value = user.email;
            if (profileName) profileName.value = user.email.split("@")[0];
        } catch (err) {
            console.error("Error loading user:", err);
        }
    }
    
    document.addEventListener("DOMContentLoaded", () => {
        loadCurrentUser();
    });
    
    // Logout function   
    
    function logout() {
        localStorage.removeItem('userLoggedIn'); 
        console.log("✅ Logging out...");
        window.location.href = "login-signup.html"; // ✅ send them back to login
      }


    // Initial Data Fetch
    fetchStudents();
});
