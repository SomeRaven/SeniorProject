document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("add-student-form");

    if (!form) {
        console.error("Form with ID 'add-student-form' not found.");
        return;
    }

    document.getElementById('logout-button').addEventListener('click', function () {
        logout();
    });    
    
    function logout() {
        localStorage.removeItem('userLoggedIn'); 
        console.log("✅ Logging out...");
        window.location.href = "login-signup.html"; // ✅ send them back to login
      }

    // Fetch classes from the backend and populate the dropdown
    fetch("/classes")
        .then(response => response.json())
        .then(data => {
            const classesDropdown = document.getElementById("classes-dropdown");
            data.forEach(classData => {
                const option = document.createElement("option");
                option.value = classData.class_id;
                option.textContent = classData.class_name;
                classesDropdown.appendChild(option);
            });
        })
        .catch(error => {
            console.error("Error fetching classes:", error);
        });

    form.addEventListener("submit", function (event) {
        event.preventDefault();

        // Ensure all form elements exist before accessing their values
        const s_name = document.getElementById("s_name");
        const parent_name = document.getElementById("parent_name");
        const parent_email = document.getElementById("parent_email");
        const parent_phone = document.getElementById("parent_phone");

        if (!s_name || !parent_name || !parent_email || !parent_phone) {
            console.error("One or more form fields are missing.");
            return;
        }

        // Collect student data
        const studentData = {
            s_name: s_name.value.trim(),
            parent_name: parent_name.value.trim(),
            parent_email: parent_email.value.trim(),
            parent_phone: parent_phone.value.trim()
        };

        // Collect selected class IDs
        const classElements = document.querySelectorAll(".classes-dropdown");
        const selectedClassIds = Array.from(classElements)
            .flatMap(el => Array.from(el.selectedOptions).map(option => option.value))
            .filter(Boolean);  // Remove any empty values

        if (selectedClassIds.length === 0) {
            alert("Please select at least one class.");
            return;
        }

        // Construct the final payload
        const payload = {
            student: studentData,
            class_ids: selectedClassIds  // Send an array of selected class IDs
        };
        console.log("Adding student with payload:", payload);

        fetch("/students", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload),
            credentials: "include" // Include cookies in the request

        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                console.error("Error adding student:", data.error);
                alert("Error adding student. Please try again.");
            } else {
                console.log("Student added successfully:", data);
                alert("Student added successfully!");
                form.reset();
            }
        })
        .catch(error => {
            console.error("Error adding student:", error);
            alert("Error adding student. Please try again.");
        });
    });

    // Add extra class dropdown logic
    const addAnotherClassButton = document.getElementById("add-another-class");
    const classesDropdown = document.getElementById("classes-dropdown");

    if (!form || !classesDropdown) {
        console.error("Error: Form or class dropdown not found.");
        return;
    }

    addAnotherClassButton.addEventListener("click", function (event) {
        event.preventDefault();

        const newClassDropdown = classesDropdown.cloneNode(true);
        newClassDropdown.id = ""; // Remove ID to avoid duplicates

        const wrapperDiv = document.createElement("div");
        wrapperDiv.classList.add("class-wrapper");
        wrapperDiv.appendChild(newClassDropdown);

        form.insertBefore(wrapperDiv, addAnotherClassButton);
    });
});
