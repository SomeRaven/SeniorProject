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
