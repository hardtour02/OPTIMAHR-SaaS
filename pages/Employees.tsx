
import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Employee, FormFieldOption, Company, ContractType } from '../types';
import Spinner from '../components/ui/Spinner';
import ConfirmationModal from '../components/ui/ConfirmationModal';
import { useFormatting } from '../hooks/useFormatting';
import { useAuth } from '../contexts/AuthContext';

const Employees: React.FC = () => {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [companyFilter, setCompanyFilter] = useState('');
    const [hierarchyFilter, setHierarchyFilter] = useState('');
    const [companies, setCompanies] = useState<Company[]>([]);
    const [fieldOptions, setFieldOptions] = useState<FormFieldOption[]>([]);
    const [contractTypes, setContractTypes] = useState<ContractType[]>([]);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);
    const navigate = useNavigate();
    const { formatDate } = useFormatting();
    const { hasPermission } = useAuth();

    const [currentPage, setCurrentPage] = useState(1);
    type SortableKeys = 'firstName' | 'idNumber' | 'company' | 'status' | 'hierarchy' | 'zonaDeTrabajo' | 'contractTypeId' | 'contractStartDate' | 'contractEndDate';
    const [sortConfig, setSortConfig] = useState<{ key: SortableKeys | null; direction: 'ascending' | 'descending' }>({ key: 'firstName', direction: 'ascending' });
    const [itemsPerPage, setItemsPerPage] = useState(10);
    
    const contractTypeMap = useMemo(() => new Map(contractTypes.map(ct => [ct.id, ct.name])), [contractTypes]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [empData, optData, compData, contractData] = await Promise.all([
                api.getEmployees(),
                api.getFormFieldOptions(),
                api.getCompanies(),
                api.getContractTypes()
            ]);
            setEmployees(empData);
            setFieldOptions(optData);
            setCompanies(compData);
            setContractTypes(contractData);
        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [itemsPerPage]);

    const requestSort = (key: SortableKeys) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
        setCurrentPage(1);
    };
    
    const handleEditClick = (e: React.MouseEvent, employee: Employee) => {
        e.stopPropagation();
        navigate(`/employee/${employee.id}/edit`);
    };

    const handleDeleteClick = (e: React.MouseEvent, employee: Employee) => {
        e.stopPropagation();
        setEmployeeToDelete(employee);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (employeeToDelete) {
            try {
                await api.deleteEmployee(employeeToDelete.id);
                fetchData();
            } catch (error) {
                console.error("Failed to delete employee", error);
            } finally {
                setIsDeleteModalOpen(false);
                setEmployeeToDelete(null);
            }
        }
    };

    const processedEmployees = useMemo(() => {
        let sortableItems = [...employees]
            .map(e => ({
                ...e,
                contractTypeName: e.contractTypeId ? contractTypeMap.get(e.contractTypeId) || 'N/A' : 'N/A'
            }))
            .filter(e =>
                `${e.firstName} ${e.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                e.idNumber.includes(searchTerm)
            )
            .filter(e => companyFilter ? e.company === companyFilter : true)
            .filter(e => hierarchyFilter ? e.hierarchy === hierarchyFilter : true);

        if (sortConfig.key !== null) {
            sortableItems.sort((a, b) => {
                let aValue: string | number, bValue: string | number;

                if (sortConfig.key === 'firstName') {
                    aValue = `${a.firstName} ${a.lastName}`.toLowerCase();
                    bValue = `${b.firstName} ${b.lastName}`.toLowerCase();
                } else if (sortConfig.key === 'contractTypeId') {
                    aValue = a.contractTypeName.toLowerCase();
                    bValue = b.contractTypeName.toLowerCase();
                }
                else {
                    aValue = a[sortConfig.key];
                    bValue = b[sortConfig.key];
                }
                
                if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
                return 0;
            });
        }
        return sortableItems;
    }, [employees, searchTerm, companyFilter, hierarchyFilter, sortConfig, contractTypeMap]);

    const totalPages = Math.ceil(processedEmployees.length / itemsPerPage);
    const paginatedEmployees = processedEmployees.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );
    
    const hierarchies = useMemo(() => [...new Set(employees.map(e => e.hierarchy).filter(Boolean))].sort(), [employees]);

    const SortableHeader: React.FC<{ children: React.ReactNode; sortKey: SortableKeys; }> = ({ children, sortKey }) => {
        const isSorted = sortConfig.key === sortKey;
        return (
            <th scope="col" className="px-6 py-3 cursor-pointer hover:bg-white/10 transition-colors whitespace-nowrap" onClick={() => requestSort(sortKey)}>
                <div className="flex items-center">
                    {children}
                    {isSorted ? (sortConfig.direction === 'ascending' ? ' ▲' : ' ▼') : ' ↕'}
                </div>
            </th>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-primary">Gestión de Empleados</h1>
                {hasPermission('employees:create') && (
                    <button
                        onClick={() => navigate('/employees/new')}
                        className="bg-primary text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-primary-dark-hover transition-colors"
                    >
                        Agregar Empleado
                    </button>
                )}
            </div>

            <div className="bg-surface p-4 rounded-lg border border-neutral-border flex flex-col md:flex-row gap-4">
                <input
                    type="text"
                    placeholder="Buscar por nombre, apellido, cédula..."
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                    className="flex-grow bg-background border border-neutral-border rounded-md p-2 text-on-surface focus:ring-primary focus:border-primary"
                />
                 <select 
                    value={companyFilter}
                    onChange={(e) => { setCompanyFilter(e.target.value); setCurrentPage(1); }}
                    className="bg-background border border-neutral-border rounded-md p-2 text-on-surface focus:ring-primary focus:border-primary">
                    <option value="">Todas las Empresas</option>
                    {companies.map(comp => <option key={comp.id} value={comp.name}>{comp.name}</option>)}
                </select>
                <select 
                    value={hierarchyFilter}
                    onChange={(e) => { setHierarchyFilter(e.target.value); setCurrentPage(1); }}
                    className="bg-background border border-neutral-border rounded-md p-2 text-on-surface focus:ring-primary focus:border-primary">
                    <option value="">Todas las Jerarquías</option>
                    {hierarchies.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
            </div>

            <div className="bg-surface rounded-lg shadow-lg border border-neutral-border overflow-hidden">
                <div className="overflow-x-auto">
                    {loading ? <div className="h-96"><Spinner/></div> : (
                        <table className="w-full text-sm text-left text-on-surface-variant">
                            <thead className="text-xs text-white uppercase bg-primary">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Perfil</th>
                                    <SortableHeader sortKey="firstName">Nombre Completo</SortableHeader>
                                    <SortableHeader sortKey="idNumber">Cédula</SortableHeader>
                                    <SortableHeader sortKey="hierarchy">Jerarquía</SortableHeader>
                                    <SortableHeader sortKey="zonaDeTrabajo">Zona de Trabajo</SortableHeader>
                                    <SortableHeader sortKey="contractTypeId">Tipo Contrato</SortableHeader>
                                    <SortableHeader sortKey="contractStartDate">Inicio Contrato</SortableHeader>
                                    <SortableHeader sortKey="contractEndDate">Fin Contrato</SortableHeader>
                                    <SortableHeader sortKey="status">Estatus</SortableHeader>
                                    {(hasPermission('employees:update') || hasPermission('employees:delete')) && 
                                        <th scope="col" className="sticky right-0 bg-primary px-6 py-3 text-center z-10">Acciones</th>
                                    }
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedEmployees.map((employee) => (
                                    <tr key={employee.id} className="bg-surface border-b border-neutral-border hover:bg-primary-light-hover cursor-pointer" onClick={() => navigate(`/employee/${employee.id}`)}>
                                        <td className="px-6 py-4">
                                            <img className="w-10 h-10 rounded-full object-cover" src={employee.photoUrl} alt={`${employee.firstName} ${employee.lastName}`} />
                                        </td>
                                        <td className="px-6 py-4 font-medium text-on-surface whitespace-nowrap">
                                            {employee.firstName} {employee.lastName}
                                        </td>
                                        <td className="px-6 py-4">{employee.idNumber}</td>
                                        <td className="px-6 py-4">{employee.hierarchy}</td>
                                        <td className="px-6 py-4">{employee.zonaDeTrabajo}</td>
                                        <td className="px-6 py-4">{employee.contractTypeName}</td>
                                        <td className="px-6 py-4">{formatDate(employee.contractStartDate)}</td>
                                        <td className="px-6 py-4">{formatDate(employee.contractEndDate)}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${employee.status === 'active' ? 'bg-success/20 text-success' : 'bg-error/20 text-error'}`}>
                                                {employee.status === 'active' ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </td>
                                        {(hasPermission('employees:update') || hasPermission('employees:delete')) &&
                                            <td className="sticky right-0 bg-surface px-6 py-4 text-center space-x-2">
                                                {hasPermission('employees:update') && 
                                                    <button onClick={(e) => handleEditClick(e, employee)} className="p-1.5 text-alert hover:bg-on-surface-variant/10 rounded-md" title="Editar">
                                                        <PencilIcon />
                                                    </button>
                                                }
                                                {hasPermission('employees:delete') && 
                                                    <button onClick={(e) => handleDeleteClick(e, employee)} className="p-1.5 text-error hover:bg-on-surface-variant/10 rounded-md" title="Eliminar">
                                                        <TrashIcon />
                                                    </button>
                                                }
                                            </td>
                                        }
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
                {!loading && totalPages > 0 && (
                    <div className="flex justify-between items-center p-4">
                        <div className="flex items-center gap-2">
                            <label htmlFor="rows-per-page" className="text-sm">Filas por página:</label>
                            <select
                                id="rows-per-page"
                                value={itemsPerPage}
                                onChange={e => setItemsPerPage(Number(e.target.value))}
                                className="bg-surface border border-neutral-border p-1 rounded-md text-sm"
                            >
                                <option value={10}>10</option>
                                <option value={25}>25</option>
                                <option value={50}>50</option>
                            </select>
                        </div>
                        <div className="flex items-center gap-4">
                            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="py-2 px-4 rounded-lg bg-surface border border-neutral-border hover:bg-primary-light-hover disabled:opacity-50 text-sm">Anterior</button>
                            <span>Página {currentPage} de {totalPages}</span>
                            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="py-2 px-4 rounded-lg bg-surface border border-neutral-border hover:bg-primary-light-hover disabled:opacity-50 text-sm">Siguiente</button>
                        </div>
                    </div>
                )}
            </div>
            {employeeToDelete && (
                <ConfirmationModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    onConfirm={handleConfirmDelete}
                    title="Confirmar Eliminación"
                    message={`¿Estás seguro de que deseas eliminar a ${employeeToDelete.firstName} ${employeeToDelete.lastName}? Esta acción no se puede deshacer.`}
                />
            )}
        </div>
    );
};

// Icons
const PencilIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" /></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;

export default Employees;