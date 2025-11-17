
'use client';

import { create } from 'zustand';
import {
  users as initialUsers,
  vehicles as initialVehicles,
  equipments as initialEquipments,
  collectionTasks as initialCollectionTasks,
  customers as initialCustomers,
  contracts as initialContracts,
  quotes as initialQuotes,
  settlementData as initialSettlementData,
  expensesData as initialExpensesData,
  todos as initialTodos,
  reportData as initialReportData,
  notifications as initialNotifications
} from '@/lib/mock-data';
import type {
  User,
  Vehicle,
  Equipment,
  CollectionTask,
  Customer,
  Contract,
  Quote,
  SettlementData,
  Expense,
  Todo,
  Driver,
  ReportData,
  Notification
} from '@/lib/types';
import { drivers as initialDrivers } from '@/lib/mock-data';

interface DataStoreState {
  users: User[];
  vehicles: Vehicle[];
  equipments: Equipment[];
  collectionTasks: CollectionTask[];
  customers: Customer[];
  contracts: Contract[];
  quotes: Quote[];
  settlementData: SettlementData[];
  expensesData: Expense[];
  todos: Todo[];
  drivers: Driver[];
  reportData: ReportData[];
  notifications: Notification[];

  // Actions
  addUser: (user: User) => void;
  updateUser: (id: string, updatedData: Partial<Omit<User, 'id'>>) => void;
  deleteUser: (id: string) => void;

  addVehicle: (vehicle: Vehicle) => void;
  updateVehicle: (id: string, updatedData: Partial<Omit<Vehicle, 'id'>>) => void;
  deleteVehicle: (id: string) => void;
  setVehicles: (vehicles: Vehicle[]) => void;

  addEquipment: (equipment: Equipment) => void;
  updateEquipment: (id: string, updatedData: Partial<Omit<Equipment, 'id'>>) => void;
  deleteEquipment: (id: string) => void;
  
  addTask: (task: CollectionTask) => void;
  addTasks: (tasks: CollectionTask[]) => void;
  updateTask: (id: string, updatedData: Partial<Omit<CollectionTask, 'id'>>) => void;
  deleteTask: (id: string) => void;
  deleteTasks: (ids: string[]) => void;
  setTasks: (tasks: CollectionTask[]) => void;

  addCustomer: (customer: Customer) => void;
  updateCustomer: (id: string, updatedData: Partial<Omit<Customer, 'id'>>) => void;
  deleteCustomer: (id: string) => void;

  addContract: (contract: Contract) => void;
  updateContract: (id: string, updatedData: Partial<Omit<Contract, 'id'>>) => void;
  deleteContract: (ids: string[]) => void;

  addQuote: (quote: Quote) => void;
  updateQuote: (id: string, updatedData: Partial<Omit<Quote, 'id'>>) => void;
  deleteQuote: (id: string) => void;

  addSettlement: (settlement: SettlementData) => void;
  updateSettlement: (id: string, updatedData: Partial<Omit<SettlementData, 'id'>>) => void;
  deleteSettlement: (ids: string[]) => void;
  updateSettlementStatus: (ids: string[], status: SettlementData['status']) => void;

  addExpense: (expense: Expense) => void;
  updateExpense: (id: string, updatedData: Partial<Omit<Expense, 'id'>>) => void;
  deleteExpense: (ids: string[]) => void;
  updateExpenseStatus: (ids: string[], status: Expense['status']) => void;

  addTodo: (todo: Todo) => void;
  updateTodo: (id: number, updatedData: Partial<Omit<Todo, 'id'>>) => void;
  deleteTodo: (id: number) => void;

  addDriver: (driver: Driver) => void;
  updateDriver: (id: string, updatedData: Partial<Omit<Driver, 'id'>>) => void;
  deleteDriver: (id: string) => void;
  setDrivers: (drivers: Driver[]) => void;
}

export const useDataStore = create<DataStoreState>((set) => ({
  users: initialUsers,
  vehicles: initialVehicles,
  equipments: initialEquipments,
  collectionTasks: initialCollectionTasks,
  customers: initialCustomers,
  contracts: initialContracts,
  quotes: initialQuotes,
  settlementData: initialSettlementData,
  expensesData: initialExpensesData,
  todos: initialTodos,
  drivers: initialDrivers,
  reportData: initialReportData,
  notifications: initialNotifications,

  // User Actions
  addUser: (user) => set((state) => ({ users: [user, ...state.users] })),
  updateUser: (id, updatedData) => set((state) => ({
    users: state.users.map((u) => (u.id === id ? { ...u, ...updatedData } : u)),
  })),
  deleteUser: (id) => set((state) => ({ users: state.users.filter((u) => u.id !== id) })),

  // Vehicle Actions
  addVehicle: (vehicle) => set((state) => ({ vehicles: [vehicle, ...state.vehicles] })),
  updateVehicle: (id, updatedData) => set((state) => ({
    vehicles: state.vehicles.map((v) => (v.id === id ? { ...v, ...updatedData } : v)),
  })),
  deleteVehicle: (id) => set((state) => ({ vehicles: state.vehicles.filter((v) => v.id !== id) })),
  setVehicles: (vehicles) => set({ vehicles }),

  // Equipment Actions
  addEquipment: (equipment) => set((state) => ({ equipments: [equipment, ...state.equipments] })),
  updateEquipment: (id, updatedData) => set((state) => ({
    equipments: state.equipments.map((e) => (e.id === id ? { ...e, ...updatedData } : e)),
  })),
  deleteEquipment: (id) => set((state) => ({ equipments: state.equipments.filter((e) => e.id !== id) })),

  // Task Actions
  addTask: (task) => set((state) => ({ collectionTasks: [task, ...state.collectionTasks] })),
  addTasks: (tasks) => set((state) => ({ collectionTasks: [...tasks, ...state.collectionTasks] })),
  updateTask: (id, updatedData) => set((state) => ({
    collectionTasks: state.collectionTasks.map((t) => (t.id === id ? { ...t, ...updatedData } : t)),
  })),
  deleteTask: (id) => set((state) => ({ collectionTasks: state.collectionTasks.filter((t) => t.id !== id) })),
  deleteTasks: (ids) => set((state) => ({ collectionTasks: state.collectionTasks.filter((t) => !ids.includes(t.id)) })),
  setTasks: (tasks) => set({ collectionTasks: tasks }),

  // Customer Actions
  addCustomer: (customer) => set((state) => ({ customers: [customer, ...state.customers] })),
  updateCustomer: (id, updatedData) => set((state) => ({
    customers: state.customers.map((c) => (c.id === id ? { ...c, ...updatedData } : c)),
  })),
  deleteCustomer: (id) => set((state) => ({ customers: state.customers.filter((c) => c.id !== id) })),

  // Contract Actions
  addContract: (contract) => set((state) => ({ contracts: [contract, ...state.contracts] })),
  updateContract: (id, updatedData) => set((state) => ({
    contracts: state.contracts.map((c) => (c.id === id ? { ...c, ...updatedData } : c)),
  })),
  deleteContract: (ids) => set((state) => ({ contracts: state.contracts.filter((c) => !ids.includes(c.id)) })),

  // Quote Actions
  addQuote: (quote) => set((state) => ({ quotes: [quote, ...state.quotes] })),
  updateQuote: (id, updatedData) => set((state) => ({
    quotes: state.quotes.map((q) => (q.id === id ? { ...q, ...updatedData } : q)),
  })),
  deleteQuote: (id) => set((state) => ({ quotes: state.quotes.filter((q) => q.id !== id) })),

  // Settlement Actions
  addSettlement: (settlement) => set((state) => ({ settlementData: [settlement, ...state.settlementData] })),
  updateSettlement: (id, updatedData) => set((state) => ({
    settlementData: state.settlementData.map((s) => (s.id === id ? { ...s, ...updatedData } : s)),
  })),
  deleteSettlement: (ids) => set((state) => ({ settlementData: state.settlementData.filter((s) => !ids.includes(s.id)) })),
  updateSettlementStatus: (ids, status) => set(state => ({
    settlementData: state.settlementData.map(item => ids.includes(item.id) ? { ...item, status } : item)
  })),

  // Expense Actions
  addExpense: (expense) => set((state) => ({ expensesData: [expense, ...state.expensesData] })),
  updateExpense: (id, updatedData) => set((state) => ({
    expensesData: state.expensesData.map((e) => (e.id === id ? { ...e, ...updatedData } : e)),
  })),
  deleteExpense: (ids) => set((state) => ({ expensesData: state.expensesData.filter((e) => !ids.includes(e.id)) })),
  updateExpenseStatus: (ids, status) => set(state => ({
    expensesData: state.expensesData.map(item => ids.includes(item.id) ? { ...item, status } : item)
  })),

  // Todo Actions
  addTodo: (todo) => set((state) => ({ todos: [todo, ...state.todos] })),
  updateTodo: (id, updatedData) => set((state) => ({
    todos: state.todos.map((t) => (t.id === id ? { ...t, ...updatedData } : t)),
  })),
  deleteTodo: (id) => set((state) => ({ todos: state.todos.filter((t) => t.id !== id) })),

  // Driver Actions
  addDriver: (driver) => set((state) => ({ drivers: [driver, ...state.drivers] })),
  updateDriver: (id, updatedData) => set((state) => ({
    drivers: state.drivers.map((d) => (d.id === id ? { ...d, ...updatedData } : d)),
  })),
  deleteDriver: (id) => set((state) => ({ drivers: state.drivers.filter((d) => d.id !== id) })),
  setDrivers: (drivers) => set({ drivers }),
}));
