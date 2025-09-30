import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { ContractType } from '../../types';
import Spinner from '../ui/Spinner';
import ConfirmationModal from '../ui/ConfirmationModal';

const ToggleSwitch: React.FC<{ enabled: boolean; onChange: () => void; }> = ({ enabled, onChange }) => (
    <button type="button" onClick={onChange} className={`${enabled ? 'bg-primary' : 'bg-slate-600'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out`}>
        <span className={`${enabled ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`} />
    </button>
);

const ContractSettingsManager: React.FC = () => {
    const [contractTypes, setContractTypes] = useState<ContractType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingContract, setEditingContract] = useState<ContractType | null>(null);
    const [contractToDelete, setContractToDelete] = useState<ContractType | null>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const data = await api.getContractTypes();
            setContractTypes(data);
        } catch (err) {
            setError('No se pudieron cargar los tipos de contrato.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSave = async (data: Omit<ContractType, 'id'> | ContractType) => {
        await ('id' in data ? api.updateContractType(data) : api.addContractType(data));
        setIsModalOpen(false);
        fetchData();
    };
    
    const handleToggleStatus = async (contract: ContractType) => {
        await api.updateContractType({ ...contract, isActive: !contract.isActive });
        fetchData();
    };

    const confirmDelete = async () => {
        if (contractToDelete) {
            await api.deleteContractType(contractToDelete.id);
            setContractToDelete(null);
            fetchData();
        }
    };

    if (loading) return <div className="h-40"><Spinner/></div>;
    if (error) return <p className="text-center text-red-400">{error}</p>

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-on-surface">Gestionar Tipos de Contrato</h2>
                <button onClick={() => { setEditingContract(null); setIsModalOpen(true); }} className="bg-primary text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-primary/80">
                    + Añadir Tipo
                </button>
            </div>

            <div className="bg-slate-800/50 rounded-lg border border-slate-700 overflow-hidden">
                <table className="w-full text-sm text-left text-on-surface-variant">
                    <thead className="text-xs text-on-surface uppercase bg-slate-700/50">
                        <tr>
                            <th className="px-6 py-3">Nombre del Contrato</th>
                            <th className="px-6 py-3">Alerta de Vencimiento (Días)</th>
                            <th className="px-6 py-3">Estado</th>
                            <th className="px-6 py-3 text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {contractTypes.map(ct => (
                            <tr key={ct.id} className="bg-surface border-b border-slate-700 hover:bg-slate-800">
                                <td className="px-6 py-4 font-medium text-on-surface">{ct.name}</td>
                                <td className="px-6 py-4">{ct.alertDaysBeforeExpiry > 0 ? `${ct.alertDaysBeforeExpiry} días antes` : 'Sin alerta'}</td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <ToggleSwitch enabled={ct.isActive} onChange={() => handleToggleStatus(ct)} />
                                        <span className={ct.isActive ? 'text-green-400' : 'text-red-400'}>{ct.isActive ? 'Activo' : 'Inactivo'}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center space-x-2">
                                    <button onClick={() => { setEditingContract(ct); setIsModalOpen(true); }} className="p-1.5 text-yellow-400"><PencilIcon /></button>
                                    <button onClick={() => setContractToDelete(ct)} className="p-1.5 text-red-400"><TrashIcon /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && <ContractModal onClose={() => setIsModalOpen(false)} onSave={handleSave} contract={editingContract} />}
            {contractToDelete && <ConfirmationModal isOpen={!!contractToDelete} onClose={() => setContractToDelete(null)} onConfirm={confirmDelete} title="Confirmar Eliminación" message={`¿Eliminar el tipo de contrato "${contractToDelete.name}"?`} />}
        </div>
    );
};

const ContractModal: React.FC<{onClose: () => void, onSave: (d: any) => void, contract: ContractType | null}> = ({onClose, onSave, contract}) => {
    const [formData, setFormData] = useState({
        name: contract?.name || '',
        alertDaysBeforeExpiry: contract?.alertDaysBeforeExpiry || 0,
        isActive: contract?.isActive ?? true,
    });
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({...prev, [name]: type === 'checkbox' ? checked : type === 'number' ? parseInt(value) : value }));
    };

    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSave(contract ? { ...formData, id: contract.id } : formData); };
    
    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center"><div className="bg-surface rounded-lg shadow-xl w-full max-w-lg border border-slate-700">
            <form onSubmit={handleSubmit}>
                <div className="p-6 space-y-4">
                    <h3 className="text-lg font-bold">{contract ? 'Editar' : 'Añadir'} Tipo de Contrato</h3>
                    <div>
                        <label className="block text-sm mb-1">Nombre del Contrato</label>
                        <input name="name" value={formData.name} onChange={handleChange} required className="w-full bg-slate-700 p-2 rounded-md mt-1"/>
                    </div>
                    <div>
                        <label className="block text-sm mb-1">Días de anticipación para alerta de vencimiento</label>
                        <input type="number" name="alertDaysBeforeExpiry" value={formData.alertDaysBeforeExpiry} onChange={handleChange} required min="0" className="w-full bg-slate-700 p-2 rounded-md mt-1"/>
                    </div>
                     <div>
                        <label className="flex items-center gap-2 text-sm">
                            <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} className="h-4 w-4 rounded bg-slate-700 text-primary"/>
                            Activo
                        </label>
                    </div>
                </div>
                <div className="flex justify-end p-4 border-t border-slate-700 space-x-4">
                    <button type="button" onClick={onClose} className="py-2 px-4 rounded-lg bg-slate-600 hover:bg-slate-500">Cancelar</button>
                    <button type="submit" className="py-2 px-4 rounded-lg bg-primary hover:bg-primary/80 font-semibold">Guardar</button>
                </div>
            </form>
        </div></div>
    );
};

const PencilIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" /></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;

export default ContractSettingsManager;
