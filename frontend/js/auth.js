// Handle login
async function handleLogin(event) {
  event.preventDefault();

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const errorMsg = document.getElementById('errorMessage');
  const successMsg = document.getElementById('successMessage');
  const loginForm = document.getElementById('loginForm');
  const loginBtn = loginForm?.querySelector('button[type="submit"]');
  const loadingOverlay = document.getElementById('loginLoadingOverlay');

  // Hide previous messages
  errorMsg.style.display = 'none';
  successMsg.style.display = 'none';

  if (!email || !password) {
    errorMsg.textContent = 'Please fill in all fields';
    errorMsg.style.display = 'block';
    errorMsg.classList.add('shake');
    setTimeout(() => errorMsg.classList.remove('shake'), 500);
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

  // Show loading overlay and disable form
  if (loadingOverlay) loadingOverlay.classList.add('active');
  if (loginBtn) {
    loginBtn.disabled = true;
    loginBtn.textContent = 'Signing in...';
  }

  try {
    await window.fastGetApp.authReadyPromise;
    const result = await window.fastGetApp.login(email, password);

    if (result.success) {
      // Update success overlay message based on role
      const overlay = document.getElementById('loginSuccessOverlay');
      const successSub = overlay?.querySelector('.success-sub');
      const role = window.fastGetApp.currentUserRole;
      const isStore = role === 'store';

      if (successSub) {
        successSub.textContent = isStore
          ? 'Taking you to your seller dashboard...'
          : 'Taking you to explore stores...';
      }

      // Hide loading, show success overlay
      if (loadingOverlay) loadingOverlay.classList.remove('active');
      if (overlay) overlay.classList.add('active');

      sessionStorage.setItem('fromLogin', '1');

      const dest = isStore ? 'seller-dashboard.html' : 'index.html';
      setTimeout(() => {
        window.location.href = dest;
      }, 2200);
    } else {
      const errText = result.error || '';
      if (errText.toLowerCase().includes('email not confirmed')) {
        errorMsg.textContent =
          'Please check your email and click the confirmation link, then try logging in again.';
      } else if (errText.toLowerCase().includes('invalid login credentials')) {
        errorMsg.textContent = 'Wrong email or password. Please try again.';
      } else {
        errorMsg.textContent = 'Error: ' + errText;
      }
      errorMsg.style.display = 'block';
      errorMsg.classList.add('shake');
      setTimeout(() => errorMsg.classList.remove('shake'), 500);
    }
  } catch (e) {
    console.error('Login handler error:', e);
    errorMsg.textContent = 'Login failed: ' + (e.message || 'Unknown error');
    errorMsg.style.display = 'block';
    errorMsg.classList.add('shake');
    setTimeout(() => errorMsg.classList.remove('shake'), 500);
  } finally {
    if (loadingOverlay) loadingOverlay.classList.remove('active');
    if (loginBtn) {
      loginBtn.disabled = false;
      loginBtn.textContent = 'Login';
    }
  }
}

// Handle Google login
async function handleGoogleLogin() {
  alert('Google login coming soon!');
}

// Redirect if already logged in
document.addEventListener('DOMContentLoaded', async () => {
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
