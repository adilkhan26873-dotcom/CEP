/**
 * PaniPuri Shop - Billing & POS Module
 * Handles Cart Management, Stock Deduction, Invoice Generation, and Printing
 */

let currentBill = [];

function renderProductSelect() {
  const data = DB.getData();
  const select = document.getElementById('billProduct');
  if (!select) return;

  const inStockProducts = data.products.filter(p => p.stock > 0);

  if (!inStockProducts.length) {
    select.innerHTML = '<option value="">-- No products in stock --</option>';
    return;
  }

  select.innerHTML = inStockProducts
    .map(p => `<option value="${p.id}">${esc(p.name)} — ₹${p.price} (${p.stock} left)</option>`)
    .join('');
}

function addToBill() {
  const select = document.getElementById('billProduct');
  const qtyInput = document.getElementById('billQty');
  const id = +select.value;
  const q = +qtyInput.value;

  if (!id || isNaN(q) || q < 1) {
    alert('Select a valid product and enter a positive quantity.');
    return;
  }

  const data = DB.getData();
  const product = data.products.find(x => x.id === id);

  if (!product) {
    alert('Product not found.');
    return;
  }

  const existing = currentBill.find(x => x.id === id);
  const totalWanted = (existing ? existing.qty : 0) + q;

  if (totalWanted > product.stock) {
    alert(`Not enough stock available for ${product.name}. Only ${product.stock} units left.`);
    return;
  }

  if (existing) {
    existing.qty += q;
  } else {
    currentBill.push({ id: id, qty: q });
  }

  qtyInput.value = 1;
  renderBill();
}

function renderBill() {
  const billItems = document.getElementById('billItems');
  const billTotal = document.getElementById('billTotal');
  const data = DB.getData();

  if (!currentBill.length) {
    billItems.innerHTML = '<div class="empty">No items added to invoice yet.</div>';
    billTotal.textContent = '0.00';
    return;
  }

  let total = 0;
  const rows = currentBill.map((item, index) => {
    const product = data.products.find(p => p.id === item.id);
    if (!product) return '';
    const lineTotal = product.price * item.qty;
    total += lineTotal;

    return `<tr>
      <td><b>${esc(product.name)}</b></td>
      <td>${item.qty}</td>
      <td>₹${lineTotal.toFixed(2)}</td>
      <td>
        <button class="btn danger" style="padding:4px 8px;font-size:11px;" onclick="removeBillItem(${index})" title="Remove item">✕</button>
      </td>
    </tr>`;
  }).join('');

  billItems.innerHTML = `<table>
    <thead>
      <tr>
        <th>Item</th>
        <th>Qty</th>
        <th>Amount</th>
        <th></th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>`;

  billTotal.textContent = total.toFixed(2);
}

function removeBillItem(index) {
  currentBill.splice(index, 1);
  renderBill();
}

function clearBill() {
  currentBill = [];
  const cust = document.getElementById('billCustomer');
  if (cust) cust.value = '';
  renderBill();
}

function saveBill() {
  if (!currentBill.length) {
    alert('Please add at least one item to save the bill.');
    return;
  }

  const custInput = document.getElementById('billCustomer');
  const customer = (custInput ? custInput.value.trim() : '') || 'Walk-in Customer';
  const data = DB.getData();

  let total = 0;
  let itemsCount = 0;
  const billLines = [];

  // Verify stock and compute lines
  for (const item of currentBill) {
    const product = data.products.find(p => p.id === item.id);
    if (!product || product.stock < item.qty) {
      alert(`Stock shortage for ${product ? product.name : 'an item'}. Please refresh the order.`);
      return;
    }
  }

  // Deduct stock and assemble lines
  currentBill.forEach(item => {
    const product = data.products.find(p => p.id === item.id);
    product.stock -= item.qty;
    const amount = product.price * item.qty;
    total += amount;
    itemsCount += item.qty;
    billLines.push({
      id: product.id,
      name: product.name,
      price: product.price,
      qty: item.qty,
      amount: amount
    });
  });

  const billNo = 'INV-' + Math.floor(100000 + Math.random() * 900000);
  const newBill = {
    id: Date.now(),
    no: billNo,
    customer: customer,
    date: new Date().toISOString(),
    total: total,
    items: itemsCount,
    lines: billLines
  };

  data.bills.unshift(newBill);
  DB.persist();

  // Reset bill form
  clearBill();
  refresh();

  // Show Invoice preview
  showInvoiceModal(newBill);
}

function showInvoiceModal(bill) {
  const invoiceModal = document.getElementById('invoiceModal');
  const invoicePreview = document.getElementById('invoicePreview');

  const rows = bill.lines.map(line => `
    <tr>
      <td>${esc(line.name)}</td>
      <td style="text-align:center">${line.qty}</td>
      <td style="text-align:right">₹${Number(line.price).toFixed(2)}</td>
      <td style="text-align:right">₹${Number(line.amount).toFixed(2)}</td>
    </tr>
  `).join('');

  invoicePreview.innerHTML = `
    <div class="invoice-header">
      <div>
        <div class="invoice-title">
          <img src="assets/images/logo.png" alt="PaniPuri Shop logo" style="width:52px;height:52px;object-fit:contain;border-radius:50%;border:1px solid #e2e8f0;">
          PaniPuri Shop
        </div>
        <div style="color:#64748b;font-size:13px;margin-top:4px;">Inventory & Billing Management System</div>
      </div>
      <div class="invoice-meta">
        <b style="font-size:16px;color:#0f172a;">TAX INVOICE</b><br>
        <strong>Bill No:</strong> ${esc(bill.no)}<br>
        <strong>Date:</strong> ${formatDate(bill.date)}
      </div>
    </div>
    
    <div style="margin: 16px 0; font-size:14px;">
      <strong>Customer:</strong> ${esc(bill.customer)}
    </div>

    <table>
      <thead>
        <tr>
          <th>Item Description</th>
          <th style="text-align:center">Qty</th>
          <th style="text-align:right">Rate</th>
          <th style="text-align:right">Amount</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>

    <div class="bill-total">
      Grand Total: ₹${Number(bill.total).toFixed(2)}
    </div>

    <div style="margin-top:28px;text-align:center;color:#64748b;font-size:13px;">
      <p>Thank you for visiting PaniPuri Shop!</p>
      <small style="color:#94a3b8">Computer generated invoice • Powered by ShopEase Engine</small>
    </div>
  `;

  invoiceModal.style.display = 'flex';
}

function printCurrentBill() {
  const data = DB.getData();
  if (!data.bills.length) {
    alert('Please save a bill first.');
    return;
  }
  showInvoiceModal(data.bills[0]);
  setTimeout(printInvoice, 200);
}

function printInvoice() {
  window.print();
}
