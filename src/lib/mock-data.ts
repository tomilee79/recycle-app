
import type { Vehicle, CollectionTask, ReportData, Driver, Customer } from './types';
import { addDays, format } from 'date-fns';

export const vehicles: Vehicle[] = [
  {
    id: 'V001',
    name: 'EcoHauler 1',
    driver: 'John Doe',
    status: 'On Route',
    location: { lat: 40.73061, lng: -73.935242 },
    capacity: 5000,
    load: 3750,
    type: 'Truck',
  },
  {
    id: 'V002',
    name: 'GreenMover 2',
    driver: 'Jane Smith',
    status: 'Idle',
    location: { lat: 40.7128, lng: -74.006 },
    capacity: 5000,
    load: 500,
    type: 'Van',
  },
  {
    id: 'V003',
    name: 'RecycleRover',
    driver: 'Mike Johnson',
    status: 'On Route',
    location: { lat: 40.758, lng: -73.9855 },
    capacity: 3000,
    load: 2800,
    type: 'Truck',
  },
  {
    id: 'V004',
    name: 'CleanCruiser',
    driver: 'Emily White',
    status: 'Maintenance',
    location: { lat: 40.7831, lng: -73.9712 },
    capacity: 7000,
    load: 0,
    type: 'Electric',
  },
  {
    id: 'V005',
    name: 'EarthWagon 5',
    driver: 'Chris Brown',
    status: 'Completed',
    location: { lat: 40.6782, lng: -73.9442 },
    capacity: 5000,
    load: 4950,
    type: 'Truck',
  },
];

export const collectionTasks: CollectionTask[] = [
  {
    id: 'T01',
    vehicleId: 'V001',
    materialType: 'Plastic',
    address: '123 Main St, Brooklyn, NY',
    status: 'In Progress',
    scheduledTime: '10:00 AM',
    collectedWeight: 1200,
  },
  {
    id: 'T02',
    vehicleId: 'V003',
    materialType: 'Paper',
    address: '456 Broadway, New York, NY',
    status: 'In Progress',
    scheduledTime: '10:30 AM',
    collectedWeight: 850,
  },
  {
    id: 'T03',
    vehicleId: 'V002',
    materialType: 'Glass',
    address: '789 Park Ave, New York, NY',
    status: 'Pending',
    scheduledTime: '11:00 AM',
    collectedWeight: 0,
  },
  {
    id: 'T04',
    vehicleId: 'V005',
    materialType: 'Metal',
    address: '101 First Ave, New York, NY',
    status: 'Completed',
    scheduledTime: '09:00 AM',
    completedTime: '09:45 AM',
    collectedWeight: 2100,
  },
];

export const reportData: ReportData[] = [
  { month: 'Jan', plastic: 186, glass: 80, paper: 200, metal: 100, mixed: 50, revenue: 12550 },
  { month: 'Feb', plastic: 305, glass: 90, paper: 150, metal: 120, mixed: 60, revenue: 15800 },
  { month: 'Mar', plastic: 237, glass: 70, paper: 220, metal: 110, mixed: 70, revenue: 14230 },
  { month: 'Apr', plastic: 278, glass: 110, paper: 250, metal: 130, mixed: 80, revenue: 17500 },
  { month: 'May', plastic: 189, glass: 120, paper: 210, metal: 140, mixed: 90, revenue: 16800 },
  { month: 'Jun', plastic: 239, glass: 100, paper: 280, metal: 150, mixed: 100, revenue: 18900 },
];

export const drivers: Driver[] = [
  { id: 'D001', name: 'John Doe', contact: '555-0101', isAvailable: false },
  { id: 'D002', name: 'Jane Smith', contact: '555-0102', isAvailable: true },
  { id: 'D003', name: 'Mike Johnson', contact: '555-0103', isAvailable: false },
  { id: 'D004', name: 'Emily White', contact: '555-0104', isAvailable: true },
  { id: 'D005', name: 'Chris Brown', contact: '555-0105', isAvailable: true },
  { id: 'D006', name: 'Jessica Miller', contact: '555-0106', isAvailable: false },
  { id: 'D007', name: 'David Wilson', contact: '555-0107', isAvailable: true },
];

export const customers: Customer[] = [
  { 
    id: 'C001', 
    name: 'BigBelly Inc.', 
    address: '123 Main St',
    contractStatus: 'Active',
    contactPerson: '김철수',
    expiryDate: format(addDays(new Date(), 150), 'yyyy-MM-dd') 
  },
  { 
    id: 'C002', 
    name: 'Recycle Corp', 
    address: '456 Market St',
    contractStatus: 'Active',
    contactPerson: '이영희',
    expiryDate: format(addDays(new Date(), 25), 'yyyy-MM-dd') // Expires soon
  },
  { 
    id: 'C003', 
    name: 'Green Solutions', 
    address: '789 Broadway',
    contractStatus: 'Pending',
    contactPerson: '박민준',
    expiryDate: format(addDays(new Date(), 300), 'yyyy-MM-dd')
  },
  { 
    id: 'C004', 
    name: 'Eco Services', 
    address: '101 Park Ave',
    contractStatus: 'Inactive',
    contactPerson: '최지우',
    expiryDate: format(addDays(new Date(), -90), 'yyyy-MM-dd') // Expired
  },
  { 
    id: 'C005', 
    name: '지구환경 주식회사',
    address: '서울시 강남구 테헤란로',
    contractStatus: 'Active',
    contactPerson: '홍길동',
    expiryDate: format(addDays(new Date(), 400), 'yyyy-MM-dd')
  },
];
