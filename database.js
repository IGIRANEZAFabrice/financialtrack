import * as SQLite from 'expo-sqlite';

// Open database
const db = SQLite.openDatabaseSync('financialtrack.db');

// Initialize database with tables
export const initDatabase = async () => {
  try {
    // Create admin table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS admin (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        full_name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        total_invested REAL DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      );
    `);

    // Create status table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS status (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        status_name TEXT NOT NULL,
        color TEXT,
        sort_order INTEGER DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      );
    `);

    // Create finance table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS finance (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        admin_id INTEGER,
        name TEXT NOT NULL,
        phone TEXT,
        email TEXT,
        money_provided REAL NOT NULL,
        money_returned REAL DEFAULT 0,
        due_date TEXT,
        notes TEXT,
        status_id INTEGER,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (admin_id) REFERENCES admin(id),
        FOREIGN KEY (status_id) REFERENCES status(id)
      );
    `);

    // Create payment_track table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS payment_track (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        finance_id INTEGER NOT NULL,
        amount REAL NOT NULL,
        payment_date TEXT DEFAULT (datetime('now')),
        notes TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (finance_id) REFERENCES finance(id)
      );
    `);

    // Create notifications table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        finance_id INTEGER,
        message TEXT NOT NULL,
        status TEXT DEFAULT 'unread',
        created_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (finance_id) REFERENCES finance(id)
      );
    `);

    // Insert default statuses if not exist
    const statusCount = await db.getFirstAsync('SELECT COUNT(*) as count FROM status');
    if (statusCount.count === 0) {
      await db.execAsync(`
        INSERT INTO status (status_name, color, sort_order) VALUES
        ('Pending', '#FFA500', 1),
        ('Partially Paid', '#1E90FF', 2),
        ('Paid', '#32CD32', 3),
        ('Overdue', '#FF4500', 4);
      `);
    }

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
};

// Admin operations
export const registerAdmin = async (username, fullName, email, password) => {
  try {
    const result = await db.runAsync(
      'INSERT INTO admin (username, full_name, email, password) VALUES (?, ?, ?, ?)',
      [username, fullName, email, password]
    );
    return result;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

export const loginAdmin = async (username, password) => {
  try {
    const admin = await db.getFirstAsync(
      'SELECT * FROM admin WHERE username = ? AND password = ?',
      [username, password]
    );
    return admin;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const getAdminById = async (id) => {
  try {
    const admin = await db.getFirstAsync(
      'SELECT * FROM admin WHERE id = ?',
      [id]
    );
    return admin;
  } catch (error) {
    console.error('Get admin error:', error);
    throw error;
  }
};

export const updateAdmin = async (id, { username, full_name, email, password }) => {
  try {
    await db.runAsync(
      `UPDATE admin 
       SET username = ?, full_name = ?, email = ?, password = ?, updated_at = datetime('now')
       WHERE id = ?`,
      [username, full_name, email, password, id]
    );
    return true;
  } catch (error) {
    console.error('Update admin error:', error);
    throw error;
  }
};

// Finance operations
export const addFinance = async (adminId, data) => {
  try {
    const result = await db.runAsync(
      `INSERT INTO finance (admin_id, name, phone, email, money_provided, money_returned, due_date, notes, status_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [adminId, data.name, data.phone, data.email, data.money_provided, 
       data.money_returned || 0, data.due_date, data.notes, data.status_id]
    );
    return result;
  } catch (error) {
    console.error('Add finance error:', error);
    throw error;
  }
};

export const getAllFinances = async (adminId) => {
  try {
    const finances = await db.getAllAsync(
      `SELECT f.*, s.status_name, s.color 
       FROM finance f 
       LEFT JOIN status s ON f.status_id = s.id 
       WHERE f.admin_id = ?
       ORDER BY f.created_at DESC`,
      [adminId]
    );
    return finances;
  } catch (error) {
    console.error('Get finances error:', error);
    throw error;
  }
};

export const getStatuses = async () => {
  try {
    const statuses = await db.getAllAsync(
      'SELECT * FROM status ORDER BY sort_order ASC'
    );
    return statuses;
  } catch (error) {
    console.error('Get statuses error:', error);
    throw error;
  }
};

export const getFinanceById = async (id) => {
  try {
    const finance = await db.getFirstAsync(
      `SELECT f.*, s.status_name, s.color 
       FROM finance f 
       LEFT JOIN status s ON f.status_id = s.id 
       WHERE f.id = ?`,
      [id]
    );
    return finance;
  } catch (error) {
    console.error('Get finance by id error:', error);
    throw error;
  }
};

export const updateFinance = async (id, data) => {
  try {
    await db.runAsync(
      `UPDATE finance 
       SET name = ?, phone = ?, email = ?, money_provided = ?, money_returned = ?, due_date = ?, notes = ?, status_id = ?, updated_at = datetime('now')
       WHERE id = ?`,
      [
        data.name,
        data.phone,
        data.email,
        data.money_provided,
        data.money_returned ?? 0,
        data.due_date,
        data.notes,
        data.status_id,
        id,
      ]
    );
    return true;
  } catch (error) {
    console.error('Update finance error:', error);
    throw error;
  }
};

// Payment operations
export const addPayment = async (financeId, amount, notes) => {
  try {
    await db.runAsync(
      'INSERT INTO payment_track (finance_id, amount, notes) VALUES (?, ?, ?)',
      [financeId, amount, notes]
    );
    
    // Update money_returned in finance table
    await db.runAsync(
      'UPDATE finance SET money_returned = money_returned + ? WHERE id = ?',
      [amount, financeId]
    );
    
    return true;
  } catch (error) {
    console.error('Add payment error:', error);
    throw error;
  }
};

export const getPaymentsByFinanceId = async (financeId) => {
  try {
    const payments = await db.getAllAsync(
      'SELECT * FROM payment_track WHERE finance_id = ? ORDER BY payment_date DESC',
      [financeId]
    );
    return payments;
  } catch (error) {
    console.error('Get payments error:', error);
    throw error;
  }
};

// Export database instance
export default db;
