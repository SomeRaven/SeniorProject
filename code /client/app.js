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
                <div class="student-column">
                    <i class="fa-solid fa-circle-user fa-5x" style="color: #d8dadf;"></i>
                    <h3 class="koho-light student-id">${student.student_id}</h3>
                    <h3 class="koho-light student-name">${student.s_name}</h3>
                    <h3 class="koho-light student-class">${classNames}</h3>
                    <h3 class="koho-light parent-name">${student.parent_name}</h3>
                    <h3 class="koho-light parent-email">${student.parent_email.replace('@', '</br>@')}</h3>
                    <h3 class="koho-light parent-phone">${student.parent_phone.replace(/^(\d{3})/, '$1</br>')}</h3>
                    <button class="koho-light edit-button" data-student-id="${student.student_id}">Edit</button>
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
    }
    
    function editStudent(studentId) {
        const student = allStudents.find(s => s.student_id === studentId);
        if (!student) return;
    
        // Find the student's DOM elements using studentId
        const parent = document.querySelector(`button[data-student-id="${studentId}"]`).parentElement;
        const nameElement = parent.querySelector('.student-name');
        const parentNameElement = parent.querySelector('.parent-name');
        const emailElement = parent.querySelector('.parent-email');
        const phoneElement = parent.querySelector('.parent-phone');
        const editButton = parent.querySelector(`button[data-student-id="${studentId}"]`);
    
        // Check if the button is in "Edit" mode or "Submit" mode
        if (editButton.textContent === "Edit") {
            // Create input fields for editing
            const nameInput = document.createElement('input');
            nameInput.type = 'text';
            nameInput.value = student.s_name;
            nameInput.className = 'edit-input';
    
            const parentNameInput = document.createElement('input');
            parentNameInput.type = 'text';
            parentNameInput.value = student.parent_name;
            parentNameInput.className = 'edit-input';
    
            const parentEmailInput = document.createElement('input');
            parentEmailInput.type = 'text';
            parentEmailInput.value = student.parent_email;
            parentEmailInput.className = 'edit-input';
    
            const parentPhoneInput = document.createElement('input');
            parentPhoneInput.type = 'text';
            parentPhoneInput.value = student.parent_phone;
            parentPhoneInput.className = 'edit-input';
    
            // Replace text elements with input fields
            nameElement.replaceWith(nameInput);
            parentNameElement.replaceWith(parentNameInput);
            emailElement.replaceWith(parentEmailInput);
            phoneElement.replaceWith(parentPhoneInput);
    
            // Change button text to "Submit"
            editButton.textContent = "Submit";
    
            // Store the input fields in the button's dataset for later use
            editButton.dataset.inputs = JSON.stringify({
                nameInput,
                parentNameInput,
                parentEmailInput,
                parentPhoneInput,
            });

            console.log(nameInput.value, parentNameInput.value, parentEmailInput.value, parentPhoneInput.value);
        } else if (editButton.textContent === "Submit") {
            // Retrieve the input fields from the button's dataset
            const inputs = JSON.parse(editButton.dataset.inputs);
    console.log(inputs);

    
            // Ensure all inputs are valid and not undefined
            if (
                !inputs.nameInput || !inputs.parentNameInput || !inputs.parentEmailInput || !inputs.parentPhoneInput
            ) {
                console.error("Inputs are not valid:", inputs);
                return;
            }
    
            // Update the student object with new values
            student.s_name = inputs.nameInput.value;
            student.parent_name = inputs.parentNameInput.value;
            student.parent_email = inputs.parentEmailInput.value;
            student.parent_phone = inputs.parentPhoneInput.value;
    
            // Prepare the PUT request body
            const updatedStudentData = {
                s_name: student.s_name,
                parent_name: student.parent_name,
                parent_email: student.parent_email,
                parent_phone: student.parent_phone,
            };
    
            // Send the PUT request to the server
            fetch(`http://localhost:8080/students/${studentId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedStudentData),
            })
                .then(response => response.json())
                .then(data => {
                    console.log('Student updated:', data);
    
                    // Replace input fields with updated text elements
                    const newNameElement = document.createElement('h2');
                    newNameElement.className = 'student-name';
                    newNameElement.textContent = student.s_name;
    
                    const newParentNameElement = document.createElement('h2');
                    newParentNameElement.className = 'parent-name';
                    newParentNameElement.textContent = student.parent_name;
    
                    const newEmailElement = document.createElement('h2');
                    newEmailElement.className = 'parent-email';
                    newEmailElement.textContent = student.parent_email;
    
                    const newPhoneElement = document.createElement('h2');
                    newPhoneElement.className = 'parent-phone';
                    newPhoneElement.textContent = student.parent_phone;
    
                    nameInput.replaceWith(newNameElement);
                    parentNameInput.replaceWith(newParentNameElement);
                    parentEmailInput.replaceWith(newEmailElement);
                    parentPhoneInput.replaceWith(newPhoneElement);
    
                    // Change button text back to "Edit"
                    editButton.textContent = "Edit";
                })
                .catch(error => {
                    console.error('Error updating student:', error);
                });
        }
    }
    
    
    
    function getClassIdsForStudent(studentId) {
        // Fetch classes from the server
        return fetch('http://localhost:8080/classes')
            .then(response => response.json())
            .then(classes => {
                // Filter the classes that the student is enrolled in
                const studentClasses = classes.filter(cls => 
                    cls.students.some(student => student.id === studentId)
                );
    
                // Return an array of class IDs for the student
                return studentClasses.map(cls => cls.class_id);
            })
            .catch(error => {
                console.error("Error fetching classes for student:", error);
                return []; // Return an empty array in case of an error
            });
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
