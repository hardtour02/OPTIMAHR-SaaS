// FIX: Added 'ReportChartData' to the import list to resolve a 'Cannot find name' error.
// FIX: Added missing types for new mock data and API functions.
import { Employee, Company, SystemLog, NewEmployee, FormFieldOption, User, DashboardConfig, CustomFieldDef, Notification, SalaryConfig, Currency, ConversionRate, CardConfig, FilterConfig, ChartConfig, InventoryCategory, InventoryItem, Loan, LoanConfig, Accessory, InventoryConfig, InventoryMovementLog, DashboardConfigs, ReportDefinition, ReportData, ContractType, ReportCategoryKey, ReportSettings, CustomizeSettings, AuthenticatedUser, Role, Permission, Document, DashboardStats, ReportChartType, ReportVisibility, LeavePolicy, LeaveBalance, LeaveRequest, ReportChartData, OrgNode as OrgNodeType, PendingChange, PendingChangeRequest, ChecklistTemplate, AssignedChecklist } from '../types';

let MOCK_CONTRACT_TYPES: ContractType[] = [
    { id: 'ct_1', name: 'Tiempo Indeterminado', alertDaysBeforeExpiry: 0, isActive: true },
    { id: 'ct_2', name: 'Tiempo Determinado (1 Año)', alertDaysBeforeExpiry: 30, isActive: true },
    { id: 'ct_3', name: 'Por Proyecto', alertDaysBeforeExpiry: 15, isActive: true },
    { id: 'ct_4', name: 'Pasantías (Obsoleto)', alertDaysBeforeExpiry: 10, isActive: false },
];


let MOCK_EMPLOYEES: Employee[] = [
  { id: '1', photoUrl: 'https://picsum.photos/id/1005/200/200', firstName: 'Carlos', lastName: 'Santana', idNumber: 'V-12345678', phone: '555-0101', email: 'carlos.s@example.com', company: 'GlobalTech', status: 'active', gender: 'Masculino', civilStatus: 'Casado/a', birthDate: '1985-07-20', bloodType: 'O+', nationality: 'Venezolano', licenciaDeConducir: 'Sí', hierarchy: 'Presidente', title: 'Presidente', minSalary: 100000, currentSalary: 120000, maxSalary: 140000, zonaDeTrabajo: 'oficina', contractStartDate: '2020-01-15', contractEndDate: '2025-01-14', contractTypeId: 'ct_2', country: 'Venezuela', state: 'Distrito Capital', parish: 'El Recreo', emergencyContact: { name: 'Maria Santana', phone: '555-0102' }, documents: [
      { id: 'doc1_v1', name: 'Contrato_Firmado.pdf', type: 'Contrato', size: 512000, uploadDate: new Date('2020-01-15').toISOString(), version: 1, url: '#' },
      { id: 'doc2_v1', name: 'Foto_Pasaporte.jpg', type: 'Cédula de Identidad', size: 1228800, uploadDate: new Date('2020-01-15').toISOString(), version: 1, url: 'https://picsum.photos/id/1005/800/600' }
  ], Hobbies: 'Guitarra', Certificaciones: 'PMP' },
  { id: '2', photoUrl: 'https://picsum.photos/id/1011/200/200', firstName: 'Ana', lastName: 'Guevara', idNumber: 'V-23456789', phone: '555-0103', email: 'ana.g@example.com', company: 'GlobalTech', status: 'active', gender: 'Femenino', civilStatus: 'Soltero/a', birthDate: '1992-03-15', bloodType: 'A+', nationality: 'Colombiano', licenciaDeConducir: 'No', hierarchy: 'Vice-presidente', title: 'VP de Tecnología', minSalary: 85000, currentSalary: 95000, maxSalary: 105000, zonaDeTrabajo: 'oficina', contractStartDate: '2021-06-01', contractEndDate: '2024-05-31', contractTypeId: 'ct_2', country: 'Colombia', state: 'Cundamarca', parish: 'Chapinero', emergencyContact: { name: 'Luis Guevara', phone: '555-0104' }, documents: [], Certificaciones: 'Scrum Master' },
  { id: '3', photoUrl: 'https://picsum.photos/id/1025/200/200', firstName: 'Luis', lastName: 'Perez', idNumber: 'V-18765432', phone: '555-0105', email: 'luis.p@example.com', company: 'Innovate Solutions', status: 'active', gender: 'Masculino', civilStatus: 'Divorciado/a', birthDate: '1988-11-30', bloodType: 'B+', nationality: 'Venezolano', licenciaDeConducir: 'En trámite', hierarchy: 'Gerente de Proyectos', title: 'Gerente de Desarrollo', minSalary: 70000, currentSalary: 75000, maxSalary: 80000, zonaDeTrabajo: 'campo a', contractStartDate: '2019-03-10', contractEndDate: '2024-03-09', contractTypeId: 'ct_3', country: 'Venezuela', state: 'Carabobo', parish: 'Valencia', emergencyContact: { name: 'Elena Perez', phone: '555-0106' }, documents: [] },
  { id: '4', photoUrl: 'https://picsum.photos/id/1027/200/200', firstName: 'Maria', lastName: 'Rodriguez', idNumber: 'E-87654321', phone: '555-0107', email: 'maria.r@example.com', company: 'Innovate Solutions', status: 'active', gender: 'Femenino', civilStatus: 'Viudo/a', birthDate: '1980-01-25', bloodType: 'AB-', nationality: 'Argentino', licenciaDeConducir: 'Sí', hierarchy: 'Desarrollador Senior', title: 'Desarrollador Frontend Senior', minSalary: 60000, currentSalary: 65000, maxSalary: 70000, zonaDeTrabajo: 'remoto', contractStartDate: '2018-05-20', contractEndDate: '2026-05-19', contractTypeId: 'ct_1', country: 'Argentina', state: 'Buenos Aires', parish: 'Palermo', emergencyContact: { name: 'Juan Rodriguez', phone: '555-0108' }, documents: [] }
];

let MOCK_COMPANIES: Company[] = [
    { id: '1', name: 'GlobalTech', email: 'contact@globaltech.com', address: 'Caracas, Venezuela' },
    { id: '2', name: 'Innovate Solutions', email: 'info@innovatesol.com', address: 'Bogotá, Colombia' },
    { id: '3', name: 'Creative Minds', email: 'hello@creativeminds.com', address: 'Buenos Aires, Argentina' },
];

let MOCK_ROLES: Role[] = [
    { 
        id: 'role_admin', 
        name: 'Admin', 
        description: 'Acceso total al sistema.', 
        permissions: [], // Admin has all permissions implicitly in useAuth hook
        isDeletable: false 
    },
    { 
        id: 'role_viewer', 
        name: 'Visualizador', 
        description: 'Puede ver la mayoría de los datos pero no puede editar.', 
        permissions: [
            'employees:read',
            'inventory:read',
            'loans:read',
            'reports:read',
            'history:read',
        ], 
        isDeletable: true 
    },
    { 
        id: 'role_employee', 
        name: 'Empleado', 
        description: 'Acceso de autoservicio para empleados.', 
        permissions: [
            'employees:read',
            'employees:update:own',
        ], 
        isDeletable: true 
    },
];

let MOCK_USERS: User[] = [
    { id: '1', email: 'admin@hrpro.com', password: 'password', roleId: 'role_admin', isActive: true },
    { id: '2', email: 'viewer@hrpro.com', password: 'password', roleId: 'role_viewer', isActive: true },
    { id: '3', email: 'inactive@hrpro.com', password: 'password', roleId: 'role_viewer', isActive: false },
    { id: 'user_emp_1', email: 'carlos.s@example.com', password: 'password', roleId: 'role_employee', isActive: true },
    { id: 'user_emp_2', email: 'ana.g@example.com', password: 'password', roleId: 'role_employee', isActive: true },
    { id: 'user_emp_3', email: 'luis.p@example.com', password: 'password', roleId: 'role_employee', isActive: true },
    { id: 'user_emp_4', email: 'maria.r@example.com', password: 'password', roleId: 'role_employee', isActive: true },
];

let MOCK_DASHBOARD_CONFIGS: DashboardConfigs = {
    employees: {
        cards: [
            { id: 'card_total', title: 'Total de Empleados', visible: true, dataKey: 'totalEmployees', icon: 'users' },
            { id: 'card_active', title: 'Empleados Activos', visible: true, dataKey: 'activeEmployees', icon: 'check' },
            { id: 'card_inactive', title: 'Empleados Inactivos', visible: true, dataKey: 'inactiveEmployees', icon: 'x' },
        ],
        filters: [
            { id: 'filter_gender', label: 'Género', visible: true, dataKey: 'gender' },
            { id: 'filter_hierarchy', label: 'Jerarquía', visible: true, dataKey: 'hierarchy' },
            { id: 'filter_company', label: 'Empresa', visible: true, dataKey: 'company' },
            { id: 'filter_status', label: 'Estatus', visible: true, dataKey: 'status' },
            { id: 'filter_blood', label: 'Tipo de Sangre', visible: true, dataKey: 'bloodType' },
            { id: 'filter_license', label: 'Licencia de Conducir', visible: true, dataKey: 'licenciaDeConducir' },
            { id: 'filter_civil', label: 'Estado Civil', visible: true, dataKey: 'civilStatus' },
            { id: 'filter_workzone', label: 'Zona de Trabajo', visible: true, dataKey: 'zonaDeTrabajo' },
            { id: 'filter_title', label: 'Cargo/Título', visible: true, dataKey: 'title' },
            { id: 'filter_certs', label: 'Certificaciones', visible: true, dataKey: 'Certificaciones' },
        ],
        charts: [
            { id: 'chart_salary', title: 'Salario Actual por Empleado', type: 'bar', visible: true, dataKey: 'salaryPerEmployee' },
            { id: 'chart_license', title: 'Licencia de Conducir', type: 'bar', visible: true, dataKey: 'employeesByLicense' },
            { id: 'chart_workzone', title: 'Zona de Trabajo', type: 'pie', visible: true, dataKey: 'employeesByZona' },
        ]
    },
    loans: {
        cards: [
            { id: 'card_total_loans', title: 'Préstamos Totales', visible: true, dataKey: 'totalLoans', icon: 'clipboard' },
            { id: 'card_active_loans', title: 'Préstamos Activos', visible: true, dataKey: 'activeLoans', icon: 'check' },
            { id: 'card_overdue_loans', title: 'Préstamos Vencidos', visible: true, dataKey: 'overdueLoans', icon: 'alert' },
            // FIX: Added missing 'icon' property and corrected 'dataKey' to align with the CardConfig type and stats generation.
            { id: 'card_returned_loans', title: 'Préstamos Devueltos', visible: true, dataKey: 'returnedLoans', icon: 'archive' },
        ],
        filters: [
             { id: 'filter_loan_category', label: 'Categoría', visible: true, dataKey: 'categoryId' },
             { id: 'filter_loan_status', label: 'Estado', visible: true, dataKey: 'status' },
        ],
        charts: [
            { id: 'chart_loans_by_cat', title: 'Préstamos por Categoría', type: 'pie', visible: true, dataKey: 'loansByCategory' },
            { id: 'chart_loans_by_emp', title: 'Top 5 Empleados con Préstamos', type: 'bar', visible: true, dataKey: 'loansByEmployee' },
        ]
    },
    inventory_items: {
        cards: [
            { id: 'card_total_items', title: 'Ítems Totales', visible: true, dataKey: 'totalItems', icon: 'archive' },
            { id: 'card_low_stock_items', title: 'Ítems con Poco Stock', visible: true, dataKey: 'lowStockItems', icon: 'alert' },
        ],
        filters: [
            { id: 'filter_inv_category', label: 'Categoría', visible: true, dataKey: 'categoryId' },
            { id: 'filter_inv_status', label: 'Estado', visible: true, dataKey: 'status' },
        ],
        charts: [
            { id: 'chart_items_by_cat', title: 'Ítems por Categoría', type: 'pie', visible: true, dataKey: 'itemsByCategory' },
            { id: 'chart_items_by_status', title: 'Estado de Ítems', type: 'pie', visible: true, dataKey: 'itemsByStatus' },
            { id: 'chart_items_availability', title: 'Disponibilidad de Ítems', type: 'pie', visible: true, dataKey: 'stockAvailability' },
            { id: 'chart_items_health', title: 'Salud del Stock (Ítems)', type: 'pie', visible: true, dataKey: 'stockHealth' },
        ]
    },
    inventory_accessories: {
        cards: [
            { id: 'card_total_acc', title: 'Accesorios Totales', visible: true, dataKey: 'totalAccessories', icon: 'clipboard' },
            { id: 'card_low_stock_acc', title: 'Accesorios con Poco Stock', visible: true, dataKey: 'lowStockAccessories', icon: 'alert' },
        ],
        filters: [
            { id: 'filter_inv_category', label: 'Categoría', visible: true, dataKey: 'categoryId' },
            { id: 'filter_inv_status', label: 'Estado', visible: true, dataKey: 'status' },
        ],
        charts: [
            { id: 'chart_acc_by_cat', title: 'Accesorios por Categoría', type: 'bar', visible: true, dataKey: 'accessoriesByCategory' },
            { id: 'chart_acc_by_status', title: 'Estado de Accesorios', type: 'pie', visible: true, dataKey: 'accessoriesByStatus' },
            { id: 'chart_acc_availability', title: 'Disponibilidad de Accesorios', type: 'pie', visible: true, dataKey: 'accessoryStockAvailability' },
            { id: 'chart_acc_health', title: 'Salud del Stock (Accesorios)', type: 'pie', visible: true, dataKey: 'accessoryStockHealth' },
        ]
    },
    absences: {
        cards: [
            { id: 'card_total_absences', title: 'Solicitudes Totales', visible: true, dataKey: 'totalRequests', icon: 'clipboard' },
            { id: 'card_pending_absences', title: 'Solicitudes Pendientes', visible: true, dataKey: 'pendingRequests', icon: 'alert' },
            { id: 'card_approved_month', title: 'Aprobadas (Este Mes)', visible: true, dataKey: 'approvedThisMonth', icon: 'check' },
            { id: 'card_rejected_month', title: 'Rechazadas (Este Mes)', visible: true, dataKey: 'rejectedThisMonth', icon: 'x' },
        ],
        filters: [
            { id: 'filter_absence_policy', label: 'Tipo de Ausencia', visible: true, dataKey: 'policyId' },
            { id: 'filter_absence_status', label: 'Estado', visible: true, dataKey: 'status' },
        ],
        charts: [
            { id: 'chart_absences_by_type', title: 'Ausencias por Tipo', type: 'pie', visible: true, dataKey: 'absencesByType' },
            { id: 'chart_absences_by_status', title: 'Ausencias por Estado', type: 'pie', visible: true, dataKey: 'absencesByStatus' },
        ]
    }
};


let MOCK_FIELD_OPTIONS: FormFieldOption[] = [
  // Personal
  { id: 'gen1', fieldType: 'gender', value: 'Masculino' },
  { id: 'gen2', fieldType: 'gender', value: 'Femenino' },
  { id: 'gen3', fieldType: 'gender', value: 'Otro' },
  { id: 'civ1', fieldType: 'civilStatus', value: 'Soltero/a' },
  { id: 'civ2', fieldType: 'civilStatus', value: 'Casado/a' },
  { id: 'civ3', fieldType: 'civilStatus', value: 'Divorciado/a' },
  { id: 'civ4', fieldType: 'civilStatus', value: 'Viudo/a' },
  { id: 'nat1', fieldType: 'nationality', value: 'Venezolano' },
  { id: 'nat2', fieldType: 'nationality', value: 'Colombiano' },
  { id: 'nat3', fieldType: 'nationality', value: 'Argentino' },
  { id: 'nat4', fieldType: 'nationality', value: 'Español' },
  { id: 'bld1', fieldType: 'bloodType', value: 'A+' }, { id: 'bld2', fieldType: 'bloodType', value: 'A-' }, { id: 'bld3', fieldType: 'bloodType', value: 'B+' }, { id: 'bld4', fieldType: 'bloodType', value: 'B-' }, { id: 'bld5', fieldType: 'bloodType', value: 'AB+' }, { id: 'bld6', fieldType: 'bloodType', value: 'AB-' }, { id: 'bld7', fieldType: 'bloodType', value: 'O+' }, { id: 'bld8', fieldType: 'bloodType', value: 'O-' },
  { id: 'lic1', fieldType: 'licenciaDeConducir', value: 'Sí' },
  { id: 'lic2', fieldType: 'licenciaDeConducir', value: 'No' },
  { id: 'lic3', fieldType: 'licenciaDeConducir', value: 'En trámite' },

  // Professional
  { id: 'tit1', fieldType: 'title', value: 'Ing. en Sistemas' },
  { id: 'tit2', fieldType: 'title', value: 'Lic. en Computación' },
  { id: 'tit3', fieldType: 'title', value: 'TSU Diseño Gráfico' },
  { id: 'tit4', fieldType: 'title', value: 'Diseñadora Gráfica' },
  { id: 'tit5', fieldType: 'title', value: 'Desarrollador Frontend Senior' },
  { id: 'tit6', fieldType: 'title', value: 'Gerente de Desarrollo' },
  { id: 'tit7', fieldType: 'title', value: 'VP de Tecnología' },
  { id: 'tit8', fieldType: 'title', value: 'Presidente' },
  { id: 'hie1', fieldType: 'hierarchy', value: 'Gerente de Proyectos' },
  { id: 'hie2', fieldType: 'hierarchy', value: 'Desarrollador Senior' },
  { id: 'hie3', fieldType: 'hierarchy', value: 'Diseñador UI/UX' },
  { id: 'hie4', fieldType: 'hierarchy', value: 'Directora de Arte' },
  { id: 'hie5', fieldType: 'hierarchy', value: 'Presidente' },
  { id: 'hie6', fieldType: 'hierarchy', value: 'Vice-presidente' },
  { id: 'zon1', fieldType: 'zonaDeTrabajo', value: 'oficina' },
  { id: 'zon2', fieldType: 'zonaDeTrabajo', value: 'campo a' },
  { id: 'zon3', fieldType: 'zonaDeTrabajo', value: 'campo b' },
  { id: 'zon4', fieldType: 'zonaDeTrabajo', value: 'remoto' },
  { id: 'sta1', fieldType: 'status', value: 'active' },
  { id: 'sta2', fieldType: 'status', value: 'inactive' },
  
  // Contact
  { id: 'cou1', fieldType: 'country', value: 'Venezuela' },
  { id: 'cou2', fieldType: 'country', value: 'Colombia' },
  { id: 'cou3', fieldType: 'country', value: 'Argentina' },
  { id: 'sta1_ct', fieldType: 'state', value: 'Distrito Capital' },
  { id: 'sta2_ct', fieldType: 'state', value: 'Cundamarca' },
  { id: 'sta3_ct', fieldType: 'state', value: 'Carabobo' },
  { id: 'sta4_ct', fieldType: 'state', value: 'Buenos Aires' },
  { id: 'par1_ct', fieldType: 'parish', value: 'El Recreo' },
  { id: 'par2_ct', fieldType: 'parish', value: 'Chapinero' },
  { id: 'par3_ct', fieldType: 'parish', value: 'Valencia' },
  { id: 'par4_ct', fieldType: 'parish', value: 'Palermo' },

  // Custom Fields Options
  { id: 'cert1', fieldType: 'Certificaciones', value: 'AWS Certified' },
  { id: 'cert2', fieldType: 'Certificaciones', value: 'PMP' },
  { id: 'cert3', fieldType: 'Certificaciones', value: 'Scrum Master' },

  // Inventory Units
  { id: 'unit1', fieldType: 'inventoryUnit', value: 'Unidad' },
  { id: 'unit2', fieldType: 'inventoryUnit', value: 'Litro' },
  { id: 'unit3', fieldType: 'inventoryUnit', value: 'Kg' },
  { id: 'unit4', fieldType: 'inventoryUnit', value: 'Par' },

  // Document Types
  { id: 'doc_type_1', fieldType: 'documentType', value: 'Contrato' },
  { id: 'doc_type_2', fieldType: 'documentType', value: 'Cédula de Identidad' },
  { id: 'doc_type_3', fieldType: 'documentType', value: 'Certificación' },
  { id: 'doc_type_4', fieldType: 'documentType', value: 'Examen Médico' },

  // Absence Statuses
  { id: 'abs_stat_1', fieldType: 'absenceStatus', value: 'Pendiente' },
  { id: 'abs_stat_2', fieldType: 'absenceStatus', value: 'Aprobado' },
  { id: 'abs_stat_3', fieldType: 'absenceStatus', value: 'Rechazado' },
  { id: 'abs_stat_4', fieldType: 'absenceStatus', value: 'Cancelado' },
];

let MOCK_CUSTOM_FIELDS: CustomFieldDef[] = [
    { id: 'cf_pers_1', label: 'Hobbies', type: 'text', section: 'personal' },
    { id: 'cf_prof_1', label: 'Certificaciones', type: 'select', section: 'professional' }
];

const MOCK_LOGS: SystemLog[] = [
    {id: '1', user: 'admin@hrpro.com', action: 'Creación de empleado', timestamp: '2023-10-27T10:00:00.000Z', details: 'Empleado Carlos Santana creado.'},
    {id: '2', user: 'admin@hrpro.com', action: 'Inicio de sesión', timestamp: '2023-10-27T09:58:00.000Z', details: 'Inicio de sesión exitoso.'},
    {id: '3', user: 'viewer@hrpro.com', action: 'Reporte generado', timestamp: '2023-10-26T15:30:00.000Z', details: 'Reporte de salarios generado.'},
    {id: '4', user: 'admin@hrpro.com', action: 'Edición de empresa', timestamp: '2023-10-26T11:00:00.000Z', details: 'Empresa GlobalTech actualizada.'},
    {id: '5', user: 'viewer@hrpro.com', action: 'Inicio de sesión', timestamp: '2023-10-28T11:00:00.000Z', details: 'Inicio de sesión exitoso.'},
];

let MOCK_NOTIFICATIONS: Notification[] = [];

// --- Salary Management Mocks ---
let MOCK_SALARY_CONFIG: SalaryConfig = {
    primaryCurrency: 'USD',
    secondaryCurrency: 'EUR',
};
let MOCK_CURRENCIES: Currency[] = [
    { id: 'cur_1', code: 'USD', name: 'Dólar estadounidense' },
    { id: 'cur_2', code: 'EUR', name: 'Euro' },
    { id: 'cur_3', code: 'USDT', name: 'Tether' },
    { id: 'cur_4', code: 'CLP', name: 'Peso chileno' },
    { id: 'cur_5', code: 'CNY', name: 'Yuan chino' },
];
let MOCK_CONVERSION_RATES: ConversionRate[] = [
    { id: 'rate_1', from: 'USD', to: 'EUR', rate: 0.95 },
    { id: 'rate_2', from: 'USD', to: 'USDT', rate: 1.00 },
    { id: 'rate_3', from: 'USD', to: 'CLP', rate: 930.50 },
    { id: 'rate_4', from: 'USD', to: 'CNY', rate: 7.29 },
];
// --- End Salary Management Mocks ---


// --- Inventory and Loan Mocks ---
let MOCK_INVENTORY_CONFIG: InventoryConfig = {
    enableLowStockAlerts: true,
};

let MOCK_LOAN_CONFIG: LoanConfig = {
    alertDaysBeforeExpiry: 3,
};

let MOCK_INVENTORY_CATEGORIES: InventoryCategory[] = [
    { id: 'cat_1', name: 'Vehículos' },
    { id: 'cat_2', name: 'Equipos de Cómputo' },
];

let MOCK_INVENTORY_ITEMS: InventoryItem[] = [
    { id: 'item_1', categoryId: 'cat_1', name: 'Toyota Corolla 2022', identifier: 'AA123BC', company: 'GlobalTech', totalStock: 1, minStock: 0, status: 'Activo', unit: 'Unidad', creationDate: '2023-01-10T10:00:00.000Z' },
    { id: 'item_2', categoryId: 'cat_1', name: 'Ford Ranger 2021', identifier: 'AB456CD', company: 'Innovate Solutions', totalStock: 1, minStock: 0, status: 'Activo', unit: 'Unidad', creationDate: '2023-02-15T10:00:00.000Z' },
    { id: 'item_3', categoryId: 'cat_2', name: 'Laptop Dell XPS 15', identifier: 'DELL-XPS-15', company: 'GlobalTech', totalStock: 5, minStock: 2, status: 'Activo', unit: 'Unidad', creationDate: '2023-03-20T10:00:00.000Z' },
    { id: 'item_5', categoryId: 'cat_2', name: 'Monitor LG 27" 4K', identifier: 'LG-27-4K', company: 'GlobalTech', totalStock: 10, minStock: 3, status: 'Activo', unit: 'Unidad', creationDate: '2023-04-05T10:00:00.000Z' },
];

let MOCK_INVENTORY_MOVEMENTS: InventoryMovementLog[] = [
    { id: 'mov_1', itemId: 'item_3', itemType: 'item', timestamp: new Date('2023-01-01').toISOString(), user: 'system', action: 'Creación', quantityChange: 5, notes: 'Stock inicial' },
    { id: 'mov_2', itemId: 'item_5', itemType: 'item', timestamp: new Date('2023-01-01').toISOString(), user: 'system', action: 'Creación', quantityChange: 10, notes: 'Stock inicial' },
];

let MOCK_ACCESSORIES: Accessory[] = [
    { id: 'acc_1', categoryId: 'cat_1', name: 'Gato Hidráulico', company: 'GlobalTech', totalStock: 2, minStock: 1, unit: 'Unidad', status: 'Activo', creationDate: '2023-01-10T10:00:00.000Z' },
    { id: 'acc_2', categoryId: 'cat_1', name: 'Caucho de Repuesto', company: 'Innovate Solutions', totalStock: 2, minStock: 1, unit: 'Unidad', status: 'Activo', creationDate: '2023-02-15T10:00:00.000Z' },
    { id: 'acc_3', categoryId: 'cat_2', name: 'Cargador USB-C 90W', company: 'GlobalTech', totalStock: 10, minStock: 3, unit: 'Unidad', status: 'Activo', creationDate: '2023-03-20T10:00:00.000Z' },
    { id: 'acc_4', categoryId: 'cat_2', name: 'Mouse Inalámbrico Logitech', company: 'GlobalTech', totalStock: 8, minStock: 3, unit: 'Unidad', status: 'Activo', creationDate: '2023-04-05T10:00:00.000Z' },
];

const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
const nextWeek = new Date();
nextWeek.setDate(nextWeek.getDate() + 7);

let MOCK_LOANS: Loan[] = [
    { id: 'loan_1', employeeId: '2', inventoryItemId: 'item_2', categoryId: 'cat_1', isItemPermanent: false, deliveryDate: new Date('2023-10-01').toISOString(), returnDate: tomorrow.toISOString(), assignedAccessories: [{id: 'acc_2', isPermanent: false}], instanceDetails: 'Placa AB456CD', status: 'Activo' },
    { id: 'loan_2', employeeId: '4', inventoryItemId: 'item_3', categoryId: 'cat_2', isItemPermanent: false, deliveryDate: new Date('2023-09-15').toISOString(), returnDate: nextWeek.toISOString(), assignedAccessories: [{id: 'acc_3', isPermanent: true}, {id: 'acc_4', isPermanent: false}], instanceDetails: 'S/N: ABC1', status: 'Activo' },
];
// --- End Mocks ---

// --- Org Chart & Profile Changes Mocks ---
let MOCK_ORG_CHART: OrgNodeType = {
    id: 'org_1', name: 'GlobalTech', unitType: 'Empresa', employeeIds: ['1'],
    children: [
        { id: 'org_2', name: 'Tecnología', unitType: 'Vice-presidencia', employeeIds: ['2'],
          children: [
              { id: 'org_3', name: 'Desarrollo', unitType: 'Gerencia', employeeIds: ['3'], children: [
                  { id: 'org_4', name: 'Frontend', unitType: 'Equipo', employeeIds: ['4'], children: [] }
              ]}
          ]
        }
    ]
};

let MOCK_PENDING_CHANGES: PendingChangeRequest[] = [
    { id: 'pcr_1', employeeId: '4', employeeName: 'Maria Rodriguez', requestedAt: new Date().toISOString(),
      changes: [
          { field: 'phone', oldValue: '555-0107', newValue: '555-0109' },
          { field: 'civilStatus', oldValue: 'Viudo/a', newValue: 'Soltero/a'}
      ]
    }
];

// --- Checklist Mocks ---
let MOCK_CHECKLIST_TEMPLATES: ChecklistTemplate[] = [
    { id: 'tmpl_1', name: 'Onboarding General', type: 'Onboarding', tasks: [
        { id: 't1_1', text: 'Firmar contrato', responsible: 'RRHH' },
        { id: 't1_2', text: 'Configurar email y laptop', responsible: 'TI' },
        { id: 't1_3', text: 'Presentación con el equipo', responsible: 'Gerente' },
    ]},
    { id: 'tmpl_2', name: 'Offboarding General', type: 'Offboarding', tasks: [
        { id: 't2_1', text: 'Entregar equipos', responsible: 'Empleado' },
        { id: 't2_2', text: 'Desactivar accesos', responsible: 'TI' },
    ]}
];
let MOCK_ASSIGNED_CHECKLISTS: AssignedChecklist[] = [
    { id: 'asgn_1', employeeId: '2', templateId: 'tmpl_1', templateName: 'Onboarding General', assignedDate: new Date().toISOString(),
      tasks: [
          { id: 't1_1', text: 'Firmar contrato', responsible: 'RRHH', isCompleted: true, completedAt: new Date().toISOString() },
          { id: 't1_2', text: 'Configurar email y laptop', responsible: 'TI', isCompleted: false },
          { id: 't1_3', text: 'Presentación con el equipo', responsible: 'Gerente', isCompleted: false },
      ]
    }
];
// --- End New Mocks ---


const ALL_PERMISSIONS: { id: Permission, label: string, module: string }[] = [
    // Employees
    { id: 'employees:read', label: 'Ver Empleados', module: 'Empleados' },
    { id: 'employees:create', label: 'Crear Empleados', module: 'Empleados' },
    { id: 'employees:update', label: 'Editar Empleados (Admin)', module: 'Empleados' },
    { id: 'employees:update:own', label: 'Editar Mi Perfil (Autoservicio)', module: 'Empleados' },
    { id: 'employees:delete', label: 'Eliminar Empleados', module: 'Empleados' },
    { id: 'employees:read:salary', label: 'Ver Salarios', module: 'Empleados' },
    // Absences
    { id: 'absences:manage', label: 'Gestionar Ausencias (Aprobar/Rechazar)', module: 'Ausencias' },
    // Inventory
    { id: 'inventory:read', label: 'Ver Inventario', module: 'Inventario' },
    { id: 'inventory:create', label: 'Crear en Inventario', module: 'Inventario' },
    { id: 'inventory:update', label: 'Editar Inventario', module: 'Inventario' },
    { id: 'inventory:delete', label: 'Eliminar de Inventario', module: 'Inventario' },
    // Loans
    { id: 'loans:read', label: 'Ver Préstamos', module: 'Préstamos' },
    { id: 'loans:create', label: 'Crear Préstamos', module: 'Préstamos' },
    { id: 'loans:update', label: 'Editar Préstamos', module: 'Préstamos' },
    { id: 'loans:delete', label: 'Eliminar Préstamos', module: 'Préstamos' },
    // Documents
    { id: 'documents:read:all', label: 'Ver Archivo Digital (Todos)', module: 'Documentos' },
    { id: 'documents:upload', label: 'Subir Documentos', module: 'Documentos' },
    { id: 'documents:delete', label: 'Eliminar Documentos', module: 'Documentos' },
    // Reports
    { id: 'reports:read', label: 'Ver Reportes', module: 'Reportes' },
    // History
    { id: 'history:read', label: 'Ver Historial', module: 'Historial' },
    // Settings
    { id: 'settings:write', label: 'Editar Configuración', module: 'Configuración' },
    { id: 'roles:write', label: 'Gestionar Roles y Usuarios', module: 'Configuración' },
    // Checklists
    { id: 'checklists:assign', label: 'Asignar Checklists', module: 'Checklists' },
    { id: 'checklists:update_tasks', label: 'Actualizar Tareas de Checklist', module: 'Checklists' },
];


// --- Start of Report Definitions ---
const REPORT_DEFINITIONS: Record<ReportCategoryKey, ReportDefinition[]> = {
    employees: [
        { id: 'emp_general', label: 'Reporte General de Empleados', 
          columns: [{key: 'name', label: 'Nombre'}, {key: 'idNumber', label: 'Cédula'}, {key: 'title', label: 'Cargo'}, {key: 'zonaDeTrabajo', label: 'Zona'}, {key: 'contractStartDate', label: 'Ingreso'}, {key: 'contractEndDate', label: 'Fin Contrato'}, {key: 'contractType', label: 'Tipo Contrato'}, {key: 'salary', label: 'Salario Actual'}], 
          charts: [{id: 'chart_salary', title: 'Salario Actual por Empleado', type: 'bar'}, {id: 'chart_by_contract', title: 'Empleados por Tipo de Contrato', type: 'pie'}, {id: 'chart_by_zone', title: 'Empleados por Zona de Trabajo', type: 'pie'}]
        },
        { id: 'emp_contracts', label: 'Reporte de Contratos', 
          columns: [{key: 'employee', label: 'Empleado'}, {key: 'contractType', label: 'Tipo de Contrato'}, {key: 'startDate', label: 'Fecha Inicio'}, {key: 'endDate', label: 'Fecha Vencimiento'}, {key: 'status', label: 'Estado'}], 
          charts: [{id: 'chart_by_type', title: 'Cantidad de Contratos por Tipo', type: 'pie'}, {id: 'chart_expiring', title: 'Contratos Próximos a Vencer', type: 'line'}]
        },
        { id: 'emp_birthdays', label: 'Reporte de Cumpleaños', 
          columns: [{key: 'employee', label: 'Empleado'}, {key: 'birthDate', label: 'Fecha Nacimiento'}, {key: 'age', label: 'Edad'}, {key: 'zonaDeTrabajo', label: 'Zona de Trabajo'}], 
          charts: [{id: 'chart_by_month', title: 'Distribución de Cumpleaños por Mes', type: 'bar'}]
        },
    ],
    absences: [
        {
            id: 'abs_general', label: 'Reporte General de Ausencias',
            columns: [{ key: 'employee', label: 'Empleado' }, { key: 'policy', label: 'Tipo de Ausencia' }, { key: 'startDate', label: 'Fecha Inicio' }, { key: 'endDate', label: 'Fecha Fin' }, { key: 'days', label: 'Días' }, { key: 'status', label: 'Estado' }],
            charts: [{ id: 'chart_by_type', title: 'Ausencias por Tipo', type: 'pie' }, { id: 'chart_by_status', title: 'Ausencias por Estado', type: 'pie' }, { id: 'chart_by_employee', title: 'Top 5 Empleados con Ausencias', type: 'bar' }]
        }
    ],
    loans: [
        { id: 'loan_general', label: 'Reporte General de Préstamos', 
          columns: [{key: 'category', label: 'Categoría'}, {key: 'item', label: 'Item Asignado'}, {key: 'employee', label: 'Empleado'}, {key: 'deliveryDate', label: 'Fecha Entrega'}, {key: 'returnDate', label: 'Fecha Devolución'}, {key: 'status', label: 'Estado'}, {key: 'accessories', label: 'Accesorios'}], 
          charts: [{id: 'chart_by_cat', title: 'Cantidad de Préstamos por Categoría', type: 'pie'}, {id: 'chart_status', title: 'Préstamos Activos vs Devueltos', type: 'pie'}]
        },
        { id: 'loan_accessories', label: 'Reporte de Accesorios en Préstamo', 
          columns: [{key: 'category', label: 'Categoría Principal'}, {key: 'accessory', label: 'Accesorio'}, {key: 'employee', label: 'Empleado'}, {key: 'deliveryDate', label: 'Fecha Entrega'}, {key: 'returnDate', label: 'Fecha Devolución'}, {key: 'status', label: 'Estado'}], 
          charts: [{id: 'chart_most_loaned', title: 'Accesorios más Prestados', type: 'bar'}, {id: 'chart_by_cat', title: 'Accesorios Prestados por Categoría', type: 'bar'}]
        },
        { id: 'loan_alerts', label: 'Reporte de Alertas de Préstamo', 
          columns: [{key: 'employee', label: 'Empleado'}, {key: 'item', label: 'Item/Accesorio'}, {key: 'deadline', label: 'Fecha Límite'}, {key: 'alertStatus', label: 'Estado Alerta'}, {key: 'action', label: 'Acción Tomada'}], 
          charts: [{id: 'chart_by_month', title: 'Alertas Generadas por Mes', type: 'line'}, {id: 'chart_status', title: 'Alertas Activas vs Resueltas', type: 'pie'}]
        },
    ],
    inventory: [
        { id: 'inv_items_general', label: 'Reporte General de Inventario de Ítems', 
          columns: [{key: 'category', label: 'Categoría'}, {key: 'item', label: 'Nombre del Ítem'}, {key: 'currentStock', label: 'Stock Actual'}, {key: 'minStock', label: 'Stock Mínimo'}, {key: 'movements', label: 'Movimientos'}], 
          charts: [{id: 'chart_stock_evo', title: 'Evolución de Stock en el Tiempo', type: 'line'}, {id: 'chart_low_stock', title: 'Ítems por Debajo del Mínimo', type: 'bar'}]
        },
        { id: 'inv_accessories_general', label: 'Reporte General de Inventario de Accesorios', 
          columns: [{key: 'category', label: 'Categoría'}, {key: 'accessory', label: 'Nombre del Accesorio'}, {key: 'currentStock', label: 'Stock Actual'}, {key: 'minStock', label: 'Stock Mínimo'}, {key: 'movements', label: 'Movimientos'}], 
          charts: [{id: 'chart_most_used', title: 'Accesorios más Utilizados', type: 'bar'}, {id: 'chart_low_stock', title: 'Accesorios en Riesgo por Bajo Stock', type: 'bar'}]
        },
    ],
    system: [
        { id: 'sys_history', label: 'Reporte de Historial del Sistema', 
          columns: [{key: 'action', label: 'Acción'}, {key: 'user', label: 'Usuario'}, {key: 'timestamp', label: 'Fecha y Hora'}, {key: 'status', label: 'Estado'}], 
          charts: [{id: 'chart_actions_by_user', title: 'Cantidad de Acciones por Usuario', type: 'bar'}, {id: 'chart_most_frequent', title: 'Acciones más Frecuentes', type: 'pie'}]
        },
        { id: 'sys_alerts', label: 'Reporte de Alertas del Sistema', 
          columns: [{key: 'type', label: 'Tipo de Alerta'}, {key: 'timestamp', label: 'Fecha Creación'}, {key: 'status', label: 'Estado'}, {key: 'user', label: 'Usuario Afectado'}], 
          charts: [{id: 'chart_by_type', title: 'Alertas por Tipo', type: 'pie'}, {id: 'chart_status', title: 'Alertas Activas vs Resueltas', type: 'pie'}]
        },
        { id: 'sys_contract_notifications', label: 'Reporte de Notificaciones de Contratos', 
          columns: [{key: 'employee', label: 'Empleado'}, {key: 'contractType', label: 'Tipo de Contrato'}, {key: 'endDate', label: 'Fecha Vencimiento'}, {key: 'alertDays', label: 'Días Anticipación'}, {key: 'status', label: 'Estado'}], 
          charts: [{id: 'chart_status', title: 'Contratos Vencidos vs Activos', type: 'pie'}, {id: 'chart_expiring', title: 'Contratos por Vencer (30/60/90 días)', type: 'bar'}]
        },
    ],
};

let MOCK_REPORT_SETTINGS: ReportSettings = {
    pdf: {
        headerText: 'Reporte Interno - HR Pro',
        footerText: 'Generado por el sistema',
        logoUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAxMDAgMjQiPgogIDxzdHlsZT4uaGVhdnkgeyBmb250OiBib2xkIDIwcHggc2Fucy1zZXJpZjsgfSAubGlnaHQgeyBmb250OiAyMHB4IHNhbnMtc2VyaWY7IGZpbGw6ICM0ZjQ2ZTU7IH08L3N0eWxlPgogIDx0ZXh0IHg9IjAiIHk9IjE4IiBjbGFzcz0iaGVhdnkiPkhSPC90ZXh0PgogIDx0ZXh0IHg9IjMyIiB5PSIxOCIgY2xhcз0ibGlnaHQiPlBSTzwvdGV4dD4KPC9zdmc+Cg==',
        orientation: 'portrait',
        size: 'Letter',
    },
    reports: {
        'emp_general': { isActive: true }, 'emp_contracts': { isActive: true }, 'emp_birthdays': { isActive: true },
        'abs_general': { isActive: true },
        'loan_general': { isActive: true }, 'loan_accessories': { isActive: true }, 'loan_alerts': { isActive: true },
        'inv_items_general': { isActive: true }, 'inv_accessories_general': { isActive: true },
        'sys_history': { isActive: true }, 'sys_alerts': { isActive: true }, 'sys_contract_notifications': { isActive: true },
    }
};

// --- End of Report Definitions ---

let MOCK_CUSTOMIZE_SETTINGS: CustomizeSettings = {
  branding: {
    logoUrlMain: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAxMDAgMjQiPgogIDxzdHlsZT4uaGVhdnkgeyBmb250OiBib2xkIDIwcHggc2Fucy1zZXJpZjsgZmlsbDojZTJlOGYwO30gLmxpZ2h0IHsgZm9udDogMjBweCBzYW5zLXNlcmlmOyBmaWxsOiAjNGY0NmU1OyB9PC9zdHlsZT4KICA8dGV4dCB4PSIwIiB5PSIxOCIgY2xhc3M9ImhlYXZ5Ij5IUjwvdGV4dD4KICA8dGV4dCB4PSIzMiIgeT0iMTgiIGNsYXNzPSJsaWdodCI+UFJCPC90ZXh0Pgo8L3N2Zz4K',
    logoUrlAlt: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDMyIDMyIj4KICA8cmVjdCB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIGZpbGw9IiM0ZjQ2ZTUiIHJ4PSI0Ii8+CiAgPHRleHQgeD0iNSIgeT0iMjQiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjE4IiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0id2hpdGUiPkhSPC90ZXh0Pgo8L3N2Zz4K',
    logoUrlPdf: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAxMDAgMjQiPgogIDxzdHlsZT4uaGVhdnkgeyBmb250OiBib2xkIDIwcHggc2Fucy1zZXJpZjsgfSAubGlnaHQgeyBmb250OiAyMHB4IHNhbnMtc2VyaWY7IGZpbGw6ICM0ZjQ2ZTU7IH08L3N0eWxlPgogIDx0ZXh0IHg9IjAiIHk9IjE4IiBjbGFzcz0iaGVhdnkiPkhSPC90ZXh0PgogIDx0ZXh0IHg9IjMyIiB5PSIxOCIgY2xhcз0ibGlnaHQiPlBSTzwvdGV4dD4KPC9zdmc+Cg==',
    faviconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDMyIDMyIj4KICA8cmVjdCB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIGZpbGw9IiM0ZjQ2ZTUiIHJ4PSI0Ii8+CiAgPHRleHQgeD0iNSIgeT0iMjQiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjE4IiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0id2hpdGUiPkhSPC90ZXh0Pgo8L3N2Zz4K',
    headerTitle: 'Bienvenido, {userRole}',
    headerSubtitle: 'Gestión de Recursos Humanos Simplificada',
    footerText: '© 2023 HR Pro SaaS. Todos los derechos reservados.',
    loginWelcomeMessage: 'Inicia sesión para continuar'
  },
  theme: { mode: 'dark', colorVariant: 'default' },
  customThemes: [],
  layout: { sidebarDefaultCollapsed: false, animationsEnabled: true, headerVisible: true, footerVisible: true },
  globalFormat: { dateFormat: 'DD/MM/YYYY', timeFormat: '12h', timezone: 'America/Caracas', currencyStyle: 'symbol_before', decimalPlaces: 2, decimalSeparator: ',', thousandsSeparator: '.', defaultUnit: 'Unidad' },
  tables: { density: 'media', rowStyle: 'plain', defaultPageSize: 10, showExport: true },
  notifications: { position: 'top-right', soundEnabled: true, soundName: 'default', enabledModules: { inventory: true, loans: true, contracts: true, birthdays: true } },
  accessibility: { fontSize: 'medium', highContrast: false },
};

// --- Absence Mocks ---
let MOCK_LEAVE_POLICIES: LeavePolicy[] = [
    { id: 'policy_1', name: 'Vacaciones Anuales', daysPerYear: 20, allowNegativeBalance: false },
    { id: 'policy_2', name: 'Licencia por Enfermedad', daysPerYear: 10, allowNegativeBalance: true },
    { id: 'policy_3', name: 'Asuntos Personales', daysPerYear: 5, allowNegativeBalance: false },
];

let MOCK_LEAVE_BALANCES: LeaveBalance[] = [
    { employeeId: '1', policyId: 'policy_1', balance: 15 },
    { employeeId: '1', policyId: 'policy_2', balance: 8 },
    { employeeId: '2', policyId: 'policy_1', balance: 20 },
    { employeeId: '3', policyId: 'policy_1', balance: 12 },
    { employeeId: '4', policyId: 'policy_1', balance: 5 },
];

let MOCK_LEAVE_REQUESTS: LeaveRequest[] = [
    { id: 'req_1', employeeId: '1', policyId: 'policy_1', startDate: '2023-12-20', endDate: '2023-12-22', requestedDays: 3, reason: 'Viaje familiar', status: 'Aprobado', managerNotes: 'Aprobado por admin.' },
    { id: 'req_2', employeeId: '2', policyId: 'policy_2', startDate: '2024-01-10', endDate: '2024-01-11', requestedDays: 2, reason: 'Cita médica', status: 'Pendiente' },
    { id: 'req_3', employeeId: '1', policyId: 'policy_3', startDate: '2024-01-15', endDate: '2024-01-15', requestedDays: 1, reason: 'Trámite personal', status: 'Rechazado', managerNotes: 'No cumple con políticas.' },
    { id: 'req_4', employeeId: '3', policyId: 'policy_1', startDate: '2024-02-01', endDate: '2024-02-05', requestedDays: 5, reason: 'Vacaciones planificadas', status: 'Pendiente' },
];


// --- END of MOCK DATA ---


// =================================================================================================
// --- API IMPLEMENTATION ---
// =================================================================================================

const simulateApiCall = <T>(data: T, delay = 150): Promise<T> => {
  return new Promise(resolve => {
    setTimeout(() => {
      // Deep copy to prevent direct mutation of mock data store
      resolve(JSON.parse(JSON.stringify(data)));
    }, delay);
  });
};

const addLog = (user: string, action: string, details: string) => {
    MOCK_LOGS.unshift({
        id: `log_${Date.now()}`,
        user,
        action,
        details,
        timestamp: new Date().toISOString()
    });
};

const getEmployeeStockHelper = () => {
    const activeLoans = MOCK_LOANS.filter(l => l.status === 'Activo');
    
    const itemStock = MOCK_INVENTORY_ITEMS.map(item => {
        const loanedOut = activeLoans.filter(l => l.inventoryItemId === item.id && !l.isItemPermanent).length;
        const availableStock = item.totalStock - loanedOut;
        return { ...item, availableStock };
    });

    const accessoryStock = MOCK_ACCESSORIES.map(accessory => {
        const loanedOut = activeLoans.reduce((count, loan) => {
            const hasAccessory = loan.assignedAccessories.find(a => a.id === accessory.id && !a.isPermanent);
            return count + (hasAccessory ? 1 : 0);
        }, 0);
        const availableStock = accessory.totalStock - loanedOut;
        return { ...accessory, availableStock };
    });
    
    return { itemStock, accessoryStock };
}

export const api = {
  // --- Auth ---
  login: (email: string, password: string): Promise<{ success: true; user: AuthenticatedUser } | { success: false; message: string }> => {
    return new Promise(resolve => {
      setTimeout(() => {
        const user = MOCK_USERS.find(u => u.email === email && u.password === password);
        if (user && user.isActive) {
          const role = MOCK_ROLES.find(r => r.id === user.roleId);
          if (role) {
            addLog(email, 'Inicio de sesión', 'Inicio de sesión exitoso.');
            const { password, ...userWithoutPass } = user;
            resolve({
              success: true,
              user: {
                ...userWithoutPass,
                permissions: role.permissions,
                roleName: role.name
              }
            });
          } else {
            resolve({ success: false, message: 'Rol de usuario no encontrado.' });
          }
        } else if (user && !user.isActive) {
            resolve({ success: false, message: 'La cuenta de usuario está inactiva.' });
        } else {
          resolve({ success: false, message: 'Credenciales inválidas.' });
        }
      }, 500);
    });
  },

  // --- Employees ---
  getEmployees: () => simulateApiCall(MOCK_EMPLOYEES),
  getEmployeeById: (id: string) => simulateApiCall(MOCK_EMPLOYEES.find(e => e.id === id)),
  getEmployeeByEmail: (email: string) => simulateApiCall(MOCK_EMPLOYEES.find(e => e.email === email)),
  addEmployee: (employee: NewEmployee) => {
    // FIX: Add explicit type assertion to resolve potential type inference issue with spread syntax.
    const newEmployee: Employee = { ...employee, id: `emp_${Date.now()}` } as Employee;
    MOCK_EMPLOYEES.push(newEmployee);
    addLog('admin@hrpro.com', 'Creación de empleado', `Empleado ${newEmployee.firstName} ${newEmployee.lastName} creado.`);
    return simulateApiCall(newEmployee);
  },
  updateEmployee: (employee: Employee) => {
    const index = MOCK_EMPLOYEES.findIndex(e => e.id === employee.id);
    if (index > -1) {
      MOCK_EMPLOYEES[index] = employee;
      addLog('admin@hrpro.com', 'Actualización de empleado', `Empleado ${employee.firstName} ${employee.lastName} actualizado.`);
      return simulateApiCall(employee);
    }
    return Promise.reject(new Error('Employee not found'));
  },
  deleteEmployee: (id: string) => {
    MOCK_EMPLOYEES = MOCK_EMPLOYEES.filter(e => e.id !== id);
    addLog('admin@hrpro.com', 'Eliminación de empleado', `Empleado con ID ${id} eliminado.`);
    return simulateApiCall({ success: true });
  },

  // --- Companies ---
  getCompanies: () => simulateApiCall(MOCK_COMPANIES),
  addCompany: (company: Omit<Company, 'id'>) => {
    const newCompany = { ...company, id: `comp_${Date.now()}` };
    MOCK_COMPANIES.push(newCompany);
    return simulateApiCall(newCompany);
  },
  updateCompany: (company: Company) => {
    const index = MOCK_COMPANIES.findIndex(c => c.id === company.id);
    if (index > -1) MOCK_COMPANIES[index] = company;
    return simulateApiCall(company);
  },
  deleteCompany: (id: string) => {
    MOCK_COMPANIES = MOCK_COMPANIES.filter(c => c.id !== id);
    return simulateApiCall({ success: true });
  },
  
  // --- System ---
  getSystemLogs: (filters: { userFilter?: string, startDate?: string, endDate?: string, actionFilter?: string }) => {
      let filteredLogs = MOCK_LOGS;
      if (filters.userFilter) filteredLogs = filteredLogs.filter(l => l.user.includes(filters.userFilter!));
      if (filters.actionFilter) filteredLogs = filteredLogs.filter(l => l.action === filters.actionFilter);
      if (filters.startDate) filteredLogs = filteredLogs.filter(l => new Date(l.timestamp) >= new Date(filters.startDate!));
      if (filters.endDate) filteredLogs = filteredLogs.filter(l => new Date(l.timestamp) <= new Date(filters.endDate!));
      return simulateApiCall(filteredLogs);
  },
  
  // --- Form Fields ---
  getFormFieldOptions: () => simulateApiCall(MOCK_FIELD_OPTIONS),
  addFormFieldOption: (option: Omit<FormFieldOption, 'id'>) => {
      const newOption = { ...option, id: `opt_${Date.now()}`};
      MOCK_FIELD_OPTIONS.push(newOption);
      return simulateApiCall(newOption);
  },
  updateFormFieldOption: (option: FormFieldOption) => {
      const index = MOCK_FIELD_OPTIONS.findIndex(o => o.id === option.id);
      if (index > -1) MOCK_FIELD_OPTIONS[index] = option;
      return simulateApiCall(option);
  },
  deleteFormFieldOption: (id: string) => {
      MOCK_FIELD_OPTIONS = MOCK_FIELD_OPTIONS.filter(o => o.id !== id);
      return simulateApiCall({ success: true });
  },

  // --- Custom Fields ---
  getCustomFields: () => simulateApiCall(MOCK_CUSTOM_FIELDS),
  addCustomField: (field: Omit<CustomFieldDef, 'id'> & { options?: string[] }) => {
      const newField = { id: `cf_${Date.now()}`, ...field };
      if (newField.type === 'select' && field.options) {
          field.options.forEach(opt => {
              MOCK_FIELD_OPTIONS.push({ id: `cfo_${Date.now()}_${Math.random()}`, fieldType: newField.label, value: opt });
          });
      }
      delete (newField as any).options;
      MOCK_CUSTOM_FIELDS.push(newField);
      return simulateApiCall(newField);
  },
  deleteCustomField: (id: string) => {
      const field = MOCK_CUSTOM_FIELDS.find(f => f.id === id);
      if(field) {
          MOCK_FIELD_OPTIONS = MOCK_FIELD_OPTIONS.filter(o => o.fieldType !== field.label);
      }
      MOCK_CUSTOM_FIELDS = MOCK_CUSTOM_FIELDS.filter(f => f.id !== id);
      return simulateApiCall({ success: true });
  },

  // --- Users & Roles ---
  getUsers: () => simulateApiCall(MOCK_USERS),
  addUser: (user: Omit<User, 'id' | 'isActive'>) => {
      const newUser = { ...user, id: `user_${Date.now()}`, isActive: true };
      MOCK_USERS.push(newUser);
      return simulateApiCall(newUser);
  },
  updateUser: (user: User) => {
      const index = MOCK_USERS.findIndex(u => u.id === user.id);
      if (index > -1) MOCK_USERS[index] = user;
      return simulateApiCall(user);
  },
  deleteUser: (id: string) => {
      MOCK_USERS = MOCK_USERS.filter(u => u.id !== id);
      return simulateApiCall({ success: true });
  },
   toggleUserStatus: (id: string) => {
    const index = MOCK_USERS.findIndex(u => u.id === id);
    if (index > -1) MOCK_USERS[index].isActive = !MOCK_USERS[index].isActive;
    return simulateApiCall({ success: true });
  },
  getRoles: () => simulateApiCall(MOCK_ROLES),
  getPermissions: () => simulateApiCall(ALL_PERMISSIONS),
  addRole: (role: Omit<Role, 'id' | 'isDeletable'>) => {
      if (MOCK_ROLES.some(r => r.name.toLowerCase() === role.name.toLowerCase())) {
          return Promise.reject(new Error("Ya existe un rol con este nombre."));
      }
      const newRole = { ...role, id: `role_${Date.now()}`, isDeletable: true };
      MOCK_ROLES.push(newRole);
      return simulateApiCall(newRole);
  },
  updateRole: (role: Role) => {
      if (MOCK_ROLES.some(r => r.name.toLowerCase() === role.name.toLowerCase() && r.id !== role.id)) {
          return Promise.reject(new Error("Ya existe otro rol con este nombre."));
      }
      const index = MOCK_ROLES.findIndex(r => r.id === role.id);
      if (index > -1) MOCK_ROLES[index] = role;
      return simulateApiCall(role);
  },
  deleteRole: (id: string) => {
       const roleInUse = MOCK_USERS.some(u => u.roleId === id);
       if (roleInUse) {
           return Promise.reject(new Error("No se puede eliminar el rol porque está asignado a uno o más usuarios."));
       }
      MOCK_ROLES = MOCK_ROLES.filter(r => r.id !== id);
      return simulateApiCall({ success: true });
  },

  // --- Dashboards ---
  getDashboardConfig: (type: string) => simulateApiCall(MOCK_DASHBOARD_CONFIGS[type]),
  updateDashboardConfig: (type: string, config: DashboardConfig) => {
      MOCK_DASHBOARD_CONFIGS[type] = config;
      return simulateApiCall(config);
  },
  getAvailableDataKeys: (type: string) => {
      // In a real app, this would be dynamic. Here we just mock it.
      const employeeKeys = {
          card: [{key: 'totalEmployees', label: 'Total Empleados'}, {key: 'activeEmployees', label: 'Activos'}, {key: 'inactiveEmployees', label: 'Inactivos'}],
          filter: [{key: 'gender', label: 'Género'}, {key: 'company', label: 'Empresa'}, {key: 'status', label: 'Estatus'}],
          chart: [{key: 'employeesByZona', label: 'Empleados por Zona'}, {key: 'employeesByLicense', label: 'Empleados por Licencia'}],
      };
      const loanKeys = {
          card: [{key: 'totalLoans', label: 'Total Préstamos'}, {key: 'activeLoans', label: 'Activos'}, {key: 'overdueLoans', label: 'Vencidos'}, {key: 'returnedLoans', label: 'Devueltos'}],
          filter: [{key: 'categoryId', label: 'Categoría'}, {key: 'status', label: 'Estado'}],
          chart: [{key: 'loansByCategory', label: 'Préstamos por Categoría'}, {key: 'loansByEmployee', label: 'Préstamos por Empleado'}],
      };
      const inventoryKeys = {
          card: [{key: 'totalItems', label: 'Total Ítems'}, {key: 'lowStockItems', label: 'Poco Stock'}],
          filter: [{key: 'categoryId', label: 'Categoría'}, {key: 'status', label: 'Estado'}],
          chart: [{key: 'itemsByCategory', label: 'Ítems por Categoría'}, {key: 'stockHealth', label: 'Salud del Stock'}],
      };
       const accessoryKeys = {
          card: [{key: 'totalAccessories', label: 'Total Accesorios'}, {key: 'lowStockAccessories', label: 'Poco Stock'}],
          filter: [{key: 'categoryId', label: 'Categoría'}, {key: 'status', label: 'Estado'}],
          chart: [{key: 'accessoriesByCategory', label: 'Accesorios por Categoría'}, {key: 'accessoryStockHealth', label: 'Salud del Stock'}],
      };
      const absenceKeys = {
        card: [{key: 'totalRequests', label: 'Total Solicitudes'}, {key: 'pendingRequests', label: 'Pendientes'}],
        filter: [{key: 'policyId', label: 'Tipo de Ausencia'}, {key: 'status', label: 'Estado'}],
        chart: [{key: 'absencesByType', label: 'Ausencias por Tipo'}, {key: 'absencesByStatus', label: 'Ausencias por Estado'}],
      };

      if(type === 'employees') return simulateApiCall(employeeKeys);
      if(type === 'loans') return simulateApiCall(loanKeys);
      if(type === 'inventory_items') return simulateApiCall(inventoryKeys);
      if(type === 'inventory_accessories') return simulateApiCall(accessoryKeys);
      if(type === 'absences') return simulateApiCall(absenceKeys);
      return simulateApiCall(employeeKeys);
  },
  getEmployeesDashboardStats: (employees: Employee[]): Promise<DashboardStats> => {
      const stats: DashboardStats = {
          totalEmployees: employees.length,
          activeEmployees: employees.filter(e => e.status === 'active').length,
          inactiveEmployees: employees.filter(e => e.status === 'inactive').length,
          salaryPerEmployee: employees.map(e => ({ name: `${e.firstName} ${e.lastName}`, value: e.currentSalary })),
          employeesByLicense: Object.entries(employees.reduce((acc, e) => {
              acc[e.licenciaDeConducir] = (acc[e.licenciaDeConducir] || 0) + 1; return acc;
          }, {} as Record<string, number>)).map(([name, value]) => ({ name, value })),
          employeesByZona: Object.entries(employees.reduce((acc, e) => {
              acc[e.zonaDeTrabajo] = (acc[e.zonaDeTrabajo] || 0) + 1; return acc;
          }, {} as Record<string, number>)).map(([name, value]) => ({ name, value })),
      };
      return simulateApiCall(stats);
  },
  getLoansDashboardStats: (loans: Loan[]): Promise<DashboardStats> => {
      const now = new Date();
      now.setHours(0,0,0,0);
      const stats: DashboardStats = {
          totalLoans: loans.length,
          activeLoans: loans.filter(l => l.status === 'Activo').length,
          overdueLoans: loans.filter(l => l.status === 'Activo' && l.returnDate && new Date(l.returnDate) < now).length,
          returnedLoans: loans.filter(l => l.status === 'Devuelto').length,
      };
      return simulateApiCall(stats);
  },
   getAbsencesDashboardStats: (requests: LeaveRequest[]): Promise<DashboardStats> => {
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const requestsThisMonth = requests.filter(r => new Date(r.startDate) >= firstDayOfMonth);

        const policies = MOCK_LEAVE_POLICIES;
        const policyMap = new Map(policies.map(p => [p.id, p.name]));

        const stats: DashboardStats = {
            totalRequests: requests.length,
            pendingRequests: requests.filter(r => r.status === 'Pendiente').length,
            approvedThisMonth: requestsThisMonth.filter(r => r.status === 'Aprobado').length,
            rejectedThisMonth: requestsThisMonth.filter(r => r.status === 'Rechazado').length,
            absencesByType: Object.entries(requests.reduce((acc, r) => {
                const policyName = policyMap.get(r.policyId) || 'Desconocido';
                acc[policyName] = (acc[policyName] || 0) + 1;
                return acc;
            }, {} as Record<string, number>)).map(([name, value]) => ({ name, value })),
            absencesByStatus: Object.entries(requests.reduce((acc, r) => {
                acc[r.status] = (acc[r.status] || 0) + 1;
                return acc;
            }, {} as Record<string, number>)).map(([name, value]) => ({ name, value })),
        };
        return simulateApiCall(stats);
    },
   getInventoryDashboardStats: (items: InventoryItem[], accessories: Accessory[]): Promise<DashboardStats> => {
       const { itemStock, accessoryStock } = getEmployeeStockHelper();

      const stats: DashboardStats = {
          totalItems: items.length,
          lowStockItems: itemStock.filter(i => i.availableStock! <= i.minStock).length,
          totalAccessories: accessories.length,
          lowStockAccessories: accessoryStock.filter(a => a.availableStock! <= a.minStock).length,
      };
      return simulateApiCall(stats);
  },
  
  // --- Salary & Contract ---
  getSalaryConfig: () => simulateApiCall(MOCK_SALARY_CONFIG),
  updateSalaryConfig: (config: SalaryConfig) => {
    MOCK_SALARY_CONFIG = config;
    return simulateApiCall(config);
  },
  getCurrencies: () => simulateApiCall(MOCK_CURRENCIES),
  addCurrency: (currency: Omit<Currency, 'id'>) => {
    const newCurrency = { ...currency, id: `cur_${Date.now()}`};
    MOCK_CURRENCIES.push(newCurrency);
    return simulateApiCall(newCurrency);
  },
  updateCurrency: (currency: Currency) => {
    const index = MOCK_CURRENCIES.findIndex(c => c.id === currency.id);
    if(index > -1) MOCK_CURRENCIES[index] = currency;
    return simulateApiCall(currency);
  },
  deleteCurrency: (id: string) => {
    MOCK_CURRENCIES = MOCK_CURRENCIES.filter(c => c.id !== id);
    return simulateApiCall({success: true});
  },
  getConversionRates: () => simulateApiCall(MOCK_CONVERSION_RATES),
  addConversionRate: (rate: Omit<ConversionRate, 'id'>) => {
    const existingRateIndex = MOCK_CONVERSION_RATES.findIndex(r => r.from === rate.from && r.to === rate.to);
    if(existingRateIndex > -1) {
        MOCK_CONVERSION_RATES[existingRateIndex].rate = rate.rate;
        return simulateApiCall(MOCK_CONVERSION_RATES[existingRateIndex]);
    } else {
        const newRate = { ...rate, id: `rate_${Date.now()}` };
        MOCK_CONVERSION_RATES.push(newRate);
        return simulateApiCall(newRate);
    }
  },
  deleteConversionRate: (id: string) => {
    MOCK_CONVERSION_RATES = MOCK_CONVERSION_RATES.filter(r => r.id !== id);
    return simulateApiCall({success: true});
  },
  getContractTypes: () => simulateApiCall(MOCK_CONTRACT_TYPES),
  addContractType: (ct: Omit<ContractType, 'id'>) => {
    const newCt = { ...ct, id: `ct_${Date.now()}` };
    MOCK_CONTRACT_TYPES.push(newCt);
    return simulateApiCall(newCt);
  },
  updateContractType: (ct: ContractType) => {
    const index = MOCK_CONTRACT_TYPES.findIndex(c => c.id === ct.id);
    if(index > -1) MOCK_CONTRACT_TYPES[index] = ct;
    return simulateApiCall(ct);
  },
  deleteContractType: (id: string) => {
    MOCK_CONTRACT_TYPES = MOCK_CONTRACT_TYPES.filter(c => c.id !== id);
    return simulateApiCall({success: true});
  },
  
  // --- Absences ---
  getLeavePolicies: () => simulateApiCall(MOCK_LEAVE_POLICIES),
  addLeavePolicy: (policy: Omit<LeavePolicy, 'id'>) => {
      const newPolicy = { ...policy, id: `policy_${Date.now()}` };
      MOCK_LEAVE_POLICIES.push(newPolicy);
      addLog('admin@hrpro.com', 'Creación de política de ausencia', `Política ${newPolicy.name} creada.`);
      return simulateApiCall(newPolicy);
  },
  updateLeavePolicy: (policy: LeavePolicy) => {
      const index = MOCK_LEAVE_POLICIES.findIndex(p => p.id === policy.id);
      if (index > -1) MOCK_LEAVE_POLICIES[index] = policy;
      addLog('admin@hrpro.com', 'Actualización de política de ausencia', `Política ${policy.name} actualizada.`);
      return simulateApiCall(policy);
  },
  deleteLeavePolicy: (id: string) => {
      MOCK_LEAVE_POLICIES = MOCK_LEAVE_POLICIES.filter(p => p.id !== id);
      addLog('admin@hrpro.com', 'Eliminación de política de ausencia', `Política con ID ${id} eliminada.`);
      return simulateApiCall({ success: true });
  },
  getEmployeeLeaveBalances: (employeeId: string) => simulateApiCall(MOCK_LEAVE_BALANCES.filter(b => b.employeeId === employeeId)),
  getEmployeeLeaveRequests: (employeeId: string) => simulateApiCall(MOCK_LEAVE_REQUESTS.filter(r => r.employeeId === employeeId).sort((a,b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())),
  getAllLeaveRequests: () => simulateApiCall(MOCK_LEAVE_REQUESTS.sort((a,b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())),
  addLeaveRequest: (request: Omit<LeaveRequest, 'id' | 'status'>) => {
      const newRequest: LeaveRequest = { ...request, id: `req_${Date.now()}`, status: 'Pendiente' };
      MOCK_LEAVE_REQUESTS.push(newRequest);
      addLog(MOCK_EMPLOYEES.find(e => e.id === request.employeeId)?.email || 'system', 'Solicitud de ausencia', `Solicitud creada por ${request.requestedDays} días.`);
      return simulateApiCall(newRequest);
  },
  cancelLeaveRequest: (requestId: string) => {
      const index = MOCK_LEAVE_REQUESTS.findIndex(r => r.id === requestId);
      if (index > -1 && MOCK_LEAVE_REQUESTS[index].status === 'Pendiente') {
          MOCK_LEAVE_REQUESTS[index].status = 'Cancelado';
          addLog('system', 'Cancelación de ausencia', `Solicitud ${requestId} cancelada por el usuario.`);
          return simulateApiCall({ success: true });
      }
      return Promise.reject('Request not found or cannot be cancelled.');
  },
  reviewLeaveRequest: (requestId: string, status: 'Aprobado' | 'Rechazado', managerNotes: string) => {
      const index = MOCK_LEAVE_REQUESTS.findIndex(r => r.id === requestId);
      if (index > -1 && MOCK_LEAVE_REQUESTS[index].status === 'Pendiente') {
          const request = MOCK_LEAVE_REQUESTS[index];
          request.status = status;
          request.managerNotes = managerNotes;
          // Adjust balance if approved
          if (status === 'Aprobado') {
              const balance = MOCK_LEAVE_BALANCES.find(b => b.employeeId === request.employeeId && b.policyId === request.policyId);
              if (balance) {
                  balance.balance -= request.requestedDays;
              } else {
                  // Create a balance if it doesn't exist, this might happen with new policies
                  const policy = MOCK_LEAVE_POLICIES.find(p => p.id === request.policyId);
                  if(policy) {
                    MOCK_LEAVE_BALANCES.push({ employeeId: request.employeeId, policyId: request.policyId, balance: policy.daysPerYear - request.requestedDays });
                  }
              }
          }
          addLog('admin@hrpro.com', 'Revisión de ausencia', `Solicitud ${requestId} fue ${status.toLowerCase()}.`);
          return simulateApiCall({ success: true });
      }
      return Promise.reject('Request not found or already reviewed.');
  },

  // --- Inventory ---
  getInventoryItemsWithStock: () => simulateApiCall(getEmployeeStockHelper().itemStock),
  getAccessoriesWithStock: (categoryId: string) => simulateApiCall(getEmployeeStockHelper().accessoryStock.filter(a => a.categoryId === categoryId)),
  getAllAccessories: () => simulateApiCall(getEmployeeStockHelper().accessoryStock),
  getInventoryCategories: () => simulateApiCall(MOCK_INVENTORY_CATEGORIES),
  addInventoryCategory: (cat: Omit<InventoryCategory, 'id'>) => {
      const newCat = { ...cat, id: `cat_${Date.now()}` };
      MOCK_INVENTORY_CATEGORIES.push(newCat);
      return simulateApiCall(newCat);
  },
  updateInventoryCategory: (cat: InventoryCategory) => {
      const index = MOCK_INVENTORY_CATEGORIES.findIndex(c => c.id === cat.id);
      if(index > -1) MOCK_INVENTORY_CATEGORIES[index] = cat;
      return simulateApiCall(cat);
  },
  deleteInventoryCategory: (id: string) => {
      MOCK_INVENTORY_CATEGORIES = MOCK_INVENTORY_CATEGORIES.filter(c => c.id !== id);
      MOCK_INVENTORY_ITEMS = MOCK_INVENTORY_ITEMS.filter(i => i.categoryId !== id);
      MOCK_ACCESSORIES = MOCK_ACCESSORIES.filter(a => a.categoryId !== id);
      return simulateApiCall({ success: true });
  },
  getInventoryConfig: () => simulateApiCall(MOCK_INVENTORY_CONFIG),
  updateInventoryConfig: (config: InventoryConfig) => {
      MOCK_INVENTORY_CONFIG = config;
      return simulateApiCall(config);
  },
  addInventoryItem: (item: Omit<InventoryItem, 'id'>) => {
      const newItem = { ...item, id: `item_${Date.now()}` };
      MOCK_INVENTORY_ITEMS.push(newItem);
      return simulateApiCall(newItem);
  },
  updateInventoryItem: (item: InventoryItem) => {
      const index = MOCK_INVENTORY_ITEMS.findIndex(i => i.id === item.id);
      if(index > -1) MOCK_INVENTORY_ITEMS[index] = item;
      return simulateApiCall(item);
  },
  deleteInventoryItem: (id: string) => {
      MOCK_INVENTORY_ITEMS = MOCK_INVENTORY_ITEMS.filter(i => i.id !== id);
      return simulateApiCall({ success: true });
  },
  adjustInventoryStock: (id: string, quantity: number, notes: string) => {
      const index = MOCK_INVENTORY_ITEMS.findIndex(i => i.id === id);
      if(index > -1) {
          MOCK_INVENTORY_ITEMS[index].totalStock += quantity;
          MOCK_INVENTORY_MOVEMENTS.push({ id: `mov_${Date.now()}`, itemId: id, itemType: 'item', timestamp: new Date().toISOString(), user: 'admin@hrpro.com', action: quantity > 0 ? 'Ajuste Manual (+)' : 'Ajuste Manual (-)', quantityChange: quantity, notes });
      }
      return simulateApiCall({success: true});
  },
  getInventoryMovements: (itemId: string) => simulateApiCall(MOCK_INVENTORY_MOVEMENTS.filter(m => m.itemId === itemId && m.itemType === 'item')),
  getAllInventoryMovements: () => simulateApiCall(MOCK_INVENTORY_MOVEMENTS),
  getAccessoryMovements: (accessoryId: string) => simulateApiCall(MOCK_INVENTORY_MOVEMENTS.filter(m => m.itemId === accessoryId && m.itemType === 'accessory')),
  
  // --- Accessories ---
  addAccessory: (acc: Omit<Accessory, 'id'>) => {
      const newAcc = { ...acc, id: `acc_${Date.now()}` };
      MOCK_ACCESSORIES.push(newAcc);
      return simulateApiCall(newAcc);
  },
  updateAccessory: (acc: Accessory) => {
      const index = MOCK_ACCESSORIES.findIndex(a => a.id === acc.id);
      if(index > -1) MOCK_ACCESSORIES[index] = acc;
      return simulateApiCall(acc);
  },
  deleteAccessory: (id: string) => {
      MOCK_ACCESSORIES = MOCK_ACCESSORIES.filter(a => a.id !== id);
      return simulateApiCall({ success: true });
  },
  adjustAccessoryStock: (id: string, quantity: number, notes: string) => {
      const index = MOCK_ACCESSORIES.findIndex(a => a.id === id);
      if(index > -1) {
          MOCK_ACCESSORIES[index].totalStock += quantity;
          MOCK_INVENTORY_MOVEMENTS.push({ id: `mov_${Date.now()}`, itemId: id, itemType: 'accessory', timestamp: new Date().toISOString(), user: 'admin@hrpro.com', action: quantity > 0 ? 'Ajuste Manual (+)' : 'Ajuste Manual (-)', quantityChange: quantity, notes });
      }
      return simulateApiCall({success: true});
  },
  
  // --- Loans ---
  getLoanConfig: () => simulateApiCall(MOCK_LOAN_CONFIG),
  updateLoanConfig: (config: LoanConfig) => {
      MOCK_LOAN_CONFIG = config;
      return simulateApiCall(config);
  },
  getAllLoans: () => simulateApiCall(MOCK_LOANS),
  getLoans: (categoryId: string) => simulateApiCall(MOCK_LOANS.filter(l => l.categoryId === categoryId)),
  addLoan: (loan: Omit<Loan, 'id' | 'status'>) => {
      const newLoan = { ...loan, id: `loan_${Date.now()}`, status: 'Activo' } as Loan;
      MOCK_LOANS.push(newLoan);
      return simulateApiCall(newLoan);
  },
  updateLoan: (loan: Loan) => {
      const index = MOCK_LOANS.findIndex(l => l.id === loan.id);
      if(index > -1) MOCK_LOANS[index] = loan;
      return simulateApiCall(loan);
  },
  deleteLoan: (id: string) => {
      MOCK_LOANS = MOCK_LOANS.filter(l => l.id !== id);
      return simulateApiCall({success: true});
  },
  returnLoan: (id: string) => {
      const index = MOCK_LOANS.findIndex(l => l.id === id);
      if(index > -1) {
          MOCK_LOANS[index].status = 'Devuelto';
          MOCK_LOANS[index].returnDate = new Date().toISOString();
      }
      return simulateApiCall({success: true});
  },
  
  // --- Reports ---
  getAllReportDefinitions: () => simulateApiCall(REPORT_DEFINITIONS),
  getReportDefinitions: () => {
    const visibleReports: Record<string, ReportDefinition[]> = {};
    for (const category in REPORT_DEFINITIONS) {
        visibleReports[category] = REPORT_DEFINITIONS[category as ReportCategoryKey].filter(
            def => MOCK_REPORT_SETTINGS.reports[def.id]?.isActive
        );
    }
    return simulateApiCall(visibleReports);
  },
  getReportSettings: () => simulateApiCall(MOCK_REPORT_SETTINGS),
  updateReportSettings: (settings: ReportSettings) => {
      MOCK_REPORT_SETTINGS = settings;
      return simulateApiCall(settings);
  },
  generateReport: (reportId: string, filters: any): Promise<ReportData> => {
      // This is a simplified mock report generator
      const tableData: Record<string, any>[] = [];
      if(reportId === 'emp_general') {
          MOCK_EMPLOYEES.filter(e => !filters.company || e.company === filters.company).forEach(e => {
              tableData.push({
                  id: e.id,
                  name: `${e.firstName} ${e.lastName}`,
                  idNumber: e.idNumber,
                  title: e.title,
                  zonaDeTrabajo: e.zonaDeTrabajo,
                  contractStartDate: e.contractStartDate,
                  contractEndDate: e.contractEndDate,
                  contractType: MOCK_CONTRACT_TYPES.find(ct => ct.id === e.contractTypeId)?.name || 'N/A',
                  salary: e.currentSalary,
              })
          });
      }
      if (reportId === 'abs_general') {
          MOCK_LEAVE_REQUESTS.forEach(req => {
              const employee = MOCK_EMPLOYEES.find(e => e.id === req.employeeId);
              const policy = MOCK_LEAVE_POLICIES.find(p => p.id === req.policyId);
              if(employee && policy) {
                  tableData.push({
                      employee: `${employee.firstName} ${employee.lastName}`,
                      policy: policy.name,
                      startDate: req.startDate,
                      endDate: req.endDate,
                      days: req.requestedDays,
                      status: req.status,
                  });
              }
          });
      }
      const chartData: ReportChartData[] = REPORT_DEFINITIONS[reportId.split('_')[0] as ReportCategoryKey]?.find(r => r.id === reportId)?.charts.map(c => ({
          id: c.id, title: c.title, type: c.type, data: [{name: 'Ejemplo', value: 10}]
      })) || [];
      return simulateApiCall({tableData, chartData});
  },
  
  // --- Notifications ---
  getNotifications: (filters?: { status?: 'recent' | 'archived' | 'read' | 'unread', search?: string }) => {
    let results = MOCK_NOTIFICATIONS;
    if(filters?.status === 'archived') {
        results = results.filter(n => n.status === 'archived');
    } else if (filters?.status === 'read') {
        results = results.filter(n => n.status === 'read');
    } else if (filters?.status === 'unread') {
        results = results.filter(n => n.status === 'unread');
    } else if (filters?.status === 'recent') {
        results = results.filter(n => n.status !== 'archived');
    }
    if (filters?.search) {
        results = results.filter(n => n.message.toLowerCase().includes(filters.search!.toLowerCase()));
    }
    return simulateApiCall(results.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
  },
  markNotificationAsRead: (id: string) => {
      const index = MOCK_NOTIFICATIONS.findIndex(n => n.id === id);
      if(index > -1) MOCK_NOTIFICATIONS[index].status = 'read';
      return simulateApiCall({success: true});
  },
   markNotificationAsUnread: (id: string) => {
      const index = MOCK_NOTIFICATIONS.findIndex(n => n.id === id);
      if(index > -1) MOCK_NOTIFICATIONS[index].status = 'unread';
      return simulateApiCall({success: true});
  },
  archiveNotification: (id: string) => {
      const index = MOCK_NOTIFICATIONS.findIndex(n => n.id === id);
      if(index > -1) MOCK_NOTIFICATIONS[index].status = 'archived';
      return simulateApiCall({success: true});
  },
   unarchiveNotification: (id: string) => {
      const index = MOCK_NOTIFICATIONS.findIndex(n => n.id === id);
      if(index > -1) MOCK_NOTIFICATIONS[index].status = 'read'; // Unarchive to read
      return simulateApiCall({success: true});
  },
  checkAndCreateBirthdayNotifications: () => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentDay = today.getDate();
    const currentYear = today.getFullYear();

    MOCK_EMPLOYEES.forEach(employee => {
      if (employee.status !== 'active') return;

      const birthDate = new Date(employee.birthDate);
      // Adjust for timezone offset to prevent off-by-one day errors when comparing dates.
      const userTimezoneOffset = birthDate.getTimezoneOffset() * 60000;
      const adjustedBirthDate = new Date(birthDate.getTime() + userTimezoneOffset);

      const birthMonth = adjustedBirthDate.getMonth();
      const birthDay = adjustedBirthDate.getDate();

      if (birthMonth === currentMonth && birthDay === currentDay) {
        // Check if a notification for this employee's birthday has already been created this year.
        const notificationExists = MOCK_NOTIFICATIONS.some(
          n =>
            n.type === 'birthday' &&
            n.referenceId === employee.id &&
            new Date(n.timestamp).getFullYear() === currentYear
        );

        if (!notificationExists) {
          const newNotification: Notification = {
            id: `notif_bday_${employee.id}_${currentYear}`,
            type: 'birthday',
            referenceId: employee.id,
            message: `¡Hoy es el cumpleaños de ${employee.firstName} ${employee.lastName}!`,
            status: 'unread',
            timestamp: new Date().toISOString(),
          };
          MOCK_NOTIFICATIONS.push(newNotification);
        }
      }
    });

    return Promise.resolve();
  },
  checkAndCreateLoanNotifications: () => { /* Logic to create notifications */ return Promise.resolve(); },
  checkStockLevels: () => { /* Logic to create notifications */ return Promise.resolve(); },
  checkAndCreateContractNotifications: () => { /* Logic to create notifications */ return Promise.resolve(); },
  checkLeaveBalanceLimits: () => { /* Logic to create notifications */ return Promise.resolve(); },

  // --- Documents ---
  getAllDocuments: () => {
    const flatDocs = MOCK_EMPLOYEES.flatMap(e => e.documents.map(d => ({ ...d, employeeId: e.id, employeeName: `${e.firstName} ${e.lastName}` })));
    return simulateApiCall(flatDocs);
  },
  addDocumentToEmployee: (employeeId: string, file: File, docType: string) => {
    const employee = MOCK_EMPLOYEES.find(e => e.id === employeeId);
    if (!employee) return Promise.reject('Employee not found');
    const newDoc: Document = {
      id: `doc_${Date.now()}`,
      name: file.name,
      type: docType,
      size: file.size,
      uploadDate: new Date().toISOString(),
      version: 1,
      url: URL.createObjectURL(file), // This will only last for the session
    };
    employee.documents.push(newDoc);
    return simulateApiCall(newDoc);
  },
  deleteDocument: (employeeId: string, docId: string) => {
      const employee = MOCK_EMPLOYEES.find(e => e.id === employeeId);
      if(employee) {
          employee.documents = employee.documents.filter(d => d.id !== docId);
      }
      return simulateApiCall({success: true});
  },

  // --- Customize ---
  getCustomizeSettings: () => simulateApiCall(MOCK_CUSTOMIZE_SETTINGS),
  updateCustomizeSettings: (settings: CustomizeSettings) => {
      MOCK_CUSTOMIZE_SETTINGS = settings;
      return simulateApiCall(settings);
  },
  exportCustomizeSettings: () => simulateApiCall(JSON.stringify(MOCK_CUSTOMIZE_SETTINGS, null, 2)),
  importCustomizeSettings: (jsonString: string) => {
      try {
        const parsed = JSON.parse(jsonString);
        // Add validation here if needed
        return simulateApiCall(parsed as CustomizeSettings);
      } catch (e) {
        return Promise.reject("Invalid JSON");
      }
  },

  // --- Org Chart ---
  getOrgChart: () => simulateApiCall(MOCK_ORG_CHART),

  // --- Profile Changes ---
  requestProfileUpdate: (employeeId: string, updates: Partial<Employee>, requesterEmail: string): Promise<{success: boolean, message?: string}> => {
      const originalEmployee = MOCK_EMPLOYEES.find(e => e.id === employeeId);
      if (!originalEmployee) return Promise.reject("Employee not found");

      const changes: PendingChange[] = [];
      for (const key in updates) {
          if (key !== 'id' && key !== 'documents' && JSON.stringify(updates[key as keyof Employee]) !== JSON.stringify(originalEmployee[key as keyof Employee])) {
              changes.push({
                  field: key,
                  oldValue: originalEmployee[key as keyof Employee],
                  newValue: updates[key as keyof Employee]
              });
          }
      }

      if (changes.length > 0) {
          const newRequest: PendingChangeRequest = {
              id: `pcr_${Date.now()}`,
              employeeId,
              employeeName: `${originalEmployee.firstName} ${originalEmployee.lastName}`,
              requestedAt: new Date().toISOString(),
              changes
          };
          MOCK_PENDING_CHANGES.push(newRequest);
          addLog(requesterEmail, 'Solicitud de cambio de perfil', `Solicitud para ${originalEmployee.firstName} ${originalEmployee.lastName} enviada.`);
          return simulateApiCall({ success: true });
      }
      return simulateApiCall({ success: false, message: 'No se detectaron cambios para enviar.' });
  },
  getPendingChanges: () => simulateApiCall(MOCK_PENDING_CHANGES),
  approveChangeRequest: (requestId: string) => {
      const requestIndex = MOCK_PENDING_CHANGES.findIndex(r => r.id === requestId);
      if (requestIndex === -1) return Promise.reject("Request not found");
      const request = MOCK_PENDING_CHANGES[requestIndex];

      const employeeIndex = MOCK_EMPLOYEES.findIndex(e => e.id === request.employeeId);
      if (employeeIndex === -1) return Promise.reject("Employee not found");

      let updatedEmployee = { ...MOCK_EMPLOYEES[employeeIndex] };
      request.changes.forEach(change => {
          (updatedEmployee as any)[change.field] = change.newValue;
      });
      MOCK_EMPLOYEES[employeeIndex] = updatedEmployee;

      MOCK_PENDING_CHANGES.splice(requestIndex, 1);
      addLog('admin@hrpro.com', 'Aprobación de cambio', `Cambios para ${request.employeeName} aprobados.`);
      return simulateApiCall({ success: true });
  },
  rejectChangeRequest: (requestId: string) => {
      MOCK_PENDING_CHANGES = MOCK_PENDING_CHANGES.filter(r => r.id !== requestId);
      addLog('admin@hrpro.com', 'Rechazo de cambio', `Solicitud ${requestId} rechazada.`);
      return simulateApiCall({ success: true });
  },

  // --- Checklists ---
  getChecklistTemplates: () => simulateApiCall(MOCK_CHECKLIST_TEMPLATES),
  addChecklistTemplate: (template: Omit<ChecklistTemplate, 'id'>) => {
      const newTemplate = { ...template, id: `tmpl_${Date.now()}` };
      MOCK_CHECKLIST_TEMPLATES.push(newTemplate);
      return simulateApiCall(newTemplate);
  },
  updateChecklistTemplate: (template: ChecklistTemplate) => {
      const index = MOCK_CHECKLIST_TEMPLATES.findIndex(t => t.id === template.id);
      if (index > -1) MOCK_CHECKLIST_TEMPLATES[index] = template;
      return simulateApiCall(template);
  },
  deleteChecklistTemplate: (id: string) => {
      MOCK_CHECKLIST_TEMPLATES = MOCK_CHECKLIST_TEMPLATES.filter(t => t.id !== id);
      return simulateApiCall({ success: true });
  },
  getAssignedChecklists: (employeeId: string) => simulateApiCall(MOCK_ASSIGNED_CHECKLISTS.filter(c => c.employeeId === employeeId)),
  assignChecklistToEmployee: (employeeId: string, templateId: string) => {
      const template = MOCK_CHECKLIST_TEMPLATES.find(t => t.id === templateId);
      if (!template) return Promise.reject("Template not found");

      const newAssigned: AssignedChecklist = {
          id: `asgn_${Date.now()}`,
          employeeId,
          templateId,
          templateName: template.name,
          assignedDate: new Date().toISOString(),
          tasks: template.tasks.map(t => ({ ...t, isCompleted: false }))
      };
      MOCK_ASSIGNED_CHECKLISTS.push(newAssigned);
      return simulateApiCall(newAssigned);
  },
  updateTaskStatus: (checklistId: string, taskId: string, isCompleted: boolean) => {
      const checklist = MOCK_ASSIGNED_CHECKLISTS.find(c => c.id === checklistId);
      if (checklist) {
          const task = checklist.tasks.find(t => t.id === taskId);
          if (task) {
              task.isCompleted = isCompleted;
              task.completedAt = isCompleted ? new Date().toISOString() : undefined;
          }
      }
      return simulateApiCall({ success: true });
  },
};