import { createContext, useContext, useReducer, useCallback, useState, useEffect } from "react";
import { loadLang } from "../utils/i18n";

const STORAGE_KEY = "amal_v4";
const LEGACY_KEY = "amal_v3";

// === Module Registry ===
// Each module defines its schema. Adding a new service = add entry here.
export const MODULES = [
  { id: "expenses", name: "Expenses", nameAr: "المصروفات", icon: "Wallet", color: "#6366f1", route: "expenses" },
  { id: "fleet", name: "Fleet", nameAr: "المركبات", icon: "Car", color: "#f59e0b", route: "fleet" },
  { id: "groceries", name: "Groceries", nameAr: "المشتريات", icon: "ShoppingCart", color: "#10b981", route: "groceries" },
  { id: "invoices", name: "Invoices", nameAr: "الفواتير", icon: "Receipt", color: "#f43f5e", route: "invoices" },
];

const DEFAULT_TAGS = [
  { id: "consumables", name: "Consumables", nameAr: "مستهلكات", color: "#6366f1", statuses: ["Low", "OK", "Stocked"] },
  { id: "durables", name: "Durables", nameAr: "أصول", color: "#10b981", statuses: ["Good", "Worn", "Damaged", "Retired"] },
  { id: "car", name: "Car", nameAr: "سيارة", color: "#f59e0b", statuses: ["Service", "Fuel", "Annual", "Repair", "Cleaning", "Parking", "Toll", "Fine"] },
  { id: "finances", name: "Finances", nameAr: "مالية", color: "#8b5cf6", statuses: ["Fixed", "Variable", "Subscription", "One-time", "Investment", "Savings"] },
  { id: "invoices", name: "Invoices", nameAr: "فواتير", color: "#f43f5e", statuses: ["Paid", "Pending", "Overdue"] },
  { id: "groceries", name: "Groceries", nameAr: "مشتريات", color: "#22d3ee", statuses: ["Need", "Have", "Running Low"] },
];

function daysBetween(a, b) {
  if (!a || !b) return 0;
  const ms = new Date(b) - new Date(a);
  return Math.max(0, Math.round(ms / 86400000));
}

function migrateV3(v3) {
  return {
    expenses: v3.expenses || [],
    tags: v3.tags || DEFAULT_TAGS,
    parents: v3.parents || [],
    invoices: v3.invoices || [],
    fleet: v3.fleet || { cars: [] },
    groceries: v3.groceries || { lists: [], stores: [] },
    settings: { 
      currency: v3.settings?.currency || "$", 
      language: v3.settings?.language || loadLang(), 
      theme: "dark", 
      aiEnabled: v3.settings?.aiEnabled || false 
    }
  };
}

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const p = JSON.parse(raw);
      if (!p.tags) p.tags = DEFAULT_TAGS;
      if (!p.parents) p.parents = [];
      if (!p.invoices) p.invoices = [];
      if (!p.fleet) p.fleet = { cars: [] };
      if (!p.groceries) p.groceries = { lists: [], stores: [] };
      if (!p.settings) p.settings = { currency: "$", language: loadLang(), theme: "dark", aiEnabled: false };
      return p;
    }
    const legacy = localStorage.getItem(LEGACY_KEY);
    if (legacy) {
      const m = migrateV3(JSON.parse(legacy));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(m));
      return m;
    }
  } catch (e) { console.error("Load failed", e); }
  return {
    expenses: [], tags: DEFAULT_TAGS, parents: [], invoices: [],
    fleet: { cars: [] }, groceries: { lists: [], stores: [] },
    settings: { currency: "$", language: loadLang(), theme: "dark", aiEnabled: false }
  };
}

function saveData(data) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch (e) {}
}

function reducer(state, action) {
  let next;
  switch (action.type) {
    case "ADD_EXPENSE":
      next = { ...state, expenses: [...state.expenses, action.item] };
      break;
    case "UPDATE_EXPENSE":
      next = { ...state, expenses: state.expenses.map(i => i.id === action.item.id ? action.item : i) };
      break;
    case "DELETE_EXPENSE":
      next = { ...state, expenses: state.expenses.filter(i => i.id !== action.id) };
      break;
    case "ADD_TAG":
      if (state.tags.find(t => t.id === action.tag.id)) next = state;
      else next = { ...state, tags: [...state.tags, action.tag] };
      break;
    case "UPDATE_TAG":
      next = { ...state, tags: state.tags.map(t => t.id === action.tag.id ? action.tag : t) };
      break;
    case "REMOVE_TAG":
      next = { ...state, tags: state.tags.filter(t => t.id !== action.id), expenses: state.expenses.map(e => e.tag === action.id ? { ...e, tag: "finances" } : e) };
      break;
    case "ADD_PARENT":
      next = { ...state, parents: [...state.parents, action.item] };
      break;
    case "UPDATE_PARENT":
      next = { ...state, parents: state.parents.map(p => p.id === action.item.id ? action.item : p) };
      break;
    case "DELETE_PARENT":
      next = { ...state, parents: state.parents.filter(p => p.id !== action.id), expenses: state.expenses.map(e => e.parentId === action.id ? { ...e, parentId: null } : e) };
      break;
    case "ADD_INVOICE":
      next = { ...state, invoices: [...state.invoices, action.item] };
      break;
    case "UPDATE_INVOICE":
      next = { ...state, invoices: state.invoices.map(i => i.id === action.item.id ? action.item : i) };
      break;
    case "DELETE_INVOICE":
      next = { ...state, invoices: state.invoices.filter(i => i.id !== action.id) };
      break;
    // Fleet
    case "ADD_FLEET_CAR":
      next = { ...state, fleet: { ...state.fleet, cars: [...(state.fleet?.cars || []), action.item] } };
      break;
    case "UPDATE_FLEET_CAR":
      next = { ...state, fleet: { ...state.fleet, cars: (state.fleet?.cars || []).map(c => c.id === action.item.id ? action.item : c) } };
      break;
    case "DELETE_FLEET_CAR":
      next = { ...state, fleet: { ...state.fleet, cars: (state.fleet?.cars || []).filter(c => c.id !== action.id) } };
      break;
    // Groceries
    case "ADD_GROCERY_LIST":
      next = { ...state, groceries: { ...state.groceries, lists: [...(state.groceries?.lists || []), action.item] } };
      break;
    case "UPDATE_GROCERY_LIST":
      next = { ...state, groceries: { ...state.groceries, lists: (state.groceries?.lists || []).map(l => l.id === action.item.id ? action.item : l) } };
      break;
    case "DELETE_GROCERY_LIST":
      next = { ...state, groceries: { ...state.groceries, lists: (state.groceries?.lists || []).filter(l => l.id !== action.id) } };
      break;
    case "SET_SETTINGS":
      next = { ...state, settings: { ...state.settings, ...action.settings } };
      break;
    case "REPLACE_ALL":
      next = { ...loadData(), ...action.data };
      break;
    case "RESET":
      next = { expenses: [], tags: DEFAULT_TAGS, parents: [], invoices: [], fleet: { cars: [] }, groceries: { lists: [], stores: [] }, settings: { currency: "$", language: state.settings.language, theme: "dark", aiEnabled: false } };
      break;
    default:
      return state;
  }
  saveData(next);
  return next;
}

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, null, loadData);
  const [toast, setToast] = useState(null);
  const [activeModule, setActiveModule] = useState("dashboard");

  const showToast = useCallback((message, type = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2800);
  }, []);

  const value = {
    state,
    toast,
    showToast,
    activeModule,
    setActiveModule,
    // Expenses
    addExpense: useCallback((item) => dispatch({ type: "ADD_EXPENSE", item }), []),
    updateExpense: useCallback((item) => dispatch({ type: "UPDATE_EXPENSE", item }), []),
    deleteExpense: useCallback((id) => dispatch({ type: "DELETE_EXPENSE", id }), []),
    // Tags
    addTag: useCallback((tag) => dispatch({ type: "ADD_TAG", tag }), []),
    updateTag: useCallback((tag) => dispatch({ type: "UPDATE_TAG", tag }), []),
    removeTag: useCallback((id) => dispatch({ type: "REMOVE_TAG", id }), []),
    // Parents
    addParent: useCallback((item) => dispatch({ type: "ADD_PARENT", item }), []),
    updateParent: useCallback((item) => dispatch({ type: "UPDATE_PARENT", item }), []),
    deleteParent: useCallback((id) => dispatch({ type: "DELETE_PARENT", id }), []),
    // Invoices
    addInvoice: useCallback((item) => dispatch({ type: "ADD_INVOICE", item }), []),
    updateInvoice: useCallback((item) => dispatch({ type: "UPDATE_INVOICE", item }), []),
    deleteInvoice: useCallback((id) => dispatch({ type: "DELETE_INVOICE", id }), []),
    // Fleet
    addFleetCar: useCallback((item) => dispatch({ type: "ADD_FLEET_CAR", item }), []),
    updateFleetCar: useCallback((item) => dispatch({ type: "UPDATE_FLEET_CAR", item }), []),
    deleteFleetCar: useCallback((id) => dispatch({ type: "DELETE_FLEET_CAR", id }), []),
    // Groceries
    addGroceryList: useCallback((item) => dispatch({ type: "ADD_GROCERY_LIST", item }), []),
    updateGroceryList: useCallback((item) => dispatch({ type: "UPDATE_GROCERY_LIST", item }), []),
    deleteGroceryList: useCallback((id) => dispatch({ type: "DELETE_GROCERY_LIST", id }), []),
    // Settings
    setSettings: useCallback((s) => dispatch({ type: "SET_SETTINGS", settings: s }), []),
    replaceAll: useCallback((data) => dispatch({ type: "REPLACE_ALL", data }), []),
    resetData: useCallback(() => dispatch({ type: "RESET" }), []),
    // Derived
    currency: state.settings?.currency || "$",
    TODAY: new Date(new Date().setHours(0,0,0,0)),
    monthly: state.expenses.reduce((s, r) => s + (r.monthly || 0), 0),
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be inside AppProvider");
  return ctx;
}
