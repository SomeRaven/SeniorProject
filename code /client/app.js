document.addEventListener("DOMContentLoaded", function () {
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
    
        fetch("http://localhost:8080/check-in", {
            method: "POST",
            body: JSON.stringify(data),
            headers: { "Content-Type": "application/json" }
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

    function fetchStudents() {
        fetch("http://localhost:8080/students")
            .then(response => response.json())
            .then(students => {
                allStudents = students;
                console.log("Fetched students:", students);
                sortAndDisplayStudents();
            })
            .catch(error => console.error("Error fetching students:", error));
    }

    function displayStudents(students) {
        const container = document.getElementById('student-row');
        container.innerHTML = ""; 
    
        students.forEach(student => {
            const classNames = Array.isArray(student.classes) 
                ? student.classes.map(cls => cls.class_name).join(', ') 
                : "No classes assigned";
    
            container.innerHTML += `
                <i class="fa-solid fa-circle-user fa-5x" style="color: #d8dadf;"></i>
                <h3 class="koho-light student-id">${student.student_id}</h3>
                <h3 class="koho-light student-name">${student.s_name}</h3>
                <h3 class="koho-light student-class">${classNames}</h3>
                <h3 class="koho-light parent-name">${student.parent_name}</h3>
                <h3 class="koho-light parent-email">${student.parent_email.replace('@', '</br>@')}</h3>
                <h3 class="koho-light parent-phone">${student.parent_phone.replace(/^(\d{3})/, '$1</br>')}</h3>
                <button class="koho-light edit-button" data-student-id="${student.student_id}">Edit</button>
            `;
        });
    
        document.querySelectorAll(".edit-button").forEach(button => {
            button.onclick = function () {
                const studentId = this.dataset.studentId;
                console.log("Clicked edit for:", studentId);
                editStudent(studentId);
            };
        });
    }
    
    function editStudent(studentId) {
        const student = allStudents.find(s => s.student_id === studentId);
        if (!student) return;
        const classNames = Array.isArray(student.classes) 
                ? student.classes.map(cls => cls.class_name).join(', ') 
                : "No classes assigned";
    
                
        // Find the student's DOM elements
        const parent = document.querySelector(`button[data-student-id="${studentId}"]`).parentElement;
        const nameElement = parent.querySelector('.student-name');
        const classElement = parent.querySelector('.student-class');
        const parentNameElement = parent.querySelector('.parent-name');
        
        // Create input fields for editing
        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.value = student.s_name;
        nameInput.className = 'edit-input';
    
        const classInput = document.createElement('input');
        classInput.type = 'text';
        classInput.value = classNames;
        classInput.className = 'edit-input';
    
        const parentNameInput = document.createElement('input');
        parentNameInput.type = 'text';
        parentNameInput.value = student.parent_name;
        parentNameInput.className = 'edit-input';
    
        nameElement.replaceWith(nameInput);
        classElement.replaceWith(classInput);
        parentNameElement.replaceWith(parentNameInput);
    
        // Change "Edit" button to "Submit"
        const editButton = parent.querySelector('.edit-button');
        editButton.textContent = 'Submit';
    
        // On submit, send the updated data to the server via PUT request
        editButton.onclick = function () {
            // Get the new values from the input fields
            student.s_name = nameInput.value;
            student.class_name = classInput.value;
            student.parent_name = parentNameInput.value;
    
            // Prepare the PUT request body
            const updatedStudentData = {
                s_name: student.s_name,
                parent_name: student.parent_name,
                parent_email: student.parent_email,
                parent_phone: student.parent_phone,
                class_ids: student.classes.map(cls => cls.id) // Assuming class relationships are stored in student.classes
            };
    
            // Send the PUT request to the server
            fetch(`http://localhost:8080/students/${studentId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedStudentData)
            })
            .then(response => response.json())
            .then(data => {
                console.log('Student updated:', data);
                // Update the DOM to reflect the changes
                const updatedNameElement = document.createElement('h3');
                updatedNameElement.className = 'koho-light student-name';
                updatedNameElement.textContent = student.s_name;
    
                const updatedClassElement = document.createElement('h3');
                updatedClassElement.className = 'koho-light student-class';
                updatedClassElement.textContent = student.class_name;
    
                const updatedParentNameElement = document.createElement('h3');
                updatedParentNameElement.className = 'koho-light parent-name';
                updatedParentNameElement.textContent = student.parent_name;
    
                nameInput.replaceWith(updatedNameElement);
                classInput.replaceWith(updatedClassElement);
                parentNameInput.replaceWith(updatedParentNameElement);
    
                // Change the button text back to "Edit"
                editButton.textContent = 'Edit';
                editButton.onclick = function () {
                    editStudent(studentId);
                };
            })
            .catch(error => {
                console.error('Error updating student:', error);
                alert('Error updating student');
            });
        };
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
            student.class_name.toLowerCase().includes(query) ||
            student.parent_name.toLowerCase().includes(query) ||
            student.parent_email.toLowerCase().includes(query) ||
            student.parent_phone.includes(query)
        );
        displayStudents(filteredStudents);
    }

    document.getElementById("search-bar").addEventListener("input", searchStudents);

    // Initial Data Fetch
    fetchStudents();
});
