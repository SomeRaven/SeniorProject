document.addEventListener("DOMContentLoaded", function () {
    // Function to update the date and time dynamically
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
    setInterval(updateDateTime, 1000); // Update every second

    // Handle navigation link highlighting
    const navLinks = document.querySelectorAll(".nav-item");
    navLinks.forEach(link => {
        if (link.href === window.location.href) {
            link.classList.add("current-page");
        }
    });

    // Check-In function
    function checkIn() {
        const now = new Date();
        const data = {
            student_id: document.querySelector("#student-number").value,
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
            if (!response.ok) throw new Error('Student ID not found');
            return response.json();
        })
        .then(data => {
            console.log('Check-in successful:', data);
            showCheckmarkAnimation();
        })
        .catch(error => {
            console.error('Error:', error);
            showErrorMessage(error.message);
        });
    }

    // Display error message
    function showErrorMessage(message) {
        const errorElement = document.getElementById("error-message");
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = "block";
            errorElement.style.fontSize = "2rem";
            setTimeout(() => errorElement.style.display = "none", 3000);
        }
    }

    // Add event listener for check-in button
    const checkInButton = document.getElementById("check-in-button");
    if (checkInButton) checkInButton.onclick = checkIn;

    // Show checkmark animation on successful check-in
    function showCheckmarkAnimation() {
        const checkmark = document.getElementById("checkmark-icon");
        checkmark.classList.add("checkmark-animation");
        setTimeout(() => checkmark.classList.remove("checkmark-animation"), 600);
    }

    function fetchClasses() {
        fetch("http://localhost:8080/class-students")
            .then(response => response.json())
            .then(classes => {
                const classContainer = document.getElementById("class-container");
    
                classContainer.innerHTML = classes.map(cls => {
                    // Create a string of HTML for each student's information
                    const studentRows = cls.students.map(student => {
                        return `
                            <div class="student-row">
                                <p><strong>ID:</strong> ${student.id}</p>
                                <p><strong>Name:</strong> ${student.name}</p>
                                <p><strong>Parent Name:</strong> ${student.parent_name}</p>
                                <p><strong>Parent Email:</strong> ${student.parent_email}</p>
                                <p><strong>Parent Phone:</strong> ${student.parent_phone}</p>
                            </div>
                        `;
                    }).join('');
    
                    return `
                        <div class="class-item">
                            <h2>${cls.class_name}</h2>
                            <p><strong>Teacher:</strong> ${cls.teacher}</p>
                            <p><strong>Location:</strong> ${cls.location}</p>
                            <p><strong>Meeting Day:</strong> ${cls.meeting_day}</p>
                            <p><strong>Time:</strong> ${cls.time}</p>
                            <p><strong>Semester:</strong> ${cls.semester}</p>
                            <h3>Students:</h3>
                            ${studentRows}
                        </div>
                    `;
                }).join('');
    
                classContainer.innerHTML = classContainer.innerHTML;
            })
            .catch(error => console.error("Error fetching classes:", error));
    }
    
    

    // Fetch and display students dynamically
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
        container.innerHTML = ""; // Clear previous content
    
        students.forEach(student => {
            // Ensure student.classes is an array before mapping
            const classNames = Array.isArray(student.classes) 
                ? student.classes.map(cls => cls.class_name).join(', ') 
                : "No classes assigned";
    
            container.innerHTML += `
                <i class="fa-solid fa-circle-user fa-5x" style="color: #d8dadf;"></i>
                <h3 class="koho-light">${student.student_id}</h3>
                <h3 class="koho-light">${student.s_name}</h3>
                <h3 class="koho-light">${classNames}</h3>
                <h3 class="koho-light">${student.parent_name}</h3>
                <h3 class="koho-light">${student.parent_email}</h3>
                <h3 class="koho-light">${student.parent_phone}</h3>
            `;
        });
    }
    

    function sortAndDisplayStudents() {
        let sortedStudents = [...allStudents];
        sortedStudents.sort((a, b) => {
            if (currentSort === "all") return (a.id || "").localeCompare(b.id || "");
            if (currentSort === "class") return (a.class_name || "").localeCompare(b.class_name || "");
            return 0;
        });
        displayStudents(sortedStudents);
    }

    // Handle sorting changes
    document.getElementById("sort-select").addEventListener("change", function (event) {
        currentSort = event.target.value;
        sortAndDisplayStudents();
    });

    // Search Function
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
    fetchClasses();
});
