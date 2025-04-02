document.addEventListener("DOMContentLoaded", function () {
    let allClasses = [];
    let currentClassSort = "class_name"; // Default sorting by class name
    
    function fetchClasses() {
        fetch("http://localhost:8080/class-students")
            .then(response => response.json())
            .then(classes => {
                allClasses = classes;
                console.log("Fetched classes:", classes);
                sortAndDisplayClasses(); // Sort and display upon fetching
            })
            .catch(error => console.error("Error fetching classes:", error));
    }
    
    function displayClasses(classes) {
        const classContainer = document.getElementById("class-container");
        classContainer.innerHTML = ""; // Clear previous content
    
        classes.forEach(cls => {
            const studentRows = cls.students.map(student => `
                <div class="student-row">
                    <p><strong>ID:</strong> ${student.id}</p>
                    <p><strong>Name:</strong> ${student.name}</p>
                    <p><strong>Parent Name:</strong> ${student.parent_name}</p>
                    <p><strong>Parent Email:</strong> ${student.parent_email}</p>
                    <p><strong>Parent Phone:</strong> ${student.parent_phone}</p>
                </div>
            `).join('');
    
            classContainer.innerHTML += `
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
        });
    }
    
    function sortAndDisplayClasses() {
        let sortedClasses = [...allClasses];
    
        sortedClasses.sort((a, b) => {
            if (currentClassSort === "class_name") return a.class_name.localeCompare(b.class_name);
            if (currentClassSort === "teacher") return a.teacher.localeCompare(b.teacher);
            if (currentClassSort === "semester") return a.semester.localeCompare(b.semester);
            if (currentClassSort === "meeting_day") return a.meeting_day.localeCompare(b.meeting_day);
            return 0;
        });
    
        displayClasses(sortedClasses);
    }
    
    // Event listener for sorting dropdown
    document.getElementById("class-sort-select").addEventListener("change", function (event) {
        currentClassSort = event.target.value;
        sortAndDisplayClasses();
    });
    
    // Fetch and display classes on page load
    fetchClasses();
    

// Search functionality for classes
function searchClasses() {
    const query = document.getElementById("class-search-bar").value.toLowerCase().trim();
    const filteredClasses = allClasses.filter(cls =>
        cls.class_name.toLowerCase().includes(query) ||
        cls.teacher.toLowerCase().includes(query) ||
        cls.location.toLowerCase().includes(query) ||
        cls.semester.toLowerCase().includes(query) ||
        cls.meeting_day.toLowerCase().includes(query) 
    );
    displayClasses(filteredClasses);
}

// Event listener for search input
document.getElementById("class-search-bar").addEventListener("input", searchClasses);

// Fetch and display classes on page load
fetchClasses();

});