/**
 * PaniPuri Shop - Unified Database & Storage Adapter
 * Automatically works in Standalone Browser Mode (localStorage) AND Full API Mode (PHP/MySQL/SQLite)
 */

const DB = (function () {
  const STORAGE_KEY = 'panipuri_shop_data';
  const USERS_KEY = 'panipuri_shop_users';

  // Initial Seed Data (Mirrors database/seed_data.sql)
  const defaultUsers = [
    { id: 1, name: 'Administrator', username: 'admin', password: 'admin123', role: 'admin' },
    { id: 2, name: 'Adil Khan', username: 'adil', password: 'adil123', role: 'admin' },
    { id: 3, name: 'Shop Assistant', username: 'staff', password: 'staff123', role: 'staff' }
  ];

  const defaultData = {
    products: [
      { id: 1, name: 'Pani Puri Plate', category: 'Pani Puri', price: 30, stock: 100, unit: 'Plate' },
      { id: 2, name: 'Masala Puri Plate', category: 'Pani Puri', price: 40, stock: 80, unit: 'Plate' },
      { id: 3, name: 'Dahi Puri Plate', category: 'Chaat', price: 60, stock: 50, unit: 'Plate' },
      { id: 4, name: 'Sev Puri Plate', category: 'Chaat', price: 50, stock: 60, unit: 'Plate' },
      { id: 5, name: 'Ragda Puri Plate', category: 'Chaat', price: 50, stock: 45, unit: 'Plate' },
      { id: 6, name: 'Extra Puri (6 Pcs)', category: 'Extras', price: 10, stock: 150, unit: 'Packet' },
      { id: 7, name: 'Sweet Chutney (Jar)', category: 'Chutney', price: 20, stock: 40, unit: 'Bottle' },
      { id: 8, name: 'Spicy Teekha Pani (1L)', category: 'Pani', price: 15, stock: 50, unit: 'Bottle' }
    ],
    customers: [
      { id: 1, name: 'Amit Sharma', phone: '9876543210', email: 'amit@example.com', address: 'Chembur, Mumbai' },
      { id: 2, name: 'Neha Khan', phone: '9820012345', email: 'neha@example.com', address: 'Kurla, Mumbai' },
      { id: 3, name: 'Rahul Verma', phone: '9819988776', email: 'rahul.v@example.com', address: 'Ghatkopar, Mumbai' },
      { id: 4, name: 'Priya Patel', phone: '9833445566', email: 'priya.p@example.com', address: 'Sion, Mumbai' }
    ],
    ingredients: [
      { id: 1, name: 'Puri Shells', unit: 'pieces', stock: 1200, reorder: 200, cost: 0.40 },
      { id: 2, name: 'Boiled Potatoes (Aloo)', unit: 'kg', stock: 25, reorder: 5, cost: 30.00 },
      { id: 3, name: 'White Peas Ragda', unit: 'kg', stock: 18, reorder: 4, cost: 45.00 },
      { id: 4, name: 'Fresh Mint & Coriander', unit: 'kg', stock: 6, reorder: 1.5, cost: 60.00 },
      { id: 5, name: 'Tamarind & Jaggery Pulp', unit: 'kg', stock: 10, reorder: 2, cost: 80.00 },
      { id: 6, name: 'Nylon Crisp Sev', unit: 'kg', stock: 15, reorder: 3, cost: 120.00 },
      { id: 7, name: 'Fresh Whipped Dahi', unit: 'kg', stock: 8, reorder: 2, cost: 70.00 },
      { id: 8, name: 'Chaat Masala & Kala Namak', unit: 'kg', stock: 4, reorder: 1, cost: 150.00 }
    ],
    bills: [
      {
        id: 1,
        no: 'INV-100001',
        customer: 'Amit Sharma',
        phone: '9876543210',
        date: new Date(Date.now() - 2 * 86400000).toISOString(),
        items: 4,
        total: 150,
        payment_mode: 'UPI / Online',
        lines: [
          { name: 'Pani Puri Plate', qty: 2, price: 30, amount: 60 },
          { name: 'Sev Puri Plate', qty: 1, price: 50, amount: 50 },
          { name: 'Masala Puri Plate', qty: 1, price: 40, amount: 40 }
        ]
      },
      {
        id: 2,
        no: 'INV-100002',
        customer: 'Neha Khan',
        phone: '9820012345',
        date: new Date(Date.now() - 1 * 86400000).toISOString(),
        items: 3,
        total: 130,
        payment_mode: 'Cash',
        lines: [
          { name: 'Dahi Puri Plate', qty: 1, price: 60, amount: 60 },
          { name: 'Ragda Puri Plate', qty: 1, price: 50, amount: 50 },
          { name: 'Sweet Chutney (Jar)', qty: 1, price: 20, amount: 20 }
        ]
      }
    ]
  };

  // Local storage management
  function loadUsers() {
    try {
      const stored = localStorage.getItem(USERS_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
    persistUsers(defaultUsers);
    return defaultUsers;
  }

  function persistUsers(users) {
    try {
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  }

  function loadData() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.products && parsed.customers && parsed.bills) {
          if (!parsed.ingredients) parsed.ingredients = defaultData.ingredients;
          return parsed;
        }
      }
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
    persistData(defaultData);
    return defaultData;
  }

  function persistData(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  }

  // Active state
  let currentUsers = loadUsers();
  let currentData = loadData();

  return {
    getUsers: () => currentUsers,
    saveUser: (user) => {
      currentUsers.push(user);
      persistUsers(currentUsers);
      return user;
    },
    getData: () => currentData,
    persist: () => persistData(currentData),
    resetToDefault: () => {
      currentUsers = JSON.parse(JSON.stringify(defaultUsers));
      currentData = JSON.parse(JSON.stringify(defaultData));
      persistUsers(currentUsers);
      persistData(currentData);
    }
  };
})();
