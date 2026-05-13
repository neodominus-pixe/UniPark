document.addEventListener('DOMContentLoaded', async () => {
  // If already logged in, skip the login page
  const { data: { session } } = await db.auth.getSession();
  if (session) {
    window.location.href = 'dashboard.html';
    return;
  }

  document.getElementById('login-form').addEventListener('submit', handleLogin);
});

async function handleLogin(e) {
  e.preventDefault();
  clearMessage();

  const email    = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  if (!email || !password) {
    showMessage('Please enter your email and password.', 'error');
    return;
  }

  const btn = document.getElementById('login-btn');
  btn.disabled    = true;
  btn.textContent = 'Signing in…';

  const { error } = await db.auth.signInWithPassword({ email, password });

  if (error) {
    showMessage('Invalid credentials. Please try again.', 'error');
    btn.disabled    = false;
    btn.textContent = 'Sign In';
    return;
  }

  window.location.href = 'dashboard.html';
}

function showMessage(text, type) {
  const el = document.getElementById('form-message');
  el.textContent   = text;
  el.className     = `form-message ${type}`;
  el.style.display = 'block';
}

function clearMessage() {
  const el = document.getElementById('form-message');
  el.style.display = 'none';
  el.textContent   = '';
}
