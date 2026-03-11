const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const fetchAPI = async (endpoint, options = {}) => {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Request failed");
  return data;
};

export const api = {
  // Categories
  getCategories: () => fetchAPI("/categories"),
  createCategory: (data) => fetchAPI("/categories", { method: "POST", body: JSON.stringify(data) }),
  updateCategory: (id, data) => fetchAPI(`/categories/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteCategory: (id) => fetchAPI(`/categories/${id}`, { method: "DELETE" }),

  // Brands
  getBrands: () => fetchAPI("/brands"),
  createBrand: (data) => fetchAPI("/brands", { method: "POST", body: JSON.stringify(data) }),
  updateBrand: (id, data) => fetchAPI(`/brands/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteBrand: (id) => fetchAPI(`/brands/${id}`, { method: "DELETE" }),

  // Units
  getUnits: () => fetchAPI("/units"),
  createUnit: (data) => fetchAPI("/units", { method: "POST", body: JSON.stringify(data) }),
  updateUnit: (id, data) => fetchAPI(`/units/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteUnit: (id) => fetchAPI(`/units/${id}`, { method: "DELETE" }),

  // Products
  getProducts: (params = "") => fetchAPI(`/products${params}`),
  getProduct: (id) => fetchAPI(`/products/${id}`),
  getProductByBarcode: (barcode) => fetchAPI(`/products/barcode/${barcode}`),
  createProduct: (data) => fetchAPI("/products", { method: "POST", body: JSON.stringify(data) }),
  updateProduct: (id, data) => fetchAPI(`/products/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteProduct: (id) => fetchAPI(`/products/${id}`, { method: "DELETE" }),

  // Customers
  getCustomers: (params = "") => fetchAPI(`/customers${params}`),
  createCustomer: (data) => fetchAPI("/customers", { method: "POST", body: JSON.stringify(data) }),
  updateCustomer: (id, data) => fetchAPI(`/customers/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteCustomer: (id) => fetchAPI(`/customers/${id}`, { method: "DELETE" }),
  getImportantCustomers: () => fetchAPI("/customers/important"),
  toggleImportantCustomer: (id) => fetchAPI(`/customers/${id}/important`, { method: "PATCH" }),
  bulkUpdateCustomers: (data) => fetchAPI("/customers/bulk-update", { method: "PUT", body: JSON.stringify(data) }),

  // Sales Persons
  getSalesPersons: (params = "") => fetchAPI(`/salespersons${params}`),
  getSalesPerson: (id) => fetchAPI(`/salespersons/${id}`),
  createSalesPerson: (data) => fetchAPI("/salespersons", { method: "POST", body: JSON.stringify(data) }),
  updateSalesPerson: (id, data) => fetchAPI(`/salespersons/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteSalesPerson: (id) => fetchAPI(`/salespersons/${id}`, { method: "DELETE" }),

  // Suppliers
  getSuppliers: (params = "") => fetchAPI(`/suppliers${params}`),
  getSupplier: (id) => fetchAPI(`/suppliers/${id}`),
  createSupplier: (data) => fetchAPI("/suppliers", { method: "POST", body: JSON.stringify(data) }),
  updateSupplier: (id, data) => fetchAPI(`/suppliers/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteSupplier: (id) => fetchAPI(`/suppliers/${id}`, { method: "DELETE" }),

  // Purchases
  getPurchases: (params = "") => fetchAPI(`/purchases${params}`),
  getPurchase: (id) => fetchAPI(`/purchases/${id}`),
  createPurchase: (data) => fetchAPI("/purchases", { method: "POST", body: JSON.stringify(data) }),
  updatePurchase: (id, data) => fetchAPI(`/purchases/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deletePurchase: (id) => fetchAPI(`/purchases/${id}`, { method: "DELETE" }),

  // Sales
  getSales: (params = "") => fetchAPI(`/sales${params}`),
  getSale: (id) => fetchAPI(`/sales/${id}`),
  createSale: (data) => fetchAPI("/sales", { method: "POST", body: JSON.stringify(data) }),
  updateSale: (id, data) => fetchAPI(`/sales/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteSale: (id) => fetchAPI(`/sales/${id}`, { method: "DELETE" }),
  cancelSale: (id) => fetchAPI(`/sales/${id}/cancel`, { method: "PATCH" }),

  // Quotations
  getQuotations: (params = "") => fetchAPI(`/quotations${params}`),
  getQuotation: (id) => fetchAPI(`/quotations/${id}`),
  createQuotation: (data) => fetchAPI("/quotations", { method: "POST", body: JSON.stringify(data) }),
  updateQuotation: (id, data) => fetchAPI(`/quotations/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteQuotation: (id) => fetchAPI(`/quotations/${id}`, { method: "DELETE" }),

  // Warranties
  getWarranties: (params = "") => fetchAPI(`/warranties${params}`),
  getWarranty: (id) => fetchAPI(`/warranties/${id}`),
  createWarranty: (data) => fetchAPI("/warranties", { method: "POST", body: JSON.stringify(data) }),
  updateWarranty: (id, data) => fetchAPI(`/warranties/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteWarranty: (id) => fetchAPI(`/warranties/${id}`, { method: "DELETE" }),

  // Inventory
  getInventoryLogs: (params = "") => fetchAPI(`/inventory${params}`),
  getLowStock: () => fetchAPI("/inventory/low-stock"),
  purchaseStock: (data) => fetchAPI("/inventory/purchase", { method: "POST", body: JSON.stringify(data) }),
  adjustStock: (data) => fetchAPI("/inventory/adjust", { method: "POST", body: JSON.stringify(data) }),

  // Reports
  getDashboardStats: () => fetchAPI("/reports/dashboard"),
  getSalesReport: (params = "") => fetchAPI(`/reports/sales${params}`),
  getTopProducts: () => fetchAPI("/reports/top-products"),

  // Expense Categories
  getExpenseCategories: (params = "") => fetchAPI(`/expense-categories${params}`),
  createExpenseCategory: (data) => fetchAPI("/expense-categories", { method: "POST", body: JSON.stringify(data) }),
  updateExpenseCategory: (id, data) => fetchAPI(`/expense-categories/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteExpenseCategory: (id) => fetchAPI(`/expense-categories/${id}`, { method: "DELETE" }),

  // Expenses
  getExpenses: (params = "") => fetchAPI(`/expenses${params}`),
  getExpense: (id) => fetchAPI(`/expenses/${id}`),
  createExpense: (data) => fetchAPI("/expenses", { method: "POST", body: JSON.stringify(data) }),
  updateExpense: (id, data) => fetchAPI(`/expenses/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteExpense: (id) => fetchAPI(`/expenses/${id}`, { method: "DELETE" }),

  // Deposits
  getDeposits: (params = "") => fetchAPI(`/deposits${params}`),
  getDeposit: (id) => fetchAPI(`/deposits/${id}`),
  createDeposit: (data) => fetchAPI("/deposits", { method: "POST", body: JSON.stringify(data) }),
  updateDeposit: (id, data) => fetchAPI(`/deposits/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteDeposit: (id) => fetchAPI(`/deposits/${id}`, { method: "DELETE" }),

  // Bank Accounts
  getBankAccounts: (params = "") => fetchAPI(`/bank-accounts${params}`),
  getBankAccount: (id) => fetchAPI(`/bank-accounts/${id}`),
  createBankAccount: (data) => fetchAPI("/bank-accounts", { method: "POST", body: JSON.stringify(data) }),
  updateBankAccount: (id, data) => fetchAPI(`/bank-accounts/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteBankAccount: (id) => fetchAPI(`/bank-accounts/${id}`, { method: "DELETE" }),

  // Bank Transactions
  getBankTransactions: (params = "") => fetchAPI(`/bank-transactions${params}`),
  createBankTransaction: (data) => fetchAPI("/bank-transactions", { method: "POST", body: JSON.stringify(data) }),
  deleteBankTransaction: (id) => fetchAPI(`/bank-transactions/${id}`, { method: "DELETE" }),

  // Employees
  getEmployees: (params = "") => fetchAPI(`/employees${params}`),
  getEmployee: (id) => fetchAPI(`/employees/${id}`),
  createEmployee: (data) => fetchAPI("/employees", { method: "POST", body: JSON.stringify(data) }),
  updateEmployee: (id, data) => fetchAPI(`/employees/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteEmployee: (id) => fetchAPI(`/employees/${id}`, { method: "DELETE" }),

  // Salary
  getSalaries: (params = "") => fetchAPI(`/salaries${params}`),
  generateSalary: (data) => fetchAPI("/salaries", { method: "POST", body: JSON.stringify(data) }),
  getSalarySheet: (params = "") => fetchAPI(`/salaries/sheet${params}`),
  updateSalary: (id, data) => fetchAPI(`/salaries/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  markSalaryPaid: (id) => fetchAPI(`/salaries/${id}/pay`, { method: "PATCH" }),
  deleteSalary: (id) => fetchAPI(`/salaries/${id}`, { method: "DELETE" }),

  // Loans
  getLoans: (params = "") => fetchAPI(`/loans${params}`),
  getLoan: (id) => fetchAPI(`/loans/${id}`),
  createLoan: (data) => fetchAPI("/loans", { method: "POST", body: JSON.stringify(data) }),
  updateLoan: (id, data) => fetchAPI(`/loans/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteLoan: (id) => fetchAPI(`/loans/${id}`, { method: "DELETE" }),

  // Tasks
  getTasks: (params = "") => fetchAPI(`/tasks${params}`),
  createTask: (data) => fetchAPI("/tasks", { method: "POST", body: JSON.stringify(data) }),
  updateTask: (id, data) => fetchAPI(`/tasks/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteTask: (id) => fetchAPI(`/tasks/${id}`, { method: "DELETE" }),
  updateTaskStatus: (id, data) => fetchAPI(`/tasks/${id}/status`, { method: "PATCH", body: JSON.stringify(data) }),

  // App Users
  getAppUsers: (params = "") => fetchAPI(`/app-users${params}`),
  getAppUser: (id) => fetchAPI(`/app-users/${id}`),
  createAppUser: (data) => fetchAPI("/app-users", { method: "POST", body: JSON.stringify(data) }),
  updateAppUser: (id, data) => fetchAPI(`/app-users/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteAppUser: (id) => fetchAPI(`/app-users/${id}`, { method: "DELETE" }),
  changeAppUserPassword: (id, data) => fetchAPI(`/app-users/${id}/password`, { method: "PATCH", body: JSON.stringify(data) }),

  // SMS & Email
  getSmsEmailLogs: (params = "") => fetchAPI(`/sms-email${params}`),
  sendSms: (data) => fetchAPI("/sms-email/sms", { method: "POST", body: JSON.stringify(data) }),
  sendEmail: (data) => fetchAPI("/sms-email/email", { method: "POST", body: JSON.stringify(data) }),
};
