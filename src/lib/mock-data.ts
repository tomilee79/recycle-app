
import type { Vehicle, CollectionTask, ReportData, Driver, Customer, Notification, Equipment, MaintenanceRecord, SalesActivity, SettlementData } from './types';
import { addDays, format, formatISO, subMinutes, subMonths, subDays } from 'date-fns';

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
    maintenanceHistory: [
      { date: format(subMonths(new Date(), 1), 'yyyy-MM-dd'), description: '엔진 오일 교체', cost: 150000 },
      { date: format(subMonths(new Date(), 6), 'yyyy-MM-dd'), description: '타이어 교체', cost: 800000 },
    ],
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
    maintenanceHistory: [
      { date: format(subMonths(new Date(), 2), 'yyyy-MM-dd'), description: '정기 점검', cost: 250000 },
    ],
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
    maintenanceHistory: [],
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
    maintenanceHistory: [
        { date: format(new Date(), 'yyyy-MM-dd'), description: '배터리 시스템 오류 점검', cost: 500000 },
    ]
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
    maintenanceHistory: [
        { date: format(subMonths(new Date(), 3), 'yyyy-MM-dd'), description: '브레이크 패드 교체', cost: 300000 },
    ]
  },
];

export const equipments: Equipment[] = [
    { id: 'E01', type: 'Roll-off Box', status: 'In Use', location: 'V001', lastInspected: format(subMonths(new Date(), 1), 'yyyy-MM-dd') },
    { id: 'E02', type: 'Roll-off Box', status: 'Available', location: '본사 차고지', lastInspected: format(subMonths(new Date(), 2), 'yyyy-MM-dd') },
    { id: 'E03', type: 'Container', status: 'Maintenance', location: '정비소', lastInspected: format(subMonths(new Date(), 12), 'yyyy-MM-dd') },
    { id: 'E04', type: 'Roll-off Box', status: 'In Use', location: 'V003', lastInspected: format(subMonths(new Date(), 3), 'yyyy-MM-dd') },
    { id: 'E05', type: 'Container', status: 'Available', location: '본사 차고지', lastInspected: format(subMonths(new Date(), 6), 'yyyy-MM-dd') },
];

export const collectionTasks: CollectionTask[] = [
  {
    id: 'T01',
    vehicleId: 'V001',
    customerId: 'C001',
    materialType: 'Plastic',
    address: '123 Main St, Brooklyn, NY',
    location: { lat: 40.6941, lng: -73.9866 },
    status: 'In Progress',
    scheduledTime: '10:00 AM',
    collectedWeight: 1200,
  },
  {
    id: 'T02',
    vehicleId: 'V003',
    customerId: 'C002',
    materialType: 'Paper',
    address: '456 Broadway, New York, NY',
    location: { lat: 40.7209, lng: -74.0007 },
    status: 'In Progress',
    scheduledTime: '10:30 AM',
    collectedWeight: 850,
  },
  {
    id: 'T03',
    vehicleId: 'V002',
    customerId: 'C003',
    materialType: 'Glass',
    address: '789 Park Ave, New York, NY',
    location: { lat: 40.7713, lng: -73.9632 },
    status: 'Pending',
    scheduledTime: '11:00 AM',
    collectedWeight: 0,
  },
  {
    id: 'T04',
    vehicleId: 'V005',
    customerId: 'C004',
    materialType: 'Metal',
    address: '101 First Ave, New York, NY',
    location: { lat: 40.7259, lng: -73.9848 },
    status: 'Completed',
    scheduledTime: '09:00 AM',
    completedTime: '09:45 AM',
    collectedWeight: 2100,
  },
   {
    id: 'T05',
    vehicleId: 'V001',
    customerId: 'C005',
    materialType: 'Plastic',
    address: '202 Second Ave, New York, NY',
    location: { lat: 40.7312, lng: -73.9854 },
    status: 'Completed',
    scheduledTime: '11:00 AM',
    completedTime: '11:30 AM',
    collectedWeight: 1500,
  },
  {
    id: 'T06',
    vehicleId: 'V003',
    customerId: 'C001',
    materialType: 'Mixed',
    address: '303 Third Ave, New York, NY',
    location: { lat: 40.7397, lng: -73.9835 },
    status: 'Completed',
    scheduledTime: '12:00 PM',
    completedTime: '12:45 PM',
    collectedWeight: 3000,
  },
  {
    id: 'T07',
    vehicleId: 'V005',
    customerId: 'C002',
    materialType: 'Paper',
    address: '404 Fourth Ave, New York, NY',
    location: { lat: 40.7458, lng: -73.9821 },
    status: 'Completed',
    scheduledTime: '01:00 PM',
    completedTime: '01:30 PM',
    collectedWeight: 1800,
  },
   {
    id: 'T08',
    vehicleId: '',
    customerId: 'C005',
    materialType: 'Glass',
    address: '55 E 1st St, New York, NY',
    location: { lat: 40.7242, lng: -73.9892 },
    status: 'Pending',
    scheduledTime: '02:00 PM',
    collectedWeight: 0,
  },
  {
    id: 'T09',
    vehicleId: '',
    customerId: 'C001',
    materialType: 'Paper',
    address: '1501 Broadway, New York, NY',
    location: { lat: 40.757, lng: -73.9859 },
    status: 'Pending',
    scheduledTime: '03:00 PM',
    collectedWeight: 0,
  }
];

export const reportData: ReportData[] = [
  { month: 'Jan', plastic: 186, glass: 80, paper: 200, metal: 100, mixed: 50, revenue: 12550000 },
  { month: 'Feb', plastic: 305, glass: 90, paper: 150, metal: 120, mixed: 60, revenue: 15800000 },
  { month: 'Mar', plastic: 237, glass: 70, paper: 220, metal: 110, mixed: 70, revenue: 14230000 },
  { month: 'Apr', plastic: 278, glass: 110, paper: 250, metal: 130, mixed: 80, revenue: 17500000 },
  { month: 'May', plastic: 189, glass: 120, paper: 210, metal: 140, mixed: 90, revenue: 16800000 },
  { month: 'Jun', plastic: 239, glass: 100, paper: 280, metal: 150, mixed: 100, revenue: 18900000 },
];

export const settlementData: SettlementData[] = [
    { id: 'S001', month: '2024-06', customerName: 'BigBelly Inc.', collectionCount: 15, totalWeight: 12500, amount: 3500000, status: 'Paid' },
    { id: 'S002', month: '2024-06', customerName: 'Recycle Corp', collectionCount: 22, totalWeight: 18200, amount: 5100000, status: 'Issued' },
    { id: 'S003', month: '2024-06', customerName: 'Green Solutions', collectionCount: 8, totalWeight: 7500, amount: 1800000, status: 'Pending' },
    { id: 'S004', month: '2024-06', customerName: '지구환경 주식회사', collectionCount: 30, totalWeight: 25000, amount: 7200000, status: 'Pending' },
    { id: 'S005', month: '2024-05', customerName: 'BigBelly Inc.', collectionCount: 14, totalWeight: 11800, amount: 3300000, status: 'Paid' },
    { id: 'S006', month: '2024-05', customerName: 'Recycle Corp', collectionCount: 20, totalWeight: 17500, amount: 4950000, status: 'Paid' },
    { id: 'S007', month: '2024-05', customerName: 'Eco Services', collectionCount: 5, totalWeight: 4200, amount: 950000, status: 'Paid' },
]

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
    expiryDate: format(addDays(new Date(), 150), 'yyyy-MM-dd'),
    activityHistory: [
        { id: 'A001', date: format(subDays(new Date(), 5), 'yyyy-MM-dd'), type: '상담', content: '신규 폐기물 처리 단가 문의', manager: '이영희' },
        { id: 'A002', date: format(subDays(new Date(), 30), 'yyyy-MM-dd'), type: '계약', content: '2025년 재계약 완료', manager: '김철수' },
    ]
  },
  { 
    id: 'C002', 
    name: 'Recycle Corp', 
    address: '456 Market St',
    contractStatus: 'Active',
    contactPerson: '이영희',
    expiryDate: format(addDays(new Date(), 25), 'yyyy-MM-dd'), // Expires soon
    activityHistory: [
        { id: 'A003', date: format(subDays(new Date(), 10), 'yyyy-MM-dd'), type: '클레임', content: '수거 지연에 대한 불만 제기', manager: '박민준' },
    ]
  },
  { 
    id: 'C003', 
    name: 'Green Solutions', 
    address: '789 Broadway',
    contractStatus: 'Pending',
    contactPerson: '박민준',
    expiryDate: format(addDays(new Date(), 300), 'yyyy-MM-dd'),
    activityHistory: [
        { id: 'A004', date: format(subDays(new Date(), 2), 'yyyy-MM-dd'), type: '영업 기회', content: '신규 계약 제안서 발송', manager: '김철수' },
    ]
  },
  { 
    id: 'C004', 
    name: 'Eco Services', 
    address: '101 Park Ave',
    contractStatus: 'Inactive',
    contactPerson: '최지우',
    expiryDate: format(addDays(new Date(), -90), 'yyyy-MM-dd'), // Expired
    activityHistory: []
  },
  { 
    id: 'C005', 
    name: '지구환경 주식회사',
    address: '서울시 강남구 테헤란로',
    contractStatus: 'Active',
    contactPerson: '홍길동',
    expiryDate: format(addDays(new Date(), 400), 'yyyy-MM-dd'),
    activityHistory: []
  },
];

export const notifications: Notification[] = [
    {
      id: 'N001',
      title: '차량 정비 필요: CleanCruiser',
      description: 'V004 차량의 정기 점검일이 도래했습니다.',
      timestamp: formatISO(subMinutes(new Date(), 5)),
      type: 'Warning',
      isRead: false,
    },
    {
      id: 'N002',
      title: '수거 완료: EarthWagon 5',
      description: 'V005 차량이 모든 수거 작업을 완료했습니다.',
      timestamp: formatISO(subMinutes(new Date(), 32)),
      type: 'Info',
      isRead: false,
    },
    {
      id: 'N003',
      title: '경로 이탈: RecycleRover',
      description: 'V003 차량이 지정된 경로를 이탈했습니다.',
      timestamp: formatISO(subMinutes(new Date(), 48)),
      type: 'Error',
      isRead: true,
    },
    {
      id: 'N004',
      title: '신규 배차 등록',
      description: '새로운 배차가 GreenMover 2 차량에 할당되었습니다.',
      timestamp: formatISO(subMinutes(new Date(), 90)),
      type: 'Info',
      isRead: true,
    },
  ];
