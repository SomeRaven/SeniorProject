import { createApp, ref } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js';

createApp({
  setup() {
    const email = ref('');
    const password = ref('');
    const error = ref('');

    const login = async () => {
      if (!email.value || !password.value) {
        error.value = "Please enter email and password.";
        return;
      }

      try {
        const response = await fetch('/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include', // 🔐 Important for setting the cookie
          body: JSON.stringify({ email: email.value, password: password.value })
        });

        if (!response.ok) {
          const msg = await response.text();
          error.value = msg || "Login failed.";
          return;
        }

        window.location.href = '/check-in.html';
      } catch (err) {
        error.value = 'Network error';
        console.error(err);
      }
    };

    return { email, password, error, login };
  },
  template: `
    <div style="max-width: 400px; margin: 100px auto; font-family: sans-serif;">
      <h1>Login</h1>
      <input v-model="email" type="email" placeholder="Email" style="width:100%; padding:10px; margin:10px 0;" />
      <input v-model="password" type="password" placeholder="Password" style="width:100%; padding:10px; margin:10px 0;" />
      <button @click="login" style="width:100%; padding:10px;">Log In</button>
      <p v-if="error" style="color:red; margin-top:10px;">{{ error }}</p>
    </div>
  `
}).mount('#app');
