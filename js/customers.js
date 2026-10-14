/**
 * PaniPuri Shop - Customer Management Module
 * Handles Customer Directory, Profiles, Contact Validation, and Records
 */

function renderCustomers() {
  const data = DB.getData();
  const customerBody = document.getElementById('customerBody');
  if (!customerBody) return;

  if (!data.customers.length) {
    customerBody.innerHTML = '<tr><td colspan="5" class="empty">No customers registered yet.</td></tr>';
    return;
  }

  const rows = data.customers.map((c, i) => `
    <tr>
      <td><b>${esc(c.name)}</b></td>
      <td>${esc(c.phone || '—')}</td>
      <td>${esc(c.email || '—')}</td>
      <td>${esc(c.address || '—')}</td>
      <td class="actions">
        <button class="btn danger" onclick="deleteCustomer(${i})">Delete</button>
      </td>
    </tr>
  `).join('');

  customerBody.innerHTML = rows;
}

function openCustomer() {
  const modal = document.getElementById('customerModal');
  const cName = document.getElementById('cName');
  const cPhone = document.getElementById('cPhone');
  const cEmail = document.getElementById('cEmail');
  const cAddress = document.getElementById('cAddress');

  modal.style.display = 'flex';
  cName.value = '';
  cPhone.value = '';
  cEmail.value = '';
  if (cAddress) cAddress.value = '';
}

function saveCustomer() {
  const cName = document.getElementById('cName');
  const cPhone = document.getElementById('cPhone');
  const cEmail = document.getElementById('cEmail');
  const cAddress = document.getElementById('cAddress');

  const name = cName.value.trim();
  const phone = cPhone.value.trim();
  const email = cEmail.value.trim();
  const address = cAddress ? cAddress.value.trim() : '';

  if (!name) {
    alert('Please enter a customer name.');
    return;
  }

  if (phone && !/^\d{10}$/.test(phone)) {
    alert('Please enter a valid 10-digit phone number (numbers only).');
    return;
  }

  const data = DB.getData();
  data.customers.push({
    id: Date.now(),
    name: name,
    phone: phone,
    email: email,
    address: address
  });

  DB.persist();
  closeModal('customerModal');
  refresh();
}

function deleteCustomer(index) {
  if (confirm('Are you sure you want to delete this customer record?')) {
    const data = DB.getData();
    data.customers.splice(index, 1);
    DB.persist();
    refresh();
  }
}
