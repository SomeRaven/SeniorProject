// Toggle between login and signup
function toggleAuth(form) {
    document.getElementById('login-box').classList.add('hidden');
    document.getElementById('signup-box').classList.add('hidden');
    document.getElementById(form + '-box').classList.remove('hidden');
}

// Handle login
async function handleLogin() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    console.log(email, password);
    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ email, password })
        });

        if (response.ok) {
            localStorage.setItem('userLoggedIn', 'true');
    console.log("✅ Login successful — delaying redirect...");
    document.cookie.split(";").forEach(c => console.log("🍪", c));

    
    setTimeout(() => {
        window.location.href = 'check-in.html';
    }, 2000); // wait 200ms to let cookie finalize
        } else {
            const data = await response.text();
            alert(`Login failed: ${data}`);
        }
    } catch (error) {
        alert("Network error. Please try again.");
        console.error(error);
    }
}

// Handle signup
async function handleSignup() {
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;

    try {
        const response = await fetch('/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ email, password })
        });

        if (response.ok) {
            localStorage.setItem('userLoggedIn', 'true');
            window.location.href = '/check-in.html';
        } else {
            const data = await response.text();
            alert(`Signup failed: ${data}`);
        }
    } catch (error) {
        alert("Network error. Please try again.");
        console.error(error);
    }
}
