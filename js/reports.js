/**
 * PaniPuri Shop - Reports, Analytics & Dashboard Module
 * Handles Metric Aggregation, Sales Auditing, Low Stock Warnings, and CSV Exports
 */

function renderDashboard() {
  const data = DB.getData();

  const statProducts = document.getElementById('statProducts');
  const statStock = document.getElementById('statStock');
  const statSales = document.getElementById('statSales');
  const statCustomers = document.getElementById('statCustomers');
  const lowStock = document.getElementById('lowStock');
  const recentBills = document.getElementById('recentBills');

  if (statProducts) statProducts.textContent = data.products.length;
  if (statStock) statStock.textContent = data.products.reduce((s, p) => s + p.stock, 0);

  const todayStr = new Date().toLocaleDateString('en-IN');
  const todaySales = data.bills
    .filter(b => new Date(b.date).toLocaleDateString('en-IN') === todayStr)
    .reduce((s, b) => s + b.total, 0);

  if (statSales) statSales.textContent = '₹' + todaySales.toFixed(2);
  if (statCustomers) statCustomers.textContent = data.customers.length;

  // Low stock products alert
  const low = data.products.filter(p => p.stock <= 10);
  if (lowStock) {
    lowStock.innerHTML = low.length
      ? low.map(p => `
          <div style="padding:10px 0;border-bottom:1px solid #e2e8f0;display:flex;justify-content:space-between;align-items:center;">
            <span>${productPicture(p.name, p.category)} <b>${esc(p.name)}</b></span>
            <span class="badge red">${p.stock} left</span>
          </div>
        `).join('')
      : '<div class="empty" style="padding:16px;">All products have healthy stock levels.</div>';
  }

  // Recent 5 bills
  if (recentBills) {
    recentBills.innerHTML = data.bills.length
      ? data.bills.slice(0, 5).map(b => `
          <div style="padding:10px 0;border-bottom:1px solid #e2e8f0;display:flex;justify-content:space-between;align-items:center;">
            <div>
              <b>${esc(b.no)}</b> <span style="color:#64748b;font-size:12px;">• ${esc(b.customer)}</span>
            </div>
            <strong style="color:var(--primary);">₹${Number(b.total).toFixed(2)}</strong>
          </div>
        `).join('')
      : '<div class="empty" style="padding:16px;">No bills created yet.</div>';
  }
}

function renderReports() {
  const data = DB.getData();

  const reportBills = document.getElementById('reportBills');
  const reportRevenue = document.getElementById('reportRevenue');
  const reportItems = document.getElementById('reportItems');
  const reportStock = document.getElementById('reportStock');
  const salesBody = document.getElementById('salesBody');

  const totalRev = data.bills.reduce((s, b) => s + b.total, 0);
  const totalItemsSold = data.bills.reduce((s, b) => s + b.items, 0);
  const totalStockVal = data.products.reduce((s, p) => s + p.price * p.stock, 0);

  if (reportBills) reportBills.textContent = data.bills.length;
  if (reportRevenue) reportRevenue.textContent = '₹' + totalRev.toFixed(2);
  if (reportItems) reportItems.textContent = totalItemsSold;
  if (reportStock) reportStock.textContent = '₹' + totalStockVal.toFixed(2);

  if (salesBody) {
    if (!data.bills.length) {
      salesBody.innerHTML = '<tr><td colspan="5" class="empty">No sales recorded yet.</td></tr>';
      return;
    }

    salesBody.innerHTML = data.bills.map(b => `
      <tr>
        <td><b>${esc(b.no)}</b></td>
        <td>${esc(b.customer)}</td>
        <td>${formatDate(b.date)}</td>
        <td>${b.items} plates</td>
        <td><strong>₹${Number(b.total).toFixed(2)}</strong></td>
      </tr>
    `).join('');
  }
}

function exportCSV() {
  const data = DB.getData();
  if (!data.bills.length) {
    alert('No sales data available to export.');
    return;
  }

  const rows = [
    ['Bill No', 'Customer', 'Date & Time', 'Items Count', 'Total (INR)'],
    ...data.bills.map(b => [
      b.no,
      b.customer,
      formatDate(b.date),
      b.items,
      Number(b.total).toFixed(2)
    ])
  ];

  const csvContent = rows
    .map(r => r.map(v => `"${String(v).replaceAll('"', '""')}"`).join(','))
    .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'PaniPuriShop_Sales_Report.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
