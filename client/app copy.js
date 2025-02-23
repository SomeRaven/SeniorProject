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
            }, 3000); // Error message display duration
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
        }, 600); // Duration of the animation (should match the CSS duration)
    }

    // Fetch and display students dynamically from server
    function fetchStudents() {
        fetch("http://localhost:8080/students")
            .then(response => response.json())
            .then(students => {
                const studentContainer = document.getElementById("content");
                students.forEach(student => {
                    const studentRow = document.createElement("div");
                    studentRow.classList.add("student-row");

                    studentRow.innerHTML = `
                        <i class="fa-solid fa-circle-user fa-5x" style="color: #d8dadf;"></i>
                        <h3 class="koho-light">${student.id}</h3>
                        <h3 class="koho-light">${student.name}</h3>
                        <h3 class="koho-light">${student.class}</h3>
                        <h3 class="koho-light">${student.parent}</h3>
                        <h3 class="koho-light">${student.email}</h3>
                        <h3 class="koho-light">${student.phone}</h3>
                    `;

                    studentContainer.appendChild(studentRow);
                });
            })
            .catch(error => console.error("Error fetching students:", error));
    }

    fetchStudents();
});
