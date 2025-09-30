import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { Employee, SalaryConfig, ConversionRate, ContractType } from '../../types';
import Spinner from '../ui/Spinner';
import CurrencySettings from './CurrencySettings';
import { useAuth } from '../../contexts/AuthContext';
import { useFormatting } from '../../hooks/useFormatting';

type SubTab = 'grid' | 'conversion';
type SortableKeys = 'firstName' | 'idNumber' | 'contractStartDate' | 'contractEndDate' | 'currentSalary' | 'contractTypeId';

const SalaryManager: React.FC = () => {
    const [activeTab, setActiveTab] = useState<SubTab>('grid');
    const { hasPermission } = useAuth();

    const TABS: { id: SubTab, label: string }[] = [
        { id: 'grid', label: 'Contrato Salarial' },
        { id: 'conversion', label: 'Conversión de Moneda' },
    ];
    
    if (!hasPermission('employees:read:salary')) {
        return <p className="text-on-surface-variant">No tiene permiso para ver la información salarial.</p>
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-slate-600 pb-2">
                <nav className="-mb-px flex space-x-6" aria-label="Sub-Tabs">
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`${
                                activeTab === tab.id
                                    ? 'border-secondary text-secondary'
                                    : 'border-transparent text-on-surface-variant hover:text-on-surface hover:border-slate-500'
                            } whitespace-nowrap pb-2 px-1 border-b-2 font-medium text-sm transition-colors focus:outline-none`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>
            <div className="pt-4">
                {activeTab === 'grid' ? <SalaryGrid /> : <CurrencySettings />}
            </div>
        </div>
    );
};


const SalaryGrid: React.FC = () => {
    const navigate = useNavigate();
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [config, setConfig] = useState<SalaryConfig | null>(null);
    const [rates, setRates] = useState<ConversionRate[]>([]);
    const [contractTypes, setContractTypes] = useState<ContractType[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFilter, setDateFilter] = useState({ start: '', end: '' });
    const [salaryFilter, setSalaryFilter] = useState({ min: '', max: '' });
    const [sortConfig, setSortConfig] = useState<{ key: SortableKeys | null; direction: 'ascending' | 'descending' }>({ key: 'firstName', direction: 'ascending' });
    const { hasPermission } = useAuth();
    const { formatDate, formatCurrency } = useFormatting();
    
    const [editingData, setEditingData] = useState<Record<string, Partial<Employee>>>({});
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const contractTypeMap = useMemo(() => new Map(contractTypes.map(ct => [ct.id, ct.name])), [contractTypes]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [empData, configData, ratesData, contractData] = await Promise.all([
                api.getEmployees(),
                api.getSalaryConfig(),
                api.getConversionRates(),
                api.getContractTypes(),
            ]);
            setEmployees(empData);
            setConfig(configData);
            setRates(ratesData);
            setContractTypes(contractData);
        } catch (error) {
            console.error("Failed to fetch salary data", error);
        } finally {
            setLoading(false);
        }
    }, []);
    
    useEffect(() => {
        setCurrentPage(1);
    }, [itemsPerPage]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);
    
    const conversionRate = useMemo(() => {
        if (!config || rates.length === 0) return 1;
        const rate = rates.find(r => r.from === config.primaryCurrency && r.to === config.secondaryCurrency);
        return rate?.rate || 1;
    }, [config, rates]);

    const requestSort = (key: SortableKeys) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') direction = 'descending';
        setSortConfig({ key, direction });
        setCurrentPage(1);
    };

    const sortedEmployees = useMemo(() => {
        let sortableItems = employees
            .map(e => ({
                ...e,
                contractTypeName: e.contractTypeId ? contractTypeMap.get(e.contractTypeId) || 'N/A' : 'N/A'
            }))
            .filter(e => {
                const searchMatch = `${e.firstName} ${e.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) || e.idNumber.includes(searchTerm);
                
                const startDate = dateFilter.start ? new Date(dateFilter.start).getTime() : -Infinity;
                const endDate = dateFilter.end ? new Date(dateFilter.end).getTime() + 86400000 : Infinity;
                const contractDate = new Date(e.contractStartDate).getTime();
                const dateMatch = contractDate >= startDate && contractDate <= endDate;
                
                const minSalary = salaryFilter.min ? parseFloat(salaryFilter.min) : -Infinity;
                const maxSalary = salaryFilter.max ? parseFloat(salaryFilter.max) : Infinity;
                const salaryMatch = e.currentSalary >= minSalary && e.currentSalary <= maxSalary;

                return searchMatch && dateMatch && salaryMatch;
            });

        if (sortConfig.key) {
            sortableItems.sort((a, b) => {
                let aVal: any = a[sortConfig.key!];
                let bVal: any = b[sortConfig.key!];

                if (sortConfig.key === 'contractTypeId') {
                    aVal = a.contractTypeName;
                    bVal = b.contractTypeName;
                }
                
                if (aVal < bVal) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (aVal > bVal) return sortConfig.direction === 'ascending' ? 1 : -1;
                return 0;
            });
        }
        return sortableItems;
    }, [employees, searchTerm, sortConfig, dateFilter, salaryFilter, contractTypeMap]);
    
    const totalPages = Math.ceil(sortedEmployees.length / itemsPerPage);
    const paginatedEmployees = sortedEmployees.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);


    const handleInputChange = (employeeId: string, field: keyof Employee, value: string | number) => {
        setEditingData(prev => ({
            ...prev,
            [employeeId]: {
                ...prev[employeeId],
                [field]: value,
            },
        }));
    };
    
    const handleSave = async (employeeId: string) => {
        const originalEmployee = employees.find(e => e.id === employeeId);
        const edits = editingData[employeeId];

        if (!originalEmployee || !edits) return;

        const updatedEmployee = { ...originalEmployee, ...edits } as Employee;
        
        try {
            await api.updateEmployee(updatedEmployee);
            setEmployees(prev => prev.map(e => e.id === employeeId ? updatedEmployee : e));
            setEditingData(prev => {
                const newState = { ...prev };
                delete newState[employeeId];
                return newState;
            });
        } catch (error) {
            console.error("Failed to save employee data", error);
        }
    };
    
    const SortableHeader: React.FC<{ children: React.ReactNode; sortKey: SortableKeys; }> = ({ children, sortKey }) => {
        const isSorted = sortConfig.key === sortKey;
        return (
            <th scope="col" className="px-3 py-3 cursor-pointer hover:bg-slate-600/50 transition-colors" onClick={() => requestSort(sortKey)}>
                <div className="flex items-center">
                    {children}
                    {isSorted ? (sortConfig.direction === 'ascending' ? ' ▲' : ' ▼') : ' ↕'}
                </div>
            </th>
        );
    };


    if (loading) return <div className="h-64"><Spinner /></div>;
    if (!config) return <p className="text-center text-on-surface-variant">No se ha podido cargar la configuración de salarios.</p>


    return (
        <div className="space-y-4">
            <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg space-y-4">
                <input
                    type="text"
                    placeholder="Buscar por nombre o cédula..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-on-surface"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                        <label className="text-sm whitespace-nowrap">Contrato Desde:</label>
                        <input type="date" value={dateFilter.start} onChange={e => setDateFilter(p => ({...p, start: e.target.value}))} className="w-full bg-slate-700 p-2 rounded-md text-sm" />
                        <label className="text-sm">Hasta:</label>
                        <input type="date" value={dateFilter.end} onChange={e => setDateFilter(p => ({...p, end: e.target.value}))} className="w-full bg-slate-700 p-2 rounded-md text-sm" />
                    </div>
                     <div className="flex items-center gap-2">
                        <label className="text-sm whitespace-nowrap">Salario Desde:</label>
                        <input type="number" placeholder="Mínimo" value={salaryFilter.min} onChange={e => setSalaryFilter(p => ({...p, min: e.target.value}))} className="w-full bg-slate-700 p-2 rounded-md text-sm" />
                        <label className="text-sm">Hasta:</label>
                        <input type="number" placeholder="Máximo" value={salaryFilter.max} onChange={e => setSalaryFilter(p => ({...p, max: e.target.value}))} className="w-full bg-slate-700 p-2 rounded-md text-sm" />
                    </div>
                </div>
            </div>
            <div className="bg-slate-800/50 rounded-lg border border-slate-700 overflow-hidden">
                <div className="overflow-auto max-h-[600px]">
                <table className="w-full text-sm text-left text-on-surface-variant relative border-collapse">
                    <thead className="text-xs text-on-surface uppercase bg-slate-700/50 whitespace-nowrap sticky top-0 z-20">
                        <tr>
                            <SortableHeader sortKey="firstName">Empleado</SortableHeader>
                            <SortableHeader sortKey="idNumber">Cédula</SortableHeader>
                            <SortableHeader sortKey="contractTypeId">Tipo de Contrato</SortableHeader>
                            <SortableHeader sortKey="contractStartDate">Fecha Ingreso</SortableHeader>
                            <SortableHeader sortKey="contractEndDate">Fecha Fin Contrato</SortableHeader>
                            <th scope="col" className="px-3 py-3">Sal. Mínimo ({config.primaryCurrency})</th>
                            <SortableHeader sortKey="currentSalary">Sal. Actual ({config.primaryCurrency})</SortableHeader>
                            <th scope="col" className="px-3 py-3">Sal. Máximo ({config.primaryCurrency})</th>
                            <th scope="col" className="px-3 py-3">Sal. Mín. ({config.secondaryCurrency})</th>
                            <th scope="col" className="px-3 py-3">Sal. Act. ({config.secondaryCurrency})</th>
                            <th scope="col" className="px-3 py-3">Sal. Máx. ({config.secondaryCurrency})</th>
                             {hasPermission('employees:update') && <th scope="col" className="px-3 py-3 text-center sticky right-0 bg-slate-700/50 z-30">Acción</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                        {paginatedEmployees.map(emp => {
                             const editingRowData = editingData[emp.id];
                             const isEditing = !!editingRowData;

                             const displayData = {
                                contractTypeId: editingRowData?.contractTypeId ?? emp.contractTypeId,
                                contractStartDate: editingRowData?.contractStartDate ?? emp.contractStartDate,
                                contractEndDate: editingRowData?.contractEndDate ?? emp.contractEndDate,
                                minSalary: editingRowData?.minSalary ?? emp.minSalary,
                                currentSalary: editingRowData?.currentSalary ?? emp.currentSalary,
                                maxSalary: editingRowData?.maxSalary ?? emp.maxSalary,
                             };

                            return (
                                <tr key={emp.id} 
                                    className={`bg-surface hover:bg-slate-800 cursor-pointer ${isEditing ? 'bg-primary/10' : ''}`}
                                    onClick={() => navigate(`/employee/${emp.id}`)}
                                >
                                    <td className="px-3 py-2 font-medium text-on-surface whitespace-nowrap">{emp.firstName} {emp.lastName}</td>
                                    <td className="px-3 py-2 whitespace-nowrap">{emp.idNumber}</td>
                                    <td className="px-3 py-2 whitespace-nowrap">{hasPermission('employees:update') ? (
                                        <select value={displayData.contractTypeId} onChange={e => handleInputChange(emp.id, 'contractTypeId', e.target.value)} onClick={e => e.stopPropagation()} className="w-full bg-slate-700 p-1 rounded-md border border-slate-600 text-xs">
                                            <option value="">No especificado</option>
                                            {contractTypes.map(ct => <option key={ct.id} value={ct.id}>{ct.name}</option>)}
                                        </select>
                                    ) : emp.contractTypeName}</td>
                                    <td className="px-3 py-2 whitespace-nowrap">{hasPermission('employees:update') ? (
                                        <input type="date" value={displayData.contractStartDate} onChange={e => handleInputChange(emp.id, 'contractStartDate', e.target.value)} onClick={e => e.stopPropagation()} className="w-full bg-slate-700 p-1 rounded-md border border-slate-600 text-xs"/>
                                    ) : formatDate(emp.contractStartDate)}</td>
                                    <td className="px-3 py-2 whitespace-nowrap">{hasPermission('employees:update') ? (
                                         <input type="date" value={displayData.contractEndDate} onChange={e => handleInputChange(emp.id, 'contractEndDate', e.target.value)} onClick={e => e.stopPropagation()} className="w-full bg-slate-700 p-1 rounded-md border border-slate-600 text-xs"/>
                                    ) : formatDate(emp.contractEndDate)}</td>
                                    
                                    <td className="px-3 py-2">{hasPermission('employees:update') ? <input type="number" step="0.01" value={displayData.minSalary} onChange={e => handleInputChange(emp.id, 'minSalary', parseFloat(e.target.value) || 0)} onClick={e => e.stopPropagation()} className="w-24 bg-slate-700 p-1 rounded-md border border-slate-600"/> : formatCurrency(displayData.minSalary, config.primaryCurrency)}</td>
                                    <td className="px-3 py-2">{hasPermission('employees:update') ? <input type="number" step="0.01" value={displayData.currentSalary} onChange={e => handleInputChange(emp.id, 'currentSalary', parseFloat(e.target.value) || 0)} onClick={e => e.stopPropagation()} className="w-24 bg-slate-700 p-1 rounded-md border border-slate-600 font-bold"/> : <span className="font-bold">{formatCurrency(displayData.currentSalary, config.primaryCurrency)}</span>}</td>
                                    <td className="px-3 py-2">{hasPermission('employees:update') ? <input type="number" step="0.01" value={displayData.maxSalary} onChange={e => handleInputChange(emp.id, 'maxSalary', parseFloat(e.target.value) || 0)} onClick={e => e.stopPropagation()} className="w-24 bg-slate-700 p-1 rounded-md border border-slate-600"/> : formatCurrency(displayData.maxSalary, config.primaryCurrency)}</td>
                                    
                                    <td className="px-3 py-2 text-secondary/80 whitespace-nowrap">{formatCurrency(displayData.minSalary * conversionRate, config.secondaryCurrency)}</td>
                                    <td className="px-3 py-2 font-semibold text-secondary whitespace-nowrap">{formatCurrency(displayData.currentSalary * conversionRate, config.secondaryCurrency)}</td>
                                    <td className="px-3 py-2 text-secondary/80 whitespace-nowrap">{formatCurrency(displayData.maxSalary * conversionRate, config.secondaryCurrency)}</td>
                                    
                                    {hasPermission('employees:update') && <td className="px-3 py-2 text-center sticky right-0 bg-surface z-10">{isEditing && <button onClick={(e) => { e.stopPropagation(); handleSave(emp.id); }} className="bg-secondary text-white font-semibold py-1 px-3 rounded-lg shadow-md hover:bg-secondary/80 transition-colors text-xs">Guardar</button>}</td>}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                </div>
                 {totalPages > 1 && (
                    <div className="flex justify-between items-center p-4">
                        <div className="flex items-center gap-2">
                            <label htmlFor="rows-per-page" className="text-sm">Filas por página:</label>
                            <select id="rows-per-page" value={itemsPerPage} onChange={e => setItemsPerPage(Number(e.target.value))} className="bg-slate-700 p-1 rounded-md text-sm">
                                <option value={10}>10</option>
                                <option value={25}>25</option>
                                <option value={50}>50</option>
                            </select>
                        </div>
                        <div className="flex items-center gap-4">
                            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="py-2 px-4 rounded-lg bg-slate-600 hover:bg-slate-500 disabled:opacity-50 text-sm">Anterior</button>
                            <span>Página {currentPage} de {totalPages}</span>
                            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="py-2 px-4 rounded-lg bg-slate-600 hover:bg-slate-500 disabled:opacity-50 text-sm">Siguiente</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SalaryManager;