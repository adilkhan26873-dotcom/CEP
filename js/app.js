/**
 * PaniPuri Shop - Main Application Controller
 * Handles Navigation, Lifecycle Events, Modals, System Clock, and View Orchestration
 */

function showPage(id, btn) {
  // Hide all pages
  document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));

  // Activate target page
  const target = document.getElementById(id);
  if (target) target.classList.add('active');

  // Update navigation buttons
  document.querySelectorAll('.nav button').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');

  // Update topbar title
  const pageTitle = document.getElementById('pageTitle');
  if (pageTitle && btn) {
    const text = btn.innerText.replace(/[^a-zA-Z ]/g, '').trim();
    pageTitle.textContent = text;
  }

  refresh();
}

function showPageById(id) {
  const btn = [...document.querySelectorAll('.nav button')].find(b =>
    b.getAttribute('onclick')?.includes("'" + id + "'")
  );
  if (btn) {
    showPage(id, btn);
  }
}

function refresh() {
  renderInventory();
  renderProductSelect();
  renderCustomers();
  renderDashboard();
  renderReports();
  renderBill();
  if (typeof renderIngredients === 'function') {
    renderIngredients();
  }
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.style.display = 'none';
}

function formatDate(dateInput) {
  try {
    return new Date(dateInput).toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  } catch (e) {
    return String(dateInput);
  }
}

function updateClock() {
  const clockEl = document.getElementById('clock');
  if (clockEl) {
    clockEl.textContent = new Date().toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'medium'
    });
  }
}

function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, match => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }[match]));
}

// Global modal close on backdrop click or Escape key
window.addEventListener('click', function (e) {
  if (e.target.classList.contains('modal')) {
    e.target.style.display = 'none';
  }
});

window.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal').forEach(m => (m.style.display = 'none'));
  }
});

// App Startup
document.addEventListener('DOMContentLoaded', function () {
  setInterval(updateClock, 1000);
  updateClock();

  // Handle Enter key on login form
  const loginPass = document.getElementById('loginPass');
  if (loginPass) {
    loginPass.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') login();
    });
  }

  // Handle Enter key on search
  const productSearch = document.getElementById('productSearch');
  if (productSearch) {
    productSearch.addEventListener('input', renderInventory);
  }
});
