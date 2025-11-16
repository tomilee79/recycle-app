

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
  createdAt: string; // YYYY-MM-DD
};

export type Equipment = {
  id: string;
  type: 'Roll-off Box' | 'Container';
  status: 'In Use' | 'Available' | 'Maintenance';
  location: string; // Vehicle ID or Yard Name
  lastInspected: string; // YYYY-MM-DD
  createdAt: string; // YYYY-MM-DD
};

export type TaskStatus = 'Pending' | 'In Progress' | 'Completed' | 'Cancelled';

export type Comment = {
  id: string;
  authorId: string; // User ID
  text: string;
  timestamp: string;
  replies?: Comment[];
}

export type TaskReport = {
    reportDate: string;
    collectedWeight: number;
    notes?: string;
    photoUrl?: string;
    comments?: Comment[];
}

export type CollectionTask = {
  id: string;
  vehicleId: string;
  driver?: string;
  customerId: string;
  materialType: 'Plastic' | 'Glass' | 'Paper' | 'Metal' | 'Mixed';
  address: string;
  location: {
    lat: number;
    lng: number;
  };
  status: TaskStatus;
  scheduledDate: string; // YYYY-MM-DD
  completedTime?: string;
  collectedWeight: number;
  report: TaskReport | null;
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

export type SettlementStatus = 'Pending' | 'Issued' | 'Paid';

export type SettlementData = {
  id: string;
  month: string;
  customerName: string;
  collectionCount: number;
  totalWeight: number;
  amount: number;
  status: SettlementStatus;
};

export type Driver = {
  id: string;
  name: string;
  email: string;
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

export type CustomerTier = 'VVIP' | 'VIP' | 'Gold' | 'Silver' | 'Bronze';

export type Customer = {
  id: string;
  name: string;
  address: string;
  contactPerson: string;
  tier: CustomerTier;
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

export type Priority = 'High' | 'Medium' | 'Low';

export type Todo = {
  id: number;
  text: string;
  completed: boolean;
  priority: Priority;
  dueDate?: Date;
};

export type QuoteStatus = 'Draft' | 'Sent' | 'Accepted' | 'Rejected';

export type StatusHistory = {
    status: QuoteStatus;
    date: string; // ISO 8601 format
};

export type QuoteItem = {
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
};

export type Attachment = {
    id: string;
    name: string;
    size: number; // in bytes
    type: string;
    url: string; // data URL or a mock URL
}

export type Quote = {
    id: string;
    customerId: string;
    quoteDate: string;
    expiryDate: string;
    status: QuoteStatus;
    statusHistory?: StatusHistory[];
    items: QuoteItem[];
    subtotal: number;
    tax: number;
    total: number;
    notes?: string;
    attachments?: Attachment[];
};

export type ContractStatus = 'Active' | 'Expiring' | 'Terminated';

export type ContractItem = {
    id: string;
    materialType: string;
    unitPrice: number;
};

export type Contract = {
    id: string;
    customerId: string;
    contractNumber: string;
    startDate: string;
    endDate: string;
    status: ContractStatus;
    items: ContractItem[];
    notes?: string;
};

export type ExpenseCategory = '유류비' | '정비비' | '통행료' | '기타';
export type ExpenseStatus = 'Pending' | 'Paid';

export type Expense = {
    id: string;
    date: string;
    category: ExpenseCategory;
    description: string;
    amount: number;
    vehicleId?: string;
    status: ExpenseStatus;
};

export type UserRole = 'Super Admin' | 'Manager Admin' | 'User';
export type UserStatus = 'Active' | 'Disabled';

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string; // YYYY-MM-DD
  avatarUrl?: string;
};
