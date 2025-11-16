

import type { Vehicle, CollectionTask, ReportData, Driver, Customer, Notification, Equipment, MaintenanceRecord, SalesActivity, SettlementData, Quote, QuoteItem, QuoteStatus, Contract, ContractStatus, Expense, User } from './types';
import { addDays, format, formatISO, subMinutes, subMonths, subDays, startOfMonth, addMonths, getDate } from 'date-fns';

export const vehicles: Vehicle[] = [
  {
    id: 'V001',
    name: 'EcoHauler 1',
    driver: 'John Doe',
    status: 'On Route',
    location: { lat: 37.5833, lng: 127.0017 }, // 동대문
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
    location: { lat: 37.5665, lng: 126.9780 }, // 서울 시청
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
    location: { lat: 37.5326, lng: 127.0246 }, // 강남
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
    location: { lat: 37.5492, lng: 126.9033 }, // 마포
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
    location: { lat: 37.478, lng: 126.9515 }, // 관악
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

const today = new Date();
const startOfThisMonth = startOfMonth(today);
const startOfLastMonth = startOfMonth(subMonths(today, 1));
const startOfNextMonth = startOfMonth(addMonths(today, 1));

export const collectionTasks: CollectionTask[] = [
  {
    id: 'T01',
    vehicleId: 'V001',
    customerId: 'C001',
    materialType: 'Plastic',
    address: '서울시 종로구 세종대로 175',
    location: { lat: 37.5759, lng: 126.9768 },
    status: 'In Progress',
    scheduledDate: format(today, 'yyyy-MM-dd'),
    collectedWeight: 1200,
  },
  {
    id: 'T02',
    vehicleId: 'V003',
    customerId: 'C002',
    materialType: 'Paper',
    address: '서울시 강남구 테헤란로 152',
    location: { lat: 37.5014, lng: 127.0396 },
    status: 'In Progress',
    scheduledDate: format(today, 'yyyy-MM-dd'),
    collectedWeight: 850,
  },
  {
    id: 'T03',
    vehicleId: 'V002',
    customerId: 'C003',
    materialType: 'Glass',
    address: '서울시 송파구 올림픽로 300',
    location: { lat: 37.5125, lng: 127.1025 },
    status: 'Pending',
    scheduledDate: format(addDays(today, 1), 'yyyy-MM-dd'),
    collectedWeight: 0,
  },
  {
    id: 'T04',
    vehicleId: 'V005',
    customerId: 'C004',
    materialType: 'Metal',
    address: '서울시 영등포구 의사당대로 1',
    location: { lat: 37.5262, lng: 126.9113 },
    status: 'Completed',
    scheduledDate: format(subDays(today, 1), 'yyyy-MM-dd'),
    completedTime: '09:45',
    collectedWeight: 2100,
  },
   {
    id: 'T05',
    vehicleId: 'V001',
    customerId: 'C005',
    materialType: 'Plastic',
    address: '서울시 서초구 반포대로 222',
    location: { lat: 37.4979, lng: 127.0074 },
    status: 'Completed',
    scheduledDate: format(subDays(today, 2), 'yyyy-MM-dd'),
    completedTime: '11:30',
    collectedWeight: 1500,
  },
  {
    id: 'T06',
    vehicleId: 'V003',
    customerId: 'C001',
    materialType: 'Mixed',
    address: '서울시 중구 세종대로 110',
    location: { lat: 37.5665, lng: 126.9780 },
    status: 'Completed',
    scheduledDate: format(addDays(startOfThisMonth, 3), 'yyyy-MM-dd'),
    completedTime: '12:45',
    collectedWeight: 3000,
  },
  {
    id: 'T07',
    vehicleId: 'V005',
    customerId: 'C002',
    materialType: 'Paper',
    address: '서울시 마포구 월드컵로 240',
    location: { lat: 37.5684, lng: 126.8973 },
    status: 'Completed',
    scheduledDate: format(addDays(startOfThisMonth, 5), 'yyyy-MM-dd'),
    completedTime: '13:30',
    collectedWeight: 1800,
  },
   {
    id: 'T08',
    vehicleId: 'V002',
    customerId: 'C005',
    materialType: 'Glass',
    address: '서울시 용산구 이태원로 29',
    location: { lat: 37.5398, lng: 126.9924 },
    status: 'Pending',
    scheduledDate: format(addDays(today, 3), 'yyyy-MM-dd'),
    collectedWeight: 0,
  },
  {
    id: 'T09',
    vehicleId: '',
    customerId: 'C001',
    materialType: 'Paper',
    address: '서울시 강남구 영동대로 513',
    location: { lat: 37.5124, lng: 127.0588 },
    status: 'Pending',
    scheduledDate: format(addDays(startOfNextMonth, 5), 'yyyy-MM-dd'),
    collectedWeight: 0,
  },
  {
    id: 'T10',
    vehicleId: 'V001',
    customerId: 'C003',
    materialType: 'Metal',
    address: '서울시 종로구 종로 1',
    location: { lat: 37.571, lng: 126.9772 },
    status: 'Completed',
    scheduledDate: format(addDays(startOfLastMonth, 10), 'yyyy-MM-dd'),
    completedTime: '14:30',
    collectedWeight: 2200,
  },
  {
    id: 'T11',
    vehicleId: 'V002',
    customerId: 'C002',
    materialType: 'Glass',
    address: '서울시 강동구 올림픽로 578',
    location: { lat: 37.5482, lng: 127.1424 },
    status: 'Pending',
    scheduledDate: format(today, 'yyyy-MM-dd'),
    collectedWeight: 0,
  },
  {
    id: 'T12',
    vehicleId: 'V003',
    customerId: 'C004',
    materialType: 'Plastic',
    address: '서울시 은평구 통일로 1050',
    location: { lat: 37.6192, lng: 126.9213 },
    status: 'Cancelled',
    scheduledDate: format(subDays(today, 1), 'yyyy-MM-dd'),
    collectedWeight: 0,
  },
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
    address: '서울시 종로구',
    contactPerson: '김철수',
    activityHistory: [
        { id: 'A001', date: format(subDays(new Date(), 5), 'yyyy-MM-dd'), type: '상담', content: '신규 폐기물 처리 단가 문의', manager: '이영희' },
        { id: 'A002', date: format(subDays(new Date(), 30), 'yyyy-MM-dd'), type: '계약', content: '2025년 재계약 완료', manager: '김철수' },
    ]
  },
  { 
    id: 'C002', 
    name: 'Recycle Corp', 
    address: '서울시 강남구',
    contactPerson: '이영희',
    activityHistory: [
        { id: 'A003', date: format(subDays(new Date(), 10), 'yyyy-MM-dd'), type: '클레임', content: '수거 지연에 대한 불만 제기', manager: '박민준' },
    ]
  },
  { 
    id: 'C003', 
    name: 'Green Solutions', 
    address: '서울시 송파구',
    contactPerson: '박민준',
    activityHistory: [
        { id: 'A004', date: format(subDays(new Date(), 2), 'yyyy-MM-dd'), type: '영업 기회', content: '신규 계약 제안서 발송', manager: '김철수' },
    ]
  },
  { 
    id: 'C004', 
    name: 'Eco Services', 
    address: '서울시 영등포구',
    contactPerson: '최지우',
    activityHistory: []
  },
  { 
    id: 'C005', 
    name: '지구환경 주식회사',
    address: '서울시 서초구',
    contactPerson: '홍길동',
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

  const generateQuoteItems = (count: number): QuoteItem[] => {
    const items: QuoteItem[] = [];
    const wasteTypes = ['폐 플라스틱', '폐지', '고철', '유리병'];
    for (let i = 0; i < count; i++) {
        const quantity = Math.floor(Math.random() * 20) + 1;
        const unitPrice = (Math.floor(Math.random() * 10) + 1) * 10000;
        items.push({
            id: `item-${Date.now()}-${i}`,
            description: `${wasteTypes[i % wasteTypes.length]} 처리 비용`,
            quantity: quantity,
            unitPrice: unitPrice,
            total: quantity * unitPrice,
        });
    }
    return items;
};

const calculateQuoteTotals = (items: QuoteItem[]): { subtotal: number; tax: number; total: number } => {
    const subtotal = items.reduce((acc, item) => acc + item.total, 0);
    const tax = subtotal * 0.1;
    const total = subtotal + tax;
    return { subtotal, tax, total };
};

const createQuote = (id: string, customerId: string, status: QuoteStatus, date: Date): Quote => {
    const items = generateQuoteItems(Math.floor(Math.random() * 3) + 2);
    const { subtotal, tax, total } = calculateQuoteTotals(items);
    return {
        id,
        customerId,
        quoteDate: format(date, 'yyyy-MM-dd'),
        expiryDate: format(addDays(date, 30), 'yyyy-MM-dd'),
        status,
        items,
        subtotal,
        tax,
        total,
        notes: status === 'Rejected' ? '타사 대비 가격 경쟁력 부족으로 거절.' : '월 정기 수거 건에 대한 견적.'
    };
};

export const quotes: Quote[] = [
    createQuote('Q-2024-001', 'C001', 'Accepted', subDays(new Date(), 5)),
    createQuote('Q-2024-002', 'C002', 'Sent', subDays(new Date(), 2)),
    createQuote('Q-2024-003', 'C003', 'Draft', subDays(new Date(), 1)),
    createQuote('Q-2024-004', 'C004', 'Rejected', subDays(new Date(), 15)),
    createQuote('Q-2024-005', 'C005', 'Sent', subDays(new Date(), 10)),
];

const createContract = (id: string, customerId: string, status: ContractStatus, startDate: Date, endDate: Date): Contract => {
  const contractNumber = `C${format(startDate, 'yyyyMMdd')}-${String(id).padStart(3, '0')}`;
  return {
    id,
    customerId,
    contractNumber,
    startDate: format(startDate, 'yyyy-MM-dd'),
    endDate: format(endDate, 'yyyy-MM-dd'),
    status,
    items: [
      { id: 'ci-1', materialType: 'Plastic', unitPrice: 150 },
      { id: 'ci-2', materialType: 'Paper', unitPrice: 80 },
    ],
    notes: '월 4회 정기 수거 조건',
  };
};

export const contracts: Contract[] = [
    createContract('CT001', 'C001', 'Active', subMonths(new Date(), 6), addMonths(new Date(), 6)),
    createContract('CT002', 'C002', 'Expiring', subMonths(new Date(), 11), addDays(new Date(), 25)),
    createContract('CT003', 'C004', 'Terminated', subMonths(new Date(), 18), subMonths(new Date(), 6)),
    createContract('CT004', 'C005', 'Active', subDays(new Date(), 100), addMonths(new Date(), 14)),
];

export const expensesData: Expense[] = [
    { id: 'EXP001', date: format(subDays(new Date(), 2), 'yyyy-MM-dd'), category: '유류비', description: 'EcoHauler 1 주유', amount: 120000, vehicleId: 'V001', status: 'Paid' },
    { id: 'EXP002', date: format(subDays(new Date(), 5), 'yyyy-MM-dd'), category: '정비비', description: 'GreenMover 2 타이어 교체', amount: 450000, vehicleId: 'V002', status: 'Paid' },
    { id: 'EXP003', date: format(subDays(new Date(), 10), 'yyyy-MM-dd'), category: '통행료', description: '경부고속도로 통행료', amount: 15000, vehicleId: 'V003', status: 'Pending' },
    { id: 'EXP004', date: format(subDays(new Date(), 15), 'yyyy-MM-dd'), category: '기타', description: '사무용품 구매', amount: 85000, status: 'Paid' },
    { id: 'EXP005', date: format(subDays(new Date(), 1), 'yyyy-MM-dd'), category: '유류비', description: 'RecycleRover 주유', amount: 95000, vehicleId: 'V003', status: 'Pending' },
];

export const users: User[] = [
    { id: 'U001', name: '김관리', email: 'admin@ecotrack.com', role: 'Super Admin', status: 'Active', createdAt: format(subDays(new Date(), 120), 'yyyy-MM-dd') },
    { id: 'U002', name: '이매니저', email: 'manager@ecotrack.com', role: 'Manager Admin', status: 'Active', createdAt: format(subDays(new Date(), 60), 'yyyy-MM-dd') },
    { id: 'U003', name: '박사원', email: 'user@ecotrack.com', role: 'User', status: 'Active', createdAt: format(subDays(new Date(), 30), 'yyyy-MM-dd') },
    { id: 'U004', name: '최비활', email: 'disabled@ecotrack.com', role: 'User', status: 'Disabled', createdAt: format(subDays(new Date(), 90), 'yyyy-MM-dd') },
    { id: 'U005', name: '정매니저', email: 'manager2@ecotrack.com', role: 'Manager Admin', status: 'Active', createdAt: format(subDays(new Date(), 15), 'yyyy-MM-dd') },
];
