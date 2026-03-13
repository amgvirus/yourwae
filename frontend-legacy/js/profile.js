async function loadProfile() {
  const errorBox = document.getElementById('profileError');
  const successBox = document.getElementById('profileSuccess');
  const firstNameInput = document.getElementById('profileFirstName');
  const lastNameInput = document.getElementById('profileLastName');
  const emailInput = document.getElementById('profileEmail');
  const phoneInput = document.getElementById('profilePhone');
  const dobInput = document.getElementById('profileDob');
  const roleSpan = document.getElementById('profileRole');
  const ageInfoSpan = document.getElementById('profileAgeInfo');

  errorBox.style.display = 'none';
  successBox.style.display = 'none';

  try {
    await window.fastGetApp.authReadyPromise;

    const user = window.fastGetApp.currentUser;
    if (!user) {
      errorBox.textContent = 'Please login to view your profile.';
      errorBox.style.display = 'block';
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 1800);
      return;
    }

    const result = await window.fastGetApp.getProfile();
    if (!result.success) {
      throw new Error(result.error || 'Could not load profile');
    }

    const profile = result.profile;
    firstNameInput.value = profile.firstName || '';
    lastNameInput.value = profile.lastName || '';
    emailInput.value = profile.email || '';
    phoneInput.value = profile.phone || '';
    if (profile.dateOfBirth) {
      dobInput.value = profile.dateOfBirth;
    }

    // UI Updates
    const roleText = profile.role ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1) : 'Customer';
    const displayName = profile.firstName ? `${profile.firstName} ${profile.lastName}` : (profile.email ? profile.email.split('@')[0] : 'User');
    const initials = window.fastGetApp.getStoreInitials(displayName);

    const roleBadge = document.getElementById('profileRoleBadge');
    const displayNameEl = document.getElementById('profileDisplayName');
    const initialsEl = document.getElementById('profileInitials');

    if (roleBadge) roleBadge.textContent = roleText;
    if (displayNameEl) displayNameEl.textContent = displayName;
    if (initialsEl) initialsEl.textContent = initials;

    const age = window.fastGetApp.getUserAgeFromMetadata();
    if (age == null) {
      ageInfoSpan.textContent = 'Not set';
    } else if (age < 18) {
      ageInfoSpan.textContent = `${age} years (Minor)`;
    } else {
      ageInfoSpan.textContent = `${age} years (Verified)`;
    }
  } catch (err) {
    console.error('loadProfile error:', err);
    errorBox.textContent = err.message || 'Could not load your profile. Please try again.';
    errorBox.style.display = 'block';
  }
}

async function handleProfileSubmit(event) {
  event.preventDefault();

  const errorBox = document.getElementById('profileError');
  const successBox = document.getElementById('profileSuccess');
  const firstNameInput = document.getElementById('profileFirstName');
  const lastNameInput = document.getElementById('profileLastName');
  const phoneInput = document.getElementById('profilePhone');
  const dobInput = document.getElementById('profileDob');
  const saveBtn = document.getElementById('saveProfileBtn');
  const ageInfoSpan = document.getElementById('profileAgeInfo');

  errorBox.style.display = 'none';
  successBox.style.display = 'none';

  const firstName = firstNameInput.value.trim();
  const lastName = lastNameInput.value.trim();
  const phone = phoneInput.value.trim();
  const dob = dobInput.value;

  if (!firstName || !lastName || !phone) {
    errorBox.textContent = 'First name, last name and phone are required.';
    errorBox.style.display = 'block';
    return;
  }

  if (!/^\d{10}$/.test(phone.replace(/\D/g, ''))) {
    errorBox.textContent = 'Please enter a valid 10-digit phone number.';
    errorBox.style.display = 'block';
    return;
  }

  if (dob) {
    const dobDate = new Date(dob);
    if (Number.isNaN(dobDate.getTime())) {
      errorBox.textContent = 'Please enter a valid date of birth.';
      errorBox.style.display = 'block';
      return;
    }
    const today = new Date();
    let age = today.getFullYear() - dobDate.getFullYear();
    const m = today.getMonth() - dobDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dobDate.getDate())) {
      age--;
    }
    if (age < 0 || age > 120) {
      errorBox.textContent = 'Please double-check your date of birth.';
      errorBox.style.display = 'block';
      return;
    }
  }

  try {
    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving...';

    const result = await window.fastGetApp.updateProfile({
      firstName,
      lastName,
      phone,
      dateOfBirth: dob || null
    });

    if (!result.success) {
      throw new Error(result.error || 'Failed to update profile');
    }

    successBox.textContent = 'Profile updated successfully.';
    successBox.style.display = 'block';

    const age = window.fastGetApp.getUserAgeFromMetadata();
    if (age == null) {
      ageInfoSpan.textContent = 'Not set – some pharmacy items may be blocked until you add this.';
    } else if (age < 18) {
      ageInfoSpan.textContent = `${age} years • Under 18 – pharmacy and other age‑restricted items will be blocked.`;
    } else {
      ageInfoSpan.textContent = `${age} years • Age‑verified for pharmacy items.`;
    }
  } catch (err) {
    console.error('handleProfileSubmit error:', err);
    errorBox.textContent = err.message || 'Could not save your profile. Please try again.';
    errorBox.style.display = 'block';
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = 'Save Changes';
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  await loadProfile();
  const form = document.getElementById('profileForm');
  if (form) {
    form.addEventListener('submit', handleProfileSubmit);
  }
});

