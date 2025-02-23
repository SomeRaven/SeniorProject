document.addEventListener("DOMContentLoaded", function () {
    function handleLogin() {
        const email = document.getElementById("login-email").value;
        const password = document.getElementById("login-password").value;
        console.log("Logging in with:", { email, password });
        alert("Login successful (mock function)");
    }

    function handleSignup() {
        const name = document.getElementById("signup-name").value;
        const email = document.getElementById("signup-email").value;
        const password = document.getElementById("signup-password").value;
        console.log("Signing up with:", { name, email, password });
        alert("Signup successful (mock function)");
    }

    function toggleAuth(authType) {
        document.getElementById("login-box").classList.toggle("hidden", authType === "signup");
        document.getElementById("signup-box").classList.toggle("hidden", authType === "login");
    }

    // ✅ Make functions globally accessible
    window.handleLogin = handleLogin;
    window.handleSignup = handleSignup;
    window.toggleAuth = toggleAuth;
});
