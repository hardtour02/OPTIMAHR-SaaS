// FIX: Added 'ReportChartData' to the import list to resolve a 'Cannot find name' error.
// FIX: Added missing types for new mock data and API functions.
// FIX: Added missing type 'AssignedChecklistTask' to fix compilation error.
import { Employee, Company, SystemLog, NewEmployee, FormFieldOption, User, DashboardConfig, CustomFieldDef, Notification, SalaryConfig, Currency, ConversionRate, CardConfig, FilterConfig, ChartConfig, InventoryCategory, InventoryItem, Loan, LoanConfig, Accessory, InventoryConfig, InventoryMovementLog, DashboardConfigs, ReportDefinition, ReportData, ContractType, ReportCategoryKey, ReportSettings, CustomizeSettings, AuthenticatedUser, Role, Permission, Document, DashboardStats, ReportChartType, ReportVisibility, LeavePolicy, LeaveBalance, LeaveRequest, ReportChartData, OrgNode as OrgNodeType, PendingChange, PendingChangeRequest, ChecklistTemplate, AssignedChecklist, AssignedChecklistTask } from '../types';
import { supabase } from '../lib/supabaseClient';

const isPublicMode = supabase.supabaseUrl.includes('placeholder.supabase.co');

// --- START of MOCK DATA ---
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
// --- END of MOCK DATA ---


// =================================================================================================
// --- API IMPLEMENTATION ---
// =================================================================================================

// Helper function to convert snake_case keys from DB to camelCase for frontend
const toCamel = (s: string) => s.replace(/([-_][a-z])/ig, ($1) => $1.toUpperCase().replace('_', ''));
const isObject = (obj: any) => obj === Object(obj) && !Array.isArray(obj) && typeof obj !== 'function';
const keysToCamel = (obj: any): any => {
    if (isObject(obj)) {
        const n: { [key: string]: any } = {};
        Object.keys(obj).forEach((k) => {
            n[toCamel(k)] = keysToCamel(obj[k]);
        });
        return n;
    } else if (Array.isArray(obj)) {
        return obj.map((i) => keysToCamel(i));
    }
    return obj;
};

// Helper function to convert camelCase keys from frontend to snake_case for DB
const toSnake = (s: string) => s.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
const keysToSnake = (obj: any): any => {
    if (isObject(obj)) {
        const n: { [key: string]: any } = {};
        Object.keys(obj).forEach((k) => {
            n[toSnake(k)] = keysToSnake(obj[k]);
        });
        return n;
    } else if (Array.isArray(obj)) {
        return obj.map((i) => keysToSnake(i));
    }
    return obj;
};

const addLog = async (user: string, action: string, details: string) => {
    await supabase.from('system_logs').insert({ user, action, details });
};

const uploadBlobToStorage = async (blobUrl: string, storagePath: string): Promise<string> => {
    if (!blobUrl.startsWith('blob:')) {
        return blobUrl; // Not a blob, return as is.
    }

    const response = await fetch(blobUrl);
    const fileBlob = await response.blob();
    
    const { error: uploadError } = await supabase.storage.from('documents').upload(storagePath, fileBlob, {
         upsert: true // Overwrite if file exists, useful for avatars
    });
    
    if (uploadError) {
        console.error('Error uploading blob:', uploadError);
        throw uploadError;
    }

    const { data: { publicUrl } } = supabase.storage.from('documents').getPublicUrl(storagePath);
    URL.revokeObjectURL(blobUrl); // Clean up memory
    return publicUrl;
};


export const api = {
  // --- Auth is handled by AuthContext ---

  // --- Employees ---
  async getEmployees(): Promise<Employee[]> {
    if (isPublicMode) return [];
    const { data, error } = await supabase.from('employees').select('*');
    if (error) {
        console.error('Error fetching employees:', error);
        throw error;
    }
    return keysToCamel(data) as Employee[];
  },
  async getEmployeeById(id: string): Promise<Employee | undefined> {
    if (isPublicMode) return undefined;
    const { data, error } = await supabase.from('employees').select('*').eq('id', id).single();
    if (error) {
        console.error('Error fetching employee by id:', error);
        if (error.code === 'PGRST116') return undefined; // Not found
        throw error;
    }
    return keysToCamel(data) as Employee;
  },
  async getEmployeeByEmail(email: string): Promise<Employee | undefined> {
    if (isPublicMode) return undefined;
    const { data, error } = await supabase.from('employees').select('*').eq('email', email).single();
    if (error) {
        console.error('Error fetching employee by email:', error);
        if (error.code === 'PGRST116') return undefined; // Not found
        throw error;
    }
    return keysToCamel(data) as Employee;
  },
  async addEmployee(employee: NewEmployee): Promise<Employee> {
    const processedEmployee = { ...employee };

    // Handle photo upload
    if (processedEmployee.photoUrl && processedEmployee.photoUrl.startsWith('blob:')) {
        const photoPath = `public/${processedEmployee.idNumber}/avatar`;
        processedEmployee.photoUrl = await uploadBlobToStorage(processedEmployee.photoUrl, photoPath);
    }

    // Handle document uploads
    if (processedEmployee.documents && processedEmployee.documents.length > 0) {
        processedEmployee.documents = await Promise.all(
            processedEmployee.documents.map(async (doc) => {
                if (doc.url.startsWith('blob:')) {
                    const docPath = `public/${processedEmployee.idNumber}/${doc.id}_${doc.name}`;
                    return { ...doc, url: await uploadBlobToStorage(doc.url, docPath) };
                }
                return doc;
            })
        );
    }
    
    const snakeCaseEmployee = keysToSnake(processedEmployee);
    delete snakeCaseEmployee.id;

    const { data, error } = await supabase.from('employees').insert(snakeCaseEmployee).select().single();

    if (error) {
        console.error('Error adding employee:', error);
        throw error;
    }
    
    addLog('admin@hrpro.com', 'Creación de empleado', `Empleado ${employee.firstName} ${employee.lastName} creado.`);
    return keysToCamel(data) as Employee;
  },
  async updateEmployee(employee: Employee): Promise<Employee> {
    const processedEmployee = { ...employee };

    // Handle photo upload
    if (processedEmployee.photoUrl && processedEmployee.photoUrl.startsWith('blob:')) {
        const photoPath = `public/${processedEmployee.id}/avatar`;
        processedEmployee.photoUrl = await uploadBlobToStorage(processedEmployee.photoUrl, photoPath);
    }

    // Handle document uploads
    if (processedEmployee.documents && processedEmployee.documents.length > 0) {
        processedEmployee.documents = await Promise.all(
            processedEmployee.documents.map(async (doc) => {
                if (doc.url.startsWith('blob:')) {
                    const docPath = `public/${processedEmployee.id}/${doc.id}_${doc.name}`;
                    return { ...doc, url: await uploadBlobToStorage(doc.url, docPath) };
                }
                return doc;
            })
        );
    }

    const { id, ...restOfEmployee } = processedEmployee;
    const snakeCaseEmployee = keysToSnake(restOfEmployee);
    
    const { data, error } = await supabase.from('employees').update(snakeCaseEmployee).eq('id', id).select().single();

    if (error) {
        console.error('Error updating employee:', error);
        throw error;
    }

    addLog('admin@hrpro.com', 'Actualización de empleado', `Empleado ${employee.firstName} ${employee.lastName} actualizado.`);
    return keysToCamel(data) as Employee;
  },
  async deleteEmployee(id: string): Promise<{ success: boolean }> {
    const { error } = await supabase.from('employees').delete().eq('id', id);
    if (error) {
        console.error('Error deleting employee:', error);
        throw error;
    }
    addLog('admin@hrpro.com', 'Eliminación de empleado', `Empleado con ID ${id} eliminado.`);
    return { success: true };
  },

  // --- Companies ---
  async getCompanies(): Promise<Company[]> {
      if (isPublicMode) return [];
      const { data, error } = await supabase.from('companies').select('*');
      if(error) throw error;
      return keysToCamel(data) as Company[];
  },
  async addCompany(company: Omit<Company, 'id'>): Promise<Company> {
      const { data, error } = await supabase.from('companies').insert(keysToSnake(company)).select().single();
      if(error) throw error;
      return keysToCamel(data) as Company;
  },
  async updateCompany(company: Company): Promise<Company> {
      const { data, error } = await supabase.from('companies').update(keysToSnake(company)).eq('id', company.id).select().single();
      if(error) throw error;
      return keysToCamel(data) as Company;
  },
  async deleteCompany(id: string): Promise<{ success: true }> {
      const { error } = await supabase.from('companies').delete().eq('id', id);
      if(error) throw error;
      return { success: true };
  },
  
  // --- System ---
  async getSystemLogs(filters: { userFilter?: string, startDate?: string, endDate?: string, actionFilter?: string }): Promise<SystemLog[]> {
      if (isPublicMode) return [];
      let query = supabase.from('system_logs').select('*').order('timestamp', { ascending: false });
      if (filters.userFilter) query = query.ilike('user', `%${filters.userFilter}%`);
      if (filters.actionFilter) query = query.eq('action', filters.actionFilter);
      if (filters.startDate) query = query.gte('timestamp', filters.startDate);
      if (filters.endDate) query = query.lte('timestamp', filters.endDate);
      const { data, error } = await query;
      if(error) throw error;
      return keysToCamel(data) as SystemLog[];
  },
  
  // --- Form Fields ---
  async getFormFieldOptions(): Promise<FormFieldOption[]> {
      if (isPublicMode) return [];
      const { data, error } = await supabase.from('form_field_options').select('*');
      if(error) throw error;
      return keysToCamel(data) as FormFieldOption[];
  },
  async addFormFieldOption(option: Omit<FormFieldOption, 'id'>): Promise<FormFieldOption> {
      const { data, error } = await supabase.from('form_field_options').insert(keysToSnake(option)).select().single();
      if(error) throw error;
      return keysToCamel(data) as FormFieldOption;
  },
  async updateFormFieldOption(option: FormFieldOption): Promise<FormFieldOption> {
      const { data, error } = await supabase.from('form_field_options').update(keysToSnake(option)).eq('id', option.id).select().single();
      if(error) throw error;
      return keysToCamel(data) as FormFieldOption;
  },
  async deleteFormFieldOption(id: string): Promise<{ success: true }> {
      const { error } = await supabase.from('form_field_options').delete().eq('id', id);
      if(error) throw error;
      return { success: true };
  },

  // --- Custom Fields ---
  async getCustomFields(): Promise<CustomFieldDef[]> {
      if (isPublicMode) return [];
       const { data, error } = await supabase.from('custom_field_defs').select('*');
      if(error) throw error;
      return keysToCamel(data) as CustomFieldDef[];
  },
  async addCustomField(field: Omit<CustomFieldDef, 'id'> & { options?: string[] }): Promise<CustomFieldDef> {
      const { options, ...fieldData } = field;
      const { data, error } = await supabase.from('custom_field_defs').insert(keysToSnake(fieldData)).select().single();
      if(error) throw error;
      if (options && options.length > 0) {
          const optionObjects = options.map(opt => ({ field_type: field.label, value: opt }));
          await supabase.from('form_field_options').insert(optionObjects);
      }
      return keysToCamel(data) as CustomFieldDef;
  },
  async deleteCustomField(id: string): Promise<{ success: true }> {
      const { data: field } = await supabase.from('custom_field_defs').select('label').eq('id', id).single();
      if (field) {
         await supabase.from('form_field_options').delete().eq('field_type', field.label);
      }
      const { error } = await supabase.from('custom_field_defs').delete().eq('id', id);
      if(error) throw error;
      return { success: true };
  },

  // --- Users & Roles ---
  async getUsers(): Promise<User[]> {
    if (isPublicMode) return [];
    const { data, error } = await supabase.from('profiles').select('id, email, role_id, is_active');
    if(error) throw error;
    return keysToCamel(data) as User[];
  },
  async addUser(user: Omit<User, 'id' | 'isActive'>): Promise<User> {
    const { data, error } = await supabase.rpc('create_new_user', {
      email: user.email,
      password: user.password!,
      role_id: user.roleId,
    });
    if (error) throw error;
    return data;
  },
  async updateUser(user: User): Promise<User> {
    const { id, ...rest } = user;
    const { data, error } = await supabase.from('profiles').update(keysToSnake(rest)).eq('id', id).select().single();
    if (error) throw error;
    return keysToCamel(data) as User;
  },
  async deleteUser(id: string): Promise<{ success: true }> {
    const { error } = await supabase.rpc('delete_user_and_profile', { user_id_to_delete: id });
    if(error) throw error;
    return { success: true };
  },
   async toggleUserStatus(id: string): Promise<{ success: true }> {
    const { data: user } = await supabase.from('profiles').select('is_active').eq('id', id).single();
    if (!user) throw new Error("User not found");
    const { error } = await supabase.from('profiles').update({ is_active: !user.is_active }).eq('id', id);
    if(error) throw error;
    return { success: true };
  },
  async getRoles(): Promise<Role[]> {
    if (isPublicMode) return [];
    const { data, error } = await supabase.from('roles').select('*');
    if(error) throw error;
    return keysToCamel(data) as Role[];
  },
  getPermissions: () => Promise.resolve(ALL_PERMISSIONS),
  async addRole(role: Omit<Role, 'id' | 'isDeletable'>): Promise<Role> {
      const { data, error } = await supabase.from('roles').insert(keysToSnake({...role, isDeletable: true})).select().single();
      if(error) throw error;
      return keysToCamel(data) as Role;
  },
  async updateRole(role: Role): Promise<Role> {
      const { data, error } = await supabase.from('roles').update(keysToSnake(role)).eq('id', role.id).select().single();
      if(error) throw error;
      return keysToCamel(data) as Role;
  },
  async deleteRole(id: string): Promise<{ success: true }> {
      const { count } = await supabase.from('profiles').select('*', { count: 'exact' }).eq('role_id', id);
      if (count && count > 0) {
        throw new Error("No se puede eliminar el rol porque está asignado a uno o más usuarios.");
      }
      const { error } = await supabase.from('roles').delete().eq('id', id);
      if(error) throw error;
      return { success: true };
  },

  // --- Dashboards ---
  getDashboardConfig: async (dashboardType: string): Promise<DashboardConfig> => {
    const configs: DashboardConfigs | null = await api.getSystemSettings('dashboard_configs');
    if (!configs || !configs[dashboardType]) {
        // Return a default empty config to prevent crashes
        return { cards: [], filters: [], charts: [] };
    }
    return configs[dashboardType];
  },
  updateDashboardConfig: async (dashboardType: string, newConfig: DashboardConfig): Promise<DashboardConfig> => {
    const configs: DashboardConfigs = await api.getSystemSettings('dashboard_configs') || {};
    configs[dashboardType] = newConfig;
    const updated = await api.updateSystemSettings('dashboard_configs', configs);
    return updated[dashboardType];
  },
  getAvailableDataKeys: async (dashboardType: string): Promise<any> => {
    // This is mock data as the source is not defined
    const keys: Record<string, any> = {
        employees: {
            card: [{ key: 'totalEmployees', label: 'Total Empleados' }, { key: 'activeEmployees', label: 'Empleados Activos' }],
            filter: [{ key: 'company', label: 'Empresa' }, { key: 'status', label: 'Estatus' }],
            chart: [{ key: 'employeesByCompany', label: 'Empleados por Empresa' }]
        },
        loans: {
            card: [{ key: 'totalLoans', label: 'Total Préstamos' }, { key: 'activeLoans', label: 'Préstamos Activos' }],
            filter: [{ key: 'status', label: 'Estatus' }],
            chart: [{ key: 'loansByCategory', label: 'Préstamos por Categoría' }]
        },
        inventory_items: {
            card: [{ key: 'totalItems', label: 'Total Ítems' }, { key: 'lowStockItems', label: 'Ítems bajos de stock' }],
            filter: [{ key: 'categoryId', label: 'Categoría' }],
            chart: [{ key: 'itemsByCategory', label: 'Ítems por Categoría' }]
        },
        inventory_accessories: {
             card: [{ key: 'totalAccessories', label: 'Total Accesorios' }, { key: 'lowStockAccessories', label: 'Accesorios bajos de stock' }],
            filter: [{ key: 'categoryId', label: 'Categoría' }],
            chart: [{ key: 'accessoriesByCategory', label: 'Accesorios por Categoría' }]
        },
        absences: {
            card: [{ key: 'totalRequests', label: 'Total Solicitudes' }, { key: 'pendingRequests', label: 'Solicitudes Pendientes' }],
            filter: [{ key: 'status', label: 'Estatus' }, { key: 'policyId', label: 'Tipo de Ausencia' }],
            chart: [{ key: 'requestsByStatus', label: 'Solicitudes por Estado' }]
        }
    };
    return Promise.resolve(keys[dashboardType] || { card: [], filter: [], chart: [] });
  },
  getEmployeesDashboardStats: async (employees: Employee[]): Promise<DashboardStats> => {
    const totalEmployees = employees.length;
    const activeEmployees = employees.filter(e => e.status === 'active').length;
    const inactiveEmployees = totalEmployees - activeEmployees;

    const employeesByCompany = employees.reduce((acc, e) => {
        acc[e.company] = (acc[e.company] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    return {
        totalEmployees,
        activeEmployees,
        inactiveEmployees,
        employeesByCompany: Object.entries(employeesByCompany).map(([name, value]) => ({ name, value }))
    };
  },
  getLoansDashboardStats: async (loans: Loan[]): Promise<DashboardStats> => {
    const totalLoans = loans.length;
    const activeLoans = loans.filter(l => l.status === 'Activo').length;
    const returnedLoans = totalLoans - activeLoans;

    return { totalLoans, activeLoans, returnedLoans };
  },
  getInventoryDashboardStats: async (items: InventoryItem[], accessories: Accessory[]): Promise<DashboardStats> => {
    const lowStockItems = items.filter(i => (i.availableStock ?? i.totalStock) <= i.minStock).length;
    const lowStockAccessories = accessories.filter(a => (a.availableStock ?? a.totalStock) <= a.minStock).length;

    return {
        totalItems: items.length,
        lowStockItems,
        totalAccessories: accessories.length,
        lowStockAccessories,
    };
  },
  getAbsencesDashboardStats: async (requests: LeaveRequest[]): Promise<DashboardStats> => {
      const totalRequests = requests.length;
      const pendingRequests = requests.filter(r => r.status === 'Pendiente').length;
      const approvedRequests = requests.filter(r => r.status === 'Aprobado').length;
      
      const requestsByStatus = requests.reduce((acc, r) => {
          acc[r.status] = (acc[r.status] || 0) + 1;
          return acc;
      }, {} as Record<string, number>);

      return {
          totalRequests,
          pendingRequests,
          approvedRequests,
          requestsByStatus: Object.entries(requestsByStatus).map(([name, value]) => ({ name, value })),
      };
  },
  
  // --- Salary & Contract ---
  // Salary/Loan/Inventory configs are stored in a single JSONB in system_settings
  async getSystemSettings(key: string): Promise<any> {
    if (isPublicMode) return null;
    const { data, error } = await supabase.from('system_settings').select('settings').eq('id', key).single();
    if (error) {
        if (error.code === 'PGRST116') return null; // Not found is fine
        throw error;
    }
    return data.settings || null;
  },
  async updateSystemSettings(key: string, newSettings: any): Promise<any> {
    const { data, error } = await supabase.from('system_settings').upsert({ id: key, settings: newSettings }).select().single();
    if(error) throw error;
    return data.settings;
  },

  getSalaryConfig: async () => api.getSystemSettings('salary_config'),
  updateSalaryConfig: async (config: SalaryConfig) => api.updateSystemSettings('salary_config', config),
  
  async getCurrencies(): Promise<Currency[]> {
    if (isPublicMode) return [];
    const { data, error } = await supabase.from('currencies').select('*');
    if(error) throw error;
    return keysToCamel(data) as Currency[];
  },
  async addCurrency(currency: Omit<Currency, 'id'>): Promise<Currency> {
    const { data, error } = await supabase.from('currencies').insert(keysToSnake(currency)).select().single();
    if(error) throw error;
    return keysToCamel(data) as Currency;
  },
  async updateCurrency(currency: Currency): Promise<Currency> {
    const { data, error } = await supabase.from('currencies').update(keysToSnake(currency)).eq('id', currency.id).select().single();
    if(error) throw error;
    return keysToCamel(data) as Currency;
  },
  async deleteCurrency(id: string): Promise<{success: true}> {
    const { error } = await supabase.from('currencies').delete().eq('id', id);
    if(error) throw error;
    return { success: true };
  },
  async getConversionRates(): Promise<ConversionRate[]> {
    if (isPublicMode) return [];
     const { data, error } = await supabase.from('conversion_rates').select('*');
    if(error) throw error;
    return keysToCamel(data) as ConversionRate[];
  },
  async addConversionRate(rate: Omit<ConversionRate, 'id'>): Promise<ConversionRate> {
    const { data, error } = await supabase.from('conversion_rates').upsert(keysToSnake(rate), { onConflict: 'from,to' }).select().single();
    if(error) throw error;
    return keysToCamel(data) as ConversionRate;
  },
  async deleteConversionRate(id: string): Promise<{success: true}> {
     const { error } = await supabase.from('conversion_rates').delete().eq('id', id);
    if(error) throw error;
    return { success: true };
  },
  async getContractTypes(): Promise<ContractType[]> {
    if (isPublicMode) return [];
     const { data, error } = await supabase.from('contract_types').select('*');
    if(error) throw error;
    return keysToCamel(data) as ContractType[];
  },
  async addContractType(ct: Omit<ContractType, 'id'>): Promise<ContractType> {
     const { data, error } = await supabase.from('contract_types').insert(keysToSnake(ct)).select().single();
    if(error) throw error;
    return keysToCamel(data) as ContractType;
  },
  async updateContractType(ct: ContractType): Promise<ContractType> {
     const { data, error } = await supabase.from('contract_types').update(keysToSnake(ct)).eq('id', ct.id).select().single();
    if(error) throw error;
    return keysToCamel(data) as ContractType;
  },
  async deleteContractType(id: string): Promise<{success: true}> {
     const { error } = await supabase.from('contract_types').delete().eq('id', id);
    if(error) throw error;
    return { success: true };
  },
  
  // --- Absences ---
  async getLeavePolicies(): Promise<LeavePolicy[]> {
    if (isPublicMode) return [];
    const { data, error } = await supabase.from('leave_policies').select('*');
    if(error) throw error;
    return keysToCamel(data) as LeavePolicy[];
  },
  async addLeavePolicy(policy: Omit<LeavePolicy, 'id'>): Promise<LeavePolicy> {
    const { data, error } = await supabase.from('leave_policies').insert(keysToSnake(policy)).select().single();
    if(error) throw error;
    return keysToCamel(data) as LeavePolicy;
  },
  async updateLeavePolicy(policy: LeavePolicy): Promise<LeavePolicy> {
    const { data, error } = await supabase.from('leave_policies').update(keysToSnake(policy)).eq('id', policy.id).select().single();
    if(error) throw error;
    return keysToCamel(data) as LeavePolicy;
  },
  async deleteLeavePolicy(id: string): Promise<{ success: true }> {
    const { error } = await supabase.from('leave_policies').delete().eq('id', id);
    if(error) throw error;
    return { success: true };
  },
  async getEmployeeLeaveBalances(employeeId: string): Promise<LeaveBalance[]> {
    if (isPublicMode) return [];
    const { data, error } = await supabase.from('leave_balances').select('*').eq('employee_id', employeeId);
    if(error) throw error;
    return keysToCamel(data) as LeaveBalance[];
  },
  async getEmployeeLeaveRequests(employeeId: string): Promise<LeaveRequest[]> {
    if (isPublicMode) return [];
    const { data, error } = await supabase.from('leave_requests').select('*').eq('employee_id', employeeId).order('start_date', { ascending: false });
    if(error) throw error;
    return keysToCamel(data) as LeaveRequest[];
  },
  async getAllLeaveRequests(): Promise<LeaveRequest[]> {
    if (isPublicMode) return [];
    const { data, error } = await supabase.from('leave_requests').select('*').order('start_date', { ascending: false });
    if(error) throw error;
    return keysToCamel(data) as LeaveRequest[];
  },
  async addLeaveRequest(request: Omit<LeaveRequest, 'id' | 'status'>): Promise<LeaveRequest> {
    const { data, error } = await supabase.from('leave_requests').insert(keysToSnake({...request, status: 'Pendiente'})).select().single();
    if(error) throw error;
    return keysToCamel(data) as LeaveRequest;
  },
  async cancelLeaveRequest(requestId: string): Promise<{ success: true }> {
    const { error } = await supabase.from('leave_requests').update({ status: 'Cancelado' }).eq('id', requestId).eq('status', 'Pendiente');
    if(error) throw error;
    return { success: true };
  },
  async reviewLeaveRequest(requestId: string, status: 'Aprobado' | 'Rechazado', managerNotes: string): Promise<{ success: true }> {
    const { error } = await supabase.rpc('review_leave_request', {
        request_id: requestId,
        new_status: status,
        manager_notes: managerNotes
    });
    if(error) throw error;
    return { success: true };
  },

  // --- Inventory ---
  getInventoryConfig: async (): Promise<InventoryConfig> => api.getSystemSettings('inventory_config'),
  updateInventoryConfig: async (config: InventoryConfig): Promise<InventoryConfig> => api.updateSystemSettings('inventory_config', config),
  async getInventoryCategories(): Promise<InventoryCategory[]> {
    if (isPublicMode) return [];
    const { data, error } = await supabase.from('inventory_categories').select('*');
    if (error) throw error;
    return keysToCamel(data) as InventoryCategory[];
  },
  async addInventoryCategory(category: Omit<InventoryCategory, 'id'>): Promise<InventoryCategory> {
    const { data, error } = await supabase.from('inventory_categories').insert(keysToSnake(category)).select().single();
    if (error) throw error;
    return keysToCamel(data) as InventoryCategory;
  },
  async updateInventoryCategory(category: InventoryCategory): Promise<InventoryCategory> {
    const { data, error } = await supabase.from('inventory_categories').update(keysToSnake(category)).eq('id', category.id).select().single();
    if (error) throw error;
    return keysToCamel(data) as InventoryCategory;
  },
  async deleteInventoryCategory(id: string): Promise<{ success: true }> {
    const { error } = await supabase.from('inventory_categories').delete().eq('id', id);
    if (error) throw error;
    return { success: true };
  },
  async getInventoryItemsWithStock(): Promise<InventoryItem[]> {
    if (isPublicMode) return [];
    const { data, error } = await supabase.rpc('get_inventory_items_with_stock');
    if (error) throw error;
    return keysToCamel(data) as InventoryItem[];
  },
  async addInventoryItem(item: Omit<InventoryItem, 'id' | 'availableStock'>): Promise<InventoryItem> {
    const { data, error } = await supabase.from('inventory_items').insert(keysToSnake(item)).select().single();
    if (error) throw error;
    await addLog((await supabase.auth.getUser()).data.user?.email || 'system', 'Creación', `Ítem de inventario '${item.name}' creado.`);
    return keysToCamel(data) as InventoryItem;
  },
  async updateInventoryItem(item: InventoryItem): Promise<InventoryItem> {
    const { id, ...rest } = item;
    const { data, error } = await supabase.from('inventory_items').update(keysToSnake(rest)).eq('id', id).select().single();
    if (error) throw error;
    return keysToCamel(data) as InventoryItem;
  },
  async deleteInventoryItem(id: string): Promise<{ success: true }> {
    const { error } = await supabase.from('inventory_items').delete().eq('id', id);
    if (error) throw error;
    return { success: true };
  },
  async adjustInventoryStock(itemId: string, quantityChange: number, notes: string): Promise<{ success: true }> {
    const { error } = await supabase.rpc('adjust_inventory_stock', {
        p_item_id: itemId,
        p_quantity_change: quantityChange,
        p_notes: notes,
        p_user_email: (await supabase.auth.getUser()).data.user?.email || 'system'
    });
    if (error) throw error;
    return { success: true };
  },
  async getAllAccessories(): Promise<Accessory[]> {
    if (isPublicMode) return [];
    const { data, error } = await supabase.from('accessories').select('*');
    if (error) throw error;
    return keysToCamel(data) as Accessory[];
  },
  async getAccessoriesWithStock(categoryId: string): Promise<Accessory[]> {
    if (isPublicMode) return [];
    const { data, error } = await supabase.rpc('get_accessories_with_stock', { p_category_id: categoryId });
    if (error) throw error;
    return keysToCamel(data) as Accessory[];
  },
  async addAccessory(accessory: Omit<Accessory, 'id' | 'availableStock'>): Promise<Accessory> {
    const { data, error } = await supabase.from('accessories').insert(keysToSnake(accessory)).select().single();
    if (error) throw error;
    await addLog((await supabase.auth.getUser()).data.user?.email || 'system', 'Creación', `Accesorio '${accessory.name}' creado.`);
    return keysToCamel(data) as Accessory;
  },
  async updateAccessory(accessory: Accessory): Promise<Accessory> {
    const { id, ...rest } = accessory;
    const { data, error } = await supabase.from('accessories').update(keysToSnake(rest)).eq('id', id).select().single();
    if (error) throw error;
    return keysToCamel(data) as Accessory;
  },
  async deleteAccessory(id: string): Promise<{ success: true }> {
    const { error } = await supabase.from('accessories').delete().eq('id', id);
    if (error) throw error;
    return { success: true };
  },
  async adjustAccessoryStock(accessoryId: string, quantityChange: number, notes: string): Promise<{ success: true }> {
     const { error } = await supabase.rpc('adjust_accessory_stock', {
        p_accessory_id: accessoryId,
        p_quantity_change: quantityChange,
        p_notes: notes,
        p_user_email: (await supabase.auth.getUser()).data.user?.email || 'system'
    });
    if (error) throw error;
    return { success: true };
  },
  async getAllInventoryMovements(): Promise<InventoryMovementLog[]> {
      if (isPublicMode) return [];
      const { data, error } = await supabase.from('inventory_movement_logs').select('*').order('timestamp', { ascending: false });
      if(error) throw error;
      return keysToCamel(data) as InventoryMovementLog[];
  },
  async getInventoryMovements(itemId: string): Promise<InventoryMovementLog[]> {
      if (isPublicMode) return [];
      const { data, error } = await supabase.from('inventory_movement_logs').select('*').eq('item_id', itemId).eq('item_type', 'item').order('timestamp', { ascending: false });
      if(error) throw error;
      return keysToCamel(data) as InventoryMovementLog[];
  },
  async getAccessoryMovements(accessoryId: string): Promise<InventoryMovementLog[]> {
      if (isPublicMode) return [];
      const { data, error } = await supabase.from('inventory_movement_logs').select('*').eq('item_id', accessoryId).eq('item_type', 'accessory').order('timestamp', { ascending: false });
      if(error) throw error;
      return keysToCamel(data) as InventoryMovementLog[];
  },

  // --- Loans ---
  getAllLoans: async (): Promise<Loan[]> => {
    if (isPublicMode) return [];
    const { data, error } = await supabase.from('loans').select('*');
    if (error) throw error;
    return keysToCamel(data) as Loan[];
  },
  getLoans: async (categoryId: string): Promise<Loan[]> => {
    if (isPublicMode) return [];
    const { data, error } = await supabase.from('loans').select('*').eq('category_id', categoryId);
    if (error) throw error;
    return keysToCamel(data) as Loan[];
  },
  addLoan: async (loan: Omit<Loan, 'id'>): Promise<Loan> => {
    const { data, error } = await supabase.rpc('create_loan', { p_loan_data: keysToSnake(loan), p_user_email: (await supabase.auth.getUser()).data.user?.email || 'system' });
    if (error) throw error;
    return keysToCamel(data) as Loan;
  },
  updateLoan: async (loan: Loan): Promise<Loan> => {
    const { id, ...rest } = loan;
    const { data, error } = await supabase.from('loans').update(keysToSnake(rest)).eq('id', id).select().single();
    if (error) throw error;
    return keysToCamel(data) as Loan;
  },
  deleteLoan: async (id: string): Promise<{ success: true }> => {
    const { error } = await supabase.rpc('delete_loan', { p_loan_id: id, p_user_email: (await supabase.auth.getUser()).data.user?.email || 'system' });
    if (error) throw error;
    return { success: true };
  },
  returnLoan: async (id: string): Promise<{ success: true }> => {
    const { error } = await supabase.rpc('return_loan', { p_loan_id: id, p_user_email: (await supabase.auth.getUser()).data.user?.email || 'system' });
    if (error) throw error;
    return { success: true };
  },
  getLoanConfig: async (): Promise<LoanConfig> => api.getSystemSettings('loan_config'),
  updateLoanConfig: async (config: LoanConfig): Promise<LoanConfig> => api.updateSystemSettings('loan_config', config),

  // --- Reports ---
  async getAllReportDefinitions(): Promise<Record<string, ReportDefinition[]>> {
    if (isPublicMode) return {};
    const { data, error } = await supabase.from('system_settings').select('settings').eq('id', 'report_definitions').single();
    if(error) throw error;
    return data.settings;
  },
  getReportSettings: async () => api.getSystemSettings('report_settings'),
  updateReportSettings: async (settings: ReportSettings) => api.updateSystemSettings('report_settings', settings),

  async getReportDefinitions(): Promise<Record<string, ReportDefinition[]>> {
    if (isPublicMode) return {};
    const [allDefs, settings] = await Promise.all([api.getAllReportDefinitions(), api.getReportSettings()]);
    if (!settings || !allDefs) return {};
    const visibleReports: Record<string, ReportDefinition[]> = {};
    for (const category in allDefs) {
        visibleReports[category] = allDefs[category].filter(
            def => settings.reports[def.id]?.isActive
        );
    }
    return visibleReports;
  },
  
  async generateReport(reportId: string, filters: any): Promise<ReportData> {
      if (isPublicMode) return { tableData: [], chartData: [] };
      const { data, error } = await supabase.rpc(`generate_report_${reportId}`, { filters });
      if (error) throw error;
      return data as ReportData;
  },
  
  // --- Notifications ---
  async getNotifications(filters?: { status?: 'recent' | 'archived' | 'read' | 'unread', search?: string }): Promise<Notification[]> {
      if (isPublicMode) return [];
      let query = supabase.from('notifications').select('*');
      if(filters?.status === 'archived') query = query.eq('status', 'archived');
      else if (filters?.status === 'read') query = query.eq('status', 'read');
      else if (filters?.status === 'unread') query = query.eq('status', 'unread');
      else if (filters?.status === 'recent') query = query.neq('status', 'archived');
      if (filters?.search) query = query.ilike('message', `%${filters.search}%`);

      const { data, error } = await query.order('timestamp', { ascending: false });
      if(error) throw error;
      return keysToCamel(data) as Notification[];
  },
  async markNotificationAsRead(id: string): Promise<{success: true}> {
    const { error } = await supabase.from('notifications').update({ status: 'read' }).eq('id', id);
    if(error) throw error;
    return { success: true };
  },
   async markNotificationAsUnread(id: string): Promise<{success: true}> {
    const { error } = await supabase.from('notifications').update({ status: 'unread' }).eq('id', id);
    if(error) throw error;
    return { success: true };
  },
  async archiveNotification(id: string): Promise<{success: true}> {
    const { error } = await supabase.from('notifications').update({ status: 'archived' }).eq('id', id);
    if(error) throw error;
    return { success: true };
  },
   async unarchiveNotification(id: string): Promise<{success: true}> {
    const { error } = await supabase.from('notifications').update({ status: 'read' }).eq('id', id);
    if(error) throw error;
    return { success: true };
  },
  async checkAndCreateBirthdayNotifications(): Promise<void> {
    await supabase.rpc('check_and_create_birthday_notifications');
  },
  async checkAndCreateLoanNotifications(): Promise<void> {
    await supabase.rpc('check_and_create_loan_notifications');
  },
  async checkStockLevels(): Promise<void> {
    await supabase.rpc('check_and_create_stock_notifications');
  },
  async checkAndCreateContractNotifications(): Promise<void> {
    await supabase.rpc('check_and_create_contract_notifications');
  },
  checkLeaveBalanceLimits: () => Promise.resolve(), // This might be better as a DB trigger/function

  // --- Documents ---
  async getAllDocuments(): Promise<any[]> {
    if (isPublicMode) return [];
    const { data, error } = await supabase.from('employees').select('id, first_name, last_name, documents');
    if(error) throw error;
    const flatDocs = data.flatMap(e => (e.documents || []).map((d: Document) => ({ ...d, employeeId: e.id, employeeName: `${e.first_name} ${e.last_name}` })));
    return keysToCamel(flatDocs);
  },
  async addDocumentToEmployee(employeeId: string, file: File, docType: string): Promise<Document> {
    const filePath = `${employeeId}/${Date.now()}_${file.name}`;
    const { error: uploadError } = await supabase.storage.from('documents').upload(filePath, file);
    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage.from('documents').getPublicUrl(filePath);

    const newDoc: Document = {
      id: `doc_${Date.now()}`, name: file.name, type: docType, size: file.size,
      uploadDate: new Date().toISOString(), version: 1, url: publicUrl,
    };
    
    const { data: employee, error: fetchError } = await supabase.from('employees').select('documents').eq('id', employeeId).single();
    if (fetchError) throw fetchError;

    const updatedDocuments = [...(employee.documents || []), newDoc];
    const { error: updateError } = await supabase.from('employees').update({ documents: updatedDocuments }).eq('id', employeeId);
    if(updateError) throw updateError;
    
    return newDoc;
  },
  async deleteDocument(employeeId: string, docId: string): Promise<{success: true}> {
    const { data: employee, error: fetchError } = await supabase.from('employees').select('documents').eq('id', employeeId).single();
    if (fetchError) throw fetchError;
    if (!employee?.documents) return { success: true };
    
    const docToDelete = (employee.documents as Document[]).find(d => d.id === docId);
    const updatedDocuments = (employee.documents as Document[]).filter(d => d.id !== docId);
    
    if (docToDelete) {
        // Assuming the URL contains the filePath after the bucket name
        const urlParts = new URL(docToDelete.url).pathname.split('/');
        const filePath = urlParts.slice(urlParts.indexOf('documents') + 1).join('/');
        await supabase.storage.from('documents').remove([filePath]);
    }
    
    const { error: updateError } = await supabase.from('employees').update({ documents: updatedDocuments }).eq('id', employeeId);
    if(updateError) throw updateError;
    
    return { success: true };
  },

  // --- Customize ---
  getCustomizeSettings: async (): Promise<CustomizeSettings> => api.getSystemSettings('customize_settings'),
  updateCustomizeSettings: async (settings: CustomizeSettings): Promise<CustomizeSettings> => api.updateSystemSettings('customize_settings', settings),
  exportCustomizeSettings: () => api.getSystemSettings('customize_settings').then(s => JSON.stringify(s, null, 2)),
  importCustomizeSettings: (jsonString: string): Promise<CustomizeSettings> => {
      try {
        const parsed = JSON.parse(jsonString);
        return Promise.resolve(parsed as CustomizeSettings);
      } catch (e) {
        return Promise.reject("Invalid JSON");
      }
  },

  // --- Org Chart ---
  async getOrgChart(): Promise<OrgNodeType> {
    if (isPublicMode) return { id: 'root', name: 'Organización', unitType: 'root', employeeIds: [], children: [] };
    const { data, error } = await supabase.rpc('get_organization_chart_tree');
    if(error) throw error;
    return data || { id: 'root', name: 'Organización', unitType: 'root', employeeIds: [], children: [] };
  },

  // --- Profile Changes ---
  async requestProfileUpdate(employeeId: string, updates: Partial<Employee>, requesterEmail: string): Promise<{success: boolean, message?: string}> {
    const { data: originalEmployee, error: empError } = await supabase.from('employees').select('*').eq('id', employeeId).single();
    if (empError) throw empError;
    
    const changes: PendingChange[] = [];
      for (const key in updates) {
          if (key !== 'id' && JSON.stringify(updates[key as keyof Employee]) !== JSON.stringify(originalEmployee[toCamel(key) as keyof Employee])) {
              changes.push({
                  field: key,
                  oldValue: originalEmployee[toCamel(key) as keyof Employee],
                  newValue: updates[key as keyof Employee]
              });
          }
      }

    if (changes.length > 0) {
        const { error } = await supabase.from('pending_profile_changes').insert({
            employee_id: employeeId,
            changes: changes,
        });
        if (error) throw error;
        await addLog(requesterEmail, 'Solicitud de cambio de perfil', `Solicitud para ${originalEmployee.first_name} ${originalEmployee.last_name} enviada.`);
        return { success: true };
    }
    return { success: false, message: 'No se detectaron cambios para enviar.' };
  },
  async getPendingChanges(): Promise<PendingChangeRequest[]> {
    if (isPublicMode) return [];
    const { data, error } = await supabase.from('pending_profile_changes_view').select('*');
    if(error) throw error;
    return keysToCamel(data) as PendingChangeRequest[];
  },
  async approveChangeRequest(requestId: string): Promise<{ success: true }> {
    const { error } = await supabase.rpc('approve_profile_change', { request_id: requestId });
    if (error) throw error;
    return { success: true };
  },
  async rejectChangeRequest(requestId: string): Promise<{ success: true }> {
    const { error } = await supabase.from('pending_profile_changes').delete().eq('id', requestId);
    if (error) throw error;
    return { success: true };
  },

  // --- Checklists ---
  async getChecklistTemplates(): Promise<ChecklistTemplate[]> {
    if (isPublicMode) return [];
    const { data, error } = await supabase.from('checklist_templates').select('*');
    if(error) throw error;
    return keysToCamel(data) as ChecklistTemplate[];
  },
  async addChecklistTemplate(template: Omit<ChecklistTemplate, 'id'>): Promise<ChecklistTemplate> {
    const { data, error } = await supabase.from('checklist_templates').insert(keysToSnake(template)).select().single();
    if(error) throw error;
    return keysToCamel(data) as ChecklistTemplate;
  },
  async updateChecklistTemplate(template: ChecklistTemplate): Promise<ChecklistTemplate> {
    const { data, error } = await supabase.from('checklist_templates').update(keysToSnake(template)).eq('id', template.id).select().single();
    if(error) throw error;
    return keysToCamel(data) as ChecklistTemplate;
  },
  async deleteChecklistTemplate(id: string): Promise<{ success: true }> {
    const { error } = await supabase.from('checklist_templates').delete().eq('id', id);
    if(error) throw error;
    return { success: true };
  },
  async getAssignedChecklists(employeeId: string): Promise<AssignedChecklist[]> {
    if (isPublicMode) return [];
    const { data, error } = await supabase.from('assigned_checklists').select('*').eq('employee_id', employeeId);
    if(error) throw error;
    return keysToCamel(data) as AssignedChecklist[];
  },
  async assignChecklistToEmployee(employeeId: string, templateId: string): Promise<AssignedChecklist> {
    const { data: template, error: templateError } = await supabase.from('checklist_templates').select('*').eq('id', templateId).single();
    if (templateError || !template) throw new Error("Template not found");

    const newAssigned = {
        employee_id: employeeId,
        template_id: templateId,
        template_name: template.name,
        tasks: template.tasks.map((t: any) => ({ ...t, is_completed: false }))
    };
    const { data, error } = await supabase.from('assigned_checklists').insert(newAssigned).select().single();
    if(error) throw error;
    return keysToCamel(data) as AssignedChecklist;
  },
  async updateTaskStatus(checklistId: string, taskId: string, isCompleted: boolean): Promise<{ success: true }> {
    const { data: checklist, error: fetchError } = await supabase.from('assigned_checklists').select('tasks').eq('id', checklistId).single();
    if(fetchError || !checklist) throw new Error("Checklist not found");

    const updatedTasks = (checklist.tasks as AssignedChecklistTask[]).map(task => {
        if (task.id === taskId) {
            return { ...task, isCompleted, completedAt: isCompleted ? new Date().toISOString() : undefined };
        }
        return task;
    });

    const { error } = await supabase.from('assigned_checklists').update({ tasks: updatedTasks }).eq('id', checklistId);
    if(error) throw error;
    return { success: true };
  },
};