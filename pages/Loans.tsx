import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { api } from '../services/api';
import { Loan, InventoryCategory, Employee, InventoryItem, Accessory, Company } from '../types';
import Spinner from '../components/ui/Spinner';
import LoanModal from '../components/loans/LoanModal';
import ConfirmationModal from '../components/ui/ConfirmationModal';
import { useAuth } from '../contexts/AuthContext';
import { useFormatting } from '../hooks/useFormatting';

type SortableKeys = 'employee' | 'item' | 'deliveryDate' | 'returnDate' | 'status';

const Loans: React.FC = () => {
    const [categories, setCategories] = useState<InventoryCategory[]>([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
    const [allLoans, setAllLoans] = useState<Loan[]>([]);
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [accessories, setAccessories] = useState<Accessory[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);
    const { hasPermission } = useAuth();
    const { formatDate } = useFormatting();
    
    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingLoan, setEditingLoan] = useState<Loan | null>(null);
    const [loanToReturn, setLoanToReturn] = useState<Loan | null>(null);
    const [loanToDelete, setLoanToDelete] = useState<Loan | null>(null);

    // Filtering & Sorting
    const [searchTerm, setSearchTerm] = useState('');
    const [companyFilter, setCompanyFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'Activo' | 'Devuelto' | 'Vencido'>('all');
    const [dateFilter, setDateFilter] = useState({ start: '', end: '' });
    const [sortConfig, setSortConfig] = useState<{ key: SortableKeys | null; direction: 'ascending' | 'descending' }>({ key: 'returnDate', direction: 'ascending' });

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [catData, empData, accData, compData] = await Promise.all([
                api.getInventoryCategories(),
                api.getEmployees(),
                api.getAllAccessories(),
                api.getCompanies(),
            ]);
            setCategories(catData);
            setEmployees(empData);
            setAccessories(accData);
            setCompanies(compData);
            if (catData.length > 0 && !selectedCategoryId) {
                setSelectedCategoryId(catData[0].id);
            } else if (catData.length === 0) {
                setSelectedCategoryId('');
            }
        } catch (error) {
            console.error("Failed to fetch initial loan data", error);
        } finally {
            setLoading(false);
        }
    }, [selectedCategoryId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);
    
    const fetchCategoryData = useCallback(async () => {
        if (!selectedCategoryId) {
            setAllLoans([]);
            setInventory([]);
            return;
        };
        setLoading(true);
        try {
            const [loansData, inventoryData] = await Promise.all([
                api.getLoans(selectedCategoryId),
                api.getInventoryItemsWithStock(),
            ]);
            setAllLoans(loansData);
            setInventory(inventoryData.filter(i => i.categoryId === selectedCategoryId));
        } catch (error) {
            console.error(`Failed to fetch data for category ${selectedCategoryId}`, error);
        } finally {
            setLoading(false);
        }
    }, [selectedCategoryId]);

    useEffect(() => {
        fetchCategoryData();
    }, [fetchCategoryData]);

    const handleSaveLoan = async (loanData: Omit<Loan, 'id'> | Loan) => {
        try {
            await ('id' in loanData ? api.updateLoan(loanData) : api.addLoan(loanData));
            fetchCategoryData();
        } catch (error) {
            console.error("Failed to save loan", error);
        } finally {
            setIsModalOpen(false);
            setEditingLoan(null);
        }
    };

    const handleConfirmReturn = async () => {
        if (loanToReturn) {
            await api.returnLoan(loanToReturn.id);
            setLoanToReturn(null);
            fetchCategoryData();
        }
    };
    
    const handleConfirmDelete = async () => {
        if (loanToDelete) {
            await api.deleteLoan(loanToDelete.id);
            setLoanToDelete(null);
            fetchCategoryData();
        }
    };

    const dataMap = useMemo(() => ({
        employeeMap: new Map(employees.map(e => [e.id, { name: `${e.firstName} ${e.lastName}`, company: e.company }])),
        inventoryMap: new Map(inventory.map(i => [i.id, i.name])),
        accessoryMap: new Map(accessories.map(a => [a.id, a.name])),
    }), [employees, inventory, accessories]);
    
    const processedLoans = useMemo(() => {
        const now = new Date();
        now.setHours(0,0,0,0);

        return allLoans
            .map(loan => {
                const employeeInfo = dataMap.employeeMap.get(loan.employeeId);
                const isOverdue = loan.status === 'Activo' && loan.returnDate && new Date(loan.returnDate) < now;
                return {
                    ...loan,
                    employeeName: employeeInfo?.name || 'N/A',
                    company: employeeInfo?.company || 'N/A',
                    itemName: dataMap.inventoryMap.get(loan.inventoryItemId) || 'N/A',
                    effectiveStatus: isOverdue ? 'Vencido' : loan.status,
                };
            })
            .filter(loan => {
                const searchMatch = searchTerm === '' || 
                    loan.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                    loan.itemName.toLowerCase().includes(searchTerm.toLowerCase());
                
                const companyMatch = !companyFilter || loan.company === companyFilter;
                
                const statusMatch = statusFilter === 'all' || loan.effectiveStatus === statusFilter;

                const deliveryDate = new Date(loan.deliveryDate);
                const startDateMatch = dateFilter.start === '' || deliveryDate >= new Date(dateFilter.start);
                const endDateMatch = dateFilter.end === '' || deliveryDate <= new Date(dateFilter.end);

                return searchMatch && statusMatch && companyMatch && startDateMatch && endDateMatch;
            })
            .sort((a, b) => {
                if (!sortConfig.key) return 0;
                const key = sortConfig.key === 'employee' ? 'employeeName' : sortConfig.key === 'item' ? 'itemName' : sortConfig.key;
                
                 if (sortConfig.key === 'returnDate') {
                    const aDate = a.returnDate ? new Date(a.returnDate).getTime() : 0;
                    const bDate = b.returnDate ? new Date(b.returnDate).getTime() : 0;
                    if (aDate < bDate) return sortConfig.direction === 'ascending' ? -1 : 1;
                    if (aDate > bDate) return sortConfig.direction === 'ascending' ? 1 : -1;
                    return 0;
                }
                
                const aVal = a[key as keyof typeof a];
                const bVal = b[key as keyof typeof b];

                if (aVal < bVal) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (aVal > bVal) return sortConfig.direction === 'ascending' ? 1 : -1;
                return 0;
            });
    }, [allLoans, dataMap, searchTerm, statusFilter, dateFilter, sortConfig, companyFilter]);

    const selectedCategoryName = categories.find(c => c.id === selectedCategoryId)?.name || '';

    const SortableHeader: React.FC<{ children: React.ReactNode; sortKey: SortableKeys; }> = ({ children, sortKey }) => {
        const isSorted = sortConfig.key === sortKey;
        const requestSort = (key: SortableKeys) => {
            let direction: 'ascending' | 'descending' = 'ascending';
            if (sortConfig.key === key && sortConfig.direction === 'ascending') direction = 'descending';
            setSortConfig({ key, direction });
        };
        return <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => requestSort(sortKey)}>{children} {isSorted ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : '↕'}</th>;
    };
    
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-primary">Página Operativa de Préstamos</h1>
                {hasPermission('loans:create') && selectedCategoryId && (
                    <button onClick={() => { setEditingLoan(null); setIsModalOpen(true); }} className="bg-primary text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-primary-dark-hover transition-colors">
                        + Registrar Préstamo
                    </button>
                )}
            </div>

            <div className="bg-surface p-4 rounded-lg border border-neutral-border space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="search-loans" className="block text-sm font-medium text-on-surface-variant mb-1">Buscar por Empleado o Ítem</label>
                        <input id="search-loans" type="text" placeholder="Juan Perez, Laptop Dell..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-background border border-neutral-border rounded-md p-2" />
                    </div>
                     <div>
                        <label htmlFor="company-filter" className="block text-sm font-medium text-on-surface-variant mb-1">Empresa</label>
                        <select id="company-filter" value={companyFilter} onChange={e => setCompanyFilter(e.target.value)} className="w-full bg-background border border-neutral-border rounded-md p-2">
                             <option value="">Todas las Empresas</option>
                             {companies.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                        </select>
                    </div>
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex-shrink-0 w-full">
                        <label className="block text-sm font-medium text-on-surface-variant mb-1">Fecha de Entrega</label>
                        <div className="flex items-center gap-2">
                            <input type="date" value={dateFilter.start} onChange={e => setDateFilter(p => ({ ...p, start: e.target.value }))} className="bg-background border border-neutral-border rounded-md p-2 w-full text-sm"/>
                            <span className="text-on-surface-variant">-</span>
                            <input type="date" value={dateFilter.end} onChange={e => setDateFilter(p => ({ ...p, end: e.target.value }))} className="bg-background border border-neutral-border rounded-md p-2 w-full text-sm"/>
                        </div>
                    </div>
                    <div className="flex-shrink-0 w-full">
                        <label htmlFor="category-select" className="block text-sm font-medium text-on-surface-variant mb-1">Categoría</label>
                        <select id="category-select" value={selectedCategoryId} onChange={(e) => setSelectedCategoryId(e.target.value)} className="w-full bg-background border border-neutral-border rounded-md p-2 text-on-surface h-10" disabled={categories.length === 0}>
                            {categories.length > 0 ? (categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)) : (<option>No hay categorías</option>)}
                        </select>
                    </div>
                    
                    <div className="flex-shrink-0 w-full">
                        <label htmlFor="status-select" className="block text-sm font-medium text-on-surface-variant mb-1">Estado</label>
                        <select id="status-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)} className="w-full bg-background border border-neutral-border rounded-md p-2 h-10">
                            <option value="all">Todos los Estados</option><option value="Activo">Activo</option><option value="Vencido">Vencido</option><option value="Devuelto">Devuelto</option>
                        </select>
                    </div>
                </div>
            </div>
            
            <div className="bg-surface rounded-lg shadow-lg border border-neutral-border overflow-hidden">
                <h2 className="text-xl font-bold text-on-surface p-4 border-b border-neutral-border">Historial de Préstamos: {selectedCategoryName} ({processedLoans.length})</h2>
                <div className="overflow-x-auto">
                    {loading ? <div className="h-96"><Spinner/></div> : (
                        <table className="w-full text-sm text-left text-on-surface-variant">
                            <thead className="text-xs text-white uppercase bg-primary">
                                <tr>
                                    <SortableHeader sortKey="employee">Empleado</SortableHeader>
                                    <SortableHeader sortKey="item">Ítem Prestado</SortableHeader>
                                    <th scope="col" className="px-6 py-3">Accesorios</th>
                                    <SortableHeader sortKey="deliveryDate">Fecha Entrega</SortableHeader>
                                    <SortableHeader sortKey="returnDate">Fecha Devolución</SortableHeader>
                                    <th scope="col" className="px-6 py-3">Días Asignados</th>
                                    <SortableHeader sortKey="status">Estado</SortableHeader>
                                    {(hasPermission('loans:update') || hasPermission('loans:delete')) && <th scope="col" className="px-6 py-3 text-center">Acciones</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {processedLoans.length > 0 ? processedLoans.map((loan) => {
                                    const assignedAccessoriesText = loan.assignedAccessories
                                        .map(acc => `${dataMap.accessoryMap.get(acc.id) || 'N/A'}${acc.isPermanent ? ' (P)' : ''}`)
                                        .join(', ');

                                    const daysAssigned = loan.returnDate ? Math.ceil((new Date(loan.returnDate).getTime() - new Date(loan.deliveryDate).getTime()) / (1000 * 3600 * 24)) : 'N/A';
                                    const statusColors = { 'Activo': 'bg-success/20 text-success', 'Devuelto': 'bg-on-surface-variant/20 text-on-surface-variant', 'Vencido': 'bg-alert/20 text-alert' };

                                    return (
                                        <tr key={loan.id} className="bg-surface border-b border-neutral-border hover:bg-primary-light-hover">
                                            <td className="px-6 py-4 font-medium text-on-surface whitespace-nowrap">{loan.employeeName}</td>
                                            <td className="px-6 py-4">{loan.itemName} {loan.isItemPermanent && <span className="text-xs text-alert">(P)</span>}</td>
                                            <td className="px-6 py-4 text-xs">{assignedAccessoriesText || 'Ninguno'}</td>
                                            <td className="px-6 py-4">{formatDate(loan.deliveryDate)}</td>
                                            <td className="px-6 py-4">{loan.returnDate ? formatDate(loan.returnDate) : 'Permanente'}</td>
                                            <td className="px-6 py-4 text-center">{daysAssigned}</td>
                                            <td className="px-6 py-4"><span className={`px-2 py-1 font-medium text-xs rounded-full ${statusColors[loan.effectiveStatus]}`}>{loan.effectiveStatus}</span></td>
                                            {(hasPermission('loans:update') || hasPermission('loans:delete')) && (
                                                <td className="px-6 py-4 text-center space-x-2">
                                                    {loan.status === 'Activo' && hasPermission('loans:update') && <>
                                                        <button onClick={() => { setEditingLoan(loan); setIsModalOpen(true); }} className="p-1.5 text-alert hover:bg-on-surface-variant/10 rounded-md" title="Editar"><PencilIcon /></button>
                                                        <button disabled={loan.isItemPermanent && loan.assignedAccessories.every(a => a.isPermanent)} onClick={() => setLoanToReturn(loan)} className="p-1.5 text-success hover:bg-on-surface-variant/10 rounded-md disabled:opacity-50 disabled:cursor-not-allowed" title="Marcar como Devuelto"><CheckIcon /></button>
                                                    </>}
                                                    {hasPermission('loans:delete') && <button onClick={() => setLoanToDelete(loan)} className="p-1.5 text-error hover:bg-on-surface-variant/10 rounded-md" title="Eliminar Registro"><TrashIcon /></button>}
                                                </td>
                                            )}
                                        </tr>
                                    );
                                }) : (
                                    <tr><td colSpan={hasPermission('loans:update') ? 8 : 7} className="text-center py-8">No se encontraron préstamos con los filtros aplicados.</td></tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
            {isModalOpen && <LoanModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveLoan} loan={editingLoan} categoryId={selectedCategoryId} allEmployees={employees} allInventory={inventory} companies={companies}/>}
            {loanToReturn && <ConfirmationModal isOpen={!!loanToReturn} onClose={() => setLoanToReturn(null)} onConfirm={handleConfirmReturn} title="Confirmar Devolución" message={`¿Confirmas que el ítem "${dataMap.inventoryMap.get(loanToReturn.inventoryItemId)}" y sus accesorios temporales han sido devueltos? Esta acción aumentará el stock disponible.`}/>}
            {loanToDelete && <ConfirmationModal isOpen={!!loanToDelete} onClose={() => setLoanToDelete(null)} onConfirm={handleConfirmDelete} title="Confirmar Eliminación" message={`¿Eliminar permanentemente el registro de este préstamo? Esta acción no se puede deshacer.`}/>}
        </div>
    );
};

// Icons
const PencilIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" /></svg>;
const CheckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;

export default Loans;