// Update role UI
function updateRoleUI() {
  const role = document.querySelector('input[name="role"]:checked').value;
  const storeFields = document.getElementById('storeFields');

  if (role === 'store') {
    storeFields.style.display = 'block';
  } else {
    storeFields.style.display = 'none';
  }
}

// Handle signup
async function handleSignup(event) {
  event.preventDefault();

  const firstName = document.getElementById('firstName').value.trim();
  const lastName = document.getElementById('lastName').value.trim();
  const email = document.getElementById('email').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  const role = document.querySelector('input[name="role"]:checked').value;
  const errorMsg = document.getElementById('errorMessage');
  const successMsg = document.getElementById('successMessage');

  // Hide previous messages
  errorMsg.style.display = 'none';
  successMsg.style.display = 'none';

  // Validation
  if (!firstName || !lastName || !email || !phone || !password || !confirmPassword) {
    errorMsg.textContent = 'Please fill in all required fields';
    errorMsg.style.display = 'block';
    return;
  }

  if (password !== confirmPassword) {
    errorMsg.textContent = 'Passwords do not match';
    errorMsg.style.display = 'block';
    return;
  }

  if (password.length < 8) {
    errorMsg.textContent = 'Password must be at least 8 characters';
    errorMsg.style.display = 'block';
    return;
  }

  // Strong password validation (required by Supabase)
  const hasLowercase = /[a-z]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasDigit = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"|<>?,./`~]/.test(password);

  if (!hasLowercase || !hasUppercase || !hasDigit || !hasSpecial) {
    let missing = [];
    if (!hasLowercase) missing.push('a lowercase letter');
    if (!hasUppercase) missing.push('an uppercase letter');
    if (!hasDigit) missing.push('a number');
    if (!hasSpecial) missing.push('a special character (!@#$%^&*)');
    errorMsg.textContent = 'Password must include: ' + missing.join(', ');
    errorMsg.style.display = 'block';
    return;
  }

  if (!/^\d{10}$/.test(phone.replace(/\D/g, ''))) {
    errorMsg.textContent = 'Please enter a valid 10-digit phone number';
    errorMsg.style.display = 'block';
    return;
  }

  // Wait for app.js to be ready
  if (!window.fastGetApp) {
    errorMsg.textContent = 'App is loading, please wait...';
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

  const storeName = role === 'store' ? document.getElementById('storeName').value.trim() : '';
  const storeCategory = role === 'store' ? document.getElementById('storeCategory').value : '';

  // Show loading state
  successMsg.textContent = 'Creating your account...';
  successMsg.style.display = 'block';

  try {
    const result = await window.fastGetApp.signup(email, password, firstName, lastName, phone, role, storeName, storeCategory);

    if (result.success) {
      if (result.needsConfirmation) {
        // Email confirmation actually needed
        successMsg.textContent = 'Account created! Please check your email to confirm your account, then log in.';
        successMsg.style.display = 'block';
        setTimeout(() => {
          window.location.href = 'login.html';
        }, 3000);
      } else {
        // Auto-login succeeded — redirect immediately
        successMsg.textContent = 'Account created! Redirecting...';
        successMsg.style.display = 'block';
        if (role === 'store') {
          window.location.href = 'seller-dashboard.html';
        } else {
          window.location.href = 'index.html';
        }
      }
    } else {
      successMsg.style.display = 'none';
      // Handle "already registered" with a helpful message + login link
      if (result.alreadyRegistered) {
        errorMsg.innerHTML = 'This email is already registered. <a href="login.html" style="color: #007bff; text-decoration: underline;">Click here to log in</a>';
      } else {
        errorMsg.textContent = 'Error: ' + result.error;
      }
      errorMsg.style.display = 'block';
    }
  } catch (e) {
    console.error('Signup handler error:', e);
    successMsg.style.display = 'none';
    errorMsg.textContent = 'Signup failed: ' + (e.message || 'Unknown error');
    errorMsg.style.display = 'block';
  }
}

// Redirect if already logged in
document.addEventListener('DOMContentLoaded', async () => {
  // Wait for app.js to be ready
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
    if (window.fastGetApp.currentUser) {
      if (window.fastGetApp.currentUserRole === 'store') {
        window.location.href = 'seller-dashboard.html';
      } else {
        window.location.href = 'index.html';
      }
    }
  } catch (e) {
    console.error('Auth check error:', e);
  }
});
