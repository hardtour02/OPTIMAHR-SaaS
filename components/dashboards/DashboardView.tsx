
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import Card from '../ui/Card';
import PieChartComponent from '../charts/PieChartComponent';
import BarChartComponent from '../charts/BarChartComponent';
import { api } from '../../services/api';
import Spinner from '../ui/Spinner';
// FIX: Import 'CardConfig' type to resolve 'Cannot find name' errors.
import { DashboardConfig, Employee, FormFieldOption, Company, Loan, InventoryCategory, FilterConfig, ChartConfig, InventoryItem, Accessory, CardConfig, LeaveRequest, LeavePolicy } from '../../types';
import EmployeeSummaryTable from './EmployeeSummaryTable';
import LoansSummaryTable from './LoansSummaryTable';
import InventorySummaryTable from './InventorySummaryTable';
import AccessorySummaryTable from './AccessorySummaryTable';
import AbsencesSummaryTable from './AbsencesSummaryTable';


interface DashboardStats {
    [key: string]: any; 
}

interface DashboardViewProps {
    type: 'employees' | 'loans' | 'inventory_items' | 'inventory_accessories' | 'absences';
}

export const DashboardView: React.FC<DashboardViewProps> = ({ type }) => {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [config, setConfig] = useState<DashboardConfig | null>(null);
    const [loading, setLoading] = useState(true);
    
    // Data specific to each dashboard
    const [allEmployees, setAllEmployees] = useState<Employee[]>([]);
    const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
    const [allLoans, setAllLoans] = useState<Loan[]>([]);
    const [filteredLoans, setFilteredLoans] = useState<Loan[]>([]);
    const [allInventory, setAllInventory] = useState<InventoryItem[]>([]);
    const [filteredInventory, setFilteredInventory] = useState<InventoryItem[]>([]);
    const [allAccessories, setAllAccessories] = useState<Accessory[]>([]);
    const [filteredAccessories, setFilteredAccessories] = useState<Accessory[]>([]);
    const [employeesForLoanSearch, setEmployeesForLoanSearch] = useState<Employee[]>([]);
    const [inventoryForLoanSearch, setInventoryForLoanSearch] = useState<InventoryItem[]>([]);
    const [allAbsences, setAllAbsences] = useState<LeaveRequest[]>([]);
    const [filteredAbsences, setFilteredAbsences] = useState<LeaveRequest[]>([]);
    const [leavePolicies, setLeavePolicies] = useState<LeavePolicy[]>([]);


    // Form options for filters
    const [fieldOptions, setFieldOptions] = useState<FormFieldOption[]>([]);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [inventoryCategories, setInventoryCategories] = useState<InventoryCategory[]>([]);
    
    // Filter state
    const [filters, setFilters] = useState<Record<string, string>>({});
    const [searchTerm, setSearchTerm] = useState(''); 
    const [loanSearchTerm, setLoanSearchTerm] = useState('');
    const [loanDateFilter, setLoanDateFilter] = useState({ start: '', end: '' });
    const [contractDateFilter, setContractDateFilter] = useState({ start: '', end: '' });
    const [creationDateFilter, setCreationDateFilter] = useState({ start: '', end: '' });

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const configData = await api.getDashboardConfig(type);
            setConfig(configData);

            // Fetch data based on dashboard type
            if (type === 'employees') {
                const [empData, optData, compData] = await Promise.all([api.getEmployees(), api.getFormFieldOptions(), api.getCompanies()]);
                setAllEmployees(empData);
                setFilteredEmployees(empData);
                setFieldOptions(optData);
                setCompanies(compData);
                setStats(await api.getEmployeesDashboardStats(empData));
            } else if (type === 'loans') {
                const [loansData, empData, invData, catData] = await Promise.all([api.getAllLoans(), api.getEmployees(), api.getInventoryItemsWithStock(), api.getInventoryCategories()]);
                setAllLoans(loansData);
                setFilteredLoans(loansData);
                setEmployeesForLoanSearch(empData);
                setInventoryForLoanSearch(invData);
                setInventoryCategories(catData);
                setStats(await api.getLoansDashboardStats(loansData));
            } else if (type === 'inventory_items' || type === 'inventory_accessories') {
                 const [invData, accData, catData] = await Promise.all([api.getInventoryItemsWithStock(), api.getAllAccessories(), api.getInventoryCategories()]);
                setAllInventory(invData);
                setFilteredInventory(invData);
                
                const accessoriesWithStock = await Promise.all(accData.map(async a => {
                    const stockData = await api.getAccessoriesWithStock(a.categoryId);
                    return stockData.find(s => s.id === a.id) || a;
                }));
                setAllAccessories(accessoriesWithStock);
                setFilteredAccessories(accessoriesWithStock);

                setInventoryCategories(catData);
                setStats(await api.getInventoryDashboardStats(invData, accessoriesWithStock));
            } else if (type === 'absences') {
                const [requestsData, policiesData, empData, optData] = await Promise.all([
                    api.getAllLeaveRequests(),
                    api.getLeavePolicies(),
                    api.getEmployees(),
                    api.getFormFieldOptions(),
                ]);
                setAllAbsences(requestsData);
                setFilteredAbsences(requestsData);
                setLeavePolicies(policiesData);
                setAllEmployees(empData);
                setFieldOptions(optData);
                setStats(await api.getAbsencesDashboardStats(requestsData));
            }

        } catch (error) {
            console.error("Failed to fetch dashboard data:", error);
        } finally {
            setLoading(false);
        }
    }, [type]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Apply filters and update stats
    useEffect(() => {
        const applyFilters = async () => {
            if (type === 'employees') {
                const newFiltered = allEmployees.filter(e => {
                    const searchMatch = `${e.firstName} ${e.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) || e.idNumber.includes(searchTerm.toLowerCase());
                    const filterMatch = Object.entries(filters).every(([key, value]) => !value || e[key] === value);
                    const contractDate = new Date(e.contractStartDate).getTime();
                    const startDateMatch = !contractDateFilter.start || contractDate >= new Date(contractDateFilter.start).getTime();
                    const endDateMatch = !contractDateFilter.end || contractDate <= new Date(contractDateFilter.end).getTime() + 86399999;
                    return searchMatch && filterMatch && startDateMatch && endDateMatch;
                });
                setFilteredEmployees(newFiltered);
                setStats(await api.getEmployeesDashboardStats(newFiltered));
            } else if (type === 'loans') {
                const newFiltered = allLoans.filter(l => {
                    const employee = employeesForLoanSearch.find(e => e.id === l.employeeId);
                    const item = inventoryForLoanSearch.find(i => i.id === l.inventoryItemId);
                    const searchMatch = !loanSearchTerm || 
                        employee?.firstName.toLowerCase().includes(loanSearchTerm.toLowerCase()) ||
                        employee?.lastName.toLowerCase().includes(loanSearchTerm.toLowerCase()) ||
                        item?.name.toLowerCase().includes(loanSearchTerm.toLowerCase());
                    const filterMatch = Object.entries(filters).every(([key, value]) => !value || l[key as keyof Loan] === value);
                    const deliveryDate = new Date(l.deliveryDate).getTime();
                    const startDateMatch = !loanDateFilter.start || deliveryDate >= new Date(loanDateFilter.start).getTime();
                    const endDateMatch = !loanDateFilter.end || deliveryDate <= new Date(loanDateFilter.end).getTime() + 86399999;
                    return searchMatch && filterMatch && startDateMatch && endDateMatch;
                });
                setFilteredLoans(newFiltered);
                setStats(await api.getLoansDashboardStats(newFiltered));
            } else if (type === 'inventory_items' || type === 'inventory_accessories') {
                 const newFilteredItems = allInventory.filter(i => {
                    const searchMatch = i.name.toLowerCase().includes(searchTerm.toLowerCase()) || i.identifier.toLowerCase().includes(searchTerm.toLowerCase());
                    const filterMatch = Object.entries(filters).every(([key, value]) => !value || i[key as keyof InventoryItem] === value);
                    const creationDate = i.creationDate ? new Date(i.creationDate).getTime() : 0;
                    const startDateMatch = !creationDateFilter.start || creationDate >= new Date(creationDateFilter.start).getTime();
                    const endDateMatch = !creationDateFilter.end || creationDate <= new Date(creationDateFilter.end).getTime() + 86399999;
                    return searchMatch && filterMatch && startDateMatch && endDateMatch;
                 });
                 setFilteredInventory(newFilteredItems);
                 
                 const newFilteredAccessories = allAccessories.filter(a => {
                    const searchMatch = a.name.toLowerCase().includes(searchTerm.toLowerCase());
                    const filterMatch = Object.entries(filters).every(([key, value]) => !value || a[key as keyof Accessory] === value);
                    const creationDate = a.creationDate ? new Date(a.creationDate).getTime() : 0;
                    const startDateMatch = !creationDateFilter.start || creationDate >= new Date(creationDateFilter.start).getTime();
                    const endDateMatch = !creationDateFilter.end || creationDate <= new Date(creationDateFilter.end).getTime() + 86399999;
                    return searchMatch && filterMatch && startDateMatch && endDateMatch;
                 });
                 setFilteredAccessories(newFilteredAccessories);
                 setStats(await api.getInventoryDashboardStats(newFilteredItems, newFilteredAccessories));
            } else if (type === 'absences') {
                const newFiltered = allAbsences.filter(a => {
                    const employee = allEmployees.find(e => e.id === a.employeeId);
                    const searchMatch = !searchTerm || (employee && `${employee.firstName} ${employee.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()));
                    const filterMatch = Object.entries(filters).every(([key, value]) => !value || a[key as keyof LeaveRequest] === value);
                    return searchMatch && filterMatch;
                });
                setFilteredAbsences(newFiltered);
                setStats(await api.getAbsencesDashboardStats(newFiltered));
            }
        };

        if (!loading) {
            applyFilters();
        }
    }, [filters, searchTerm, allEmployees, type, loanSearchTerm, allLoans, allInventory, allAccessories, employeesForLoanSearch, inventoryForLoanSearch, loading, loanDateFilter, contractDateFilter, creationDateFilter, allAbsences]);


    const handleFilterChange = (key: string, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const getFilterOptions = (dataKey: string) => {
        if (dataKey === 'company') return companies.map(c => ({ id: c.id, value: c.name }));
        if (dataKey === 'categoryId') return inventoryCategories.map(c => ({ id: c.id, value: c.name }));
        if (dataKey === 'policyId') return leavePolicies.map(p => ({ id: p.id, value: p.name }));
        if (dataKey === 'status' && type === 'absences') {
            const options = fieldOptions.filter(o => o.fieldType === 'absenceStatus');
            return options.map(o => ({ id: o.id, value: o.value }));
        }
        const options = fieldOptions.filter(o => o.fieldType === dataKey);
        return options.map(o => ({ id: o.id, value: o.value }));
    };

    const getIcon = (iconName: CardConfig['icon']) => {
        switch (iconName) {
            case 'users': return <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
            case 'check': return <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>;
            case 'x': return <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;
            case 'clipboard': return <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>;
            case 'alert': return <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;
            case 'archive': return <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>;
        }
    }
    const cardColors = ['bg-primary', 'bg-secondary', 'bg-alert', 'bg-error'];


    if (loading) {
        return <div className="h-96 flex items-center justify-center"><Spinner /></div>;
    }
    if (!stats || !config) {
        return <p className="text-center text-on-surface-variant">No se pudo cargar la data del dashboard.</p>;
    }
    
    return (
        <div className="space-y-6">
            {/* Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {config.cards.filter(c => c.visible).map((card, index) => (
                    <Card
                        key={card.id}
                        title={card.title}
                        value={stats[card.dataKey] ?? 0}
                        icon={getIcon(card.icon)}
                        colorClass={cardColors[index % cardColors.length]}
                    />
                ))}
            </div>

            {/* Filters */}
            <div className="bg-surface p-4 rounded-lg shadow-lg border border-neutral-border">
                <h3 className="text-lg font-semibold mb-2 text-on-surface">Filtros Avanzados</h3>
                <div className="space-y-4">
                    {/* Top Row: Search and Dates */}
                    <div className="flex flex-col md:flex-row gap-4 items-end">
                        <div className="flex-grow">
                            <label className="block text-sm font-medium text-on-surface-variant mb-1">Búsqueda</label>
                            {type === 'employees' && <input type="text" placeholder="Buscar por Nombre/Cédula..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-background p-2 rounded-md border border-neutral-border"/>}
                            {type === 'loans' && <input type="text" placeholder="Buscar por Empleado/Ítem..." value={loanSearchTerm} onChange={(e) => setLoanSearchTerm(e.target.value)} className="w-full bg-background p-2 rounded-md border border-neutral-border"/>}
                            {(type === 'inventory_items' || type === 'inventory_accessories') && <input type="text" placeholder="Buscar por Nombre/Identificador..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-background p-2 rounded-md border border-neutral-border"/>}
                            {type === 'absences' && <input type="text" placeholder="Buscar por Nombre de Empleado..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-background p-2 rounded-md border border-neutral-border"/>}
                        </div>

                        {type === 'employees' && (
                            <div className="flex items-end gap-2 w-full md:w-auto">
                                <div>
                                    <label className="block text-sm font-medium text-on-surface-variant mb-1">Fecha Contrato Desde</label>
                                    <input type="date" value={contractDateFilter.start} onChange={e => setContractDateFilter(p => ({...p, start: e.target.value}))} className="bg-background p-2 rounded-md border border-neutral-border text-sm w-full"/>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-on-surface-variant mb-1">Hasta</label>
                                    <input type="date" value={contractDateFilter.end} onChange={e => setContractDateFilter(p => ({...p, end: e.target.value}))} className="bg-background p-2 rounded-md border border-neutral-border text-sm w-full"/>
                                </div>
                            </div>
                        )}
                         {type === 'loans' && (
                             <div className="flex items-end gap-2 w-full md:w-auto">
                                <div>
                                    <label className="block text-sm font-medium text-on-surface-variant mb-1">Fecha Préstamo Desde</label>
                                    <input type="date" value={loanDateFilter.start} onChange={e => setLoanDateFilter(p => ({...p, start: e.target.value}))} className="bg-background p-2 rounded-md border border-neutral-border text-sm w-full"/>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-on-surface-variant mb-1">Hasta</label>
                                    <input type="date" value={loanDateFilter.end} onChange={e => setLoanDateFilter(p => ({...p, end: e.target.value}))} className="bg-background p-2 rounded-md border border-neutral-border text-sm w-full"/>
                                </div>
                            </div>
                        )}
                        {(type === 'inventory_items' || type === 'inventory_accessories') && (
                             <div className="flex items-end gap-2 w-full md:w-auto">
                                <div>
                                    <label className="block text-sm font-medium text-on-surface-variant mb-1">Fecha Creación Desde</label>
                                    <input type="date" value={creationDateFilter.start} onChange={e => setCreationDateFilter(p => ({...p, start: e.target.value}))} className="bg-background p-2 rounded-md border border-neutral-border text-sm w-full"/>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-on-surface-variant mb-1">Hasta</label>
                                    <input type="date" value={creationDateFilter.end} onChange={e => setCreationDateFilter(p => ({...p, end: e.target.value}))} className="bg-background p-2 rounded-md border border-neutral-border text-sm w-full"/>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Bottom Row: Dropdown Filters */}
                    {config.filters.filter(f => f.visible).length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-neutral-border/50">
                            {config.filters.filter(f => f.visible).map((filter) => (
                                <div key={filter.id}>
                                    <label className="block text-sm font-medium text-on-surface-variant mb-1">{filter.label}</label>
                                    <select value={filters[filter.dataKey] || ''} onChange={(e) => handleFilterChange(filter.dataKey, e.target.value)} className="w-full bg-background p-2 rounded-md border border-neutral-border">
                                        <option value="">Todos</option>
                                        {getFilterOptions(filter.dataKey).map(opt => <option key={opt.id} value={opt.value}>{opt.value}</option>)}
                                    </select>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {config.charts.filter(c => c.visible).map(chart => {
                    const chartData = stats[chart.dataKey];
                    if (!chartData || chartData.length === 0) return null;
                    return (
                        <div key={chart.id} className="bg-surface p-6 rounded-lg shadow-lg border border-neutral-border">
                             <h2 className="text-xl font-semibold mb-4 text-on-surface">{chart.title}</h2>
                            {chart.type === 'pie' ? (
                                <PieChartComponent data={chartData} />
                            ) : (
                                <BarChartComponent data={chartData} dataKey="value" fill="rgb(var(--color-primary))" />
                            )}
                        </div>
                    );
                })}
            </div>
            
            {/* Summary Table */}
            {type === 'employees' && <EmployeeSummaryTable filteredEmployees={filteredEmployees} />}
            {type === 'loans' && <LoansSummaryTable filteredLoans={filteredLoans} allLoans={allLoans} />}
            {type === 'inventory_items' && <InventorySummaryTable filteredItems={filteredInventory} />}
            {type === 'inventory_accessories' && <AccessorySummaryTable filteredAccessories={filteredAccessories} />}
            {type === 'absences' && <AbsencesSummaryTable filteredRequests={filteredAbsences} />}

        </div>
    );
};
