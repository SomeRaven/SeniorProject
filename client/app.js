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
        const date = now.toLocaleDateString();
        const time = now.toLocaleTimeString();

        const student_id = document.querySelector("#student-number").value;

        const data = {
            student_id,
            date,
            time
        };

        console.log("The check-in data:", data);

        fetch("http://localhost:8080/check-in", {
            method: "POST",
            body: JSON.stringify(data),
            headers: {
                "Content-Type": "application/json"
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Student ID not found');
            }
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
            setTimeout(() => {
                errorElement.style.display = "none";
            }, 3000); 
        }
    }

    // Add event listener for check-in button
    var addButton = document.getElementById("check-in-button");
    if (addButton) {
        addButton.onclick = checkIn;
    }

    // Add checkmark animation when check-in is successful
    function showCheckmarkAnimation() {
        const checkmark = document.getElementById("checkmark-icon");
        checkmark.classList.add("checkmark-animation");
        setTimeout(() => {
            checkmark.classList.remove("checkmark-animation");
        }, 600); 
    }

    // Fetch and display students dynamically from server
    let allStudents = []; 
    let currentSort = "id"; 

    function fetchStudents() {
        fetch("http://localhost:8080/students")
            .then(response => response.json())
            .then(students => {
                allStudents = students; 
                sortAndDisplayStudents(); 
            })
            .catch(error => console.error("Error fetching students:", error));
    }

    function displayStudents(students) {
        const studentContainer = document.querySelector(".student-list");
        studentContainer.innerHTML = ""; 

        students.forEach(student => {
            const studentRow = document.createElement("div");
            studentRow.classList.add("student-row");

            const emailParts = student.parent_email.split("@");
            const formattedEmail = `${emailParts[0]}<br>@${emailParts[1]}`;

            studentRow.innerHTML = `
                <i class="fa-solid fa-circle-user fa-5x" style="color: #d8dadf;"></i>
                <h3 class="koho-light">${student.id}</h3>
                <h3 class="koho-light">${student.s_name}</h3>
                <h3 class="koho-light">${student.class_name}</h3>
                <h3 class="koho-light">${student.parent_name}</h3>
                <h3 class="koho-light">${formattedEmail}</h3>
                <h3 class="koho-light">${student.parent_phone}</h3>
            `;

            studentContainer.appendChild(studentRow);
        });
    }

    // **Sorting Function**
    function sortAndDisplayStudents() {
        let sortedStudents = [...allStudents]; 
        sortedStudents.sort((a, b) => {
            if (currentSort === "id") {
                return a.id.localeCompare(b.id);
            } else if (currentSort === "name") {
                return a.s_name.localeCompare(b.s_name); 
            } else if (currentSort === "class") {
                return a.class_name.localeCompare(b.class_name);
            }
            return 0;
        });

        displayStudents(sortedStudents);
    }

    // **Handle Sorting Changes**
    document.getElementById("sort-select").addEventListener("change", function (event) {
        currentSort = event.target.value;
        sortAndDisplayStudents();
    });

    // **Search Function (Filters & Sorts Results)**
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

    // **Attach event listener for search**
    document.getElementById("search-bar").addEventListener("input", searchStudents);

    fetchStudents();

});


