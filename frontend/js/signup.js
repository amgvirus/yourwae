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

  if (password.length < 6) {
    errorMsg.textContent = 'Password must be at least 6 characters';
    errorMsg.style.display = 'block';
    return;
  }

  if (!/^\d{10}$/.test(phone.replace(/\D/g, ''))) {
    errorMsg.textContent = 'Please enter a valid 10-digit phone number';
    errorMsg.style.display = 'block';
    return;
  }

  const storeName = role === 'store' ? document.getElementById('storeName').value.trim() : '';
  const storeCategory = role === 'store' ? document.getElementById('storeCategory').value : '';

  const result = await window.fastGetApp.signup(email, password, firstName, lastName, phone, role, storeName, storeCategory);


  if (result.success) {
    if (result.needsConfirmation) {
      successMsg.textContent = 'Account created! Please check your email to confirm your account, then log in.';
      successMsg.style.display = 'block';
      // Redirect to login after a moment
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 3000);
    } else {
      successMsg.textContent = 'Signup successful! Redirecting...';
      successMsg.style.display = 'block';
      setTimeout(() => {
        if (role === 'store') {
          window.location.href = 'seller-dashboard.html';
        } else {
          window.location.href = 'index.html';
        }
      }, 1500);
    }
  } else {
    errorMsg.textContent = 'Error: ' + result.error;
    errorMsg.style.display = 'block';
  }
}

// Redirect if already logged in
document.addEventListener('DOMContentLoaded', async () => {
  await window.fastGetApp.authReadyPromise;
  if (window.fastGetApp.currentUser) {
    if (window.fastGetApp.currentUserRole === 'store') {
      window.location.href = 'seller-dashboard.html';
    } else {
      window.location.href = 'index.html';
    }
  }
});
