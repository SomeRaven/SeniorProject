document.addEventListener("DOMContentLoaded", function () {


// Add event listener for the add student form
document.getElementById("add-student-form").addEventListener("submit", function(event) {
    event.preventDefault();
    
    const studentData = {
        s_name: document.getElementById("s_name").value,
        class_name: document.getElementById("class_name").value,
        parent_name: document.getElementById("parent_name").value,
        parent_email: document.getElementById("parent_email").value, 
        parent_phone: document.getElementById("parent_phone").value
    };
    
    fetch("http://localhost:8080/students", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(studentData)
    })
    .then(response => response.json())
    .then(data => {
        console.log("Student added successfully:", data);
        alert("Student added successfully!");
        document.getElementById("add-student-form").reset();
    })
    .catch(error => {
        console.error("Error adding student:", error);
        alert("Error adding student. Please try again.");
    });
});
});