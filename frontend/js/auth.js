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

  // Wait for app.js to be ready
  if (!window.fastGetApp) {
    errorMsg.textContent = 'App is still loading, please wait...';
    errorMsg.style.display = 'block';
    let waited = 0;
    while (!window.fastGetApp && waited < 5000) {
      await new Promise(r => setTimeout(r, 100));
      waited += 100;
    }
    if (!window.fastGetApp) {
      errorMsg.textContent = 'App failed to load. Please refresh the page.';
      return;
    }
    errorMsg.style.display = 'none';
  }

  try {
    const result = await window.fastGetApp.login(email, password);

    if (result.success) {
      successMsg.textContent = 'Login successful! Redirecting...';
      successMsg.style.display = 'block';

      // Redirect immediately based on role (app.js already sets the role during login)
      const role = window.fastGetApp.currentUserRole;
      if (role === 'store') {
        window.location.href = 'seller-dashboard.html';
      } else {
        window.location.href = 'index.html';
      }
    } else {
      // Check for email-not-confirmed error
      const errText = result.error || '';
      if (errText.toLowerCase().includes('email not confirmed')) {
        errorMsg.textContent = 'Please check your email and click the confirmation link, then try logging in again.';
      } else if (errText.toLowerCase().includes('invalid login credentials')) {
        errorMsg.textContent = 'Wrong email or password. Please try again.';
      } else {
        errorMsg.textContent = 'Error: ' + errText;
      }
      errorMsg.style.display = 'block';
    }
  } catch (e) {
    console.error('Login handler error:', e);
    errorMsg.textContent = 'Login failed: ' + (e.message || 'Unknown error');
    errorMsg.style.display = 'block';
  }
}

// Handle Google login
async function handleGoogleLogin() {
  alert('Google login coming soon!');
}

// Redirect if already logged in
document.addEventListener('DOMContentLoaded', async () => {
  // Wait for app.js auth to be ready
  if (!window.fastGetApp) {
    let waited = 0;
    while (!window.fastGetApp && waited < 5000) {
      await new Promise(r => setTimeout(r, 100));
      waited += 100;
    }
    if (!window.fastGetApp) return;
  }

  try {
    await window.fastGetApp.authReadyPromise;
    const user = window.fastGetApp.currentUser;
    const role = window.fastGetApp.currentUserRole;
    if (user) {
      if (role === 'store') {
        window.location.href = 'seller-dashboard.html';
      } else {
        window.location.href = 'index.html';
      }
    }
  } catch (e) {
    console.error('Auth check error:', e);
  }
});
