import type { Vehicle, CollectionTask, ReportData } from './types';

export const vehicles: Vehicle[] = [
  {
    id: 'V001',
    name: 'EcoHauler 1',
    driver: 'John Doe',
    status: 'On Route',
    location: { lat: 40.73061, lng: -73.935242 },
    capacity: 5000,
    load: 3750,
  },
  {
    id: 'V002',
    name: 'GreenMover 2',
    driver: 'Jane Smith',
    status: 'Idle',
    location: { lat: 40.7128, lng: -74.006 },
    capacity: 5000,
    load: 500,
  },
  {
    id: 'V003',
    name: 'RecycleRover',
    driver: 'Mike Johnson',
    status: 'On Route',
    location: { lat: 40.758, lng: -73.9855 },
    capacity: 3000,
    load: 2800,
  },
  {
    id: 'V004',
    name: 'CleanCruiser',
    driver: 'Emily White',
    status: 'Maintenance',
    location: { lat: 40.7831, lng: -73.9712 },
    capacity: 7000,
    load: 0,
  },
  {
    id: 'V005',
    name: 'EarthWagon 5',
    driver: 'Chris Brown',
    status: 'Completed',
    location: { lat: 40.6782, lng: -73.9442 },
    capacity: 5000,
    load: 4950,
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
  { month: 'Jan', plastic: 186, glass: 80, paper: 200, metal: 100, mixed: 50 },
  { month: 'Feb', plastic: 305, glass: 90, paper: 150, metal: 120, mixed: 60 },
  { month: 'Mar', plastic: 237, glass: 70, paper: 220, metal: 110, mixed: 70 },
  { month: 'Apr', plastic: 278, glass: 110, paper: 250, metal: 130, mixed: 80 },
  { month: 'May', plastic: 189, glass: 120, paper: 210, metal: 140, mixed: 90 },
  { month: 'Jun', plastic: 239, glass: 100, paper: 280, metal: 150, mixed: 100 },
];
