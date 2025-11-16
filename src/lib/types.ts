

export type MaintenanceRecord = {
  date: string;
  description: string;
  cost: number;
};

export type Vehicle = {
  id: string;
  name: string;
  driver: string;
  status: 'On Route' | 'Idle' | 'Maintenance' | 'Completed';
  location: {
    lat: number;
    lng: number;
  };
  capacity: number;
  load: number;
  type: 'Truck' | 'Van' | 'Electric';
  maintenanceHistory: MaintenanceRecord[];
};

export type Equipment = {
  id: string;
  type: 'Roll-off Box' | 'Container';
  status: 'In Use' | 'Available' | 'Maintenance';
  location: string; // Vehicle ID or Yard Name
  lastInspected: string; // YYYY-MM-DD
};

export type CollectionTask = {
  id: string;
  vehicleId: string;
  customerId: string;
  materialType: 'Plastic' | 'Glass' | 'Paper' | 'Metal' | 'Mixed';
  address: string;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Cancelled';
  scheduledTime: string;
  completedTime?: string;
  collectedWeight: number;
};

export type ReportData = {
  month: string;
  plastic: number;
  glass: number;
  paper: number;
  metal: number;
  mixed: number;
  revenue: number;
};

export type Driver = {
  id: string;
  name: string;
  contact: string;
  isAvailable: boolean;
};

export type SalesActivity = {
    id: string;
    date: string;
    type: '상담' | '클레임' | '영업 기회' | '계약';
    content: string;
    manager: string;
};

export type Customer = {
  id: string;
  name: string;
  address: string;
  contractStatus: 'Active' | 'Inactive' | 'Pending';
  contactPerson: string;
  expiryDate: string; // YYYY-MM-DD
  activityHistory: SalesActivity[];
};

export type Notification = {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  type: 'Warning' | 'Info' | 'Error';
  isRead: boolean;
};
