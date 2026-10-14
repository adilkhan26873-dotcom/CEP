/**
 * PaniPuri Shop - Authentication Module
 * Handles Login, Registration, Session Management, and Password Visibility
 */

let currentUser = null;

function login() {
  const loginUser = document.getElementById('loginUser');
  const loginPass = document.getElementById('loginPass');
  const loginMessage = document.getElementById('loginMessage');
  const loginScreen = document.getElementById('loginScreen');
  const app = document.getElementById('app');
  const userPill = document.getElementById('userPill');

  const u = (loginUser.value || '').trim().toLowerCase();
  const p = loginPass.value || '';

  if (!u || !p) {
    loginMessage.textContent = 'Please enter both username and password.';
    return;
  }

  const users = DB.getUsers();
  const user = users.find(x => x.username.toLowerCase() === u && x.password === p);

  if (user) {
    currentUser = user;
    loginScreen.style.display = 'none';
    app.style.display = 'block';
    userPill.innerHTML = `👤 ${esc(user.name)}`;
    loginMessage.textContent = '';
    refresh();
  } else {
    loginMessage.textContent = 'Invalid username or password.';
  }
}

function showRegister() {
  document.getElementById('loginCard').style.display = 'none';
  document.getElementById('registerCard').style.display = 'block';
  document.getElementById('loginMessage').textContent = '';
  document.getElementById('registerMessage').textContent = '';
}

function showLogin() {
  document.getElementById('registerCard').style.display = 'none';
  document.getElementById('loginCard').style.display = 'block';
  document.getElementById('registerMessage').textContent = '';
}

function createAccount() {
  const regName = document.getElementById('regName');
  const regUser = document.getElementById('regUser');
  const regPass = document.getElementById('regPass');
  const regConfirm = document.getElementById('regConfirm');
  const registerMessage = document.getElementById('registerMessage');

  const name = regName.value.trim();
  const u = regUser.value.trim().toLowerCase();
  const p = regPass.value;
  const c = regConfirm.value;

  if (!name || !u || !p || !c) {
    registerMessage.style.color = 'var(--danger)';
    return (registerMessage.textContent = 'Please fill all fields.');
  }

  if (!/^[A-Za-z ]+$/.test(name)) {
    registerMessage.style.color = 'var(--danger)';
    return (registerMessage.textContent = 'Full name can contain letters and spaces only.');
  }

  if (u.length < 3) {
    registerMessage.style.color = 'var(--danger)';
    return (registerMessage.textContent = 'Username must be at least 3 characters.');
  }

  if (p.length < 4) {
    registerMessage.style.color = 'var(--danger)';
    return (registerMessage.textContent = 'Password must be at least 4 characters.');
  }

  if (p !== c) {
    registerMessage.style.color = 'var(--danger)';
    return (registerMessage.textContent = 'Passwords do not match.');
  }

  const users = DB.getUsers();
  if (users.some(x => x.username.toLowerCase() === u)) {
    registerMessage.style.color = 'var(--danger)';
    return (registerMessage.textContent = 'Username already exists.');
  }

  const newUser = {
    id: Date.now(),
    name: name,
    username: u,
    password: p,
    role: 'staff'
  };

  DB.saveUser(newUser);

  registerMessage.style.color = 'var(--success)';
  registerMessage.textContent = 'Account created successfully. You can now login.';

  regName.value = '';
  regUser.value = '';
  regPass.value = '';
  regConfirm.value = '';

  setTimeout(showLogin, 900);
}

function logout() {
  currentUser = null;
  document.getElementById('app').style.display = 'none';
  const loginScreen = document.getElementById('loginScreen');
  loginScreen.style.display = 'flex';
  showLogin();
  document.getElementById('loginUser').value = '';
  document.getElementById('loginPass').value = '';
}

function togglePassword(inputId, button) {
  const input = document.getElementById(inputId);
  if (!input) return;
  const isPassword = input.type === 'password';
  input.type = isPassword ? 'text' : 'password';
  button.textContent = isPassword ? 'Hide' : 'Show';
  button.setAttribute('aria-label', isPassword ? 'Hide password' : 'Show password');
}
