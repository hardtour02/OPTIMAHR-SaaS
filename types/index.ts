
export interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadDate: string;
  version: number;
  url: string; 
}

export interface Employee {
  id: string;
  photoUrl: string;
  firstName: string;
  lastName: string;
  idNumber: string;
  phone: string;
  email: string;
  company: string;
  status: 'active' | 'inactive';
  gender: string;
  civilStatus: string;
  birthDate: string;
  bloodType: string;
  nationality: string;
  licenciaDeConducir: string;
  hierarchy: string;
  title: string;
  minSalary: number;
  currentSalary: number;
  maxSalary: number;
  zonaDeTrabajo: string;
  contractStartDate: string;
  contractEndDate: string;
  contractTypeId?: string;
  country: string;
  state: string;
  parish: string;
  emergencyContact: {
    name: string;
    phone: string;
  };
  documents: Document[];
  // For custom fields
  [key: string]: any;
}

export type NewEmployee = Omit<Employee, 'id'>;

export interface Company {
  id: string;
  name: string;
  email: string;
  address: string;
}

export interface SystemLog {
  id: string;
  user: string;
  action: string;
  timestamp: string;
  details: string;
}

export interface FormFieldOption {
  id: string;
  fieldType: string; // Changed to string to allow for custom fields
  value: string;
}

export type Permission =
  // Employees
  | 'employees:read'
  | 'employees:create'
  | 'employees:update'
  | 'employees:delete'
  | 'employees:read:salary' // Specific permission for salary info
  | 'employees:update:own' // For employee self-service
  // Absences
  | 'absences:manage'
  // Inventory
  | 'inventory:read'
  | 'inventory:create'
  | 'inventory:update'
  | 'inventory:delete'
  // Loans
  | 'loans:read'
  | 'loans:create'
  | 'loans:update'
  | 'loans:delete'
  // Documents
  | 'documents:read:all'
  | 'documents:upload'
  | 'documents:delete'
  // Reports
  | 'reports:read'
  // History
  | 'history:read'
  // Settings
  | 'settings:write' // A single permission for all settings for simplicity
  | 'roles:write' // Permission to manage roles and permissions itself
  // FIX: Added missing checklist permissions
  | 'checklists:assign'
  | 'checklists:update_tasks';

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  isDeletable: boolean; // Admin role cannot be deleted
}

export interface User {
  id: string;
  email: string;
  password?: string;
  roleId: string;
  isActive: boolean;
}

export type AuthenticatedUser = Omit<User, 'password'> & {
    permissions: Permission[];
    roleName: string;
};


// --- Absence Management Types ---
export interface LeavePolicy {
  id: string;
  name: string;
  daysPerYear: number;
  allowNegativeBalance: boolean;
}

export interface LeaveBalance {
  employeeId: string;
  policyId: string;
  balance: number;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  policyId: string;
  startDate: string;
  endDate: string;
  requestedDays: number;
  reason: string;
  status: 'Pendiente' | 'Aprobado' | 'Rechazado' | 'Cancelado';
  managerNotes?: string;
}

// --- New Dashboard Config Types ---

export interface CardConfig {
  id: string;
  title: string;
  visible: boolean;
  dataKey: string;
  icon: 'users' | 'check' | 'x' | 'clipboard' | 'alert' | 'archive';
}

export interface FilterConfig {
  id: string;
  label: string;
  visible: boolean;
  dataKey: string;
}

export interface ChartConfig {
  id: string;
  title: string;
  type: 'bar' | 'pie';
  visible: boolean;
  dataKey: string; // e.g., 'employeesByZona', must match a key in DashboardStats
}

export interface DashboardConfig {
  cards: CardConfig[];
  filters: FilterConfig[];
  charts: ChartConfig[];
}

export interface DashboardConfigs {
    [key: string]: DashboardConfig;
}

export interface DashboardStats {
  [key: string]: number | { name: string; value: number }[];
}

export interface CustomFieldDef {
  id: string;
  label: string;
  type: 'text' | 'select';
  section: 'personal' | 'professional' | 'contact';
}

export interface Notification {
  id: string;
  type: 'birthday' | 'loan' | 'low_stock' | 'accessory_low_stock' | 'contract_expiry' | 'leave_balance_limit';
  referenceId: string; // employeeId, loanId, or inventoryItemId
  message: string;
  status: 'read' | 'unread' | 'archived';
  timestamp: string;
}

// --- Salary Management Types ---

export interface SalaryConfig {
  primaryCurrency: string; // e.g., 'USD'
  secondaryCurrency: string; // e.g., 'EUR'
}

export interface Currency {
  id: string;
  code: string; // e.g., 'USD'
  name: string; // e.g., 'Dólar estadounidense'
}

export interface ConversionRate {
  id: string;
  from: string; // e.g., 'USD'
  to: string; // e.g., 'EUR'
  rate: number;
}

// --- New Loan and Inventory Management Types ---
export interface InventoryCategory {
  id: string;
  name: string;
}

export interface Accessory {
  id: string;
  categoryId: string;
  name: string;
  company: string;
  totalStock: number;
  minStock: number;
  unit: string;
  status: 'Activo' | 'Inactivo';
  creationDate?: string;
  availableStock?: number;
}

export interface InventoryItem {
  id: string;
  categoryId: string;
  name: string;
  identifier: string;
  company: string;
  totalStock: number;
  minStock: number;
  status: 'Activo' | 'Inactivo';
  unit: string;
  creationDate?: string;
  // availableStock will be calculated on the fly by the API
  availableStock?: number;
}

export interface InventoryMovementLog {
  id: string;
  itemId: string; // Can be InventoryItem ID or Accessory ID
  itemType: 'item' | 'accessory';
  timestamp: string;
  user: string;
  action: 'Creación' | 'Ajuste Manual (+)' | 'Ajuste Manual (-)' | 'Préstamo Creado' | 'Préstamo Devuelto' | 'Asignación Permanente' | 'Eliminado';
  quantityChange: number;
  notes: string;
}

export interface AssignedAccessory {
  id: string;
  isPermanent: boolean;
}

export interface Loan {
  id: string;
  employeeId: string;
  inventoryItemId: string;
  isItemPermanent: boolean;
  instanceDetails?: string; // e.g., Serial Number
  categoryId: string;
  deliveryDate: string;
  returnDate: string | null;
  assignedAccessories: AssignedAccessory[];
  status: 'Activo' | 'Devuelto';
}

export interface LoanConfig {
    alertDaysBeforeExpiry: number;
}

export interface InventoryConfig {
    enableLowStockAlerts: boolean;
}

// --- New Reporting Types ---
export type ReportCategoryKey = 'employees' | 'loans' | 'inventory' | 'system' | 'absences';

export interface ReportColumn {
    key: string;
    label: string;
}

export type ReportChartType = 'bar' | 'pie' | 'line';

export interface ReportChartDefinition {
    id: string;
    title: string;
    type: ReportChartType;
}

export interface ReportDefinition {
    id: string;
    label: string;
    columns: ReportColumn[];
    charts: ReportChartDefinition[];
}

export interface ReportChartData {
    id: string;
    title: string;
    type: ReportChartType;
    data: { name: string; value: number }[];
}

export interface ReportData {
    tableData: Record<string, any>[];
    chartData: ReportChartData[];
}

export interface ContractType {
  id: string;
  name: string;
  alertDaysBeforeExpiry: number;
  isActive: boolean;
}

export interface PdfCustomization {
    headerText: string;
    footerText: string;
    logoUrl: string;
    orientation: 'portrait' | 'landscape';
    size: 'A4' | 'Letter' | 'Legal';
}

export interface ReportVisibility {
    [reportId: string]: { isActive: boolean };
}

export interface ReportSettings {
    pdf: PdfCustomization;
    reports: ReportVisibility;
}

// --- New System Customization Types ---

export type PaletteColors = {
    '--color-primary': string;
    '--color-secondary': string;
    '--color-background': string;
    '--color-surface': string;
    '--color-on-surface': string;
    '--color-on-surface-variant': string;
    '--color-error': string;
    '--color-alert': string;
    '--color-success': string;
    '--color-info': string;
    '--color-primary-dark-hover': string;
    '--color-secondary-dark-hover': string;
    '--color-primary-light-hover': string;
    '--color-neutral-border': string;
    '--color-table-row-striped': string;
};

export interface CustomTheme {
  id: string;
  name: string;
  palettes: {
      light: PaletteColors;
      dark: PaletteColors;
  };
}

export interface CustomizeSettings {
  branding: {
    logoUrlMain: string;
    logoUrlAlt: string;
    logoUrlPdf: string;
    faviconUrl: string;
    headerTitle: string;
    headerSubtitle: string;
    footerText: string;
    loginWelcomeMessage: string;
  };
  theme: {
    mode: 'dark' | 'light';
    colorVariant: 'default' | 'variant1' | 'variant2' | string;
  };
  customThemes: CustomTheme[];
  layout: {
    sidebarDefaultCollapsed: boolean;
    animationsEnabled: boolean;
    headerVisible: boolean;
    footerVisible: boolean;
  };
  globalFormat: {
    dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
    timeFormat: '12h' | '24h';
    timezone: string;
    currencyStyle: 'symbol_before' | 'symbol_after';
    decimalPlaces: number;
    decimalSeparator: '.' | ',';
    thousandsSeparator: ',' | '.' | ' ';
    defaultUnit: string;
  };
  tables: {
    density: 'compacta' | 'media' | 'amplia';
    rowStyle: 'plain' | 'striped';
    defaultPageSize: 10 | 20 | 50;
    showExport: boolean;
  };
  notifications: {
      position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
      soundEnabled: boolean;
      soundName: 'default' | 'chime' | 'ding';
      enabledModules: {
          inventory: boolean;
          loans: boolean;
          contracts: boolean;
          birthdays: boolean;
      };
  };
  accessibility: {
    fontSize: 'small' | 'medium' | 'large';
    highContrast: boolean;
  };
}

// --- New Org Chart Types ---
export interface OrgNode {
  id: string;
  name: string;
  unitType: string;
  employeeIds: string[];
  children: OrgNode[];
}

// --- New Profile Change Request Types ---
export interface PendingChange {
    field: string;
    oldValue: any;
    newValue: any;
}

export interface PendingChangeRequest {
    id: string;
    employeeId: string;
    employeeName: string;
    requestedAt: string;
    changes: PendingChange[];
}

// --- New Checklist Types ---
export interface ChecklistTask {
    id: string;
    text: string;
    responsible: 'Empleado' | 'Gerente' | 'RRHH' | 'TI';
}

export interface ChecklistTemplate {
    id: string;
    name: string;
    type: 'Onboarding' | 'Offboarding';
    tasks: ChecklistTask[];
}

export interface AssignedChecklistTask extends ChecklistTask {
    isCompleted: boolean;
    completedAt?: string;
}

export interface AssignedChecklist {
    id: string;
    employeeId: string;
    templateId: string;
    templateName: string;
    assignedDate: string;
    tasks: AssignedChecklistTask[];
}
