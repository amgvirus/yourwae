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
  const dateOfBirth = document.getElementById('dateOfBirth').value;
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  const role = document.querySelector('input[name="role"]:checked').value;
  const errorMsg = document.getElementById('errorMessage');
  const successMsg = document.getElementById('successMessage');

  // Hide previous messages
  errorMsg.style.display = 'none';
  successMsg.style.display = 'none';

  // Validation
  if (!firstName || !lastName || !email || !phone || !dateOfBirth || !password || !confirmPassword) {
    errorMsg.textContent = 'Please fill in all required fields';
    errorMsg.style.display = 'block';
    return;
  }

  // Basic DOB validation and friendly age feedback
  const dobDate = dateOfBirth ? new Date(dateOfBirth) : null;
  if (!dobDate || Number.isNaN(dobDate.getTime())) {
    errorMsg.textContent = 'Please enter a valid date of birth';
    errorMsg.style.display = 'block';
    return;
  }

  const today = new Date();
  let age = today.getFullYear() - dobDate.getFullYear();
  const m = today.getMonth() - dobDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dobDate.getDate())) {
    age--;
  }

  if (age < 0 || age > 120) {
    errorMsg.textContent = 'Please double-check your date of birth';
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
  const storeLocation = role === 'store' ? document.getElementById('storeLocation').value.trim() : '';
  const storeGPS = role === 'store' ? document.getElementById('storeGPS').value.trim() : '';

  // Store owner specific validation
  if (role === 'store' && (!storeName || !storeCategory || !storeLocation || !storeGPS)) {
    errorMsg.textContent = 'Please fill in all store details including Location and GPS Address';
    errorMsg.style.display = 'block';
    return;
  }

  const signupBtn = document.querySelector('#signupForm button[type="submit"]');
  const loadingOverlay = document.getElementById('signupLoadingOverlay');

  // Show loading overlay and disable form
  if (loadingOverlay) loadingOverlay.classList.add('active');
  if (signupBtn) { signupBtn.disabled = true; signupBtn.textContent = 'Creating...'; }

  try {
    const signupPromise = window.fastGetApp.signup(
      email,
      password,
      firstName,
      lastName,
      phone,
      role,
      storeName,
      storeCategory,
      {
        location: storeLocation,
        gps: storeGPS,
        date_of_birth: dateOfBirth
      }
    );
    const signupTimeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Signup timed out. Please check your connection and try again.')), 35000)
    );
    const result = await Promise.race([signupPromise, signupTimeout]);

    if (result.success) {
      if (loadingOverlay) loadingOverlay.classList.remove('active');
      if (signupBtn) { signupBtn.disabled = false; signupBtn.textContent = 'Create Account'; }
      if (result.needsConfirmation) {
        successMsg.textContent = 'Account created! Please check your email to confirm your account, then log in.';
        successMsg.style.display = 'block';
        setTimeout(() => { window.location.href = 'login.html'; }, 3000);
      } else {
        successMsg.textContent = 'Account created! Redirecting...';
        successMsg.style.display = 'block';
        sessionStorage.setItem('fromLogin', '1');
        if (role === 'store') {
          window.location.href = 'seller-dashboard.html';
        } else {
          window.location.href = 'index.html';
        }
      }
    } else {
      if (result.alreadyRegistered) {
        errorMsg.innerHTML = 'This email is already registered. <a href="login.html" style="color: #007bff; text-decoration: underline;">Click here to log in</a>';
      } else {
        errorMsg.textContent = 'Error: ' + result.error;
      }
      errorMsg.style.display = 'block';
    }
  } catch (e) {
    console.error('Signup handler error:', e);
    errorMsg.textContent = 'Signup failed: ' + (e.message || 'Unknown error');
    errorMsg.style.display = 'block';
  } finally {
    if (loadingOverlay) loadingOverlay.classList.remove('active');
    if (signupBtn) { signupBtn.disabled = false; signupBtn.textContent = 'Create Account'; }
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
