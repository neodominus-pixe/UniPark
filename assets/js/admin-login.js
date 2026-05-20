document.addEventListener('DOMContentLoaded', async () => {
  const { data: { session } } = await db.auth.getSession();
  if (session) {
    window.location.href = 'dashboard.html';
    return;
  }

  document.getElementById('login-form').addEventListener('submit', handleLogin);
  document.getElementById('pwd-toggle').addEventListener('click', togglePassword);
  document.getElementById('forgot-link').addEventListener('click', showForgotView);
  document.getElementById('back-link').addEventListener('click', showLoginView);
  document.getElementById('reset-btn').addEventListener('click', handleForgotPassword);
});

async function handleLogin(e) {
  e.preventDefault();
  clearMessage('form-message');

  const email    = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  if (!email || !password) {
    showMessage('form-message', 'Please enter your email and password.', 'error');
    return;
  }

  const btn = document.getElementById('login-btn');
  btn.disabled    = true;
  btn.textContent = 'Signing in…';

  const { error } = await db.auth.signInWithPassword({ email, password });

  if (error) {
    showMessage('form-message', 'Invalid credentials. Please try again.', 'error');
    btn.disabled    = false;
    btn.textContent = 'Sign In';
    return;
  }

  window.location.href = 'dashboard.html';
}

function togglePassword() {
  const input    = document.getElementById('password');
  const btn      = document.getElementById('pwd-toggle');
  const isHidden = input.type === 'password';
  input.type = isHidden ? 'text' : 'password';
  btn.setAttribute('aria-label', isHidden ? 'Hide password' : 'Show password');
  btn.querySelector('.eye-show').style.display = isHidden ? 'none' : '';
  btn.querySelector('.eye-hide').style.display = isHidden ? ''     : 'none';
}

function showForgotView() {
  document.getElementById('login-view').style.display  = 'none';
  document.getElementById('forgot-view').style.display = 'block';
  clearMessage('forgot-message');
}

function showLoginView() {
  document.getElementById('forgot-view').style.display = 'none';
  document.getElementById('login-view').style.display  = 'block';
  clearMessage('form-message');
}

async function handleForgotPassword() {
  const email = document.getElementById('reset-email').value.trim();

  if (!email) {
    showMessage('forgot-message', 'Please enter your email address.', 'error');
    return;
  }

  const btn = document.getElementById('reset-btn');
  btn.disabled    = true;
  btn.textContent = 'Sending…';

  const redirectTo = window.location.origin + '/admin/reset-password.html';
  const { error }  = await db.auth.resetPasswordForEmail(email, { redirectTo });

  btn.disabled    = false;
  btn.textContent = 'Send Reset Link';

  if (error) {
    showMessage('forgot-message', 'Failed to send reset email. Please try again.', 'error');
    return;
  }

  showMessage('forgot-message', 'Reset link sent! Check your inbox.', 'success');
}

function showMessage(id, text, type) {
  const el = document.getElementById(id);
  el.textContent   = text;
  el.className     = `form-message ${type}`;
  el.style.display = 'block';
}

function clearMessage(id) {
  const el = document.getElementById(id);
  el.style.display = 'none';
  el.textContent   = '';
}
