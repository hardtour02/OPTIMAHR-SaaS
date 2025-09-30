import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Document, Employee, FormFieldOption } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useFormatting } from '../hooks/useFormatting';
import Spinner from '../components/ui/Spinner';
import UploadDocumentModal from '../components/documents/UploadDocumentModal';
import ConfirmationModal from '../components/ui/ConfirmationModal';

interface FlatDocument extends Document {
    employeeId: string;
    employeeName: string;
}

const Documents: React.FC = () => {
    const [allDocuments, setAllDocuments] = useState<FlatDocument[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [docTypes, setDocTypes] = useState<FormFieldOption[]>([]);
    const [loading, setLoading] = useState(true);
    const { hasPermission } = useAuth();
    const { formatDate } = useFormatting();
    const navigate = useNavigate();

    // Modals
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [docToDelete, setDocToDelete] = useState<FlatDocument | null>(null);

    // Filters & Sorting
    const [searchTerm, setSearchTerm] = useState('');
    const [employeeFilter, setEmployeeFilter] = useState('');
    const [docTypeFilter, setDocTypeFilter] = useState('');
    const [sortConfig, setSortConfig] = useState<{ key: keyof FlatDocument | null; direction: 'ascending' | 'descending' }>({ key: 'uploadDate', direction: 'descending' });
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 15;

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [docs, emps, options] = await Promise.all([
                api.getAllDocuments(),
                api.getEmployees(),
                api.getFormFieldOptions()
            ]);
            setAllDocuments(docs);
            setEmployees(emps);
            setDocTypes(options.filter(o => o.fieldType === 'documentType'));
        } catch (error) {
            console.error("Failed to fetch documents", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleUploadSuccess = () => {
        setIsUploadModalOpen(false);
        fetchData();
    };
    
    const handleConfirmDelete = async () => {
        if (docToDelete) {
            try {
                await api.deleteDocument(docToDelete.employeeId, docToDelete.id);
                fetchData();
            } catch (error) {
                console.error("Failed to delete document", error);
            } finally {
                setDocToDelete(null);
            }
        }
    };
    
    const processedDocuments = useMemo(() => {
        let filtered = [...allDocuments]
            .filter(doc => 
                doc.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
                (!employeeFilter || doc.employeeId === employeeFilter) &&
                (!docTypeFilter || doc.type === docTypeFilter)
            );

        if (sortConfig.key) {
            filtered.sort((a, b) => {
                const aVal = a[sortConfig.key!];
                const bVal = b[sortConfig.key!];
                if (aVal < bVal) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (aVal > bVal) return sortConfig.direction === 'ascending' ? 1 : -1;
                return 0;
            });
        }
        return filtered;
    }, [allDocuments, searchTerm, employeeFilter, docTypeFilter, sortConfig]);

    const totalPages = Math.ceil(processedDocuments.length / ITEMS_PER_PAGE);
    const paginatedDocuments = processedDocuments.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const requestSort = (key: keyof FlatDocument) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const SortableHeader: React.FC<{ children: React.ReactNode; sortKey: keyof FlatDocument; }> = ({ children, sortKey }) => {
        const isSorted = sortConfig.key === sortKey;
        return <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => requestSort(sortKey)}>{children} {isSorted ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : '↕'}</th>;
    };
    
    return (
         <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-primary">Archivo Digital Centralizado</h1>
                {hasPermission('documents:upload') && (
                    <button onClick={() => setIsUploadModalOpen(true)} className="bg-primary text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-primary-dark-hover">
                        + Subir Documento
                    </button>
                )}
            </div>
            
            <div className="bg-surface p-4 rounded-lg border border-neutral-border grid grid-cols-1 md:grid-cols-3 gap-4">
                <input type="text" placeholder="Buscar por nombre de archivo..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="md:col-span-3 bg-background border border-neutral-border rounded-md p-2"/>
                <select value={employeeFilter} onChange={e => setEmployeeFilter(e.target.value)} className="bg-background border border-neutral-border rounded-md p-2">
                    <option value="">Todos los Empleados</option>
                    {employees.map(e => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}
                </select>
                <select value={docTypeFilter} onChange={e => setDocTypeFilter(e.target.value)} className="bg-background border border-neutral-border rounded-md p-2">
                    <option value="">Todos los Tipos</option>
                     {docTypes.map(d => <option key={d.id} value={d.value}>{d.value}</option>)}
                </select>
            </div>

            <div className="bg-surface rounded-lg shadow-lg border border-neutral-border overflow-hidden">
                <div className="overflow-x-auto">
                    {loading ? <div className="h-96"><Spinner/></div> : (
                        <table className="w-full text-sm text-left text-on-surface-variant">
                            <thead className="text-xs text-white uppercase bg-primary">
                                <tr>
                                    <SortableHeader sortKey="employeeName">Empleado</SortableHeader>
                                    <SortableHeader sortKey="name">Nombre del Documento</SortableHeader>
                                    <SortableHeader sortKey="type">Tipo</SortableHeader>
                                    <SortableHeader sortKey="uploadDate">Fecha de Carga</SortableHeader>
                                    {(hasPermission('documents:delete')) && <th scope="col" className="px-6 py-3 text-center">Acciones</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedDocuments.map(doc => (
                                    <tr 
                                        key={doc.id} 
                                        className="bg-surface border-b border-neutral-border hover:bg-primary-light-hover cursor-pointer"
                                        onClick={() => navigate(`/employee/${doc.employeeId}`)}
                                    >
                                        <td className="px-6 py-4 font-medium text-on-surface">{doc.employeeName}</td>
                                        <td className="px-6 py-4">
                                            <a href={doc.url} onClick={(e) => e.stopPropagation()} target="_blank" rel="noopener noreferrer" className="hover:underline">{doc.name}</a>
                                        </td>
                                        <td className="px-6 py-4">{doc.type}</td>
                                        <td className="px-6 py-4">{formatDate(doc.uploadDate)}</td>
                                        {hasPermission('documents:delete') && (
                                            <td className="px-6 py-4 text-center">
                                                <button onClick={(e) => { e.stopPropagation(); setDocToDelete(doc); }} className="p-1.5 text-error hover:bg-on-surface-variant/10 rounded-md" title="Eliminar"><TrashIcon /></button>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
                 {totalPages > 1 && (
                    <div className="flex justify-end items-center p-4">
                        <div className="flex items-center gap-4">
                            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="py-2 px-4 rounded-lg bg-surface border border-neutral-border hover:bg-primary-light-hover disabled:opacity-50 text-sm">Anterior</button>
                            <span>Página {currentPage} de {totalPages}</span>
                            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="py-2 px-4 rounded-lg bg-surface border border-neutral-border hover:bg-primary-light-hover disabled:opacity-50 text-sm">Siguiente</button>
                        </div>
                    </div>
                )}
            </div>

            {isUploadModalOpen && <UploadDocumentModal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} onUploadSuccess={handleUploadSuccess}/>}
            {docToDelete && <ConfirmationModal isOpen={!!docToDelete} onClose={() => setDocToDelete(null)} onConfirm={handleConfirmDelete} title="Confirmar Eliminación" message={`¿Eliminar el documento "${docToDelete.name}" del perfil de ${docToDelete.employeeName}?`}/>}
        </div>
    );
};

const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;

export default Documents;