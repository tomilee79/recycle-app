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
};

export type CollectionTask = {
  id: string;
  vehicleId: string;
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
};

export type Driver = {
  id: string;
  name: string;
  contact: string;
  isAvailable: boolean;
};
