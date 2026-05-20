const fallbackTimer = setTimeout(() => showView('invalid-view'), 3000);

db.auth.onAuthStateChange((event) => {
  if (event === 'PASSWORD_RECOVERY') {
    clearTimeout(fallbackTimer);
    showView('reset-view');
  }
});

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('save-btn').addEventListener('click', handleSetPassword);
  document.getElementById('pwd-toggle-1').addEventListener('click', () =>
    togglePwd('new-password', 'pwd-toggle-1'));
  document.getElementById('pwd-toggle-2').addEventListener('click', () =>
    togglePwd('confirm-password', 'pwd-toggle-2'));
});

async function handleSetPassword() {
  const password = document.getElementById('new-password').value;
  const confirm  = document.getElementById('confirm-password').value;

  if (!password || password.length < 6) {
    showMessage('Password must be at least 6 characters.', 'error');
    return;
  }
  if (password !== confirm) {
    showMessage('Passwords do not match.', 'error');
    return;
  }

  const btn = document.getElementById('save-btn');
  btn.disabled    = true;
  btn.textContent = 'Saving…';

  const { error } = await db.auth.updateUser({ password });

  if (error) {
    showMessage('Failed to update password. Please request a new reset link.', 'error');
    btn.disabled    = false;
    btn.textContent = 'Set New Password';
    return;
  }

  showMessage('Password updated! Redirecting…', 'success');
  setTimeout(() => { window.location.href = 'dashboard.html'; }, 1500);
}

function togglePwd(inputId, btnId) {
  const input    = document.getElementById(inputId);
  const btn      = document.getElementById(btnId);
  const isHidden = input.type === 'password';
  input.type = isHidden ? 'text' : 'password';
  btn.setAttribute('aria-label', isHidden ? 'Hide password' : 'Show password');
  btn.querySelector('.eye-show').style.display = isHidden ? 'none' : '';
  btn.querySelector('.eye-hide').style.display = isHidden ? ''     : 'none';
}

function showView(id) {
  ['verify-view', 'invalid-view', 'reset-view'].forEach(v => {
    document.getElementById(v).style.display = v === id ? 'block' : 'none';
  });
}

function showMessage(text, type) {
  const el = document.getElementById('reset-message');
  el.textContent   = text;
  el.className     = `form-message ${type}`;
  el.style.display = 'block';
}
