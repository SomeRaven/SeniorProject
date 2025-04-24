document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("add-class-form");

    if (!form) {
        console.error("Form with ID 'add-class-form' not found.");
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
    

    form.addEventListener("submit", async function (event) {
        event.preventDefault(); // Prevent form submission refresh

        // Get form elements
        const className = document.getElementById("class_name")?.value.trim();
        const teacher = document.getElementById("teacher_name")?.value.trim();
        const semester = document.getElementById("semester")?.value.trim();
        const meetingDay = document.getElementById("meeting_day")?.value.trim();
        const time = document.getElementById("time")?.value.trim();
        const location = document.getElementById("class_location")?.value.trim();

        // Check for missing fields
        if (!className || !teacher || !semester || !meetingDay || !time || !location) {
            console.error("Missing required fields!", { className, teacher, semester, meetingDay, time, location });
            alert("Please fill in all required fields.");
            return;
        }

        // Construct request payload
        const classData = {
            class_name: className,
            teacher: teacher,
            semester: semester,
            meeting_day: meetingDay,
            time: time,
            location: location
        };

        console.log("🚀 Sending class data:", classData);
        try {
            const response = await fetch("http://localhost:8080/classes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(classData),
                credentials: "include" // Include cookies in the request
            });
        
            const contentType = response.headers.get("content-type");
        
            let result;
            if (contentType && contentType.includes("application/json")) {
                result = await response.json();
            } else {
                const text = await response.text();
                console.error("❌ Expected JSON but got:", text);
                throw new Error("Server did not return JSON");
            }
        
            if (!response.ok) {
                console.error("❌ Server Error:", result);
                alert(`Error: ${result.message || "Failed to add class."}`);
                return;
            }
        
            console.log("✅ Class added successfully:", result);
            alert("Class added successfully!");
            form.reset();
        
        } catch (error) {
            console.error("❌ Network error:", error);
            alert("An error occurred while adding the class. Please try again.");
        }        
    });
});
