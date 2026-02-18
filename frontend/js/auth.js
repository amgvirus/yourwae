// Handle login
async function handleLogin(event) {
  event.preventDefault();

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const errorMsg = document.getElementById('errorMessage');
  const successMsg = document.getElementById('successMessage');

  // Hide previous messages
  errorMsg.style.display = 'none';
  successMsg.style.display = 'none';

  if (!email || !password) {
    errorMsg.textContent = 'Please fill in all fields';
    errorMsg.style.display = 'block';
    return;
  }

  const result = await window.fastGetApp.login(email, password);

  if (result.success) {
    successMsg.textContent = 'Login successful! Redirecting...';
    successMsg.style.display = 'block';
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 1500);
  } else {
    errorMsg.textContent = 'Error: ' + result.error;
    errorMsg.style.display = 'block';
  }
}

// Handle Google login
async function handleGoogleLogin() {
  alert('Google login coming soon!');
}

// Redirect if already logged in - REMOVED (Handled by app.js listener)

