import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Company } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import Spinner from '../ui/Spinner';
import ConfirmationModal from '../ui/ConfirmationModal';

const CompanyManager: React.FC = () => {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCompany, setEditingCompany] = useState<Company | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [companyToDelete, setCompanyToDelete] = useState<Company | null>(null);
    const { hasPermission } = useAuth();

    const fetchCompanies = async () => {
        try {
            setLoading(true);
            const data = await api.getCompanies();
            setCompanies(data);
        } catch (err) {
            setError('No se pudieron cargar las empresas.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCompanies();
    }, []);

    const handleAdd = () => {
        setEditingCompany(null);
        setIsModalOpen(true);
    };

    const handleEdit = (company: Company) => {
        setEditingCompany(company);
        setIsModalOpen(true);
    };
    
    const handleDelete = (company: Company) => {
        setCompanyToDelete(company);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (companyToDelete) {
            try {
                await api.deleteCompany(companyToDelete.id);
                fetchCompanies();
            } catch (err) {
                 setError('Error al eliminar la empresa.');
            } finally {
                setIsDeleteModalOpen(false);
                setCompanyToDelete(null);
            }
        }
    };

    const handleSave = async (companyData: Omit<Company, 'id'> | Company) => {
        try {
            if ('id' in companyData) {
                await api.updateCompany(companyData);
            } else {
                await api.addCompany(companyData);
            }
            fetchCompanies();
            setIsModalOpen(false);
        } catch (err) {
            setError('No se pudo guardar la empresa.');
        }
    };

    return (
        <div className="space-y-4">
             <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-primary">Gestionar Empresas</h2>
                {hasPermission('settings:write') && (
                    <button onClick={handleAdd} className="bg-primary text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-primary-dark-hover transition-colors">
                        Añadir Empresa
                    </button>
                )}
            </div>
            {error && <p className="text-error text-center">{error}</p>}
            {loading ? <div className="h-64"><Spinner /></div> : (
                 <div className="bg-surface rounded-lg border border-neutral-border overflow-hidden">
                    <table className="w-full text-sm text-left text-on-surface-variant">
                        <thead className="text-xs text-white uppercase bg-primary">
                            <tr>
                                <th scope="col" className="px-6 py-3">Nombre</th>
                                <th scope="col" className="px-6 py-3">Correo</th>
                                <th scope="col" className="px-6 py-3">Dirección</th>
                                {hasPermission('settings:write') && <th scope="col" className="px-6 py-3 text-center">Acciones</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {companies.map(company => (
                                <tr key={company.id} className="bg-surface border-b border-neutral-border hover:bg-primary-light-hover">
                                    <td className="px-6 py-4 font-medium text-on-surface">{company.name}</td>
                                    <td className="px-6 py-4">{company.email}</td>
                                    <td className="px-6 py-4">{company.address}</td>
                                    {hasPermission('settings:write') && (
                                        <td className="px-6 py-4 text-center space-x-2">
                                            <button onClick={() => handleEdit(company)} className="p-1.5 text-alert hover:bg-on-surface-variant/10 rounded-md"><PencilIcon /></button>
                                            <button onClick={() => handleDelete(company)} className="p-1.5 text-error hover:bg-on-surface-variant/10 rounded-md"><TrashIcon /></button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
             {isModalOpen && <CompanyModal onClose={() => setIsModalOpen(false)} onSave={handleSave} company={editingCompany} />}
             {companyToDelete && (
                <ConfirmationModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    onConfirm={handleConfirmDelete}
                    title="Confirmar Eliminación"
                    message={`¿Estás seguro de que deseas eliminar la empresa ${companyToDelete.name}?`}
                />
            )}
        </div>
    );
};

// --- Modal Component ---
interface CompanyModalProps {
    onClose: () => void;
    onSave: (companyData: Omit<Company, 'id'> | Company) => void;
    company: Company | null;
}
const CompanyModal: React.FC<CompanyModalProps> = ({ onClose, onSave, company }) => {
    const [formData, setFormData] = useState({
        name: company?.name || '',
        email: company?.email || '',
        address: company?.address || '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(company ? { ...formData, id: company.id } : formData);
    };

    return (
         <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4">
            <div className="bg-surface rounded-lg shadow-xl w-full max-w-lg border border-neutral-border">
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <h3 className="text-lg font-bold text-on-surface mb-4">{company ? 'Editar' : 'Añadir'} Empresa</h3>
                        <div className="space-y-4">
                             <div>
                                <label className="block text-sm font-medium text-on-surface-variant mb-1">Nombre</label>
                                <input name="name" value={formData.name} onChange={handleChange} required className="w-full bg-background border border-neutral-border rounded-md p-2 text-on-surface focus:ring-primary focus:border-primary" />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-on-surface-variant mb-1">Correo</label>
                                <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full bg-background border border-neutral-border rounded-md p-2 text-on-surface focus:ring-primary focus:border-primary" />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-on-surface-variant mb-1">Dirección</label>
                                <input name="address" value={formData.address} onChange={handleChange} required className="w-full bg-background border border-neutral-border rounded-md p-2 text-on-surface focus:ring-primary focus:border-primary" />
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end items-center p-4 border-t border-neutral-border space-x-4">
                        <button type="button" onClick={onClose} className="py-2 px-4 rounded-lg bg-surface border border-neutral-border hover:bg-primary-light-hover transition-colors">Cancelar</button>
                        <button type="submit" className="py-2 px-4 rounded-lg bg-primary text-white hover:bg-primary-dark-hover transition-colors font-semibold">Guardar</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// Icons
const PencilIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" /></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;

export default CompanyManager;