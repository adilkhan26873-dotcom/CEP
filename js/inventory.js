/**
 * PaniPuri Shop - Inventory Management Module
 * Handles Product Catalog, Stock Tracking, Add/Edit Modals, and Search
 */

function productPicture(name, category) {
  const n = (name + ' ' + category).toLowerCase();
  if (n.includes('dahi')) return '🥣';
  if (n.includes('masala')) return '🍲';
  if (n.includes('sev')) return '🥗';
  if (n.includes('ragda')) return '🍛';
  if (n.includes('extra puri') || n.includes('puri')) return '🥟';
  if (n.includes('chutney')) return '🍯';
  if (n.includes('pani') || n.includes('water')) return '💧';
  if (n.includes('plate') || n.includes('chaat')) return '🍽️';
  return '🍴';
}

function renderInventory() {
  const data = DB.getData();
  const searchInput = document.getElementById('productSearch');
  const inventoryBody = document.getElementById('inventoryBody');
  const q = (searchInput ? searchInput.value : '').toLowerCase().trim();

  const filtered = data.products.filter(p =>
    (p.name + ' ' + p.category).toLowerCase().includes(q)
  );

  if (!filtered.length) {
    inventoryBody.innerHTML = '<tr><td colspan="6" class="empty">No products found matching your search.</td></tr>';
    return;
  }

  const rows = filtered.map(p => {
    const status = p.stock <= 10
      ? '<span class="badge red">Low Stock</span>'
      : p.stock <= 25
      ? '<span class="badge yellow">Medium</span>'
      : '<span class="badge green">In Stock</span>';

    const picture = productPicture(p.name, p.category);

    return `<tr>
      <td>
        <div class="product-cell">
          <span class="product-thumb" aria-hidden="true">${picture}</span>
          <b>${esc(p.name)}</b>
        </div>
      </td>
      <td>${esc(p.category)}</td>
      <td><strong>₹${Number(p.price).toFixed(2)}</strong></td>
      <td>${p.stock} ${p.unit || 'units'}</td>
      <td>${status}</td>
      <td class="actions">
        <button class="btn warning" onclick="openProduct(${p.id})">Edit</button>
        <button class="btn danger" onclick="deleteProduct(${p.id})">Delete</button>
      </td>
    </tr>`;
  }).join('');

  inventoryBody.innerHTML = rows;
}

function openProduct(id = null) {
  const modal = document.getElementById('productModal');
  const modalTitle = document.getElementById('productModalTitle');
  const editId = document.getElementById('editProductId');
  const pName = document.getElementById('pName');
  const pCategory = document.getElementById('pCategory');
  const pPrice = document.getElementById('pPrice');
  const pStock = document.getElementById('pStock');

  modal.style.display = 'flex';
  editId.value = id || '';

  if (id) {
    const data = DB.getData();
    const p = data.products.find(x => x.id === id);
    if (p) {
      modalTitle.textContent = 'Edit Product';
      pName.value = p.name;
      pCategory.value = p.category;
      pPrice.value = p.price;
      pStock.value = p.stock;
    }
  } else {
    modalTitle.textContent = 'Add Product';
    pName.value = '';
    pCategory.value = '';
    pPrice.value = '';
    pStock.value = '';
  }
}

function saveProduct() {
  const editId = document.getElementById('editProductId');
  const pName = document.getElementById('pName');
  const pCategory = document.getElementById('pCategory');
  const pPrice = document.getElementById('pPrice');
  const pStock = document.getElementById('pStock');

  const id = editId.value ? +editId.value : null;
  const name = pName.value.trim();
  const category = pCategory.value.trim();
  const price = +pPrice.value;
  const stock = +pStock.value;

  if (!name || !category || isNaN(price) || price < 0 || isNaN(stock) || stock < 0) {
    alert('Please enter valid product details with non-negative price and stock.');
    return;
  }

  const data = DB.getData();

  if (id) {
    const existing = data.products.find(p => p.id === id);
    if (existing) {
      existing.name = name;
      existing.category = category;
      existing.price = price;
      existing.stock = stock;
    }
  } else {
    const newProduct = {
      id: Date.now(),
      name: name,
      category: category,
      price: price,
      stock: stock,
      unit: 'Plate'
    };
    data.products.push(newProduct);
  }

  DB.persist();
  closeModal('productModal');
  refresh();
}

function deleteProduct(id) {
  if (confirm('Are you sure you want to delete this product?')) {
    const data = DB.getData();
    data.products = data.products.filter(p => p.id !== id);
    DB.persist();
    refresh();
  }
}

function renderIngredients() {
  const data = DB.getData();
  const ingBody = document.getElementById('ingredientBody');
  if (!ingBody) return;

  if (!data.ingredients || !data.ingredients.length) {
    ingBody.innerHTML = '<tr><td colspan="6" class="empty">No raw kitchen ingredients recorded.</td></tr>';
    return;
  }

  const rows = data.ingredients.map((ing, i) => {
    const isLow = ing.stock <= ing.reorder;
    const status = isLow
      ? '<span class="badge red">Low Stock - Reorder</span>'
      : '<span class="badge green">Adequate</span>';

    return `<tr>
      <td><b>${esc(ing.name)}</b></td>
      <td>${esc(ing.unit)}</td>
      <td><strong>${ing.stock}</strong></td>
      <td>${ing.reorder} ${esc(ing.unit)}</td>
      <td>₹${Number(ing.cost).toFixed(2)}</td>
      <td>${status}</td>
    </tr>`;
  }).join('');

  ingBody.innerHTML = rows;
}
